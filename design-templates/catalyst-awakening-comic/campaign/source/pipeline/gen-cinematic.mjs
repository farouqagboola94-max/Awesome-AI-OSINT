/* Template generator for the 20-piece cinematic pack.
   Each item: { id, art, wash, title, caption, quote, endTitle, endSub, kb, dur, sf } */
import fs from 'fs';
import path from 'path';

const items = [
  { id: '01-mushin-3am', art: 'noir-window.jpg', wash: 'wash-red',
    title: 'MUSHIN', caption: '03:47 AM · A WEDNESDAY IN JULY',
    quote: 'The city was breathing.<br>He just learned<br>how to <em>listen</em>.',
    kb: [1.0, 1.12, 0, -30, 0, -60], dur: 10000 },
  { id: '02-forge', art: 'forge.jpg', wash: 'wash-red',
    title: 'THE FORGE', caption: 'IRON MET BLOOD · SOMETHING WOKE',
    quote: 'Ògún was here first.<br>Long before the boy.',
    kb: [1.05, 1.20, -20, 40, 20, -20], dur: 9000 },
  { id: '03-shipyard', art: 'shipyard.jpg', wash: 'wash-teal',
    title: 'THE SHIPYARD', caption: 'WHERE OLD GODS WATCH NEW STORMS',
    quote: 'Ọ̀ṣun taught the tide<br>to remember his name.',
    kb: [1.0, 1.15, 30, -30, -30, 20], dur: 9000 },
  { id: '04-corridor', art: 'corridor.jpg', wash: 'wash-dark',
    title: 'THE HALLWAY', caption: 'ONE MORE STEP · ONE MORE STEP',
    quote: 'Every corridor in Lagos<br>leads to the same door.',
    kb: [1.0, 1.18, 0, 0, 0, -80], dur: 9000 },
  { id: '05-industrial', art: 'industrial.jpg', wash: 'wash-red',
    title: 'THE PLANT', caption: 'STEAM · STEEL · SÀ NGÓ',
    quote: 'The thunder never left.<br>It just found a body.',
    kb: [1.02, 1.15, 20, -30, 0, 30], dur: 9000 },
  { id: '06-flares', art: 'flares.jpg', wash: 'wash-gold',
    title: 'FLARES', caption: 'THE OFFERING · THE WITNESS',
    quote: 'Every flame is a prayer<br>the Orishas can read.',
    kb: [1.0, 1.14, -20, 20, -20, 30], dur: 8500 },
  { id: '07-intersection', art: 'intersection.jpg', wash: 'wash-dark',
    title: 'THE CROSSROADS', caption: 'ẸṢÙ WAS ALREADY WAITING',
    quote: 'Every choice is a door.<br>He picked one anyway.',
    kb: [1.0, 1.10, 0, 40, 0, 20], dur: 8500 },
  { id: '08-circle', art: 'circle.jpg', wash: 'wash-teal',
    title: 'THE CIRCLE', caption: 'FIVE ELDERS · ONE PROPHECY',
    quote: 'They knew the name<br>before he did.',
    kb: [1.0, 1.14, 0, -20, 30, -30], dur: 8500 },
  { id: '09-bayo-portrait', art: 'bayo-portrait.webp', wash: 'wash-dark',
    title: 'BAYO ADEYEMI', caption: '19 · MUSHIN · CHOSEN',
    quote: 'He asked for nothing.<br>They gave him <em>everything</em>.',
    kb: [1.0, 1.10, 0, 0, 0, -30], dur: 8500 },
  { id: '10-bayo-bridge', art: 'bayo-bridge.webp', wash: 'wash-red',
    title: 'THE THIRD MAINLAND', caption: 'BRIDGE · BODY · BURNING',
    quote: 'He walked across water<br>the day the sky broke.',
    kb: [1.02, 1.16, -20, 40, 20, -40], dur: 9000 },
  { id: '11-amara-portrait', art: 'amara-portrait.webp', wash: 'wash-teal',
    title: 'AMARA OKAFOR', caption: 'SEER · SISTER · SPARK',
    quote: 'She saw the ending<br>before it began.',
    kb: [1.0, 1.10, 0, 20, 30, -20], dur: 8500 },
  { id: '12-ikenna', art: 'ikenna-portrait.webp', wash: 'wash-red',
    title: 'IKENNA', caption: 'THE STORM WITH A NAME',
    quote: 'Some men make weather.<br>He <em>was</em> weather.',
    kb: [1.0, 1.12, 0, -30, 0, 30], dur: 8500 },
  { id: '13-zara-portrait', art: 'zara-portrait.webp', wash: 'wash-teal',
    title: 'ZARA IBRAHIM', caption: 'THE RIVER · THE RECKONING',
    quote: 'She only ever swam<br>toward the fight.',
    kb: [1.0, 1.10, 20, -20, 0, 20], dur: 8500 },
  { id: '14-zara-raw', art: 'zara-raw.webp', wash: 'wash-dark',
    title: 'AFTERMATH', caption: 'THE COST · THE CROWN',
    quote: 'The river doesn\'t care<br>who wins.',
    kb: [1.04, 1.18, -30, 20, 20, -30], dur: 9000 },
  { id: '15-battle-raw', art: 'battle-raw.webp', wash: 'wash-red',
    title: 'THE FIRST FIGHT', caption: 'FIVE POWERS · ONE BOY',
    quote: 'His hands remembered<br>things he never learned.',
    kb: [1.05, 1.20, 30, -40, -30, 40], dur: 9500 },
  { id: '16-team-aurora', art: 'team-aurora.webp', wash: 'wash-teal',
    title: 'CONSTELLATION', caption: 'NO ONE STANDS ALONE',
    quote: 'Even gods need a<br>constellation to name them.',
    kb: [1.0, 1.10, -20, 20, 0, -20], dur: 8500 },
  { id: '17-team-highway', art: 'team-highway.webp', wash: 'wash-dark',
    title: 'THE ROAD OUT', caption: 'LAGOS TO IBADAN · MIDNIGHT',
    quote: 'They left the city<br>the way it left them.',
    kb: [1.0, 1.14, 0, -40, 0, 20], dur: 8500 },
  { id: '18-team-constellation', art: 'team-constellation.webp', wash: 'wash-gold',
    title: 'THE ALIGNMENT', caption: 'FOUR SOULS · FIVE ORISHAS',
    quote: 'When the stars agree,<br>the story starts.',
    kb: [1.0, 1.14, 20, -20, 20, -20], dur: 8500 },
  { id: '19-lagos-spirits', art: 'lagos-spirits.webp', wash: 'wash-teal',
    title: 'THE UNSEEN', caption: 'THEY LIVE HERE TOO',
    quote: 'Lagos was never<br>only a <em>city</em>.',
    kb: [1.02, 1.18, 0, 30, -30, 30], dur: 9000 },
  { id: '20-cover-finale', art: 'cover-finale50.webp', wash: 'wash-gold',
    title: 'THE FIFTY', caption: 'ISSUE FIFTY · THE RECKONING',
    quote: 'Every awakening<br>ends where it began.',
    kb: [1.02, 1.16, -20, 20, 30, -30], dur: 9500 }
];

const template = (item) => {
  const [s0, s1, x0, x1, y0, y1] = item.kb;
  const endStart = item.dur - 4200;
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../pipeline/base.css">
<link rel="stylesheet" href="../pipeline/cinematic.css">
<style>
  .cine-title { top: 260px; font-size: 130px; }
  .cine-caption { top: 440px; }
  .cine-quote { bottom: 380px; font-size: 66px; line-height: 1.2; }
  .chapter-num { position: absolute; top: 200px; left: 0; right: 0; text-align: center; z-index: 50; opacity: 0; }
</style></head>
<body><div class="cine-stage" id="cam">
  <div class="cine-art" id="art" style="background-image: url('../artwork/${item.art}');"></div>
  <div class="wash ${item.wash}"></div>
  <div class="wash wash-dark"></div>
  <div class="cine-grain"></div>
  <div class="letterbox-t"></div>
  <div class="letterbox-b"></div>
  <div class="chapter-num" id="chNum">CHAPTER ${item.id.slice(0,2)}</div>
  <div class="cine-title" id="title">${item.title}</div>
  <div class="cine-caption" id="caption">◈ ${item.caption} ◈</div>
  <div class="cine-quote" id="quote">${item.quote}</div>
  <div class="cine-endcard" id="endcard" style="opacity:0">
    <div class="lg">CATALYST</div>
    <div class="sub">THE AWAKENING</div>
    <div class="rule"></div>
    <div class="sub" style="font-size:34px;letter-spacing:6px;color:var(--gold)">4 FREE ISSUES · READ NOW</div>
    <div class="url">catalyst-awakening.netlify.app</div>
  </div>
</div>
<script src="../pipeline/kinetic.js"></script>
<script src="../pipeline/kit.js"></script>
<script src="../pipeline/cinematic.js"></script>
<script>
const $ = id => document.getElementById(id);
CINE.kenBurns($('art'), 0, ${item.dur}, ${s0}, ${s1}, ${x0}, ${x1}, ${y0}, ${y1});
CINE.letterboxIn(0, 900);
CINE.fadeIn($('chNum'), 300, 600);
CINE.fadeOut($('chNum'), 2400, 600);
KIN.add($('title'), {t0: 900, t1: 1900, from: {opacity: 0, ls: 32, y: 40, blur: 8}, to: {opacity: 1, ls: 6, y: 0, blur: 0}, ease: 'outExpo'});
KIN.add($('caption'), {t0: 1600, t1: 2400, from: {opacity: 0, ls: 40, y: 20}, to: {opacity: 1, ls: 14, y: 0}, ease: 'outExpo'});
CINE.fadeOut($('title'), 4000, 700);
CINE.fadeOut($('caption'), 4000, 700);
KIT.linePop($('quote'), 4300, 380, 620);
CINE.fadeOut($('quote'), ${endStart - 800}, 700);
CINE.endcard(${endStart}, 500);
KIN.seek(0);
</script></body></html>`;
};

const outDir = process.argv[2];
const listPath = process.argv[3];
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const durs = [];
for (const item of items) {
  fs.writeFileSync(path.join(outDir, `cine-${item.id}.html`), template(item));
  durs.push(`cine-${item.id} ${item.dur}`);
}
fs.writeFileSync(listPath, durs.join('\n'));
console.log(`Generated ${items.length} cinematic HTMLs`);
