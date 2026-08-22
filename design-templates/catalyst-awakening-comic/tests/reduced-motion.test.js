'use strict';
// prefers-reduced-motion has to be honoured by the canvases too.
//
// The stylesheet handles its side properly — under `reduce` every one of the
// 134 CSS animations and 905 transitions on the home page goes to zero. But
// CSS cannot stop a canvas, and the background particle field, the hero
// sparks and the celebration confetti are all driven by requestAnimationFrame.
// They kept moving for people who had explicitly asked their system to stop
// exactly this: a full-viewport drifting field behind every line of text.
//
// Sampling pixels is the only honest check here. "Did the code take the
// branch" would pass on a guard that guards the wrong loop.

const { newPage, Results } = require('./lib/harness');

const PAGES = [['home', '/index.html'], ['issue-1', '/read/issue-1']];

// Grab the same region twice and report whether anything moved between them.
async function canvasMoves(page, selector) {
  return page.evaluate(sel => new Promise(resolve => {
    const c = document.querySelector(sel);
    if (!c) return resolve('absent');
    const g = c.getContext('2d');
    // A WebGL canvas cannot be read this way; say so rather than pass silently.
    if (!g) return resolve('webgl');
    const w = Math.min(c.width, 320), h = Math.min(c.height, 220);
    if (!w || !h) return resolve('empty');
    const grab = () => g.getImageData(0, 0, w, h).data;
    const first = Array.from(grab());
    setTimeout(() => {
      const second = grab();
      let changed = 0;
      for (let i = 0; i < first.length; i += 4) {
        if (first[i] !== second[i] || first[i + 1] !== second[i + 1]) changed++;
      }
      resolve(changed > 0 ? 'moving:' + changed : 'static');
    }, 700);
  }), selector);
}

module.exports = async function reducedMotion(ctx, base) {
  const r = new Results();
  const browser = ctx.browser();

  for (const motion of ['no-preference', 'reduce']) {
    const mCtx = await browser.newContext({
      viewport: { width: 1100, height: 720 },
      reducedMotion: motion,
    });

    for (const [label, url] of PAGES) {
      const page = await newPage(mCtx);
      await page.goto(base + url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);

      const css = await page.evaluate(() => {
        let animated = 0, transitioned = 0;
        for (const el of document.querySelectorAll('*')) {
          const cs = getComputedStyle(el);
          if (cs.animationName !== 'none' && (parseFloat(cs.animationDuration) || 0) > 0.05) animated++;
          if ((parseFloat(cs.transitionDuration) || 0) > 0.05) transitioned++;
        }
        return { animated, transitioned };
      });

      const bg = await canvasMoves(page, '#bg3d');
      const sparks = await canvasMoves(page, '#spark-canvas');

      if (motion === 'reduce') {
        r.ok(`${label}: no CSS animation runs under reduce`,
          css.animated === 0, String(css.animated));
        r.ok(`${label}: no CSS transition runs under reduce`,
          css.transitioned === 0, String(css.transitioned));
        r.ok(`${label}: background canvas is still under reduce`,
          bg === 'static' || bg === 'absent' || bg === 'empty', bg);
        r.ok(`${label}: hero sparks are still under reduce`,
          sparks === 'static' || sparks === 'absent' || sparks === 'empty', sparks);
      } else {
        // The other half of the claim: motion is not simply switched off for
        // everyone. A guard that broke the default would pass the checks above.
        r.ok(`${label}: CSS animation runs by default`, css.animated > 0, String(css.animated));
        r.ok(`${label}: background canvas animates by default`,
          String(bg).startsWith('moving') || bg === 'absent', bg);
      }

      await page.close();
    }
    await mCtx.close();
  }

  return r;
};
