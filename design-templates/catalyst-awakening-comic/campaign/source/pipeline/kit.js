/* Shared kinetic-typography helpers built on KIN. */
window.KIT = (() => {
  // hard-cut visibility window
  function cut(el, a, b) {
    KIN.fx(el, 0, 1, (p, t) => { el.style.opacity = (t >= a && t < b) ? 1 : 0; });
  }
  // giant type slam: scale down + blur clear + micro settle
  function slam(el, t, opts = {}) {
    const { dur = 380, from = 2.4, blur = 16, ease = 'outExpo' } = opts;
    KIN.add(el, { t0: t, t1: t + dur, from: { scale: from, opacity: 0, blur }, to: { scale: 1, opacity: 1, blur: 0 }, ease });
  }
  // typewriter-ish word pop: words appear staggered
  function wordPop(el, t, step = 90, dur = 260) {
    const words = KIN.splitWords(el);
    KIN.stagger(words, t, step, dur, { opacity: 0, y: 60, blur: 8 }, { opacity: 1, y: 0, blur: 0 }, 'outQuart');
    return words;
  }
  // char cascade
  function charCascade(el, t, step = 28, dur = 300) {
    const chars = KIN.splitChars(el);
    KIN.stagger(chars, t, step, dur, { opacity: 0, y: 90, rot: 6 }, { opacity: 1, y: 0, rot: 0 }, 'outBack');
    return chars;
  }
  // rapid strobe: show items[i] sequentially, each for step ms
  function strobe(els, t, step) {
    els.forEach((el, i) => cut(el, t + i * step, t + (i + 1) * step));
    return t + els.length * step;
  }
  // deterministic camera shake on an element (composes with data-kbase)
  function shake(el, t, dur, amp = 14) {
    KIN.fx(el, t, t + dur, (p, tt) => {
      const local = (tt - t) / dur;
      if (local < 0 || local >= 1) { el.style.transform = el.dataset.kbase || 'none'; return; }
      const d = (1 - local) * amp;
      const x = Math.sin(tt * 0.31) * d, y = Math.cos(tt * 0.47) * d * 0.7;
      el.style.transform = `${el.dataset.kbase || ''} translate(${x}px, ${y}px)`;
    });
  }
  // full-frame color flash
  function flash(color, t, dur = 70) {
    const d = document.createElement('div');
    d.style.cssText = `position:absolute;inset:0;background:${color};opacity:0;z-index:80;pointer-events:none`;
    document.querySelector('.stage').appendChild(d);
    cut(d, t, t + dur);
  }
  // split by <br>/newlines into lines and stagger them in
  function linePop(el, t, step = 260, dur = 480) {
    const html = el.innerHTML;
    const parts = html.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(p => `<span style="display:block">${p}</span>`).join('');
    const lines = [...el.children];
    KIN.stagger(lines, t, step, dur, {opacity: 0, y: 50, blur: 8}, {opacity: 1, y: 0, blur: 0}, 'outQuart');
    return lines;
  }
  // window-scoped scale animation; doesn't clobber opacity
  function scaleIn(el, t0, dur, from = 1.6, ease = 'outExpo') {
    KIN.fx(el, t0, t0 + dur, (p, t) => {
      if (t < t0) return;
      const s = from + (1 - from) * p;
      el.style.transform = `${el.dataset.kbase || ''} scale(${s})`;
    }, ease);
  }
  // slow zoom (Ken Burns) on an element across [a,b]
  function drift(el, a, b, s0, s1, x0 = 0, x1 = 0, y0 = 0, y1 = 0) {
    KIN.add(el, { t0: a, t1: b, from: { scale: s0, x: x0, y: y0 }, to: { scale: s1, x: x1, y: y1 }, ease: 'linear' });
  }
  // window-gated fade: only touches opacity within [a, b], holds o1 after b.
  function fade(el, a, b, o0, o1, ease = 'inOutQuad') {
    KIN.fx(el, a, b, (p, t) => {
      if (t < a) return;
      el.style.opacity = o0 + (o1 - o0) * p;
    }, ease);
  }
  // cut with optional fade-out tail (ms before b)
  function cutFade(el, a, b, fadeOutMs = 0) {
    KIN.fx(el, 0, 1, (p, t) => {
      let o;
      if (t < a || t >= b) o = 0;
      else if (fadeOutMs > 0 && t > b - fadeOutMs) o = Math.max(0, (b - t) / fadeOutMs);
      else o = 1;
      el.style.opacity = o;
    });
  }
  return { cut, cutFade, slam, wordPop, charCascade, strobe, shake, flash, drift, fade, linePop, scaleIn };
})();
