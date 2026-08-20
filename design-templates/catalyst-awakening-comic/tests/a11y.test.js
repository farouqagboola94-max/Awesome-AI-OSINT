'use strict';
// Accessibility invariants that held across every page, checked on every page.
//
// The headline check is the closed-overlay one. Five dialogs on this site
// closed with `opacity: 0; pointer-events: none` and no `visibility: hidden`.
// Opacity does not remove anything from the accessibility tree, so those
// dialogs stayed in the tab order and were announced by screen readers while
// invisible — sixteen phantom tab stops on the home page. Nothing about the
// page looked wrong, which is exactly why it needs a test.

const { newPage, Results, HIDDEN_FROM_A11Y } = require('./lib/harness');

const PAGES = ['/index.html', '/read/issue-1', '/read/issue-2', '/read/issue-3', '/read/issue-4'];

module.exports = async function a11y(ctx, base) {
  const r = new Results();

  for (const path of PAGES) {
    const page = await newPage(ctx);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    const name = path === '/index.html' ? 'home' : path.replace('/read/', '');

    // ── no closed overlay is reachable while invisible
    const leaks = await page.evaluate(hiddenSrc => {
      const hidden = eval(hiddenSrc);
      const OPEN = ['open', 'active', 'show', 'pv-open'];
      const out = [];
      for (const o of document.querySelectorAll('[role=dialog], .modal-backdrop, [class*=overlay], [class*=drawer]')) {
        if (OPEN.some(c => o.classList.contains(c))) continue;
        if (hidden(o)) continue;
        const cs = getComputedStyle(o);
        const box = o.getBoundingClientRect();
        // Imperceptible = faded out, or a fixed-position element parked
        // outside the viewport (how the welcome-back banner hides). For a
        // element in normal flow, being below the fold just means the user
        // has not scrolled there yet — that is not a leak.
        const parked = cs.position === 'fixed' &&
          (box.bottom <= 0 || box.top >= innerHeight || box.right <= 0 || box.left >= innerWidth);
        const imperceptible = parseFloat(cs.opacity) < 0.05 || parked;
        if (!imperceptible) continue;
        const focusable = [...o.querySelectorAll(
          'a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(f => !hidden(f));
        if (focusable.length) {
          out.push(`${o.id || o.className.toString().split(' ')[0]} (${focusable.length} focusable, opacity ${cs.opacity})`);
        }
      }
      return out;
    }, HIDDEN_FROM_A11Y);
    r.ok(`${name}: no invisible dialog is keyboard-reachable`,
      leaks.length === 0, leaks.join(' | '));

    // ── document structure
    const struct = await page.evaluate(hiddenSrc => {
      const hidden = eval(hiddenSrc);
      const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
        .filter(h => !hidden(h))
        .map(h => ({ level: +h.tagName[1], text: (h.textContent || '').trim().replace(/\s+/g, ' ') }));
      const emptyHeads = heads.filter(h => !h.text.replace(/[—–-]/g, '').trim());
      return {
        h1s: heads.filter(h => h.level === 1).map(h => h.text),
        first: heads[0] || null,
        emptyHeads: emptyHeads.map(h => `h${h.level}`),
        lang: document.documentElement.lang || '',
        landmarks: document.querySelectorAll('main,nav,header,footer,[role=main]').length,
        imgsNoAlt: document.querySelectorAll('img:not([alt])').length,
        // Only count controls a user can actually reach.
        namelessButtons: [...document.querySelectorAll('button')].filter(b => !hidden(b) &&
          !(b.textContent || '').trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).length,
        namelessLinks: [...document.querySelectorAll('a')].filter(a => !hidden(a) &&
          !(a.textContent || '').trim() && !a.getAttribute('aria-label') && !a.getAttribute('title')).length,
        unlabelledInputs: [...document.querySelectorAll('input:not([type=hidden])')].filter(i => !hidden(i) &&
          !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby') &&
          !(i.id && document.querySelector(`label[for="${CSS.escape(i.id)}"]`))).length,
        unlabelledDialogs: [...document.querySelectorAll('[role=dialog]')].filter(d =>
          !d.getAttribute('aria-label') && !d.getAttribute('aria-labelledby')).length,
      };
    }, HIDDEN_FROM_A11Y);

    r.ok(`${name}: has exactly one h1`, struct.h1s.length === 1, struct.h1s.join(' / '));
    r.ok(`${name}: the first heading is the h1`,
      struct.first && struct.first.level === 1,
      struct.first ? `h${struct.first.level} ${JSON.stringify(struct.first.text.slice(0, 30))}` : 'none');
    r.ok(`${name}: no placeholder headings exposed`,
      struct.emptyHeads.length === 0, struct.emptyHeads.join(','));
    r.ok(`${name}: lang is set`, struct.lang === 'en', struct.lang);
    r.ok(`${name}: landmarks present`, struct.landmarks >= 3, String(struct.landmarks));
    r.ok(`${name}: every image has an alt attribute`, struct.imgsNoAlt === 0, String(struct.imgsNoAlt));
    r.ok(`${name}: every visible button has a name`, struct.namelessButtons === 0, String(struct.namelessButtons));
    r.ok(`${name}: every visible link has a name`, struct.namelessLinks === 0, String(struct.namelessLinks));
    r.ok(`${name}: every visible input is labelled`, struct.unlabelledInputs === 0, String(struct.unlabelledInputs));
    r.ok(`${name}: every dialog has an accessible name`, struct.unlabelledDialogs === 0, String(struct.unlabelledDialogs));

    // ── a keyboard user can reach the content quickly
    const skip = await page.evaluate(() => {
      const a = document.querySelector('.skip-link');
      return a ? { href: a.getAttribute('href'), first: document.body.querySelector('a,button') === a } : null;
    });
    r.ok(`${name}: skip link is the first control`, skip?.first === true, JSON.stringify(skip));
    r.ok(`${name}: skip link points at something on this page`,
      !!skip && await page.evaluate(h => !!document.querySelector(h), skip.href), skip?.href);

    await page.close();
  }

  return r;
};
