'use strict';
// issue.css is styles.css with the rules removed that cannot match on an issue
// page. "Cannot match" is a claim, and this is the check that it is true.
//
// Both readings come from ONE document, against the same element objects, with
// nothing between them but a stylesheet swap. That matters more than it
// sounds. The first version of this test loaded the page twice and compared
// the two loads; it passed here and failed in CI, because on a slower machine
// the loads disagreed about how many elements existed — the glossary
// annotator wraps terms in spans after load, so the DOM is still changing
// while you sample it. Comparing two loads measures that race as much as it
// measures the stylesheet. Comparing one document against itself cannot.
//
// Screenshots were tried before that and rejected for a related reason: lazy
// imagery and the live ticker move ~0.006% of pixels between two captures of
// the same build, so a small real regression would be lost in the noise.

const { newPage, Results } = require('./lib/harness');

// Everything that affects layout, colour, type or visibility. Comparing all
// ~340 computed properties is slower and adds only vendor-prefixed duplicates.
//
// margin-* is deliberately absent: for `margin: 0 auto` Chrome reports either
// the computed value (0px) or the used value (120px) depending on when it is
// asked, so comparing it produces differences that are not differences. Each
// element's box is captured instead — that is what a margin is for, and it is
// stable.
const PROPS = [
  'display', 'position', 'top', 'right', 'bottom', 'left', 'float', 'clear',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'border-top-style', 'border-radius', 'box-shadow', 'outline',
  'color', 'background-color', 'background-image', 'background-size',
  'background-position', 'opacity', 'visibility', 'z-index', 'overflow-x', 'overflow-y',
  'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
  'letter-spacing', 'text-align', 'text-transform', 'text-decoration-line',
  'white-space', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items',
  'align-content', 'flex-grow', 'flex-shrink', 'flex-basis', 'gap', 'order',
  'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row',
  'transform', 'clip-path', 'filter', 'backdrop-filter', 'pointer-events',
  'cursor', 'mix-blend-mode', 'aspect-ratio',
];

const PSEUDO_PROPS = ['content', 'display', 'width', 'height', 'transform',
                      'background-color', 'color'];
const GEOM = ['box.x', 'box.y', 'box.width', 'box.height'];

module.exports = async function cssSubset(ctx, base) {
  const r = new Results();

  for (const n of [1, 2, 3, 4]) {
    const page = await newPage(ctx);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${base}/read/issue-${n}`, { waitUntil: 'networkidle' });

    // Reserve the scrollbar unconditionally, and stop animations. Without the
    // first, whether a scrollbar happens to be present changes the box of
    // every centred element; without the second, a pulsing ticker dot gets
    // sampled at two points in its cycle. Neither is a stylesheet difference.
    await page.addStyleTag({ content:
      'html{overflow-y:scroll!important}' +
      '*,*::before,*::after{animation:none!important;transition:none!important}' });

    // Let the page finish mutating itself before either reading.
    await page.evaluate(() => new Promise(done => {
      const pending = [...document.images].filter(i => !i.complete);
      let left = pending.length;
      if (!left) return done();
      const tick = () => { if (--left <= 0) done(); };
      pending.forEach(i => { i.addEventListener('load', tick); i.addEventListener('error', tick); });
      setTimeout(done, 4000);
    }));
    await page.waitForTimeout(900);

    const result = await page.evaluate(async ([props, pseudoProps, other]) => {
      // Body only: <head> holds the stylesheet <link> this test swaps, and a
      // detached node reports empty computed styles, which would read as a
      // difference. Nothing in <head> renders anyway.
      const els = [...document.body.querySelectorAll('*')];

      const read = () => els.map(el => {
        const cs = getComputedStyle(el);
        const row = props.map(p => cs.getPropertyValue(p));
        for (const pseudo of ['::before', '::after']) {
          const ps = getComputedStyle(el, pseudo);
          for (const p of pseudoProps) row.push(ps.getPropertyValue(p));
        }
        const box = el.getBoundingClientRect();
        row.push(String(Math.round(box.x)), String(Math.round(box.y)),
                 String(Math.round(box.width)), String(Math.round(box.height)));
        return row;
      });

      const link = document.querySelector('link[rel=stylesheet]');
      const started = link.getAttribute('href');
      const before = read();

      // Point the same <link> at the other stylesheet, rather than replacing
      // the node: the element stays attached and the document keeps its
      // identity, so the second reading differs only in the CSS applied.
      await new Promise(done => {
        link.addEventListener('load', done, { once: true });
        link.addEventListener('error', done, { once: true });
        link.href = other;
      });
      await new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)));
      const after = read();

      return {
        started,
        count: els.length,
        // If the page mutated itself between the readings the comparison is
        // void; report that rather than a difference that is really a race.
        countAfter: document.body.querySelectorAll('*').length,
        before, after,
      };
    }, [PROPS, PSEUDO_PROPS, '../styles.css']);

    await page.close();

    r.ok(`i${n}: sampled under issue.css first`,
      result.started.endsWith('issue.css'), result.started);
    r.ok(`i${n}: DOM stable across both readings`,
      result.count === result.countAfter, `${result.count} then ${result.countAfter}`);

    const labels = [
      ...PROPS,
      ...['::before', '::after'].flatMap(p => PSEUDO_PROPS.map(x => `${p} ${x}`)),
      ...GEOM,
    ];

    let differing = 0;
    let first = '';
    for (let i = 0; i < result.before.length; i++) {
      const a = result.before[i];
      const b = result.after[i];
      for (let k = 0; k < a.length; k++) {
        if (a[k] === b[k]) continue;
        differing++;
        if (!first) {
          first = `element #${i} ${labels[k]}: ` +
                  `${JSON.stringify(a[k])} (issue.css) vs ${JSON.stringify(b[k])} (styles.css)`;
        }
        break;
      }
    }
    r.ok(`i${n}: issue.css computes identically to styles.css`,
      differing === 0, `${differing} of ${result.before.length} elements differ — ${first}`);
  }

  return r;
};
