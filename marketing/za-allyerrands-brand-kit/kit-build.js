// Za.allyErrands Brand IP kit — generates 50 asset plates as HTML.
const fs = require('fs');
const path = require('path');

/* ---------------- shared snippets ---------------- */
const H = {};

H.wordmark = (px, opts = {}) => {
  const cls = opts.onLight ? 'wm on-light' : 'wm';
  const color = opts.mono ? `color:${opts.mono}` : '';
  const za = opts.mono ? `<span style="color:inherit">Za.</span>` : `<span class="za">Za.</span>`;
  return `<div class="${cls}" style="font-size:${px}px;${color}">${za}allyErrands</div>`;
};

H.roundel = (d, opts = {}) => {
  const bg = opts.bg || 'var(--green)';
  const fg = opts.fg || 'var(--forest)';
  const ring = opts.ring ? `box-shadow:0 0 0 ${d * 0.045}px ${opts.ring};` : '';
  return `<div class="roundel" style="width:${d}px;height:${d}px;background:${bg};${ring}">
    <div style="font-family:var(--anton);font-size:${d * 0.46}px;color:${fg};letter-spacing:-2px">Za.</div>
  </div>`;
};

const ICONS = {
  basket: '<path d="M3.5 9.5h17l-2 10h-13z"/><path d="M8 9.5 12 3l4 6.5"/><path d="M9.5 13v3.5M12 13v3.5M14.5 13v3.5"/>',
  box: '<rect x="4" y="7" width="16" height="13" rx="1.5"/><path d="M4 11h16M12 7v13M7.5 7 9 4h6l1.5 3"/>',
  pill: '<rect x="3.5" y="9" width="17" height="7" rx="3.5" transform="rotate(-30 12 12.5)"/><path d="M9.5 8.9l4.6 7.4" transform="rotate(0)"/>',
  shirt: '<path d="M8 4 4 8l2.5 2.5L8 9v11h8V9l1.5 1.5L20 8l-4-4-1.5 1.5a3.5 3.5 0 0 1-5 0z"/>',
  receipt: '<path d="M6 3h12v16l-2-1.4L14 19l-2-1.4L10 19l-2-1.4L6 19z"/><path d="M9 8h6M9 11.5h6"/>',
  flame: '<path d="M12 3c1 3-3 4.5-3 8a4.4 4.4 0 0 0 3 4.2A4.6 4.6 0 0 0 17 11c0-1.6-.8-2.6-1.6-3.6C14.4 6 13 5 12 3z"/><path d="M12 21a6.5 6.5 0 0 1-6.5-6.5c0-1.6.6-3 1.4-4.3"/>',
  send: '<path d="M3.5 11 20.5 4l-4 16-4.6-5.8z"/><path d="M11.9 14.2 20.5 4"/>',
  route: '<circle cx="5" cy="18.5" r="2"/><circle cx="19" cy="5.5" r="2"/><path d="M7 18.5h6a4 4 0 0 0 4-4V9.5" stroke-dasharray="1 3.4"/>',
  door: '<rect x="6" y="3.5" width="12" height="17" rx="1.5"/><path d="m9.4 12 1.9 1.9 3.9-4.2"/>',
  shield: '<path d="M12 3.5 19 6v5.5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6z"/><path d="m9.2 11.7 2 2 3.7-4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.4 2.1"/>',
  star: '<path d="m12 4 2.4 5 5.4.7-4 3.8 1 5.4L12 16.3 7.2 18.9l1-5.4-4-3.8L9.6 9z"/>',
  chat: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.6 3.4V17H6.5A2.5 2.5 0 0 1 4 14.5z"/><path d="M8.5 9.2h7M8.5 12.2h4.5"/>',
  price: '<path d="m4 12 8-8h8v8l-8 8z"/><circle cx="16.5" cy="7.5" r="1.4"/>',
};
H.icon = (name, size, color = 'var(--green)', sw = 1.7) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

H.mascot = (scale = 1, pose = 'front') => {
  const lean = pose === 'run' ? 'transform="rotate(-14 100 130)"' : '';
  const speed = pose === 'run'
    ? `<g stroke="#c6ff4a" stroke-width="7" stroke-linecap="round" opacity="0.85">
         <path d="M8 96h44"/><path d="M-2 126h54"/><path d="M12 156h40"/></g>`
    : '';
  return `<svg width="${200 * scale}" height="${250 * scale}" viewBox="0 0 200 250" fill="none">
  ${speed}
  <g ${lean}>
    <path d="M60 118c0-24 18-38 40-38s40 14 40 38v62c0 18-14 30-40 30s-40-12-40-30z" fill="#0a1f12" stroke="#16e56b" stroke-width="6"/>
    <circle cx="100" cy="62" r="44" fill="#16e56b"/>
    <path d="M62 56h76v14a14 14 0 0 1-14 14H76a14 14 0 0 1-14-14z" fill="#05100a"/>
    <rect x="76" y="62" width="14" height="9" rx="4.5" fill="#f7fff9"/>
    <rect x="110" y="62" width="14" height="9" rx="4.5" fill="#f7fff9"/>
    <path d="M84 20c4-8 28-8 32 0l3 10H81z" fill="#0a8f44"/>
    <text x="100" y="155" text-anchor="middle" font-family="Anton" font-size="30" fill="#f7fff9">Za.</text>
    <rect x="128" y="150" width="52" height="44" rx="8" fill="#c6ff4a" stroke="#05100a" stroke-width="5" transform="rotate(8 154 172)"/>
    <path d="M128 168h52" stroke="#05100a" stroke-width="4" transform="rotate(8 154 172)"/>
    <path d="M58 150c-12 8-16 22-10 34" stroke="#16e56b" stroke-width="10" stroke-linecap="round"/>
  </g>
  ${pose === 'wheel' ? `<circle cx="100" cy="228" r="18" stroke="#16e56b" stroke-width="7" fill="none"/>
    <path d="M40 246a64 64 0 0 1 120 0" stroke="#c6ff4a" stroke-width="6" opacity="0.6"/>` : ''}
</svg>`;
};

H.pill = (text, fs = 34) =>
  `<div style="display:inline-block;background:var(--lime);color:var(--forest);font-family:var(--archivo);font-size:${fs}px;padding:${fs * 0.62}px ${fs * 1.3}px;border-radius:999px">${text}</div>`;

H.swatch = (name, hex, txt = '#05100a') => `
  <div style="flex:1;border-radius:28px;overflow:hidden;border:3px solid rgba(255,255,255,0.08)">
    <div style="height:270px;background:${hex}"></div>
    <div style="background:#0a1f12;padding:26px 30px">
      <div style="font-family:var(--anton);font-size:38px;color:var(--white)">${name}</div>
      <div style="font-size:24px;letter-spacing:3px;color:var(--green);margin-top:8px">${hex.toUpperCase()}</div>
    </div>
  </div>`;

/* ---------------- plate registry ---------------- */
const plates = [];
const plate = (id, name, w, h, body, cls = '') =>
  plates.push({ id, name, w, h, body, cls });

/* ============ A. CORE IDENTITY ============ */
plate('ip01-wordmark-primary', 'Primary wordmark', 1600, 900,
  `<div class="dotgrid"></div><div class="stack">${H.wordmark(150)}
   <div class="kick" style="font-size:26px;color:var(--green)">ERRANDS &bull; DELIVERY &bull; LAGOS</div></div>`);

plate('ip02-monogram-roundel', 'Monogram roundel', 1200, 1200,
  `<div class="dotgrid"></div>${H.roundel(560, { ring: 'rgba(22,229,107,0.25)' })}`);

plate('ip03-wordmark-reversed', 'Wordmark on light', 1600, 900,
  `<div class="stack">${H.wordmark(150, { onLight: true })}
   <div class="kick" style="font-size:26px;color:#0aa94b">YOUR ERRANDS. OUR PROBLEM.</div></div>`, 'light');

plate('ip04-wordmark-mono', 'Wordmark mono (1-color print)', 1600, 900,
  `<div class="stack">${H.wordmark(150, { mono: '#05100a' })}
   <div style="width:420px;height:8px;background:#05100a"></div></div>`, 'light');

plate('ip05-app-icon', 'App icon', 1024, 1024,
  `<div style="width:820px;height:820px;border-radius:190px;background:var(--grad-depth);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 10px rgba(22,229,107,0.35)">
     <div style="font-family:var(--anton);font-size:400px;color:var(--green)">Za<span style="color:var(--lime)">.</span></div></div>`);

plate('ip06-favicon-glyph', 'Favicon glyph', 1200, 1200,
  `<div class="row" style="gap:80px">
     <div style="width:420px;height:420px;border-radius:96px;background:var(--green);display:flex;align-items:center;justify-content:center"><span style="font-family:var(--anton);font-size:250px;color:var(--forest)">Z.</span></div>
     <div style="width:210px;height:210px;border-radius:48px;background:var(--green);display:flex;align-items:center;justify-content:center"><span style="font-family:var(--anton);font-size:125px;color:var(--forest)">Z.</span></div>
     <div style="width:105px;height:105px;border-radius:24px;background:var(--green);display:flex;align-items:center;justify-content:center"><span style="font-family:var(--anton);font-size:62px;color:var(--forest)">Z.</span></div>
   </div>`);

plate('ip07-tagline-lockup', 'Tagline lockup', 1600, 900,
  `<div class="dotgrid"></div><div class="stack" style="gap:30px">${H.wordmark(120)}
   <div class="tagline" style="font-size:64px">YOUR ERRANDS. <span class="alt">OUR PROBLEM.</span></div></div>`);

plate('ip08-stacked-lockup', 'Stacked lockup', 1200, 1400,
  `<div class="stack" style="gap:56px">${H.roundel(360)}${H.wordmark(110)}
   <div class="kick" style="font-size:24px;color:rgba(247,255,249,0.75)">DOLPHIN ESTATE &bull; LAGOS</div></div>`);

plate('ip09-badge-chip', 'Watermark badge chip', 1600, 600,
  `<div class="row" style="gap:60px">
    <div style="border:3px solid rgba(22,229,107,0.5);background:rgba(5,16,10,0.6);border-radius:999px;padding:34px 70px;font-size:44px;letter-spacing:4px">Za.allyErrands &bull; Dolphin Estate</div>
    <div style="border-radius:999px;background:var(--green);color:var(--forest);padding:34px 70px;font-size:44px;letter-spacing:4px">@za.allyerrands</div></div>`);

plate('ip10-order-badge', 'WhatsApp order badge', 1200, 1200,
  `<div class="stack" style="gap:44px">${H.icon('chat', 300, 'var(--lime)', 1.5)}
   <div style="font-family:var(--anton);font-size:110px">DM TO ORDER</div>
   ${H.pill('REPLIES IN MINUTES', 30)}</div>`);

/* ============ B. COLOR & TYPE ============ */
plate('ip11-palette', 'Color tokens', 1600, 1600,
  `<div class="sheet"><div><div class="lbl">BRAND IP &bull; 11</div><h2>Core Palette</h2></div>
   <div class="row" style="gap:34px;align-items:stretch">${H.swatch('Midnight Forest', '#05100a')}${H.swatch('Deep Moss', '#0a1f12')}${H.swatch('Signal Green', '#16e56b')}</div>
   <div class="row" style="gap:34px;align-items:stretch">${H.swatch('Volt Lime', '#c6ff4a')}${H.swatch('Mint Paper', '#eafff2')}
     <div style="flex:1;border-radius:28px;background:var(--grad-run);display:flex;align-items:flex-end;padding:30px"><div style="font-family:var(--anton);font-size:40px;color:var(--forest)">The Run<br>Gradient</div></div></div></div>`);

plate('ip12-gradients', 'Gradient system', 1600, 900,
  `<div class="sheet"><div><div class="lbl">BRAND IP &bull; 12</div><h2>Gradients</h2></div>
   <div style="display:flex;gap:34px;flex:1">
     <div style="flex:1;border-radius:28px;background:linear-gradient(90deg,#16e56b,#c6ff4a);display:flex;align-items:flex-end;padding:28px;color:#05100a;font-size:30px">THE RUN — CTAs</div>
     <div style="flex:1;border-radius:28px;background:linear-gradient(180deg,#0a1f12,#05100a);display:flex;align-items:flex-end;padding:28px;color:#16e56b;font-size:30px">DEPTH — backgrounds</div>
     <div style="flex:1;border-radius:28px;background:radial-gradient(120% 100% at 50% 0%,#16e56b33,#05100a);display:flex;align-items:flex-end;padding:28px;color:#f7fff9;font-size:30px">GLOW — heroes</div></div></div>`);

plate('ip13-type-system', 'Type system', 1600, 1600,
  `<div class="sheet"><div><div class="lbl">BRAND IP &bull; 13</div><h2>Typography</h2></div>
   <div style="border-top:3px solid #16e56b44;padding-top:44px"><div class="lbl">DISPLAY — ANTON</div>
     <div style="font-family:var(--anton);font-size:150px;line-height:1">SEND IT. FORGET IT.</div></div>
   <div style="border-top:3px solid #16e56b44;padding-top:44px"><div class="lbl">HEADLINE — ANTON 64</div>
     <div style="font-family:var(--anton);font-size:64px">Your errands, handled while you work.</div></div>
   <div style="border-top:3px solid #16e56b44;padding-top:44px"><div class="lbl">BODY / UI — ARCHIVO BLACK 34</div>
     <div style="font-size:34px;line-height:1.5">DM or WhatsApp to place your order.<br>Dolphin Estate &bull; Ikoyi &bull; Lagos.</div></div></div>`);

plate('ip14-clearspace', 'Clear space & usage', 1600, 1200,
  `<div class="sheet"><div><div class="lbl">BRAND IP &bull; 14</div><h2>Clear space = height of "Za."</h2></div>
   <div style="align-self:center;border:3px dashed #16e56b77;padding:110px 130px;position:relative">
     ${H.wordmark(110)}
     <div style="position:absolute;top:24px;left:50%;translate:-50% 0;color:var(--lime);font-size:24px">1 &times; Za.</div>
     <div style="position:absolute;left:24px;top:50%;translate:0 -50%;color:var(--lime);font-size:24px;writing-mode:vertical-rl">1 &times; Za.</div></div>
   <div class="row" style="gap:30px;margin-top:8px">
     <div style="flex:1;background:#0a1f12;border-radius:20px;padding:28px;font-size:26px"><span style="color:var(--green)">✓ DO</span>&nbsp; keep the dot lime or green</div>
     <div style="flex:1;background:#0a1f12;border-radius:20px;padding:28px;font-size:26px"><span style="color:#ff6b6b">✗ DON'T</span>&nbsp; stretch, recolor, or outline</div></div></div>`);

module.exports = { H, plates, plate };
