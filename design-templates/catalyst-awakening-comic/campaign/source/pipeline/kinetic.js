/* KIN — deterministic timeline animation runtime for frame-stepped rendering.
   All animation is a pure function of t (ms); window.seek(t) renders that instant. */
window.KIN = (() => {
  const E = {
    linear: p => p,
    inQuad: p => p * p,
    outQuad: p => 1 - (1 - p) * (1 - p),
    inOutQuad: p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
    inCubic: p => p * p * p,
    outCubic: p => 1 - Math.pow(1 - p, 3),
    inOutCubic: p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    outQuart: p => 1 - Math.pow(1 - p, 4),
    inOutQuint: p => (p < 0.5 ? 16 * p ** 5 : 1 - Math.pow(-2 * p + 2, 5) / 2),
    inExpo: p => (p === 0 ? 0 : Math.pow(2, 10 * p - 10)),
    outExpo: p => (p === 1 ? 1 : 1 - Math.pow(2, -10 * p)),
    outBack: p => { const c = 1.70158; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); },
    outBackHard: p => { const c = 3.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); },
    outElastic: p => {
      if (p === 0 || p === 1) return p;
      return Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
    },
    step: p => (p >= 1 ? 1 : 0),
  };

  const tracks = [];

  // add(el, {t0, t1, ease, from:{...}, to:{...}}) — props: x,y (px), scale, sx, sy,
  // rot (deg), opacity, ls (letter-spacing px), blur (px), clip (inset % from bottom-up reveal)
  function add(el, spec) {
    if (!el) throw new Error('KIN.add: null element');
    tracks.push(Object.assign({ el, ease: 'outCubic' }, spec));
    return spec;
  }

  // custom per-frame function track: fn(pEased, tAbs, el)
  function fx(el, t0, t1, fn, ease = 'linear') {
    tracks.push({ el, t0, t1, fn, ease });
  }

  function lerp(a, b, p) { return a + (b - a) * p; }

  function apply(el, s) {
    const tr = [];
    if (s.x !== undefined || s.y !== undefined) tr.push(`translate(${s.x || 0}px, ${s.y || 0}px)`);
    if (s.rot !== undefined) tr.push(`rotate(${s.rot}deg)`);
    if (s.scale !== undefined) tr.push(`scale(${s.scale})`);
    if (s.sx !== undefined || s.sy !== undefined) tr.push(`scale(${s.sx ?? 1}, ${s.sy ?? 1})`);
    if (tr.length) el.style.transform = (el.dataset.kbase ? el.dataset.kbase + ' ' : '') + tr.join(' ');
    if (s.opacity !== undefined) el.style.opacity = s.opacity;
    if (s.ls !== undefined) el.style.letterSpacing = s.ls + 'px';
    if (s.blur !== undefined) el.style.filter = s.blur > 0.02 ? `blur(${s.blur}px)` : 'none';
    if (s.clip !== undefined) el.style.clipPath = `inset(${Math.max(0, 100 - s.clip)}% 0 0 0)`;
    if (s.clipT !== undefined) el.style.clipPath = `inset(0 0 ${Math.max(0, 100 - s.clipT)}% 0)`;
    if (s.clipX !== undefined) el.style.clipPath = `inset(0 ${Math.max(0, 100 - s.clipX)}% 0 0)`;
  }

  function seek(t) {
    const state = new Map();
    for (const trk of tracks) {
      let p = (t - trk.t0) / (trk.t1 - trk.t0);
      p = Math.max(0, Math.min(1, p));
      const pe = E[trk.ease](p);
      if (trk.fn) { trk.fn(pe, t, trk.el); continue; }
      let s = state.get(trk.el);
      if (!s) { s = {}; state.set(trk.el, s); }
      for (const k in trk.to) {
        const a = trk.from && trk.from[k] !== undefined ? trk.from[k] : (k === 'opacity' || k === 'scale' || k === 'sx' || k === 'sy' ? 1 : 0);
        s[k] = lerp(a, trk.to[k], pe);
      }
    }
    for (const [el, s] of state) apply(el, s);
  }

  function splitChars(el) {
    const text = el.textContent;
    el.textContent = '';
    const spans = [];
    for (const ch of text) {
      const sp = document.createElement('span');
      sp.style.display = 'inline-block';
      sp.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(sp);
      spans.push(sp);
    }
    return spans;
  }

  function splitWords(el) {
    const words = el.textContent.split(/\s+/).filter(Boolean);
    el.textContent = '';
    const spans = [];
    words.forEach((w, i) => {
      const sp = document.createElement('span');
      sp.style.display = 'inline-block';
      sp.textContent = w;
      el.appendChild(sp);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      spans.push(sp);
    });
    return spans;
  }

  // staggered entrance for a list of elements
  function stagger(els, t0, step, dur, from, to, ease = 'outExpo') {
    els.forEach((el, i) => add(el, { t0: t0 + i * step, t1: t0 + i * step + dur, from, to, ease }));
  }

  return { add, fx, seek, splitChars, splitWords, stagger, E };
})();
window.seek = t => window.KIN.seek(t);
