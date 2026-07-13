/* Generate 15 full character-introduction videos, one HTML timeline per character.
   Each is self-contained: tag -> name slam -> art-or-domain beat -> stat grid -> quote -> brand outro. */
import fs from 'fs';
import path from 'path';

const CHARS = [
  // ── established humans ──
  { id: '01-bayo-adeyemi', name: 'BAYO', surname: 'ADEYEMI', aka: 'THE VESSEL', tag: 'PROTAGONIST',
    color: 'var(--gold)', art: 'bayo-portrait.webp', wash: 'wash-dark',
    stats: [['AGE', '19'], ['BORN', 'MUSHIN'], ['GIFT', 'ALL FIVE'], ['STATUS', 'CHOSEN']],
    quote: 'He asked for nothing.<br>They gave him <em>everything</em>.', audio: 'mix', seed: 1, canon: true },
  { id: '02-amara-okafor', name: 'AMARA', surname: 'OKAFOR', aka: 'THE SEER', tag: 'ALLY',
    color: 'var(--teal)', art: 'amara-portrait.webp', wash: 'wash-teal',
    stats: [['GIFT', 'SIGHT'], ['ROLE', 'SEER'], ['BORN', 'IKEJA'], ['STATUS', 'ALLY']],
    quote: 'She stopped whispering the day<br>the visions started<br><em>shouting back</em>.', audio: 'mix', seed: 2, canon: true },
  { id: '03-ikenna-obi', name: 'IKENNA', surname: 'OBI', aka: 'THE STORM', tag: 'WILDCARD',
    color: 'var(--orange)', art: 'ikenna-portrait.webp', wash: 'wash-red',
    stats: [['GIFT', 'STORM'], ['ROLE', 'WILDCARD'], ['BORN', 'AJEGUNLE'], ['STATUS', 'RIVAL']],
    quote: 'Some men make weather.<br>He <em>was</em> weather.', audio: 'mix', seed: 3, canon: true },
  { id: '04-zara-ibrahim', name: 'ZARA', surname: 'IBRAHIM', aka: 'THE RIVER', tag: 'ENFORCER',
    color: 'var(--red)', art: 'zara-portrait.webp', wash: 'wash-red',
    stats: [['GIFT', 'TIDE'], ['ROLE', 'ENFORCER'], ['BORN', 'APAPA'], ['STATUS', 'UNKNOWN']],
    quote: 'She only ever swam<br>toward the <em>fight</em>.', audio: 'mix', seed: 4, canon: true },

  // ── the five orishas ──
  { id: '05-sango', name: 'ṢÀNGÓ', surname: '', aka: 'ORISHA OF THUNDER', tag: 'THE FIRST POWER',
    color: 'var(--red)', art: 'forge.jpg', wash: 'wash-red',
    stats: [['DOMAIN', 'THUNDER'], ['ELEMENT', 'FIRE'], ['SYMBOL', 'AXE'], ['STATUS', 'AWAKENED']],
    quote: 'Every hammer strike<br>was a name he\'d<br>forgotten to <em>fear</em>.', audio: 'mix', seed: 5, canon: true },
  { id: '06-ogun', name: 'ÒGÚN', surname: '', aka: 'ORISHA OF IRON', tag: 'THE SECOND POWER',
    color: 'var(--orange)', art: 'industrial.jpg', wash: 'wash-red',
    stats: [['DOMAIN', 'WAR'], ['ELEMENT', 'IRON'], ['SYMBOL', 'BLADE'], ['STATUS', 'AWAKENED']],
    quote: 'Some gods bless.<br>Ògún just<br><em>sharpens</em>.', audio: 'mix', seed: 6, canon: true },
  { id: '07-osun', name: 'Ọ̀ṢUN', surname: '', aka: 'ORISHA OF RIVERS', tag: 'THE THIRD POWER',
    color: 'var(--teal)', art: 'shipyard.jpg', wash: 'wash-teal',
    stats: [['DOMAIN', 'LOVE'], ['ELEMENT', 'WATER'], ['SYMBOL', 'MIRROR'], ['STATUS', 'AWAKENED']],
    quote: 'Ọ̀ṣun never forgives.<br>She <em>redirects</em>.', audio: 'mix', seed: 7, canon: true },
  { id: '08-obatala', name: 'OBATÀLÁ', surname: '', aka: 'ORISHA OF THE SKY', tag: 'THE FOURTH POWER',
    color: 'var(--bone)', art: 'circle.jpg', wash: 'wash-dark',
    stats: [['DOMAIN', 'WISDOM'], ['ELEMENT', 'SKY'], ['SYMBOL', 'STAFF'], ['STATUS', 'AWAKENED']],
    quote: 'The oldest of them<br>speaks last.<br><em>On purpose</em>.', audio: 'mix', seed: 8, canon: true },
  { id: '09-esu', name: 'ẸṢÙ', surname: '', aka: 'ORISHA OF THE CROSSROADS', tag: 'THE FIFTH POWER',
    color: 'var(--gold)', art: 'intersection.jpg', wash: 'wash-gold',
    stats: [['DOMAIN', 'CHAOS'], ['ELEMENT', 'ROADS'], ['SYMBOL', 'STAFF-OF-OKPA'], ['STATUS', 'AWAKENED']],
    quote: 'Every crossroads<br>is a test<br>he already <em>passed</em>.', audio: 'mix', seed: 9, canon: true },

  // ── new supporting cast (invented — for review) ──
  { id: '10-mama-adunni', name: 'MAMA ADUNNI', surname: '"IYA AJE"', aka: 'THE ELDER', tag: 'NEW · MENTOR',
    color: 'var(--indigo)', art: null, wash: null,
    stats: [['ROLE', 'MENTOR'], ['SHRINE', 'ILE-AYE'], ['BORN', 'MUSHIN'], ['STATUS', 'GUIDE']],
    quote: 'She lit the first candle<br>before anyone knew<br>there\'d be a <em>fire</em> to fear.', audio: 'score', seed: 10, canon: false },
  { id: '11-tunde-wire', name: 'TUNDE "WIRE"', surname: 'BALOGUN', aka: 'THE HACKER', tag: 'NEW · ALLY',
    color: 'var(--gold)', art: null, wash: null,
    stats: [['ROLE', 'INTEL'], ['BASE', 'YABA'], ['SPECIALTY', 'SIGNALS'], ['STATUS', 'ALLY']],
    quote: 'He sees the city<br>through a thousand<br><em>borrowed</em> eyes.', audio: 'mix', seed: 11, canon: false },
  { id: '12-chidinma-naija', name: 'CHIDINMA', surname: '"NAIJA" OKOYE', aka: 'THE JOURNALIST', tag: 'NEW · INFORMANT',
    color: 'var(--bone)', art: null, wash: null,
    stats: [['ROLE', 'INFORMANT'], ['OUTLET', 'UNDERGROUND WIRE'], ['BORN', 'SURULERE'], ['STATUS', 'WATCHING']],
    quote: 'She prints what Lagos<br>won\'t say<br><em>out loud</em>.', audio: 'score', seed: 12, canon: false },
  { id: '13-obasi-kalu', name: 'CHIEF OBASI', surname: 'KALU', aka: 'THE SYNDICATE BOSS', tag: 'NEW · ANTAGONIST',
    color: '#7A0E20', art: null, wash: null,
    stats: [['ROLE', 'SYNDICATE BOSS'], ['BASE', 'VICTORIA ISLAND'], ['WANTS', 'THE VESSEL'], ['STATUS', 'ENEMY']],
    quote: 'Every god has a price.<br>He\'s found<br><em>Bayo\'s</em>.', audio: 'score', seed: 13, canon: false, dark: true },
  { id: '14-funke-adebayo', name: 'DR. FUNKE', surname: 'ADEBAYO', aka: 'THE RESEARCHER', tag: 'NEW · ANTAGONIST',
    color: '#A4FF4D', art: null, wash: null,
    stats: [['ROLE', 'RESEARCHER'], ['PROGRAM', 'AWAKENED ORIGINS'], ['BACKING', 'FEDERAL'], ['STATUS', 'ENEMY']],
    quote: 'She doesn\'t see gods.<br>She sees<br><em>test subjects</em>.', audio: 'score', seed: 14, canon: false, dark: true },
  { id: '15-ashen-man', name: 'THE ASHEN MAN', surname: '', aka: 'UNKNOWN', tag: 'NEW · MYSTERY',
    color: 'var(--ash)', art: null, wash: null,
    stats: [['ROLE', 'UNKNOWN'], ['FIRST SEEN', 'THE CROSSROADS'], ['SPEAKS IN', 'RIDDLES'], ['STATUS', '???']],
    quote: 'He only appears<br>where a choice<br>is about to be <em>made</em>.', audio: 'score', seed: 15, canon: false, dark: true }
];

const DUR = 22000; // ms
const template = (c, idx) => {
  const hasArt = !!c.art;
  const artScene = hasArt ? `
  <div class="cine-art" id="art" style="background-image: url('../artwork/${c.art}');"></div>
  <div class="wash ${c.wash}"></div>
  <div class="wash wash-dark"></div>` : `
  <div class="domain-bg" id="domainBg"></div>`;
  const glitch = c.dark ? `
  <div class="glitch-flicker" id="glitchFx"></div>` : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../pipeline/base.css">
<link rel="stylesheet" href="../pipeline/motion.css">
<link rel="stylesheet" href="../pipeline/cinematic.css">
<style>
  .charname { font-family: 'Bebas Neue'; font-size: 220px; color: ${c.color}; line-height: 0.85; letter-spacing: 2px; }
  .charsur { font-family: 'Oswald'; font-weight: 700; font-size: 70px; color: var(--bone); letter-spacing: 6px; margin-top: 8px; }
  .charaka { font-family: 'Oswald'; font-weight: 300; font-size: 36px; color: ${c.color}; letter-spacing: 12px; margin-top: 14px; }
  .chartag { font-family: 'Oswald'; font-weight: 700; font-size: 26px; color: ${c.color}; letter-spacing: 12px; }
  .domain-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.06), var(--black) 70%); }
  .domain-title { position: absolute; top: 700px; left: 0; right: 0; text-align: center; font-family: 'Bebas Neue'; font-size: 160px; color: ${c.color}; letter-spacing: 4px; }
  .stat-grid { position: absolute; top: 500px; left: 0; right: 0; padding: 0 100px; display: flex; flex-direction: column; gap: 60px; }
  .stat-row { display: flex; justify-content: space-between; border-bottom: 2px solid var(--iron); padding-bottom: 30px; }
  .stat-lab { font-family: 'Space Grotesk'; font-weight: 500; letter-spacing: 6px; font-size: 32px; color: var(--ash); }
  .stat-val { font-family: 'Oswald'; font-weight: 700; font-size: 46px; letter-spacing: 4px; color: var(--bone); }
  .quote-txt { position: absolute; left: 100px; right: 100px; top: 700px; font-family: 'Crimson Pro'; font-style: italic; font-size: 74px; line-height: 1.2; color: var(--bone); text-align: center; }
  .quote-txt em { color: ${c.color}; font-style: italic; }
  .glitch-flicker { position: absolute; inset: 0; z-index: 45; pointer-events: none; background: ${c.color}; opacity: 0; mix-blend-mode: overlay; }
</style></head>
<body><div class="stage" id="cam">
  <!-- scene A: tag -->
  <div id="sA" class="scene" style="opacity:0"><div class="center">
    <div class="chartag" id="tagline">◈ ${c.tag} ◈</div>
  </div></div>
  <!-- scene B: name slam -->
  <div id="sB" class="scene" style="opacity:0">
    <div class="corner-tl" style="border-color:${c.color}"></div><div class="corner-tr" style="border-color:${c.color}"></div>
    <div class="corner-bl" style="border-color:${c.color}"></div><div class="corner-br" style="border-color:${c.color}"></div>
    <div class="center">
      <div class="charname" id="cname">${c.name}</div>
      ${c.surname ? `<div class="charsur" id="csur">${c.surname}</div>` : ''}
      <div class="charaka" id="caka">— ${c.aka} —</div>
    </div>
  </div>
  <!-- scene C: art or domain -->
  <div id="sC" class="scene cine-stage" style="opacity:0">
    ${artScene}
    ${glitch}
    <div class="cine-grain"></div>
    ${hasArt ? '' : `<div class="domain-title" id="domainTitle">${c.aka.replace('ORISHA OF ', '')}</div>`}
  </div>
  <!-- scene D: stats -->
  <div id="sD" class="scene" style="opacity:0">
    <div class="stat-grid" id="statGrid">
      ${c.stats.map((s, i) => `<div class="stat-row" id="row${i}"><span class="stat-lab">${s[0]}</span><span class="stat-val" style="color:${c.color}">${s[1]}</span></div>`).join('\n      ')}
    </div>
  </div>
  <!-- scene E: quote -->
  <div id="sE" class="scene" style="opacity:0">
    <div class="quote-txt" id="quoteTxt">${c.quote}</div>
  </div>
  <!-- scene F: brand outro -->
  <div id="sF" class="scene" style="opacity:0"><div class="center" id="lockup">
    <div class="word" style="font-family:'Bebas Neue'; font-size:220px; color:var(--gold)" id="logoA">CATALYST</div>
    <div style="font-family:'Oswald'; font-weight:600; font-size:56px; color:var(--bone); letter-spacing:16px" id="logoB">THE AWAKENING</div>
    <div style="width:300px;height:6px;background:var(--gold);margin:36px auto" id="ruleEl"></div>
    <div style="font-family:'Oswald'; font-weight:700; font-size:36px; letter-spacing:6px; color:${c.color}" id="cta">MEET THE FULL CAST</div>
    <div style="font-family:'Space Grotesk'; font-size:26px; letter-spacing:4px; color:var(--ash); margin-top:20px" id="urlEl">catalyst-awakening.netlify.app</div>
  </div></div>
  <div class="grain"></div><div class="vignette"></div>
</div>
<script src="../pipeline/kinetic.js"></script>
<script src="../pipeline/kit.js"></script>
<script src="../pipeline/cinematic.js"></script>
<script>
const $ = id => document.getElementById(id);
const { cut, cutFade, slam, wordPop, charCascade, shake, flash, drift, fade, linePop, scaleIn } = KIT;

// A: tag  0-1200
cutFade($('sA'), 0, 1200, 200);
KIN.add($('tagline'), {t0:100, t1:600, from:{opacity:0, ls:36}, to:{opacity:1, ls:12}, ease:'outExpo'});

// B: name  1200-5200
cutFade($('sB'), 1200, 5200, 300);
charCascade($('cname'), 1300, 44, 380);
${c.surname ? `KIN.add($('csur'), {t0:2200, t1:2800, from:{opacity:0, ls:40, blur:8}, to:{opacity:1, ls:8, blur:0}, ease:'outExpo'});` : ''}
KIN.add($('caka'), {t0:2600, t1:3100, from:{opacity:0, ls:32}, to:{opacity:1, ls:14}, ease:'outExpo'});
shake($('cam'), 1320, 300, 12);

// C: art/domain  5200-10200
cutFade($('sC'), 5200, 10200, 400);
${hasArt ? `CINE.kenBurns($('art'), 5200, 10200, 1.0, 1.14, 0, -30, 0, 20);` :
  `KIN.add($('domainTitle'), {t0:5400, t1:6400, from:{opacity:0, scale:1.3, blur:14}, to:{opacity:1, scale:1, blur:0}, ease:'outExpo'});
drift($('domainBg'), 5200, 10200, 1, 1.08);`}
${c.dark ? `KIN.fx($('glitchFx'), 5200, 10200, (p,t)=>{
  const local = t - 5200;
  const flick = (Math.sin(local*0.05)*0.5+0.5) * (Math.random() > 0.9 ? 1 : 0);
  $('glitchFx').style.opacity = flick * 0.12;
});` : ''}

// D: stats  10200-15200
cutFade($('sD'), 10200, 15200, 300);
${c.stats.map((s, i) => `KIN.add($('row${i}'), {t0:${10300 + i * 200}, t1:${10700 + i * 200}, from:{opacity:0, x: ${i % 2 ? 60 : -60}}, to:{opacity:1, x:0}, ease:'outQuart'});`).join('\n')}

// E: quote  15200-19700
cutFade($('sE'), 15200, 19700, 400);
linePop($('quoteTxt'), 15400, 340, 560);

// F: brand outro  19700-22000
cutFade($('sF'), 19700, 22000, 500);
charCascade($('logoA'), 19800, 30, 300);
KIN.add($('logoB'), {t0:20300, t1:20900, from:{opacity:0, ls:44}, to:{opacity:1, ls:16}, ease:'outExpo'});
KIN.add($('ruleEl'), {t0:20700, t1:21200, from:{sx:0, sy:1}, to:{sx:1, sy:1}, ease:'outExpo'});
fade($('cta'), 21200, 21600, 0, 1);
fade($('urlEl'), 21500, 21900, 0, 1);
drift($('lockup'), 19700, 22000, 1, 1.05);

KIN.seek(0);
</script></body></html>`;
};

const outDir = process.argv[2];
const listPath = process.argv[3];
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const rows = [];
CHARS.forEach((c, i) => {
  fs.writeFileSync(path.join(outDir, `char-${c.id}.html`), template(c, i));
  rows.push(`char-${c.id} ${DUR} ${c.canon}`);
});
fs.writeFileSync(listPath, rows.join('\n'));
console.log(`Generated ${CHARS.length} character videos`);
