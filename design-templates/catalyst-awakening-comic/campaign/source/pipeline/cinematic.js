/* Cinematic helpers: Ken Burns, dolly, letterbox reveal, film title. */
window.CINE = (() => {
  // slow scale + pan across [t0, t1]
  function kenBurns(el, t0, t1, s0 = 1.0, s1 = 1.12, x0 = 0, x1 = 0, y0 = 0, y1 = 0) {
    KIN.fx(el, t0, t1, (p, t) => {
      const local = Math.max(0, Math.min(1, (t - t0) / (t1 - t0)));
      const e = 1 - Math.pow(1 - local, 2); // outQuad
      const s = s0 + (s1 - s0) * e;
      const x = x0 + (x1 - x0) * e;
      const y = y0 + (y1 - y0) * e;
      el.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    });
  }
  function letterboxIn(t0, t1) {
    const T = document.querySelector('.letterbox-t');
    const B = document.querySelector('.letterbox-b');
    if (T) KIN.add(T, {t0, t1, from: {y: -220}, to: {y: 0}, ease: 'outExpo'});
    if (B) KIN.add(B, {t0, t1, from: {y: 220}, to: {y: 0}, ease: 'outExpo'});
  }
  function letterboxOut(t0, t1) {
    const T = document.querySelector('.letterbox-t');
    const B = document.querySelector('.letterbox-b');
    if (T) KIN.add(T, {t0, t1, from: {y: 0}, to: {y: -220}, ease: 'inExpo'});
    if (B) KIN.add(B, {t0, t1, from: {y: 0}, to: {y: 220}, ease: 'inExpo'});
  }
  function titleUp(el, t0, dur = 700, from = {opacity: 0, y: 60, blur: 8, ls: 24}, to = {opacity: 1, y: 0, blur: 0, ls: 6}) {
    KIN.add(el, {t0, t1: t0 + dur, from, to, ease: 'outExpo'});
  }
  // window-scoped fade with initial gate
  function fadeIn(el, t0, dur = 600) {
    KIN.fx(el, t0, t0 + dur, (p, t) => {
      if (t < t0) return;
      el.style.opacity = p;
    });
  }
  function fadeOut(el, t0, dur = 600) {
    KIN.fx(el, t0, t0 + dur, (p, t) => {
      if (t < t0) return;
      el.style.opacity = 1 - p;
    });
  }
  // endcard reveal
  function endcard(t0, dur = 500) {
    const card = document.querySelector('.cine-endcard');
    if (!card) return;
    fadeIn(card, t0, dur);
    const lg = card.querySelector('.lg');
    const sub = card.querySelector('.sub');
    const rule = card.querySelector('.rule');
    const url = card.querySelector('.url');
    if (lg) KIT.charCascade(lg, t0 + 200, 30, 300);
    if (sub) KIN.add(sub, {t0: t0 + 700, t1: t0 + 1200, from: {opacity: 0, ls: 40}, to: {opacity: 1, ls: 10}, ease: 'outExpo'});
    if (rule) KIN.add(rule, {t0: t0 + 1000, t1: t0 + 1500, from: {sx: 0, sy: 1}, to: {sx: 1, sy: 1}, ease: 'outExpo'});
    if (url) fadeIn(url, t0 + 1400, 400);
  }
  return { kenBurns, letterboxIn, letterboxOut, titleUp, fadeIn, fadeOut, endcard };
})();
