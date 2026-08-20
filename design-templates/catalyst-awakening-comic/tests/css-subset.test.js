'use strict';
// issue.css is styles.css with the rules removed that cannot match on an issue
// page. "Cannot match" is a claim, and this is the check that it is true.
//
// Screenshots are the wrong instrument for it — lazy images and the live
// ticker move pixels between two captures of the same build, so a small real
// regression is indistinguishable from noise. Instead: render an issue page
// under each stylesheet and compare the computed style of every element and
// its ::before/::after. If the subset really is sufficient, every property
// resolves identically, and the comparison is exact rather than approximate.

const { newPage, Results } = require('./lib/harness');

// Everything that affects layout, colour, type or visibility. Comparing all
// ~340 computed properties is slower and adds only vendor-prefixed duplicates.
//
// margin-* is deliberately absent: for `margin: 0 auto` Chrome reports either
// the computed value (0px) or the used value (120px) depending on when it is
// asked, so comparing it produces differences that are not differences. The
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

module.exports = async function cssSubset(ctx, base) {
  const r = new Results();

  // A fresh page per stylesheet: swapping one in place can leave stale
  // cascade state behind and would make a real difference invisible.
  async function snapshot(url, href) {
    const page = await newPage(ctx);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(base + url, { waitUntil: 'networkidle' });
    await page.evaluate(async h => {
      const link = document.querySelector('link[rel=stylesheet]');
      if (!link || link.getAttribute('href') === h) return;
      await new Promise(done => {
        const next = document.createElement('link');
        next.rel = 'stylesheet';
        next.href = h;
        next.onload = next.onerror = done;
        link.replaceWith(next);
      });
    }, href);
    // Freeze time-varying values. The ticker dot pulses, so two loads sample
    // its opacity at different points in the animation and the comparison
    // reports a difference that is not a difference. Static values are
    // unaffected, so a real regression still shows.
    // `overflow-y: scroll` reserves the scrollbar unconditionally. Without it,
    // whether one is present when we sample depends on how much lazy imagery
    // has arrived, and that changes the used value of every `margin: 0 auto`
    // — a difference in the harness, not in the stylesheet.
    await page.addStyleTag({ content:
      'html{overflow-y:scroll!important}' +
      '*,*::before,*::after{animation:none!important;transition:none!important}' });
    await page.evaluate(() => new Promise(done => {
      // Let every already-requested image settle so layout stops moving.
      const imgs = [...document.images].filter(i => !i.complete);
      if (!imgs.length) return done();
      let left = imgs.length;
      const tick = () => (--left <= 0) && done();
      imgs.forEach(i => { i.addEventListener('load', tick); i.addEventListener('error', tick); });
      setTimeout(done, 3000);
    }));
    await page.waitForTimeout(600);
    const snap = await page.evaluate(props => {
      const rows = [];
      for (const el of document.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        const row = props.map(p => cs.getPropertyValue(p));
        for (const pseudo of ['::before', '::after']) {
          const ps = getComputedStyle(el, pseudo);
          row.push(ps.content, ps.display, ps.width, ps.height,
                   ps.transform, ps.backgroundColor, ps.color);
        }
        const box = el.getBoundingClientRect();
        row.push(Math.round(box.x), Math.round(box.y),
                 Math.round(box.width), Math.round(box.height));
        rows.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 40), row });
      }
      return rows;
    }, PROPS);
    await page.close();
    return snap;
  }

  for (const n of [1, 2, 3, 4]) {
    const url = `/read/issue-${n}`;
    const subset = await snapshot(url, '../issue.css');
    const full = await snapshot(url, '../styles.css');

    r.ok(`i${n}: both stylesheets rendered`, subset.length > 0 && full.length > 0);
    r.ok(`i${n}: same element count`, subset.length === full.length,
      `${subset.length} vs ${full.length}`);

    const len = Math.min(subset.length, full.length);
    let differing = 0;
    let first = '';
    for (let i = 0; i < len; i++) {
      const a = subset[i].row;
      const b = full[i].row;
      let same = true;
      for (let k = 0; k < a.length; k++) {
        if (a[k] !== b[k]) {
          same = false;
          if (!first) {
            const GEOM = ['box.x', 'box.y', 'box.width', 'box.height'];
            const pseudoCount = 14;   // 2 pseudo-elements x 7 properties
            const prop = k < PROPS.length ? PROPS[k]
              : k < PROPS.length + pseudoCount ? `pseudo[${k - PROPS.length}]`
              : GEOM[k - PROPS.length - pseudoCount];
            first = `<${subset[i].tag.toLowerCase()} class="${subset[i].cls}"> ` +
                    `${prop}: ${JSON.stringify(a[k])} (issue.css) vs ${JSON.stringify(b[k])} (styles.css)`;
          }
          break;
        }
      }
      if (!same) differing++;
    }
    r.ok(`i${n}: issue.css computes identically to styles.css`,
      differing === 0, `${differing} of ${len} elements differ — ${first}`);
  }

  return r;
};
