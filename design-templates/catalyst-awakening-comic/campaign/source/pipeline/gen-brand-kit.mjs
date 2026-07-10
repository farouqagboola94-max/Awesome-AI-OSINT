/* Generate the 50-asset Catalyst brand IP kit. */
import fs from 'fs';
import path from 'path';

const OUT = process.argv[2];
const mkdir = p => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };
const write = (p, s) => { mkdir(path.dirname(p)); fs.writeFileSync(p, s); };

const C = {
  gold:'#F4B800', black:'#06060d', navy:'#0a0a1f', iron:'#2a2a3a', ash:'#8a8a9a',
  bone:'#F0EDE5', red:'#C41E3A', orange:'#FF6B1A', teal:'#00C9B1', indigo:'#1a1a6e'
};
const F_TITLE = 'Bebas Neue, Impact, sans-serif';
const F_SUB   = 'Oswald, Helvetica, sans-serif';
const F_BODY  = 'Space Grotesk, system-ui, sans-serif';
const F_SERIF = 'Crimson Pro, Georgia, serif';

const svgOpen = (w, h, extra='') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"${extra}>`;
const wordmark = (color=C.gold, sub=null, sc=1, x=0, y=0) => {
  let out = `<g transform="translate(${x},${y}) scale(${sc})"><text x="0" y="0" font-family="${F_TITLE}" font-size="140" fill="${color}" letter-spacing="6">CATALYST</text>`;
  if (sub) out += `<text x="0" y="46" font-family="${F_SUB}" font-weight="600" font-size="22" fill="${sub}" letter-spacing="12">THE AWAKENING</text>`;
  out += '</g>';
  return out;
};
const grain = (w, h) => `<rect width="${w}" height="${h}" fill="url(#grain)" opacity="0.06" style="mix-blend-mode:overlay"/>`;
const grainDef = `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2"/></filter><pattern id="grainP" width="240" height="240" patternUnits="userSpaceOnUse"><rect width="240" height="240" filter="url(#grain)"/></pattern>`;
const brandmark = (x, y, color=C.bone, gcol=C.gold, url='catalyst-awakening.netlify.app') => `<g transform="translate(${x},${y})">
  <text font-family="${F_SUB}" font-weight="600" font-size="20" letter-spacing="6" fill="${color}" text-anchor="middle">CATALYST · <tspan fill="${gcol}" font-weight="700">THE AWAKENING</tspan></text>
  <text y="26" font-family="${F_BODY}" font-size="16" letter-spacing="4" fill="${C.ash}" text-anchor="middle">${url}</text>
</g>`;

/* ─────────  LOGOS  (10) ───────── */
write(`${OUT}/logos/01-wordmark-primary.svg`, svgOpen(1600, 500) + `
<rect width="1600" height="500" fill="${C.black}"/>
<g transform="translate(150,180)">
  <text font-family="${F_TITLE}" font-size="200" fill="${C.gold}" letter-spacing="10">CATALYST</text>
  <line x1="0" y1="60" x2="1120" y2="60" stroke="${C.gold}" stroke-width="6"/>
  <text y="120" font-family="${F_SUB}" font-weight="600" font-size="52" fill="${C.bone}" letter-spacing="24">THE AWAKENING</text>
</g></svg>`);

write(`${OUT}/logos/02-wordmark-reversed.svg`, svgOpen(1600, 500) + `
<rect width="1600" height="500" fill="${C.gold}"/>
<g transform="translate(150,180)">
  <text font-family="${F_TITLE}" font-size="200" fill="${C.black}" letter-spacing="10">CATALYST</text>
  <line x1="0" y1="60" x2="1120" y2="60" stroke="${C.black}" stroke-width="6"/>
  <text y="120" font-family="${F_SUB}" font-weight="600" font-size="52" fill="${C.black}" letter-spacing="24">THE AWAKENING</text>
</g></svg>`);

write(`${OUT}/logos/03-wordmark-mono-black.svg`, svgOpen(1600, 500) + `
<g transform="translate(150,180)">
  <text font-family="${F_TITLE}" font-size="200" fill="${C.black}" letter-spacing="10">CATALYST</text>
  <line x1="0" y1="60" x2="1120" y2="60" stroke="${C.black}" stroke-width="6"/>
  <text y="120" font-family="${F_SUB}" font-weight="600" font-size="52" fill="${C.black}" letter-spacing="24">THE AWAKENING</text>
</g></svg>`);

write(`${OUT}/logos/04-wordmark-mono-white.svg`, svgOpen(1600, 500) + `
<g transform="translate(150,180)">
  <text font-family="${F_TITLE}" font-size="200" fill="${C.bone}" letter-spacing="10">CATALYST</text>
  <line x1="0" y1="60" x2="1120" y2="60" stroke="${C.bone}" stroke-width="6"/>
  <text y="120" font-family="${F_SUB}" font-weight="600" font-size="52" fill="${C.bone}" letter-spacing="24">THE AWAKENING</text>
</g></svg>`);

write(`${OUT}/logos/05-lockup-stacked.svg`, svgOpen(1000, 1000) + `
<rect width="1000" height="1000" fill="${C.black}"/>
<g transform="translate(500,320)" text-anchor="middle">
  <text font-family="${F_SUB}" font-weight="300" font-size="30" letter-spacing="16" fill="${C.ash}">◈ LAGOS · NIGERIA ◈</text>
  <text y="200" font-family="${F_TITLE}" font-size="190" fill="${C.gold}" letter-spacing="6">CATALYST</text>
  <line x1="-260" y1="250" x2="260" y2="250" stroke="${C.gold}" stroke-width="6"/>
  <text y="320" font-family="${F_SUB}" font-weight="600" font-size="46" fill="${C.bone}" letter-spacing="16">THE AWAKENING</text>
  <text y="420" font-family="${F_BODY}" font-size="22" letter-spacing="8" fill="${C.ash}">A LAGOS NOIR COMIC UNIVERSE</text>
</g></svg>`);

write(`${OUT}/logos/06-lockup-horizontal.svg`, svgOpen(2000, 400) + `
<rect width="2000" height="400" fill="${C.black}"/>
<g transform="translate(220,240)">
  <circle cx="0" cy="-40" r="120" fill="none" stroke="${C.gold}" stroke-width="6"/>
  <text x="0" y="-25" font-family="${F_TITLE}" font-size="150" fill="${C.gold}" text-anchor="middle">C:TA</text>
</g>
<g transform="translate(480,220)">
  <text font-family="${F_TITLE}" font-size="140" fill="${C.gold}" letter-spacing="8">CATALYST</text>
  <text y="60" font-family="${F_SUB}" font-weight="600" font-size="34" fill="${C.bone}" letter-spacing="16">THE AWAKENING</text>
</g></svg>`);

write(`${OUT}/logos/07-mark-crossroads.svg`, svgOpen(600, 600) + `
<rect width="600" height="600" fill="${C.black}"/>
<g transform="translate(300,300)" fill="none" stroke="${C.gold}" stroke-width="10" stroke-linecap="round">
  <circle r="220"/>
  <line x1="-160" y1="-160" x2="160" y2="160"/>
  <line x1="160" y1="-160" x2="-160" y2="160"/>
  <circle r="40" fill="${C.gold}" stroke="none"/>
</g>
<text x="300" y="560" font-family="${F_SUB}" font-weight="600" font-size="26" letter-spacing="14" fill="${C.bone}" text-anchor="middle">CROSSROADS</text>
</svg>`);

write(`${OUT}/logos/08-mark-monogram.svg`, svgOpen(500, 500) + `
<rect width="500" height="500" fill="${C.gold}"/>
<g transform="translate(250,320)" text-anchor="middle">
  <text font-family="${F_TITLE}" font-size="220" fill="${C.black}" letter-spacing="-4">C:TA</text>
  <text y="80" font-family="${F_SUB}" font-weight="600" font-size="24" letter-spacing="12" fill="${C.black}">CATALYST</text>
</g></svg>`);

write(`${OUT}/logos/09-mark-orisha-star.svg`, svgOpen(600, 600) + (() => {
  const cx=300, cy=300, r=200;
  const pts = [];
  const labels = ['Ṣ', 'Ò', 'Ọ', 'B', 'Ẹ'];
  for (let i=0;i<5;i++) {
    const a = -Math.PI/2 + i * 2*Math.PI/5;
    pts.push({x: cx + Math.cos(a)*r, y: cy + Math.sin(a)*r, label: labels[i]});
  }
  // 5-pointed star with orisha initials
  let poly = '';
  for (let i=0;i<5;i++) {
    const from = pts[i];
    const to = pts[(i+2)%5];
    poly += `M${from.x},${from.y} L${to.x},${to.y} `;
  }
  let labelSvg = pts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="42" fill="${C.gold}"/><text x="${p.x}" y="${p.y+14}" font-family="${F_TITLE}" font-size="46" fill="${C.black}" text-anchor="middle">${p.label}</text>`).join('');
  return `<rect width="600" height="600" fill="${C.black}"/>
    <circle cx="${cx}" cy="${cy}" r="${r+40}" fill="none" stroke="${C.gold}" stroke-width="4" stroke-opacity="0.4"/>
    <path d="${poly}Z" fill="none" stroke="${C.gold}" stroke-width="6"/>
    ${labelSvg}
    <text x="300" y="570" font-family="${F_SUB}" font-weight="600" font-size="22" letter-spacing="12" fill="${C.bone}" text-anchor="middle">FIVE ORISHAS</text>`;
})() + '</svg>');

write(`${OUT}/logos/10-emblem-circular.svg`, svgOpen(600, 600) + `
<rect width="600" height="600" fill="${C.black}"/>
<circle cx="300" cy="300" r="270" fill="none" stroke="${C.gold}" stroke-width="6"/>
<circle cx="300" cy="300" r="230" fill="none" stroke="${C.gold}" stroke-width="2" stroke-dasharray="8 6"/>
<defs><path id="topArc" d="M 80,300 A 220,220 0 0 1 520,300"/><path id="botArc" d="M 80,300 A 220,220 0 0 0 520,300"/></defs>
<text font-family="${F_SUB}" font-weight="600" font-size="34" letter-spacing="18" fill="${C.gold}">
  <textPath href="#topArc" startOffset="50%" text-anchor="middle">CATALYST · THE AWAKENING</textPath>
</text>
<text font-family="${F_BODY}" font-size="22" letter-spacing="14" fill="${C.bone}">
  <textPath href="#botArc" startOffset="50%" text-anchor="middle">EST 2024 · LAGOS · NIGERIA</textPath>
</text>
<g transform="translate(300,310)" text-anchor="middle">
  <text font-family="${F_TITLE}" font-size="160" fill="${C.gold}">C:TA</text>
</g>
</svg>`);

/* ─────────  TOKENS (4) ───────── */
const tokens = {
  brand: { name: 'Catalyst: The Awakening', shortName: 'CATALYST', url: 'https://catalyst-awakening.netlify.app', tagline: 'A Lagos noir comic universe' },
  color: {
    primary: { gold: C.gold, black: C.black },
    accent: { red: C.red, orange: C.orange, teal: C.teal, indigo: C.indigo },
    neutral: { navy: C.navy, iron: C.iron, ash: C.ash, bone: C.bone }
  },
  typography: {
    display: { family: 'Bebas Neue', usage: 'Titles, hero, big numbers, chapter marks' },
    subhead: { family: 'Oswald', weight: '600–700', usage: 'Section labels, captions, tags' },
    body:    { family: 'Space Grotesk', usage: 'UI, coordinates, general reading' },
    editorial:{ family: 'Crimson Pro', usage: 'Pull quotes and editorial voice' }
  },
  scale: { xs: 12, sm: 14, md: 18, lg: 24, xl: 36, '2xl': 56, '3xl': 96, '4xl': 160, hero: 260 },
  radius: { sm: 6, md: 14, lg: 24, pill: 999 },
  spacing: { unit: 8, s1: 8, s2: 16, s3: 24, s4: 32, s6: 48, s8: 64, s12: 96 },
  effects: { grain: 0.06, vignetteStop: 0.55, glowGold: '0 0 80px rgba(244,184,0,0.35)' }
};
write(`${OUT}/tokens/tokens.json`, JSON.stringify(tokens, null, 2));

const cssTokens = `:root {
  /* Primary */
  --catalyst-gold: ${C.gold};
  --catalyst-black: ${C.black};
  /* Accents */
  --catalyst-red: ${C.red};
  --catalyst-orange: ${C.orange};
  --catalyst-teal: ${C.teal};
  --catalyst-indigo: ${C.indigo};
  /* Neutrals */
  --catalyst-navy: ${C.navy};
  --catalyst-iron: ${C.iron};
  --catalyst-ash: ${C.ash};
  --catalyst-bone: ${C.bone};
  /* Typography */
  --font-display: 'Bebas Neue', Impact, sans-serif;
  --font-subhead: 'Oswald', Helvetica, sans-serif;
  --font-body: 'Space Grotesk', system-ui, sans-serif;
  --font-editorial: 'Crimson Pro', Georgia, serif;
  /* Radius */
  --radius-sm: 6px;
  --radius-md: 14px;
  --radius-lg: 24px;
  --radius-pill: 999px;
  /* Effects */
  --shadow-gold: 0 0 80px rgba(244,184,0,0.35);
}
`;
write(`${OUT}/tokens/tokens.css`, cssTokens);

const scssTokens = `// Catalyst design tokens
$catalyst-gold: ${C.gold};
$catalyst-black: ${C.black};
$catalyst-red: ${C.red};
$catalyst-orange: ${C.orange};
$catalyst-teal: ${C.teal};
$catalyst-indigo: ${C.indigo};
$catalyst-navy: ${C.navy};
$catalyst-iron: ${C.iron};
$catalyst-ash: ${C.ash};
$catalyst-bone: ${C.bone};

$font-display: 'Bebas Neue', Impact, sans-serif;
$font-subhead: 'Oswald', Helvetica, sans-serif;
$font-body: 'Space Grotesk', system-ui, sans-serif;
$font-editorial: 'Crimson Pro', Georgia, serif;

$radius-sm: 6px;
$radius-md: 14px;
$radius-lg: 24px;
$radius-pill: 999px;
`;
write(`${OUT}/tokens/tokens.scss`, scssTokens);

write(`${OUT}/tokens/tokens.js`, `// Catalyst design tokens (ESM)
export const colors = ${JSON.stringify(tokens.color, null, 2)};
export const fonts = ${JSON.stringify(tokens.typography, null, 2)};
export const scale = ${JSON.stringify(tokens.scale, null, 2)};
export const radius = ${JSON.stringify(tokens.radius, null, 2)};
export const spacing = ${JSON.stringify(tokens.spacing, null, 2)};
export const effects = ${JSON.stringify(tokens.effects, null, 2)};
`);

/* ─────────  SWATCHES (2) ───────── */
const paletteSvg = () => {
  const rows = [
    { label: 'PRIMARY', items: [['Danfo Gold', C.gold], ['Ink Black', C.black]] },
    { label: 'ACCENTS', items: [['Blood Red', C.red], ['Neon Orange', C.orange], ['Orisha Teal', C.teal], ['Adire Indigo', C.indigo]] },
    { label: 'NEUTRALS', items: [['Deep Navy', C.navy], ['Iron Grey', C.iron], ['Ash Grey', C.ash], ['Bone White', C.bone]] }
  ];
  let out = svgOpen(1200, 1500) + `<rect width="1200" height="1500" fill="${C.black}"/>`;
  out += `<text x="80" y="120" font-family="${F_TITLE}" font-size="80" fill="${C.gold}" letter-spacing="6">PALETTE</text>`;
  out += `<text x="80" y="170" font-family="${F_SUB}" font-weight="600" font-size="26" fill="${C.bone}" letter-spacing="12">CATALYST BRAND SYSTEM</text>`;
  let y = 260;
  for (const row of rows) {
    out += `<text x="80" y="${y}" font-family="${F_SUB}" font-weight="700" font-size="30" fill="${C.ash}" letter-spacing="14">${row.label}</text>`;
    let x = 80;
    for (const [name, hex] of row.items) {
      out += `<rect x="${x}" y="${y+30}" width="240" height="240" fill="${hex}" rx="18"/>`;
      out += `<text x="${x+12}" y="${y+296}" font-family="${F_SUB}" font-weight="700" font-size="22" fill="${C.bone}">${name}</text>`;
      out += `<text x="${x+12}" y="${y+322}" font-family="${F_BODY}" font-size="18" fill="${C.ash}" letter-spacing="4">${hex.toUpperCase()}</text>`;
      x += 260;
    }
    y += 400;
  }
  return out + '</svg>';
};
write(`${OUT}/swatches/palette.svg`, paletteSvg());

write(`${OUT}/swatches/type-specimen.svg`, svgOpen(1200, 1500) + `
<rect width="1200" height="1500" fill="${C.black}"/>
<text x="80" y="120" font-family="${F_TITLE}" font-size="80" fill="${C.gold}" letter-spacing="6">TYPOGRAPHY</text>
<text x="80" y="170" font-family="${F_SUB}" font-weight="600" font-size="26" fill="${C.bone}" letter-spacing="12">FOUR FAMILIES · ONE VOICE</text>

<text x="80" y="290" font-family="${F_SUB}" font-weight="300" font-size="22" fill="${C.ash}" letter-spacing="12">DISPLAY</text>
<text x="80" y="440" font-family="${F_TITLE}" font-size="200" fill="${C.gold}" letter-spacing="4">LAGOS.</text>
<text x="80" y="490" font-family="${F_BODY}" font-size="20" fill="${C.ash}" letter-spacing="4">Bebas Neue · titles, hero, chapter marks</text>

<text x="80" y="580" font-family="${F_SUB}" font-weight="300" font-size="22" fill="${C.ash}" letter-spacing="12">SUBHEAD</text>
<text x="80" y="660" font-family="${F_SUB}" font-weight="700" font-size="72" fill="${C.bone}" letter-spacing="10">THE AWAKENING</text>
<text x="80" y="700" font-family="${F_BODY}" font-size="20" fill="${C.ash}" letter-spacing="4">Oswald · section labels, captions, tags</text>

<text x="80" y="790" font-family="${F_SUB}" font-weight="300" font-size="22" fill="${C.ash}" letter-spacing="12">BODY</text>
<text x="80" y="860" font-family="${F_BODY}" font-size="42" fill="${C.bone}">A Lagos noir comic universe.</text>
<text x="80" y="895" font-family="${F_BODY}" font-size="20" fill="${C.ash}" letter-spacing="4">Space Grotesk · UI, coordinates, reading</text>

<text x="80" y="990" font-family="${F_SUB}" font-weight="300" font-size="22" fill="${C.ash}" letter-spacing="12">EDITORIAL</text>
<text x="80" y="1070" font-family="${F_SERIF}" font-style="italic" font-size="46" fill="${C.bone}">"The gods never left. They were waiting."</text>
<text x="80" y="1105" font-family="${F_BODY}" font-size="20" fill="${C.ash}" letter-spacing="4">Crimson Pro Italic · pull quotes, editorial voice</text>

<line x1="80" y1="1200" x2="1120" y2="1200" stroke="${C.gold}" stroke-width="3"/>
<text x="80" y="1260" font-family="${F_SUB}" font-weight="600" font-size="30" fill="${C.gold}" letter-spacing="10">HIERARCHY RULE</text>
<text x="80" y="1310" font-family="${F_BODY}" font-size="24" fill="${C.bone}">Display &gt; Subhead &gt; Body &gt; Editorial. Never mix two displays in the same block.</text>
</svg>`);

/* ─────────  SOCIAL SQUARE 1080x1080 (5) ───────── */
const igCard = (fill=C.black, contentFn) => {
  return svgOpen(1080, 1080) + `<defs>${grainDef}</defs>
<rect width="1080" height="1080" fill="${fill}"/>
${contentFn()}
<rect width="1080" height="1080" fill="url(#grainP)" opacity="0.08" style="mix-blend-mode:overlay"/>
${brandmark(540, 1000)}
</svg>`;
};

write(`${OUT}/social/01-ig-launch.svg`, igCard(C.gold, () => `
<text x="80" y="180" font-family="${F_SUB}" font-weight="700" font-size="30" fill="${C.black}" letter-spacing="18">◈ NOW READING ◈</text>
<text x="80" y="410" font-family="${F_TITLE}" font-size="260" fill="${C.black}" letter-spacing="2">LAGOS.</text>
<text x="80" y="580" font-family="${F_TITLE}" font-size="180" fill="${C.red}" letter-spacing="2">AWAKENS.</text>
<line x1="80" y1="660" x2="500" y2="660" stroke="${C.black}" stroke-width="8"/>
<text x="80" y="750" font-family="${F_SUB}" font-weight="300" font-size="34" fill="${C.black}" letter-spacing="12">4 FREE ISSUES</text>
<text x="80" y="800" font-family="${F_SUB}" font-weight="700" font-size="46" fill="${C.black}" letter-spacing="6">READ ONLINE NOW ↗</text>
`));

write(`${OUT}/social/02-ig-quote.svg`, igCard(C.black, () => `
<text x="90" y="220" font-family="${F_TITLE}" font-size="200" fill="${C.gold}" letter-spacing="-4">"</text>
<g transform="translate(90, 380)">
  <text font-family="${F_SERIF}" font-style="italic" font-size="72" fill="${C.bone}">The gods never left.</text>
  <text y="90" font-family="${F_SERIF}" font-style="italic" font-size="72" fill="${C.bone}">They were waiting</text>
  <text y="180" font-family="${F_SERIF}" font-style="italic" font-size="72" fill="${C.bone}">for the right <tspan fill="${C.gold}">vessel</tspan>.</text>
</g>
<line x1="90" y1="740" x2="270" y2="740" stroke="${C.gold}" stroke-width="4"/>
<text x="90" y="810" font-family="${F_SUB}" font-weight="600" font-size="26" letter-spacing="14" fill="${C.ash}">— ISSUE 1 · THE AWAKENING</text>
`));

write(`${OUT}/social/03-ig-character.svg`, igCard(C.navy, () => `
<rect x="80" y="80" width="920" height="200" fill="${C.gold}"/>
<text x="120" y="200" font-family="${F_TITLE}" font-size="150" fill="${C.black}" letter-spacing="8">BAYO</text>
<text x="120" y="260" font-family="${F_SUB}" font-weight="600" font-size="34" letter-spacing="12" fill="${C.black}">ADEYEMI · 19 · MUSHIN</text>

<g transform="translate(120, 380)" font-family="${F_SUB}" font-weight="500" letter-spacing="5">
  <text font-size="26" fill="${C.ash}">ORISHAS</text>
  <text y="70" font-size="64" fill="${C.gold}" font-weight="700">FIVE</text>
</g>
<g transform="translate(560, 380)" font-family="${F_SUB}" font-weight="500" letter-spacing="5">
  <text font-size="26" fill="${C.ash}">STATUS</text>
  <text y="70" font-size="64" fill="${C.gold}" font-weight="700">CHOSEN</text>
</g>
<g transform="translate(120, 560)" font-family="${F_SUB}" font-weight="500" letter-spacing="5">
  <text font-size="26" fill="${C.ash}">POWERS</text>
  <text y="60" font-size="46" fill="${C.bone}">ṢÀNGÓ · ÒGÚN · Ọ̀ṢUN</text>
  <text y="115" font-size="46" fill="${C.bone}">OBATÀLÁ · ẸṢÙ</text>
</g>
`));

write(`${OUT}/social/04-ig-chapter-drop.svg`, igCard(C.black, () => `
<circle cx="540" cy="360" r="240" fill="${C.gold}"/>
<text x="540" y="440" font-family="${F_TITLE}" font-size="380" fill="${C.black}" text-anchor="middle" letter-spacing="-8">05</text>
<text x="540" y="720" font-family="${F_SUB}" font-weight="300" font-size="30" letter-spacing="18" fill="${C.ash}" text-anchor="middle">◈ NEW ISSUE ◈</text>
<text x="540" y="820" font-family="${F_TITLE}" font-size="130" fill="${C.gold}" text-anchor="middle" letter-spacing="4">FIRE IN MUSHIN</text>
<text x="540" y="880" font-family="${F_SUB}" font-weight="600" font-size="30" letter-spacing="14" fill="${C.bone}" text-anchor="middle">FREE ONLINE · READ NOW</text>
`));

write(`${OUT}/social/05-ig-poll.svg`, igCard(C.indigo, () => {
  const opts = [
    ['A', 'ṢÀNGÓ · THUNDER', C.red],
    ['B', 'ÒGÚN · IRON', C.orange],
    ['C', 'Ọ̀ṢUN · RIVER', C.teal],
    ['D', 'OBATÀLÁ · SKY', C.bone],
    ['E', 'ẸṢÙ · CHAOS', C.gold]
  ];
  let out = `<text x="540" y="150" font-family="${F_TITLE}" font-size="120" fill="${C.gold}" text-anchor="middle" letter-spacing="6">WHICH ORISHA</text>
  <text x="540" y="260" font-family="${F_TITLE}" font-size="120" fill="${C.bone}" text-anchor="middle" letter-spacing="6">ARE YOU?</text>`;
  opts.forEach(([k,l,c], i) => {
    const y = 340 + i * 108;
    out += `<rect x="80" y="${y}" width="920" height="90" fill="none" stroke="${c}" stroke-width="5" rx="14"/>
    <text x="120" y="${y+62}" font-family="${F_TITLE}" font-size="60" fill="${c}">${k}</text>
    <text x="1000" y="${y+58}" font-family="${F_SUB}" font-weight="700" font-size="38" letter-spacing="8" fill="${c}" text-anchor="end">${l}</text>`;
  });
  return out;
}));

/* ─────────  SOCIAL STORY 1080x1920 (5) ───────── */
const storyCard = (fill, contentFn) => svgOpen(1080, 1920) + `<defs>${grainDef}</defs>
<rect width="1080" height="1920" fill="${fill}"/>
${contentFn()}
<rect width="1080" height="1920" fill="url(#grainP)" opacity="0.08" style="mix-blend-mode:overlay"/>
${brandmark(540, 1800)}
</svg>`;

write(`${OUT}/social/06-story-countdown.svg`, storyCard(C.black, () => `
<text x="540" y="360" font-family="${F_SUB}" font-weight="700" font-size="34" letter-spacing="18" fill="${C.gold}" text-anchor="middle">◈ NEXT ISSUE DROPS ◈</text>
<text x="540" y="620" font-family="${F_TITLE}" font-size="500" fill="${C.gold}" text-anchor="middle" letter-spacing="-4">05</text>
<line x1="240" y1="720" x2="840" y2="720" stroke="${C.gold}" stroke-width="6"/>
<text x="540" y="830" font-family="${F_TITLE}" font-size="150" fill="${C.bone}" text-anchor="middle" letter-spacing="4">FIRE IN MUSHIN</text>

<g transform="translate(540, 1140)" text-anchor="middle" font-family="${F_TITLE}">
  <text x="-260" font-size="150" fill="${C.gold}">14</text>
  <text x="-260" y="60" font-family="${F_SUB}" font-weight="300" font-size="30" fill="${C.ash}" letter-spacing="8">DAYS</text>
  <text x="0" font-size="150" fill="${C.gold}">08</text>
  <text x="0" y="60" font-family="${F_SUB}" font-weight="300" font-size="30" fill="${C.ash}" letter-spacing="8">HRS</text>
  <text x="260" font-size="150" fill="${C.gold}">42</text>
  <text x="260" y="60" font-family="${F_SUB}" font-weight="300" font-size="30" fill="${C.ash}" letter-spacing="8">MIN</text>
</g>
<text x="540" y="1500" font-family="${F_SUB}" font-weight="600" font-size="40" letter-spacing="14" fill="${C.bone}" text-anchor="middle">SET A REMINDER ↗</text>
`));

write(`${OUT}/social/07-story-cta.svg`, storyCard(C.gold, () => `
<text x="540" y="500" font-family="${F_TITLE}" font-size="380" fill="${C.black}" text-anchor="middle" letter-spacing="-6" >READ.</text>
<text x="540" y="820" font-family="${F_TITLE}" font-size="220" fill="${C.red}" text-anchor="middle" letter-spacing="-2">CHAPTER</text>
<text x="540" y="1000" font-family="${F_TITLE}" font-size="220" fill="${C.red}" text-anchor="middle" letter-spacing="-2">ONE.</text>
<line x1="240" y1="1100" x2="840" y2="1100" stroke="${C.black}" stroke-width="8"/>
<text x="540" y="1240" font-family="${F_SUB}" font-weight="700" font-size="46" letter-spacing="14" fill="${C.black}" text-anchor="middle">FREE · ONLINE · FOREVER</text>
<text x="540" y="1500" font-family="${F_SUB}" font-weight="700" font-size="34" letter-spacing="10" fill="${C.black}" text-anchor="middle">TAP THE LINK IN BIO ↗</text>
`));

write(`${OUT}/social/08-story-quote.svg`, storyCard(C.navy, () => `
<text x="540" y="440" font-family="${F_TITLE}" font-size="260" fill="${C.gold}" text-anchor="middle">"</text>
<text x="540" y="700" font-family="${F_SERIF}" font-style="italic" font-size="72" fill="${C.bone}" text-anchor="middle">The city was breathing.</text>
<text x="540" y="800" font-family="${F_SERIF}" font-style="italic" font-size="72" fill="${C.bone}" text-anchor="middle">He just learned</text>
<text x="540" y="900" font-family="${F_SERIF}" font-style="italic" font-size="72" fill="${C.bone}" text-anchor="middle">how to <tspan fill="${C.gold}">listen</tspan>.</text>
<line x1="440" y1="1020" x2="640" y2="1020" stroke="${C.gold}" stroke-width="4"/>
<text x="540" y="1100" font-family="${F_SUB}" font-weight="600" font-size="30" letter-spacing="14" fill="${C.ash}" text-anchor="middle">— ISSUE 1 · THE AWAKENING</text>
`));

write(`${OUT}/social/09-story-bts.svg`, storyCard(C.black, () => `
<text x="540" y="200" font-family="${F_SUB}" font-weight="700" font-size="34" letter-spacing="18" fill="${C.gold}" text-anchor="middle">◈ BEHIND THE SCENES ◈</text>
<g transform="translate(540, 640)" text-anchor="middle" font-family="${F_TITLE}">
  <text font-size="120" fill="${C.bone}">STORYBOARDS.</text>
  <text y="140" font-size="120" fill="${C.bone}">MUSIC BOARDS.</text>
  <text y="280" font-size="120" fill="${C.bone}">SCRIPT NOTES.</text>
  <text y="420" font-size="140" fill="${C.gold}">EVERYTHING.</text>
</g>
<text x="540" y="1360" font-family="${F_SUB}" font-weight="600" font-size="36" letter-spacing="14" fill="${C.bone}" text-anchor="middle">FOLLOW FOR THE MAKING OF</text>
<text x="540" y="1420" font-family="${F_SUB}" font-weight="700" font-size="34" letter-spacing="10" fill="${C.gold}" text-anchor="middle">@CATALYSTCOMICSHQ</text>
`));

write(`${OUT}/social/10-story-linksticker.svg`, storyCard(C.gold, () => `
<text x="540" y="300" font-family="${F_SUB}" font-weight="300" font-size="40" letter-spacing="16" fill="${C.black}" text-anchor="middle">◈ FREE · ONLINE ◈</text>
<text x="540" y="620" font-family="${F_TITLE}" font-size="280" fill="${C.black}" text-anchor="middle" letter-spacing="-2">CATALYST</text>
<line x1="240" y1="700" x2="840" y2="700" stroke="${C.black}" stroke-width="8"/>
<text x="540" y="800" font-family="${F_SUB}" font-weight="700" font-size="60" letter-spacing="18" fill="${C.black}" text-anchor="middle">THE AWAKENING</text>
<rect x="180" y="1000" width="720" height="180" rx="90" fill="${C.black}"/>
<text x="540" y="1112" font-family="${F_SUB}" font-weight="700" font-size="52" letter-spacing="14" fill="${C.gold}" text-anchor="middle">TAP TO READ ↗</text>
<text x="540" y="1300" font-family="${F_BODY}" font-size="26" letter-spacing="6" fill="${C.black}" text-anchor="middle">catalyst-awakening.netlify.app</text>
`));

/* ─────────  PLATFORM COVERS (5) ───────── */
write(`${OUT}/platform/11-twitter-header.svg`, svgOpen(1500, 500) + `<defs>${grainDef}</defs>
<rect width="1500" height="500" fill="${C.black}"/>
<rect width="1500" height="500" fill="url(#grainP)" opacity="0.06" style="mix-blend-mode:overlay"/>
<g transform="translate(80,180)">
  <text font-family="${F_TITLE}" font-size="150" fill="${C.gold}" letter-spacing="8">CATALYST</text>
  <text y="46" font-family="${F_SUB}" font-weight="600" font-size="32" fill="${C.bone}" letter-spacing="16">THE AWAKENING</text>
</g>
<g transform="translate(80, 380)">
  <text font-family="${F_BODY}" font-size="26" fill="${C.ash}" letter-spacing="6">A LAGOS NOIR COMIC UNIVERSE · 4 FREE ISSUES · MADE IN LAGOS</text>
</g>
<g transform="translate(1200, 200)">
  <circle r="100" fill="none" stroke="${C.gold}" stroke-width="4"/>
  <text font-family="${F_TITLE}" font-size="80" fill="${C.gold}" text-anchor="middle" y="26">C:TA</text>
</g>
</svg>`);

write(`${OUT}/platform/12-youtube-thumbnail.svg`, svgOpen(1280, 720) + `<defs>${grainDef}</defs>
<rect width="1280" height="720" fill="${C.black}"/>
<rect width="640" height="720" fill="${C.gold}"/>
<rect width="1280" height="720" fill="url(#grainP)" opacity="0.06" style="mix-blend-mode:overlay"/>
<text x="80" y="240" font-family="${F_SUB}" font-weight="700" font-size="30" fill="${C.black}" letter-spacing="18">◈ NEW ISSUE ◈</text>
<text x="60" y="400" font-family="${F_TITLE}" font-size="140" fill="${C.black}" letter-spacing="4">FIRE IN</text>
<text x="60" y="540" font-family="${F_TITLE}" font-size="140" fill="${C.red}" letter-spacing="4">MUSHIN</text>
<g transform="translate(760, 240)">
  <text font-family="${F_TITLE}" font-size="300" fill="${C.gold}" letter-spacing="-4">05</text>
  <text y="60" font-family="${F_SUB}" font-weight="600" font-size="34" letter-spacing="12" fill="${C.bone}">CHAPTER FIVE</text>
</g>
<rect x="900" y="500" width="260" height="80" fill="${C.gold}"/>
<text x="1030" y="558" font-family="${F_SUB}" font-weight="700" font-size="38" letter-spacing="8" fill="${C.black}" text-anchor="middle">FREE ↗</text>
</svg>`);

write(`${OUT}/platform/13-tiktok-cover.svg`, svgOpen(1080, 1920) + `<defs>${grainDef}</defs>
<rect width="1080" height="1920" fill="${C.black}"/>
<rect width="1080" height="1920" fill="url(#grainP)" opacity="0.08" style="mix-blend-mode:overlay"/>
<g transform="translate(540, 400)" text-anchor="middle">
  <text font-family="${F_SUB}" font-weight="700" font-size="34" letter-spacing="18" fill="${C.gold}">◈ CATALYST STUDIO ◈</text>
  <text y="240" font-family="${F_TITLE}" font-size="280" fill="${C.gold}" letter-spacing="-2">LAGOS</text>
  <text y="480" font-family="${F_TITLE}" font-size="220" fill="${C.bone}">NEVER</text>
  <text y="700" font-family="${F_TITLE}" font-size="220" fill="${C.bone}">SLEEPS.</text>
</g>
<rect x="180" y="1500" width="720" height="120" rx="60" fill="${C.gold}"/>
<text x="540" y="1580" font-family="${F_SUB}" font-weight="700" font-size="44" letter-spacing="14" fill="${C.black}" text-anchor="middle">READ THE COMIC ↗</text>
${brandmark(540, 1830, C.bone, C.gold)}
</svg>`);

write(`${OUT}/platform/14-discord-banner.svg`, svgOpen(960, 540) + `<defs>${grainDef}</defs>
<rect width="960" height="540" fill="${C.navy}"/>
<rect width="960" height="540" fill="url(#grainP)" opacity="0.08" style="mix-blend-mode:overlay"/>
<g transform="translate(60, 200)">
  <text font-family="${F_TITLE}" font-size="130" fill="${C.gold}" letter-spacing="6">CATALYST</text>
  <text y="46" font-family="${F_SUB}" font-weight="600" font-size="30" fill="${C.bone}" letter-spacing="14">THE AWAKENING · SERVER</text>
</g>
<g transform="translate(60, 420)">
  <text font-family="${F_BODY}" font-size="22" fill="${C.ash}" letter-spacing="4">◈ FAN CLUB · ISSUE DROPS · Q&amp;A · GIVEAWAYS ◈</text>
</g>
<g transform="translate(760, 130)">
  <circle r="100" fill="none" stroke="${C.gold}" stroke-width="4"/>
  <text font-family="${F_TITLE}" font-size="80" fill="${C.gold}" text-anchor="middle" y="26">C:TA</text>
</g>
</svg>`);

write(`${OUT}/platform/15-linkedin-banner.svg`, svgOpen(1584, 396) + `<defs>${grainDef}</defs>
<rect width="1584" height="396" fill="${C.black}"/>
<rect width="1584" height="396" fill="url(#grainP)" opacity="0.06" style="mix-blend-mode:overlay"/>
<g transform="translate(60, 210)">
  <text font-family="${F_TITLE}" font-size="120" fill="${C.gold}" letter-spacing="8">CATALYST COMICS STUDIO</text>
  <text y="46" font-family="${F_SUB}" font-weight="600" font-size="30" fill="${C.bone}" letter-spacing="18">AFRICAN SUPERHERO UNIVERSE · BUILT IN LAGOS</text>
</g>
</svg>`);

/* ─────────  PRINT & MERCH (7) ───────── */
write(`${OUT}/print/16-tshirt-front.svg`, svgOpen(2400, 3000) + `
<rect width="2400" height="3000" fill="${C.black}"/>
<g transform="translate(1200, 1400)" text-anchor="middle">
  <text font-family="${F_TITLE}" font-size="360" fill="${C.gold}" letter-spacing="10">CATALYST</text>
  <line x1="-500" y1="80" x2="500" y2="80" stroke="${C.gold}" stroke-width="12"/>
  <text y="180" font-family="${F_SUB}" font-weight="700" font-size="90" fill="${C.bone}" letter-spacing="30">THE AWAKENING</text>
  <text y="400" font-family="${F_BODY}" font-size="34" fill="${C.ash}" letter-spacing="14">◈ LAGOS · NIGERIA ◈</text>
</g></svg>`);

write(`${OUT}/print/17-tshirt-back.svg`, svgOpen(2400, 3000) + `
<rect width="2400" height="3000" fill="${C.black}"/>
<g transform="translate(1200, 640)" text-anchor="middle">
  <text font-family="${F_SUB}" font-weight="300" font-size="42" fill="${C.ash}" letter-spacing="20">◈ FIVE ORISHAS · ONE VESSEL ◈</text>
</g>
<g transform="translate(1200, 1200)" text-anchor="middle" font-family="${F_TITLE}">
  <text font-size="180" fill="${C.red}">ṢÀNGÓ</text>
  <text y="200" font-size="180" fill="${C.orange}">ÒGÚN</text>
  <text y="400" font-size="180" fill="${C.teal}">Ọ̀ṢUN</text>
  <text y="600" font-size="180" fill="${C.bone}">OBATÀLÁ</text>
  <text y="800" font-size="180" fill="${C.gold}">ẸṢÙ</text>
</g></svg>`);

write(`${OUT}/print/18-poster-a2.svg`, svgOpen(1680, 2380) + `<defs>${grainDef}</defs>
<rect width="1680" height="2380" fill="${C.black}"/>
<rect width="1680" height="2380" fill="url(#grainP)" opacity="0.09" style="mix-blend-mode:overlay"/>
<g transform="translate(120, 260)">
  <text font-family="${F_SUB}" font-weight="700" font-size="42" fill="${C.gold}" letter-spacing="18">◈ CATALYST COMICS STUDIO PRESENTS ◈</text>
</g>
<g transform="translate(120, 700)">
  <text font-family="${F_TITLE}" font-size="340" fill="${C.gold}" letter-spacing="4">CATALYST</text>
  <line x1="0" y1="80" x2="1440" y2="80" stroke="${C.gold}" stroke-width="14"/>
  <text y="200" font-family="${F_SUB}" font-weight="700" font-size="80" fill="${C.bone}" letter-spacing="26">THE AWAKENING</text>
</g>
<g transform="translate(120, 1400)">
  <text font-family="${F_SERIF}" font-style="italic" font-size="60" fill="${C.bone}">"Where the blood of Orishas</text>
  <text y="80" font-family="${F_SERIF}" font-style="italic" font-size="60" fill="${C.bone}">meets the concrete of Lagos."</text>
</g>
<g transform="translate(120, 1900)">
  <text font-family="${F_TITLE}" font-size="140" fill="${C.gold}" letter-spacing="8">4 FREE ISSUES</text>
  <text y="70" font-family="${F_SUB}" font-weight="600" font-size="42" fill="${C.bone}" letter-spacing="14">READ ONLINE · MADE IN LAGOS</text>
  <text y="140" font-family="${F_BODY}" font-size="26" fill="${C.ash}" letter-spacing="8">catalyst-awakening.netlify.app</text>
</g>
</svg>`);

write(`${OUT}/print/19-sticker-sheet.svg`, svgOpen(1200, 1600) + `
<rect width="1200" height="1600" fill="${C.bone}"/>
<g transform="translate(100, 140)"><circle r="120" fill="${C.gold}" stroke="${C.black}" stroke-width="8"/>
  <text font-family="${F_TITLE}" font-size="110" fill="${C.black}" text-anchor="middle" y="34">C:TA</text></g>
<g transform="translate(420, 140)"><rect x="-140" y="-80" width="280" height="160" fill="${C.red}" stroke="${C.black}" stroke-width="8"/>
  <text font-family="${F_TITLE}" font-size="80" fill="${C.bone}" text-anchor="middle" y="14">LAGOS.</text></g>
<g transform="translate(740, 140)"><circle r="120" fill="${C.black}" stroke="${C.gold}" stroke-width="8"/>
  <text font-family="${F_SUB}" font-weight="700" font-size="32" fill="${C.gold}" text-anchor="middle" y="0" letter-spacing="6">CATALYST</text>
  <text font-family="${F_SUB}" font-weight="300" font-size="20" fill="${C.gold}" text-anchor="middle" y="40" letter-spacing="6">THE AWAKENING</text></g>
<g transform="translate(1060, 140)"><rect x="-100" y="-100" width="200" height="200" fill="${C.gold}" stroke="${C.black}" stroke-width="8" transform="rotate(45)"/>
  <text font-family="${F_TITLE}" font-size="80" fill="${C.black}" text-anchor="middle" y="30">05</text></g>

<g transform="translate(100, 460)"><rect x="-140" y="-100" width="280" height="200" fill="${C.black}" stroke="${C.gold}" stroke-width="6"/>
  <text font-family="${F_TITLE}" font-size="80" fill="${C.gold}" text-anchor="middle" y="10">ṢÀNGÓ</text></g>
<g transform="translate(420, 460)"><rect x="-140" y="-100" width="280" height="200" fill="${C.black}" stroke="${C.orange}" stroke-width="6"/>
  <text font-family="${F_TITLE}" font-size="80" fill="${C.orange}" text-anchor="middle" y="10">ÒGÚN</text></g>
<g transform="translate(740, 460)"><rect x="-140" y="-100" width="280" height="200" fill="${C.black}" stroke="${C.teal}" stroke-width="6"/>
  <text font-family="${F_TITLE}" font-size="80" fill="${C.teal}" text-anchor="middle" y="10">Ọ̀ṢUN</text></g>
<g transform="translate(1060, 460)"><rect x="-140" y="-100" width="280" height="200" fill="${C.black}" stroke="${C.bone}" stroke-width="6"/>
  <text font-family="${F_TITLE}" font-size="70" fill="${C.bone}" text-anchor="middle" y="10">OBATÀLÁ</text></g>

<g transform="translate(600, 900)"><rect x="-500" y="-80" width="1000" height="160" fill="${C.gold}"/>
  <text font-family="${F_TITLE}" font-size="130" fill="${C.black}" text-anchor="middle" y="40" letter-spacing="6">READ ONLINE — FREE</text></g>

<g transform="translate(240, 1200)"><circle r="130" fill="${C.red}"/>
  <text font-family="${F_TITLE}" font-size="70" fill="${C.bone}" text-anchor="middle" y="-6">READ</text>
  <text font-family="${F_TITLE}" font-size="70" fill="${C.bone}" text-anchor="middle" y="60">ME.</text></g>
<g transform="translate(600, 1200)"><rect x="-160" y="-100" width="320" height="200" fill="${C.gold}"/>
  <text font-family="${F_TITLE}" font-size="120" fill="${C.black}" text-anchor="middle" y="30">4 FREE</text></g>
<g transform="translate(960, 1200)"><circle r="130" fill="none" stroke="${C.black}" stroke-width="10"/>
  <text font-family="${F_SUB}" font-weight="700" font-size="30" fill="${C.black}" text-anchor="middle" y="10" letter-spacing="6">MADE IN</text>
  <text font-family="${F_TITLE}" font-size="70" fill="${C.black}" text-anchor="middle" y="70">LAGOS</text></g>
</svg>`);

write(`${OUT}/print/20-enamel-pin.svg`, svgOpen(600, 600) + `
<rect width="600" height="600" fill="${C.bone}"/>
<g transform="translate(300, 300)">
  <circle r="240" fill="${C.gold}" stroke="${C.black}" stroke-width="10"/>
  <circle r="200" fill="none" stroke="${C.black}" stroke-width="3" stroke-dasharray="6 4"/>
  <text font-family="${F_TITLE}" font-size="160" fill="${C.black}" text-anchor="middle" y="20" letter-spacing="-4">C:TA</text>
  <text font-family="${F_SUB}" font-weight="700" font-size="24" fill="${C.black}" text-anchor="middle" y="90" letter-spacing="10">CATALYST</text>
</g>
<text x="300" y="580" font-family="${F_SUB}" font-weight="300" font-size="22" letter-spacing="12" fill="${C.black}" text-anchor="middle">ENAMEL PIN · 40 MM</text>
</svg>`);

write(`${OUT}/print/21-business-card-front.svg`, svgOpen(1050, 600) + `
<rect width="1050" height="600" fill="${C.black}"/>
<g transform="translate(60, 200)">
  <text font-family="${F_TITLE}" font-size="130" fill="${C.gold}" letter-spacing="8">CATALYST</text>
  <text y="46" font-family="${F_SUB}" font-weight="600" font-size="32" fill="${C.bone}" letter-spacing="18">THE AWAKENING</text>
</g>
<g transform="translate(60, 500)">
  <text font-family="${F_BODY}" font-size="22" letter-spacing="6" fill="${C.ash}">A LAGOS NOIR COMIC UNIVERSE</text>
</g>
</svg>`);

write(`${OUT}/print/22-business-card-back.svg`, svgOpen(1050, 600) + `
<rect width="1050" height="600" fill="${C.gold}"/>
<g transform="translate(60, 140)">
  <text font-family="${F_SUB}" font-weight="700" font-size="30" fill="${C.black}" letter-spacing="6">TAIWO ADEGOKE</text>
  <text y="46" font-family="${F_SUB}" font-weight="300" font-size="24" fill="${C.black}" letter-spacing="10">SHOWRUNNER · CATALYST COMICS STUDIO</text>
</g>
<g transform="translate(60, 350)" font-family="${F_BODY}" font-size="24" fill="${C.black}" letter-spacing="4">
  <text>catalystcomicstudio@gmail.com</text>
  <text y="40">catalyst-awakening.netlify.app</text>
  <text y="80">@catalystcomicshq · everywhere</text>
</g>
</svg>`);

/* ─────────  BRAND BOOK & DOCS (5) ───────── */
write(`${OUT}/brand-book/23-brand-book.html`, `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>Catalyst · Brand Book</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@300;400;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../tokens/tokens.css">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: var(--font-body); background: var(--catalyst-black); color: var(--catalyst-bone); line-height: 1.5; }
  main { max-width: 960px; margin: 0 auto; padding: 80px 40px; }
  section { padding: 80px 0; border-top: 1px solid var(--catalyst-iron); }
  section:first-child { border-top: none; padding-top: 40px; }
  h1 { font-family: var(--font-display); font-size: 96px; line-height: 0.9; color: var(--catalyst-gold); letter-spacing: 4px; margin-bottom: 24px; }
  h2 { font-family: var(--font-display); font-size: 56px; color: var(--catalyst-gold); letter-spacing: 4px; margin-bottom: 24px; }
  h3 { font-family: var(--font-subhead); font-weight: 700; font-size: 22px; letter-spacing: 8px; text-transform: uppercase; color: var(--catalyst-ash); margin-bottom: 16px; }
  p { font-size: 18px; max-width: 640px; margin-bottom: 16px; }
  .lead { font-family: var(--font-editorial); font-style: italic; font-size: 26px; color: var(--catalyst-bone); max-width: 640px; }
  .swatch-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 24px; }
  .swatch { aspect-ratio: 1/1.1; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; justify-content: flex-end; }
  .swatch .name { font-family: var(--font-subhead); font-weight: 700; font-size: 16px; letter-spacing: 4px; }
  .swatch .hex { font-family: var(--font-body); font-size: 12px; letter-spacing: 3px; margin-top: 2px; opacity: 0.7; }
  .type-sample { font-family: var(--font-display); font-size: 120px; color: var(--catalyst-gold); letter-spacing: 4px; }
  .kv { display: grid; grid-template-columns: 200px 1fr; gap: 12px 32px; margin: 16px 0; font-size: 16px; }
  .kv dt { font-family: var(--font-subhead); font-weight: 700; letter-spacing: 4px; color: var(--catalyst-ash); text-transform: uppercase; font-size: 14px; padding-top: 4px; }
  .rules { list-style: none; margin: 24px 0; }
  .rules li { padding: 12px 0; border-bottom: 1px solid var(--catalyst-iron); font-size: 17px; }
  .rules li b { color: var(--catalyst-gold); font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin-right: 12px; font-family: var(--font-subhead); }
  .do-dont { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
  .box { padding: 24px; border-radius: 14px; border: 2px solid; }
  .do { border-color: var(--catalyst-teal); color: var(--catalyst-teal); }
  .dont { border-color: var(--catalyst-red); color: var(--catalyst-red); }
  .box p { color: var(--catalyst-bone); font-size: 16px; }
  .box b { font-family: var(--font-subhead); font-weight: 700; letter-spacing: 4px; }
</style></head>
<body><main>
  <section>
    <p style="font-family:var(--font-subhead); font-weight:700; font-size:14px; letter-spacing:12px; color:var(--catalyst-gold); margin-bottom:20px">◈ BRAND BOOK · V 1.0 ◈</p>
    <h1>CATALYST<br>THE AWAKENING</h1>
    <p class="lead">A Lagos noir comic universe rooted in Yoruba mythology. This book is how we look, sound, and hold the room — same voice on every surface.</p>
  </section>

  <section>
    <h2>01 · MISSION</h2>
    <p class="lead">We are building a Nigerian superhero universe that treats African mythology with the reverence Marvel gave Norse gods — but locates it in the pulse of modern Lagos.</p>
    <p style="margin-top:24px">Everything we ship must feel <b>Lagos-first</b>, <b>myth-serious</b>, and <b>street-real</b>. If a piece feels like generic action fantasy, it isn't ours.</p>
  </section>

  <section>
    <h2>02 · LOGO</h2>
    <div class="kv">
      <dt>Primary Lockup</dt><dd>Wordmark + subtitle. Use on cover art, headers, print.</dd>
      <dt>Horizontal</dt><dd>C:TA mark + wordmark. Use in wide banners and email.</dd>
      <dt>Stacked</dt><dd>Vertical lockup with tagline. Use on merch and posters.</dd>
      <dt>Mark Alone</dt><dd>C:TA monogram. Use as favicon, badge, pin.</dd>
    </div>
    <div class="do-dont">
      <div class="box do"><b>DO</b><p>Keep clear space equal to the height of the "C" around every side.</p></div>
      <div class="box dont"><b>DON'T</b><p>Never stretch, tilt, or recolor the wordmark. Never combine two colorways in one lockup.</p></div>
    </div>
  </section>

  <section>
    <h2>03 · COLOR</h2>
    <h3>PRIMARY</h3>
    <div class="swatch-row">
      <div class="swatch" style="background:var(--catalyst-gold); color:var(--catalyst-black)"><span class="name">DANFO GOLD</span><span class="hex">#F4B800</span></div>
      <div class="swatch" style="background:var(--catalyst-black); color:var(--catalyst-bone); border:1px solid var(--catalyst-iron)"><span class="name">INK BLACK</span><span class="hex">#06060D</span></div>
    </div>
    <h3 style="margin-top:32px">ACCENTS</h3>
    <div class="swatch-row">
      <div class="swatch" style="background:var(--catalyst-red); color:var(--catalyst-bone)"><span class="name">BLOOD RED</span><span class="hex">#C41E3A</span></div>
      <div class="swatch" style="background:var(--catalyst-orange); color:var(--catalyst-black)"><span class="name">NEON ORANGE</span><span class="hex">#FF6B1A</span></div>
      <div class="swatch" style="background:var(--catalyst-teal); color:var(--catalyst-black)"><span class="name">ORISHA TEAL</span><span class="hex">#00C9B1</span></div>
      <div class="swatch" style="background:var(--catalyst-indigo); color:var(--catalyst-bone)"><span class="name">ADIRE INDIGO</span><span class="hex">#1A1A6E</span></div>
    </div>
    <h3 style="margin-top:32px">NEUTRALS</h3>
    <div class="swatch-row">
      <div class="swatch" style="background:var(--catalyst-navy); color:var(--catalyst-bone)"><span class="name">DEEP NAVY</span><span class="hex">#0A0A1F</span></div>
      <div class="swatch" style="background:var(--catalyst-iron); color:var(--catalyst-bone)"><span class="name">IRON GREY</span><span class="hex">#2A2A3A</span></div>
      <div class="swatch" style="background:var(--catalyst-ash); color:var(--catalyst-black)"><span class="name">ASH GREY</span><span class="hex">#8A8A9A</span></div>
      <div class="swatch" style="background:var(--catalyst-bone); color:var(--catalyst-black)"><span class="name">BONE WHITE</span><span class="hex">#F0EDE5</span></div>
    </div>
    <p style="margin-top:24px">Gold is our voice. Black is our stage. Every other color is a scene, never a state.</p>
  </section>

  <section>
    <h2>04 · TYPOGRAPHY</h2>
    <h3>DISPLAY · BEBAS NEUE</h3>
    <div class="type-sample">LAGOS.</div>
    <p>Titles, hero, chapter marks, big numbers.</p>
    <h3 style="margin-top:32px">SUBHEAD · OSWALD</h3>
    <div class="type-sample" style="font-family:var(--font-subhead); font-weight:700; font-size:60px; letter-spacing:10px; color:var(--catalyst-bone)">THE AWAKENING</div>
    <p>Section labels, captions, tags.</p>
    <h3 style="margin-top:32px">BODY · SPACE GROTESK</h3>
    <div class="type-sample" style="font-family:var(--font-body); font-size:32px; color:var(--catalyst-bone); letter-spacing:0">A Lagos noir comic universe.</div>
    <p>UI, coordinates, general reading.</p>
    <h3 style="margin-top:32px">EDITORIAL · CRIMSON PRO ITALIC</h3>
    <div class="type-sample" style="font-family:var(--font-editorial); font-style:italic; font-size:36px; color:var(--catalyst-bone); letter-spacing:0">"The gods never left."</div>
    <p>Pull quotes only. Never body copy.</p>
  </section>

  <section>
    <h2>05 · VOICE</h2>
    <ul class="rules">
      <li><b>Direct</b> Say the thing. Then stop. "Lagos never sleeps." not "In the city that famously never sleeps".</li>
      <li><b>Reverent</b> The Orishas are gods, not props. Never joke about them, never Anglicize their names.</li>
      <li><b>Local</b> Lagos street names, coordinates, hours. Specificity is trust.</li>
      <li><b>Cinematic</b> Cut like film. Silence is a beat. Whitespace is a shot.</li>
      <li><b>Never</b> Fantasy tropes ("realms", "chosen ones"), corporate softening, or cape jokes.</li>
    </ul>
  </section>

  <section>
    <h2>06 · CONTACT</h2>
    <p>Catalyst Comics Studio · Lagos, Nigeria</p>
    <p><a href="mailto:catalystcomicstudio@gmail.com" style="color:var(--catalyst-gold)">catalystcomicstudio@gmail.com</a></p>
    <p><a href="https://catalyst-awakening.netlify.app" style="color:var(--catalyst-gold)">catalyst-awakening.netlify.app</a></p>
    <p style="margin-top:32px; color:var(--catalyst-ash); font-family:var(--font-subhead); font-weight:300; letter-spacing:10px; font-size:14px">◈ BUILT IN LAGOS · FOR THE WORLD ◈</p>
  </section>
</main></body></html>`);

write(`${OUT}/brand-book/24-brand-guidelines.md`, `# Catalyst · Brand Guidelines

**Version 1.0 · Lagos, 2026**

## 1. What we are
Catalyst: The Awakening is a Lagos noir comic universe where 19-year-old Bayo Adeyemi channels the combined power of five Orishas — Ṣàngó, Ògún, Ọ̀ṣun, Obatàlá, Ẹṣù — as ancient Yoruba forces collide with modern Lagos.

## 2. What we always are
- **Lagos-first.** The city is a character. Name streets, hours, coordinates.
- **Myth-serious.** Yoruba diacritics stay. Names are never Anglicized.
- **Street-real.** Danfo yellow, Mushin at 3 AM, Third Mainland Bridge before dawn.
- **Cinematic.** Cut like film. Silence and whitespace are beats.

## 3. What we are not
- Not high fantasy. No "realms", no "chosen ones", no capes as jokes.
- Not corporate-safe. If it could ship as generic superhero content, it isn't ours.
- Not diaspora tourism. This is written *in* Lagos, *for* Lagos, then for the world.

## 4. Assets
Use the assets in \`brand-kit/\`:
- **Logos**: prefer the primary lockup on gold-on-black. Reverse only on gold background.
- **Colors**: primary = Danfo Gold + Ink Black. Accent = one at a time, never mixed.
- **Type**: display Bebas Neue · subhead Oswald · body Space Grotesk · editorial Crimson Pro Italic.
- **Grain overlay**: apply at ~8% opacity, blend "overlay". Never above 12%.

## 5. Naming
- Full: **Catalyst: The Awakening**
- Short: **CATALYST**
- Monogram: **C:TA**
- Studio: **Catalyst Comics Studio** (never "Studios")
- Handles: @catalystcomicshq everywhere.
- URL: catalyst-awakening.netlify.app
`);

write(`${OUT}/brand-book/25-logo-usage.svg`, svgOpen(1600, 1000) + `
<rect width="1600" height="1000" fill="${C.black}"/>
<text x="80" y="90" font-family="${F_SUB}" font-weight="700" font-size="30" letter-spacing="14" fill="${C.gold}">◈ LOGO USAGE ◈</text>
<text x="80" y="150" font-family="${F_TITLE}" font-size="70" letter-spacing="6" fill="${C.bone}">DO. DON'T.</text>

<g transform="translate(80, 240)">
  <rect width="700" height="300" fill="${C.iron}" rx="14"/>
  <text x="30" y="60" font-family="${F_SUB}" font-weight="700" font-size="26" letter-spacing="10" fill="${C.teal}">DO</text>
  <g transform="translate(30, 130)"><text font-family="${F_TITLE}" font-size="80" fill="${C.gold}" letter-spacing="4">CATALYST</text>
    <text y="26" font-family="${F_SUB}" font-weight="600" font-size="20" fill="${C.bone}" letter-spacing="14">THE AWAKENING</text></g>
  <text x="30" y="270" font-family="${F_BODY}" font-size="18" fill="${C.bone}" letter-spacing="4">Gold on black. Full clear space. Standard lockup.</text>
</g>

<g transform="translate(820, 240)">
  <rect width="700" height="300" fill="${C.iron}" rx="14"/>
  <text x="30" y="60" font-family="${F_SUB}" font-weight="700" font-size="26" letter-spacing="10" fill="${C.red}">DON'T</text>
  <g transform="translate(30, 130) rotate(-8)"><text font-family="${F_TITLE}" font-size="80" fill="${C.orange}" letter-spacing="0" style="transform:scaleX(1.4)">CATALYST</text></g>
  <text x="30" y="270" font-family="${F_BODY}" font-size="18" fill="${C.bone}" letter-spacing="4">Don't tilt, stretch, or recolor the wordmark.</text>
</g>

<g transform="translate(80, 600)">
  <rect width="700" height="300" fill="${C.gold}" rx="14"/>
  <text x="30" y="60" font-family="${F_SUB}" font-weight="700" font-size="26" letter-spacing="10" fill="${C.black}">DO</text>
  <g transform="translate(30, 130)"><text font-family="${F_TITLE}" font-size="80" fill="${C.black}" letter-spacing="4">CATALYST</text>
    <text y="26" font-family="${F_SUB}" font-weight="600" font-size="20" fill="${C.black}" letter-spacing="14">THE AWAKENING</text></g>
  <text x="30" y="270" font-family="${F_BODY}" font-size="18" fill="${C.black}" letter-spacing="4">Black on gold — reversed version. Same lockup rules.</text>
</g>

<g transform="translate(820, 600)">
  <rect width="700" height="300" fill="${C.gold}" rx="14"/>
  <text x="30" y="60" font-family="${F_SUB}" font-weight="700" font-size="26" letter-spacing="10" fill="${C.red}">DON'T</text>
  <g transform="translate(30, 130)"><text font-family="${F_TITLE}" font-size="80" fill="${C.gold}" letter-spacing="4">CATALYST</text>
    <text y="26" font-family="${F_SUB}" font-weight="600" font-size="20" fill="${C.gold}" letter-spacing="14">THE AWAKENING</text></g>
  <text x="30" y="270" font-family="${F_BODY}" font-size="18" fill="${C.black}" letter-spacing="4">Never gold-on-gold. Contrast is non-negotiable.</text>
</g>
</svg>`);

write(`${OUT}/brand-book/26-voice-tone.md`, `# Voice & Tone

## Sound like Lagos at 3 AM.

Not like a marketing calendar. Not like a fantasy VO. Like a person who has seen the thing and stopped exaggerating.

## Sentence rules
- Short sentences. Then a shorter one.
- Coordinates before adjectives. "06°32'N. Mushin. Wet asphalt." beats "the mysterious streets of Lagos".
- Never call an Orisha "a god". Use the name. Ṣàngó is Ṣàngó.

## Words we say
Lagos. Mushin. Mainland. Bridge. Awakening. Vessel. Reckoning. Blood. Concrete. Silence.

## Words we don't say
Realm. Chosen. Ancient (as an adjective). Powers (say "the storm", "the fire"). Superhero (unless framing).

## Ending a caption
End with the thing. Not a call-to-action. Then, on a new line, put the URL — never both on one line.

Example:
> The gods never left.
> They were waiting.
>
> catalyst-awakening.netlify.app
`);

write(`${OUT}/brand-book/27-color-usage.svg`, svgOpen(1600, 1000) + `
<rect width="1600" height="1000" fill="${C.black}"/>
<text x="80" y="90" font-family="${F_SUB}" font-weight="700" font-size="30" letter-spacing="14" fill="${C.gold}">◈ COLOR USAGE ◈</text>
<text x="80" y="150" font-family="${F_TITLE}" font-size="70" letter-spacing="6" fill="${C.bone}">HIERARCHY OF INTENT</text>

<g transform="translate(80, 240)">
  <rect width="450" height="200" fill="${C.gold}"/>
  <text x="30" y="120" font-family="${F_TITLE}" font-size="80" fill="${C.black}">VOICE</text>
  <text x="30" y="180" font-family="${F_SUB}" font-weight="600" font-size="18" fill="${C.black}" letter-spacing="6">DANFO GOLD · 60%</text>
</g>
<g transform="translate(555, 240)">
  <rect width="450" height="200" fill="${C.black}" stroke="${C.iron}" stroke-width="2"/>
  <text x="30" y="120" font-family="${F_TITLE}" font-size="80" fill="${C.bone}">STAGE</text>
  <text x="30" y="180" font-family="${F_SUB}" font-weight="600" font-size="18" fill="${C.ash}" letter-spacing="6">INK BLACK · 30%</text>
</g>
<g transform="translate(1030, 240)">
  <rect width="490" height="200" fill="${C.red}"/>
  <text x="30" y="120" font-family="${F_TITLE}" font-size="80" fill="${C.bone}">SCENE</text>
  <text x="30" y="180" font-family="${F_SUB}" font-weight="600" font-size="18" fill="${C.bone}" letter-spacing="6">ACCENT · 10%</text>
</g>

<text x="80" y="530" font-family="${F_SUB}" font-weight="700" font-size="26" letter-spacing="10" fill="${C.gold}">RULES</text>

<g transform="translate(80, 590)" font-family="${F_BODY}" font-size="22" fill="${C.bone}">
  <text>◈ Gold is our voice. Every asset needs a gold beat somewhere.</text>
  <text y="46">◈ Black is our stage. Backgrounds default to Ink Black (#06060D), not #000.</text>
  <text y="92">◈ One accent at a time. Never mix Red + Teal in the same asset.</text>
  <text y="138">◈ Neutrals are supporting cast. Bone for body, Ash for meta, Iron for dividers.</text>
  <text y="184">◈ Grain overlay is mandatory at ~8%. Never above 12%. Never below 4%.</text>
</g>
</svg>`);

/* ─────────  CANVA/EXPRESS TEMPLATES (5) ───────── */
const canvaBase = (title, content) => `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@300;400;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Crimson+Pro:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../tokens/tokens.css">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  meta[name="hz:canvas-width"] { content: "1080"; }
</style></head><body>${content}</body></html>`;

write(`${OUT}/canva-express/28-canva-post-template.html`, `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Catalyst · Canva-import post template</title>
<meta name="hz:canvas-width" content="1080"><meta name="hz:canvas-height" content="1080">
<meta name="hz:slide-selector" content=".slide">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@300;400;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family: 'Space Grotesk', sans-serif; }
.slide { position: relative; width: 1080px; height: 1080px; background: #06060d; overflow: hidden; color: #F0EDE5; }
.pill { display: inline-block; padding: 8px 24px; border: 3px solid #F4B800; color: #F4B800; font-family: 'Oswald'; font-weight: 700; font-size: 22px; letter-spacing: 8px; border-radius: 999px; margin-bottom: 24px; }
.title { font-family: 'Bebas Neue'; font-size: 200px; color: #F4B800; letter-spacing: 6px; line-height: 0.9; }
.sub { font-family: 'Oswald'; font-weight: 600; font-size: 42px; letter-spacing: 14px; color: #F0EDE5; margin-top: 16px; }
.body { font-family: 'Space Grotesk'; font-size: 26px; color: #8a8a9a; letter-spacing: 4px; margin-top: 40px; }
.wrap { position: absolute; inset: 100px; display: flex; flex-direction: column; justify-content: center; }
.brand { position: absolute; bottom: 40px; left: 0; right: 0; text-align: center; font-family: 'Oswald'; font-weight: 600; font-size: 18px; letter-spacing: 8px; color: #F0EDE5; }
.brand b { color: #F4B800; }
</style></head>
<body><div class="slide">
  <div class="wrap">
    <div><span class="pill">◈ EDIT ME ◈</span></div>
    <div class="title">YOUR HEADLINE.</div>
    <div class="sub">SUBTITLE HERE</div>
    <div class="body">Body copy for context. Keep short. Two lines maximum. Add a URL below.</div>
  </div>
  <div class="brand">CATALYST · <b>THE AWAKENING</b></div>
</div></body></html>`);

write(`${OUT}/canva-express/29-canva-story-template.html`, `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Catalyst · Canva-import story template</title>
<meta name="hz:canvas-width" content="1080"><meta name="hz:canvas-height" content="1920">
<meta name="hz:slide-selector" content=".slide">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@300;400;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family: 'Space Grotesk', sans-serif; }
.slide { position: relative; width: 1080px; height: 1920px; background: #06060d; overflow: hidden; color: #F0EDE5; }
.wrap { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 80px; }
.eyebrow { font-family: 'Oswald'; font-weight: 700; font-size: 34px; letter-spacing: 18px; color: #F4B800; }
.title { font-family: 'Bebas Neue'; font-size: 320px; color: #F4B800; letter-spacing: 4px; line-height: 0.9; margin: 40px 0; }
.rule { width: 240px; height: 6px; background: #F4B800; margin: 20px auto; }
.sub { font-family: 'Oswald'; font-weight: 600; font-size: 60px; letter-spacing: 16px; color: #F0EDE5; }
.cta { position: absolute; bottom: 200px; left: 100px; right: 100px; padding: 40px; border-radius: 90px; background: #F4B800; text-align: center; font-family: 'Oswald'; font-weight: 700; font-size: 46px; letter-spacing: 12px; color: #06060d; }
.brand { position: absolute; bottom: 80px; left: 0; right: 0; text-align: center; font-family: 'Oswald'; font-weight: 600; font-size: 18px; letter-spacing: 8px; color: #F0EDE5; }
.brand b { color: #F4B800; }
</style></head>
<body><div class="slide">
  <div class="wrap">
    <div class="eyebrow">◈ EDIT EYEBROW ◈</div>
    <div class="title">HEADLINE.</div>
    <div class="rule"></div>
    <div class="sub">SUBHEAD LINE</div>
  </div>
  <div class="cta">TAP TO READ ↗</div>
  <div class="brand">CATALYST · <b>THE AWAKENING</b></div>
</div></body></html>`);

write(`${OUT}/canva-express/30-express-hero.html`, `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Catalyst · Adobe Express hero template</title>
<meta name="hz:canvas-width" content="1920"><meta name="hz:canvas-height" content="1080">
<meta name="hz:slide-selector" content=".slide">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@300;400;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
.slide { position:relative; width:1920px; height:1080px; background:#06060d; color:#F0EDE5; overflow:hidden; }
.left { position:absolute; left:0; top:0; bottom:0; width:960px; background:#F4B800; padding:100px; display:flex; flex-direction:column; justify-content:center; }
.right { position:absolute; right:0; top:0; bottom:0; width:960px; padding:100px; display:flex; flex-direction:column; justify-content:center; color:#F0EDE5; font-family:'Space Grotesk'; }
.chapter { font-family:'Oswald'; font-weight:700; font-size:30px; letter-spacing:18px; color:#06060d; }
.title { font-family:'Bebas Neue'; font-size:200px; color:#06060d; line-height:0.9; letter-spacing:4px; margin:24px 0; }
.tag { font-family:'Oswald'; font-weight:700; font-size:44px; letter-spacing:14px; color:#C41E3A; }
h3 { font-family:'Bebas Neue'; font-size:96px; color:#F4B800; letter-spacing:6px; margin-bottom:24px; }
p { font-size:26px; margin-bottom:16px; letter-spacing:2px; }
.cta { display:inline-block; padding:24px 40px; background:#F4B800; color:#06060d; font-family:'Oswald'; font-weight:700; font-size:34px; letter-spacing:10px; border-radius:999px; margin-top:32px; }
</style></head>
<body><div class="slide">
  <div class="left">
    <div class="chapter">◈ ISSUE 05 ◈</div>
    <div class="title">FIRE IN<br>MUSHIN.</div>
    <div class="tag">DROPS THIS WEEK</div>
  </div>
  <div class="right">
    <h3>THE STORY</h3>
    <p>Bayo returns to Mushin at 3AM. Something waits at the crossroads.</p>
    <p>Ṣàngó doesn't answer.</p>
    <p>He picks up the iron anyway.</p>
    <div class="cta">READ FREE ↗</div>
  </div>
</div></body></html>`);

write(`${OUT}/canva-express/31-express-character-card.html`, `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Catalyst · Adobe Express character card</title>
<meta name="hz:canvas-width" content="1080"><meta name="hz:canvas-height" content="1350">
<meta name="hz:slide-selector" content=".slide">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@300;400;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
.slide { position:relative; width:1080px; height:1350px; background:#0a0a1f; color:#F0EDE5; overflow:hidden; padding:80px; }
.header { padding: 20px 40px; background:#F4B800; color:#06060d; margin: -80px -80px 60px; }
.header .name { font-family:'Bebas Neue'; font-size:150px; letter-spacing:8px; line-height:0.9; }
.header .sub { font-family:'Oswald'; font-weight:600; font-size:28px; letter-spacing:12px; margin-top:8px; }
.grid { display:grid; grid-template-columns:1fr 1fr; gap:32px 40px; }
.stat { font-family:'Space Grotesk'; }
.stat .lab { font-family:'Space Grotesk'; font-size:22px; letter-spacing:6px; color:#8a8a9a; }
.stat .val { font-family:'Oswald'; font-weight:700; font-size:60px; color:#F4B800; margin-top:4px; letter-spacing:4px; }
.powers { margin-top:60px; }
.powers h3 { font-family:'Oswald'; font-weight:300; font-size:26px; letter-spacing:14px; color:#8a8a9a; margin-bottom:20px; }
.powers ul { list-style:none; }
.powers li { font-family:'Bebas Neue'; font-size:70px; color:#F0EDE5; letter-spacing:6px; padding:12px 0; border-bottom:1px solid #2a2a3a; }
.brand { position:absolute; bottom:40px; left:0; right:0; text-align:center; font-family:'Oswald'; font-weight:600; font-size:20px; letter-spacing:8px; color:#F0EDE5; }
.brand b { color:#F4B800; }
</style></head>
<body><div class="slide">
  <div class="header">
    <div class="name">BAYO</div>
    <div class="sub">ADEYEMI · CATALYST</div>
  </div>
  <div class="grid">
    <div class="stat"><div class="lab">AGE</div><div class="val">19</div></div>
    <div class="stat"><div class="lab">BORN</div><div class="val">MUSHIN</div></div>
    <div class="stat"><div class="lab">ORISHAS</div><div class="val">FIVE</div></div>
    <div class="stat"><div class="lab">STATUS</div><div class="val">CHOSEN</div></div>
  </div>
  <div class="powers">
    <h3>POWERS</h3>
    <ul>
      <li>ṢÀNGÓ · THUNDER</li>
      <li>ÒGÚN · IRON</li>
      <li>Ọ̀ṢUN · RIVER</li>
      <li>OBATÀLÁ · WISDOM</li>
      <li>ẸṢÙ · CROSSROADS</li>
    </ul>
  </div>
  <div class="brand">CATALYST · <b>THE AWAKENING</b></div>
</div></body></html>`);

write(`${OUT}/canva-express/32-express-quote.html`, `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Catalyst · Adobe Express quote template</title>
<meta name="hz:canvas-width" content="1080"><meta name="hz:canvas-height" content="1080">
<meta name="hz:slide-selector" content=".slide">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@300;400;600;700&family=Crimson+Pro:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
.slide { position:relative; width:1080px; height:1080px; background:#06060d; color:#F0EDE5; overflow:hidden; padding:100px 80px; display:flex; flex-direction:column; justify-content:center; text-align:center; }
.marks { font-family:'Bebas Neue'; font-size:260px; color:#F4B800; line-height:0.7; }
.quote { font-family:'Crimson Pro'; font-style:italic; font-size:70px; line-height:1.15; color:#F0EDE5; margin:20px 0; }
.quote em { color:#F4B800; font-style:italic; }
.rule { width:180px; height:4px; background:#F4B800; margin:24px auto; }
.attr { font-family:'Oswald'; font-weight:600; font-size:24px; letter-spacing:12px; color:#8a8a9a; }
.attr b { color:#F4B800; }
.brand { position:absolute; bottom:40px; left:0; right:0; text-align:center; font-family:'Oswald'; font-weight:600; font-size:18px; letter-spacing:8px; color:#F0EDE5; }
.brand b { color:#F4B800; }
</style></head>
<body><div class="slide">
  <div class="marks">"</div>
  <div class="quote">The city was <em>always</em> alive.<br>Bayo just learned<br>how to <em>listen</em>.</div>
  <div class="rule"></div>
  <div class="attr">— ISSUE 1 · <b>THE AWAKENING</b></div>
  <div class="brand">CATALYST · <b>THE AWAKENING</b></div>
</div></body></html>`);

/* ─────────  EMAIL & UTILITY (3) ───────── */
write(`${OUT}/email/33-newsletter-header.html`, `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Catalyst · Newsletter header</title>
<style>
body { margin: 0; font-family: Helvetica, sans-serif; }
.wrap { max-width: 640px; margin: 0 auto; background: #06060d; color: #F0EDE5; }
.header { background: #F4B800; padding: 40px; text-align: center; }
.header .title { font-family: 'Bebas Neue', Impact, sans-serif; font-size: 68px; color: #06060d; letter-spacing: 6px; line-height: 1; }
.header .sub { font-family: 'Oswald', Helvetica, sans-serif; font-weight: 600; font-size: 18px; letter-spacing: 14px; color: #06060d; margin-top: 8px; }
.body { padding: 40px; }
.body h1 { font-family: 'Bebas Neue', Impact, sans-serif; font-size: 46px; color: #F4B800; letter-spacing: 4px; margin: 0 0 16px; }
.body p { font-size: 17px; line-height: 1.55; color: #F0EDE5; margin: 0 0 12px; }
.cta { display: inline-block; margin-top: 20px; padding: 14px 30px; background: #F4B800; color: #06060d; text-decoration: none; font-family: 'Oswald', Helvetica, sans-serif; font-weight: 700; letter-spacing: 8px; font-size: 16px; }
.foot { padding: 20px 40px 40px; color: #8a8a9a; font-size: 12px; letter-spacing: 4px; text-align: center; }
</style></head>
<body><div class="wrap">
  <div class="header">
    <div class="title">CATALYST</div>
    <div class="sub">THE AWAKENING</div>
  </div>
  <div class="body">
    <h1>ISSUE 05 IS LIVE.</h1>
    <p>Fire in Mushin. Bayo goes back for the first time since the awakening.</p>
    <p>Fifteen pages. Free. Read in your browser.</p>
    <a class="cta" href="https://catalyst-awakening.netlify.app">READ NOW ↗</a>
  </div>
  <div class="foot">CATALYST COMICS STUDIO · LAGOS, NG · UNSUBSCRIBE</div>
</div></body></html>`);

write(`${OUT}/email/34-email-signature.html`, `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Catalyst · Email signature</title></head>
<body style="margin:0; font-family: Helvetica, sans-serif;">
<table style="border-collapse: collapse;" cellpadding="0" cellspacing="0">
<tr>
<td style="padding: 16px; border-left: 4px solid #F4B800;">
  <div style="font-family: 'Bebas Neue', Impact, sans-serif; font-size: 32px; color: #06060d; letter-spacing: 4px;">TAIWO ADEGOKE</div>
  <div style="font-family: 'Oswald', Helvetica, sans-serif; font-weight: 600; font-size: 12px; letter-spacing: 6px; color: #8a8a9a; margin-top: 4px;">SHOWRUNNER · CATALYST COMICS STUDIO</div>
  <div style="margin-top: 12px; font-size: 13px; color: #06060d;">
    <a href="mailto:catalystcomicstudio@gmail.com" style="color: #06060d; text-decoration: none;">catalystcomicstudio@gmail.com</a><br>
    <a href="https://catalyst-awakening.netlify.app" style="color: #F4B800; text-decoration: none; font-weight: 700;">catalyst-awakening.netlify.app</a>
  </div>
  <div style="margin-top: 12px; font-family: 'Oswald', Helvetica, sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 6px; color: #F4B800;">◈ MADE IN LAGOS ◈</div>
</td></tr></table>
</body></html>`);

write(`${OUT}/email/35-announcement-banner.html`, `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Catalyst · Announcement banner</title>
<style>
body { margin: 0; background: #06060d; }
.wrap { position: relative; max-width: 800px; margin: 0 auto; background: #06060d; color: #F0EDE5; text-align: center; padding: 60px 30px; overflow: hidden; }
.chip { display: inline-block; padding: 8px 20px; border: 2px solid #F4B800; border-radius: 999px; font-family: 'Oswald', Helvetica, sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 8px; color: #F4B800; margin-bottom: 20px; }
.title { font-family: 'Bebas Neue', Impact, sans-serif; font-size: 92px; color: #F4B800; letter-spacing: 6px; line-height: 0.95; margin: 0; }
.sub { font-family: 'Oswald', Helvetica, sans-serif; font-weight: 600; font-size: 22px; letter-spacing: 14px; color: #F0EDE5; margin-top: 8px; }
.cta { display: inline-block; margin-top: 28px; padding: 14px 30px; background: #F4B800; color: #06060d; text-decoration: none; font-family: 'Oswald', Helvetica, sans-serif; font-weight: 700; letter-spacing: 8px; font-size: 14px; }
</style></head>
<body><div class="wrap">
  <div class="chip">◈ ANNOUNCEMENT ◈</div>
  <div class="title">CATALYST</div>
  <div class="sub">THE AWAKENING · ISSUE 05</div>
  <a class="cta" href="https://catalyst-awakening.netlify.app">READ FREE ↗</a>
</div></body></html>`);

/* ─────────  UTILITY / PRESENTATION (5) ───────── */
write(`${OUT}/utility/36-presentation-cover.svg`, svgOpen(1920, 1080) + `<defs>${grainDef}</defs>
<rect width="1920" height="1080" fill="${C.black}"/>
<rect width="1920" height="1080" fill="url(#grainP)" opacity="0.06" style="mix-blend-mode:overlay"/>
<g transform="translate(120, 380)">
  <text font-family="${F_SUB}" font-weight="700" font-size="30" letter-spacing="18" fill="${C.gold}">◈ CATALYST COMICS STUDIO · PITCH DECK ◈</text>
  <text y="200" font-family="${F_TITLE}" font-size="240" fill="${C.gold}" letter-spacing="6">CATALYST</text>
  <line x1="0" y1="270" x2="1680" y2="270" stroke="${C.gold}" stroke-width="8"/>
  <text y="360" font-family="${F_SUB}" font-weight="600" font-size="66" fill="${C.bone}" letter-spacing="24">THE AWAKENING</text>
</g>
<g transform="translate(120, 940)">
  <text font-family="${F_BODY}" font-size="24" fill="${C.ash}" letter-spacing="6">A LAGOS NOIR COMIC UNIVERSE — 2026</text>
</g>
</svg>`);

write(`${OUT}/utility/37-convention-badge.svg`, svgOpen(600, 900) + `
<rect width="600" height="900" fill="${C.bone}"/>
<rect x="0" y="0" width="600" height="220" fill="${C.gold}"/>
<text x="300" y="120" font-family="${F_TITLE}" font-size="90" fill="${C.black}" text-anchor="middle" letter-spacing="6">CATALYST</text>
<text x="300" y="170" font-family="${F_SUB}" font-weight="600" font-size="24" fill="${C.black}" text-anchor="middle" letter-spacing="14">THE AWAKENING</text>
<g transform="translate(300, 460)" text-anchor="middle">
  <text font-family="${F_SUB}" font-weight="300" font-size="22" letter-spacing="12" fill="${C.iron}">◈ ATTENDEE ◈</text>
  <text y="120" font-family="${F_TITLE}" font-size="110" fill="${C.black}" letter-spacing="4">YOUR NAME</text>
  <text y="180" font-family="${F_SUB}" font-weight="600" font-size="24" fill="${C.iron}" letter-spacing="10">ROLE / STUDIO</text>
</g>
<g transform="translate(300, 780)" text-anchor="middle">
  <rect x="-140" y="-40" width="280" height="80" fill="${C.black}"/>
  <text font-family="${F_SUB}" font-weight="700" font-size="30" fill="${C.gold}" y="10" letter-spacing="10">STAFF · 2026</text>
</g>
</svg>`);

write(`${OUT}/utility/38-signature-card.svg`, svgOpen(1200, 400) + `
<rect width="1200" height="400" fill="${C.black}"/>
<line x1="60" y1="60" x2="60" y2="340" stroke="${C.gold}" stroke-width="6"/>
<g transform="translate(120, 120)">
  <text font-family="${F_TITLE}" font-size="80" fill="${C.gold}" letter-spacing="6">TAIWO ADEGOKE</text>
  <text y="34" font-family="${F_SUB}" font-weight="600" font-size="18" fill="${C.ash}" letter-spacing="10">SHOWRUNNER · CATALYST COMICS STUDIO</text>
</g>
<g transform="translate(120, 240)" font-family="${F_BODY}" font-size="20" fill="${C.bone}" letter-spacing="3">
  <text>catalystcomicstudio@gmail.com</text>
  <text y="30" fill="${C.gold}">catalyst-awakening.netlify.app</text>
</g>
</svg>`);

write(`${OUT}/utility/39-web-hero-banner.svg`, svgOpen(1920, 700) + `<defs>${grainDef}</defs>
<rect width="1920" height="700" fill="${C.black}"/>
<rect width="1920" height="700" fill="url(#grainP)" opacity="0.06" style="mix-blend-mode:overlay"/>
<g transform="translate(120, 240)">
  <text font-family="${F_SUB}" font-weight="700" font-size="26" letter-spacing="16" fill="${C.gold}">◈ NOW READING · ISSUES 1–4 ◈</text>
  <text y="180" font-family="${F_TITLE}" font-size="200" fill="${C.gold}" letter-spacing="8">CATALYST</text>
  <text y="260" font-family="${F_SUB}" font-weight="600" font-size="46" fill="${C.bone}" letter-spacing="22">THE AWAKENING</text>
  <text y="340" font-family="${F_BODY}" font-size="24" fill="${C.ash}" letter-spacing="8">A LAGOS NOIR COMIC UNIVERSE · MADE IN LAGOS · FREE ONLINE</text>
</g>
</svg>`);

write(`${OUT}/utility/40-favicon-set.svg`, svgOpen(512, 512) + `
<rect width="512" height="512" fill="${C.black}" rx="80"/>
<text x="256" y="330" font-family="${F_TITLE}" font-size="290" fill="${C.gold}" text-anchor="middle" letter-spacing="-8">C:TA</text>
</svg>`);

/* ─────────  FOOTER: MASTER INDEX (2) ───────── */
write(`${OUT}/README.md`, `# Catalyst · Brand IP Kit

**50 brand assets · v1.0 · 2026**

A complete identity system for **Catalyst: The Awakening** — logos, tokens, social templates, print, brand book, and Canva/Express-ready templates.

## Structure

\`\`\`
brand-kit/
├─ logos/              10 logo variants (SVG)
├─ tokens/             design tokens (JSON · CSS · SCSS · JS)
├─ swatches/           palette + type specimens (SVG)
├─ social/             10 social templates (Instagram post + story)
├─ platform/           5 platform covers (Twitter · YouTube · TikTok · Discord · LinkedIn)
├─ print/              7 print & merch templates (SVG)
├─ brand-book/         brand book HTML + guidelines + logo/color usage
├─ canva-express/      5 Canva / Adobe Express import-ready templates
├─ email/              3 email templates (newsletter · signature · announcement)
├─ utility/            5 utility assets (presentation · badge · signature card · hero · favicon)
└─ ASSET-INDEX.md      complete numbered list
\`\`\`

## Using this kit

- **Design tokens**: import \`tokens/tokens.css\` (custom properties) or \`tokens/tokens.json\` (design tools).
- **Logos**: prefer \`01-wordmark-primary.svg\`. Use reversed only on gold backgrounds.
- **Canva / Adobe Express**: \`canva-express/*.html\` files are HzHTML-compatible slide docs — import via Adobe Express' HTML import or paste into Canva to start.
- **Voice & tone**: \`brand-book/26-voice-tone.md\`.
- **Print**: SVGs in \`print/\` are ready for T-shirt / poster / sticker / business-card production. Export to PDF or PNG at target size.

## Colors

| Role       | Name        | Hex       |
|------------|-------------|-----------|
| Primary    | Danfo Gold  | #F4B800   |
| Primary    | Ink Black   | #06060D   |
| Accent     | Blood Red   | #C41E3A   |
| Accent     | Neon Orange | #FF6B1A   |
| Accent     | Orisha Teal | #00C9B1   |
| Accent     | Adire Indigo| #1A1A6E   |
| Neutral    | Bone White  | #F0EDE5   |
| Neutral    | Ash Grey    | #8A8A9A   |
| Neutral    | Iron Grey   | #2A2A3A   |
| Neutral    | Deep Navy   | #0A0A1F   |

## Type

- **Display** — Bebas Neue · Titles, hero, chapter marks
- **Subhead** — Oswald · Section labels, captions, tags
- **Body**    — Space Grotesk · UI, coordinates, reading
- **Editorial** — Crimson Pro Italic · Pull quotes only

## Contact

Catalyst Comics Studio · Lagos, Nigeria
[catalystcomicstudio@gmail.com](mailto:catalystcomicstudio@gmail.com)
[catalyst-awakening.netlify.app](https://catalyst-awakening.netlify.app)
`);

write(`${OUT}/ASSET-INDEX.md`, `# Catalyst Brand IP Kit — Asset Index

50 assets total. Numbered by category.

## Logos (10)
01. logos/01-wordmark-primary.svg — Primary lockup (gold/black)
02. logos/02-wordmark-reversed.svg — Reversed lockup (black/gold)
03. logos/03-wordmark-mono-black.svg — Mono, black on transparent
04. logos/04-wordmark-mono-white.svg — Mono, bone on transparent
05. logos/05-lockup-stacked.svg — Stacked vertical lockup
06. logos/06-lockup-horizontal.svg — Horizontal lockup with C:TA mark
07. logos/07-mark-crossroads.svg — Ẹṣù crossroads symbol
08. logos/08-mark-monogram.svg — C:TA monogram badge
09. logos/09-mark-orisha-star.svg — Five-orisha star mark
10. logos/10-emblem-circular.svg — Circular emblem seal

## Tokens (4)
11. tokens/tokens.json — Design tokens as JSON
12. tokens/tokens.css — CSS custom properties
13. tokens/tokens.scss — Sass variables
14. tokens/tokens.js — ESM export

## Swatches (2)
15. swatches/palette.svg — Full palette specimen
16. swatches/type-specimen.svg — Type specimen

## Social — Feed Posts 1:1 (5)
17. social/01-ig-launch.svg — Launch push
18. social/02-ig-quote.svg — Pull-quote card
19. social/03-ig-character.svg — Character stat card
20. social/04-ig-chapter-drop.svg — Chapter drop announcement
21. social/05-ig-poll.svg — Orisha poll card

## Social — Stories 9:16 (5)
22. social/06-story-countdown.svg — Countdown to next issue
23. social/07-story-cta.svg — Read-now CTA
24. social/08-story-quote.svg — Editorial quote
25. social/09-story-bts.svg — Behind-the-scenes
26. social/10-story-linksticker.svg — Link-sticker frame

## Platform Covers (5)
27. platform/11-twitter-header.svg — 1500×500
28. platform/12-youtube-thumbnail.svg — 1280×720
29. platform/13-tiktok-cover.svg — 1080×1920
30. platform/14-discord-banner.svg — 960×540
31. platform/15-linkedin-banner.svg — 1584×396

## Print & Merch (7)
32. print/16-tshirt-front.svg
33. print/17-tshirt-back.svg
34. print/18-poster-a2.svg
35. print/19-sticker-sheet.svg
36. print/20-enamel-pin.svg
37. print/21-business-card-front.svg
38. print/22-business-card-back.svg

## Brand Book & Docs (5)
39. brand-book/23-brand-book.html — Full brand book HTML
40. brand-book/24-brand-guidelines.md — Written guidelines
41. brand-book/25-logo-usage.svg — Do/Don't visual
42. brand-book/26-voice-tone.md — Voice & tone
43. brand-book/27-color-usage.svg — Color usage rules

## Canva / Adobe Express (5)
44. canva-express/28-canva-post-template.html
45. canva-express/29-canva-story-template.html
46. canva-express/30-express-hero.html
47. canva-express/31-express-character-card.html
48. canva-express/32-express-quote.html

## Email (3)
49. email/33-newsletter-header.html
50. email/34-email-signature.html
51. email/35-announcement-banner.html

## Utility (5)
52. utility/36-presentation-cover.svg
53. utility/37-convention-badge.svg
54. utility/38-signature-card.svg
55. utility/39-web-hero-banner.svg
56. utility/40-favicon-set.svg
`);

console.log('Brand kit generated at', OUT);
