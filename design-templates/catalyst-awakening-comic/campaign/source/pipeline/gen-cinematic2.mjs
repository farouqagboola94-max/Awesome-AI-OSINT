/* Cinematic pack, part two: chapters 21-40. Same template as gen-cinematic.mjs. */
import fs from 'fs';
import path from 'path';

const items = [
  { id: '21-issue-one', art: 'cover-issue1.webp', wash: 'wash-gold',
    title: 'ISSUE ONE', caption: 'WHERE IT ALL BEGAN',
    quote: 'Every awakening<br>needs a first page.',
    kb: [1.0, 1.12, 0, 20, 0, -30], dur: 8500 },
  { id: '22-issue-two', art: 'cover-issue2.webp', wash: 'wash-red',
    title: 'ISSUE TWO', caption: 'THE BLOOD REMEMBERS',
    quote: 'Ṣàngó doesn\'t knock.<br>He arrives.',
    kb: [1.02, 1.16, -20, 30, 0, 20], dur: 8500 },
  { id: '23-issue-three', art: 'cover-issue3.webp', wash: 'wash-teal',
    title: 'ISSUE THREE', caption: 'THE RIVER CHOOSES SIDES',
    quote: 'Ọ̀ṣun never forgives.<br>She redirects.',
    kb: [1.0, 1.14, 20, -20, 20, -20], dur: 8500 },
  { id: '24-issue-four', art: 'cover-issue4.webp', wash: 'wash-dark',
    title: 'ISSUE FOUR', caption: 'THE RECKONING ARRIVES',
    quote: 'Four issues in,<br>and Lagos still isn\'t safe.',
    kb: [1.03, 1.18, 0, -30, -20, 30], dur: 9000 },
  { id: '25-amara-awakening', art: 'cover-amara-awakening.webp', wash: 'wash-teal',
    title: "AMARA'S AWAKENING", caption: 'THE SEER FINDS HER VOICE',
    quote: 'She stopped whispering<br>the day the visions<br>started shouting back.',
    kb: [1.0, 1.13, -30, 20, 0, -20], dur: 9000 },
  { id: '26-first-orisha', art: 'cover-bayo-orisha1.webp', wash: 'wash-red',
    title: 'THE FIRST ORISHA', caption: 'BEFORE HE HAD ALL FIVE',
    quote: 'One voice in his skull<br>was already<br>too many.',
    kb: [1.02, 1.17, 0, 30, 20, -20], dur: 9000 },
  { id: '27-lagos-eternal', art: 'cover-lagos-eternal4.webp', wash: 'wash-gold',
    title: 'LAGOS ETERNAL', caption: 'THE CITY OUTLIVES EVERYONE',
    quote: 'Empires fall.<br>Lagos just<br>changes traffic patterns.',
    kb: [1.0, 1.15, 20, -30, -20, 20], dur: 9000 },
  { id: '28-orisha-rising', art: 'cover-orisha-rising3.webp', wash: 'wash-red',
    title: 'ORISHA RISING', caption: 'FIVE BECOME ONE',
    quote: 'They stopped fighting<br>for the body<br>and started sharing it.',
    kb: [1.03, 1.19, -20, 30, 0, -30], dur: 9500 },
  { id: '29-the-strike', art: 'bayo-action.png', wash: 'wash-red',
    title: 'THE STRIKE', caption: 'IRON MEETS INTENTION',
    quote: 'His fist remembered<br>a war he never<br>fought.',
    kb: [1.04, 1.22, 30, -40, -30, 40], dur: 9500 },
  { id: '30-after-midnight', art: 'noir-window.jpg', wash: 'wash-teal',
    title: 'AFTER MIDNIGHT', caption: 'EPILOGUE · THE MORNING AFTER',
    quote: 'The rain stopped.<br>He didn\'t.',
    kb: [1.06, 1.02, 30, -10, -20, 10], dur: 8500 },
  { id: '31-the-reckoning', art: 'forge.jpg', wash: 'wash-gold',
    title: 'THE RECKONING', caption: 'ÒGÚN COLLECTS HIS DEBT',
    quote: 'Every hammer strike<br>was a name he\'d<br>forgotten to fear.',
    kb: [1.08, 1.0, 30, -20, -20, 20], dur: 8500 },
  { id: '32-departure', art: 'shipyard.jpg', wash: 'wash-dark',
    title: 'DEPARTURE', caption: 'SOME LEAVE. FEW RETURN.',
    quote: 'The tide doesn\'t<br>ask permission<br>to take you.',
    kb: [1.06, 1.0, -30, 10, 30, -10], dur: 8500 },
  { id: '33-the-return', art: 'corridor.jpg', wash: 'wash-gold',
    title: 'THE RETURN', caption: 'BACK WHERE IT STARTED',
    quote: 'The hallway<br>was shorter than<br>he remembered.',
    kb: [1.09, 1.0, 0, 0, -40, 10], dur: 8500 },
  { id: '34-steel-and-silence', art: 'industrial.jpg', wash: 'wash-teal',
    title: 'STEEL AND SILENCE', caption: 'THE PLANT AFTER HOURS',
    quote: 'Machines don\'t<br>pray. They just<br>keep running.',
    kb: [1.05, 1.0, 20, -10, 20, -20], dur: 8500 },
  { id: '35-smoke-signals', art: 'flares.jpg', wash: 'wash-red',
    title: 'SMOKE SIGNALS', caption: 'A MESSAGE FOR THE GODS',
    quote: 'Every flame\'s a<br>question. Not every<br>god answers.',
    kb: [1.07, 1.0, -20, 20, 20, -10], dur: 8500 },
  { id: '36-the-choice', art: 'intersection.jpg', wash: 'wash-gold',
    title: 'THE CHOICE', caption: 'ẸṢÙ ALWAYS LEAVES A DOOR OPEN',
    quote: 'Every crossroads<br>is a test he<br>already passed.',
    kb: [1.0, 1.06, 0, -20, 0, 30], dur: 8500 },
  { id: '37-the-council', art: 'circle.jpg', wash: 'wash-dark',
    title: 'THE COUNCIL', caption: 'FIVE ELDERS RECONVENE',
    quote: 'They only meet<br>when the prophecy<br>gets complicated.',
    kb: [1.06, 1.0, 0, 30, -20, -20], dur: 8500 },
  { id: '38-scars', art: 'battle-raw.webp', wash: 'wash-red',
    title: 'SCARS', caption: 'WHAT THE FIGHT LEFT BEHIND',
    quote: 'Healing was never<br>part of the<br>arrangement.',
    kb: [1.08, 1.0, -30, 20, 30, -20], dur: 9000 },
  { id: '39-the-long-road', art: 'team-highway.webp', wash: 'wash-teal',
    title: 'THE LONG ROAD', caption: 'FOUR SOULS, ONE HIGHWAY',
    quote: 'Nobody said the<br>road out of Lagos<br>was short.',
    kb: [1.05, 1.0, 20, -30, 0, 20], dur: 8500 },
  { id: '40-what-remains', art: 'lagos-spirits.webp', wash: 'wash-gold',
    title: 'WHAT REMAINS', caption: 'THE UNSEEN STAY WATCHING',
    quote: 'The story ends.<br>The city<br>doesn\'t.',
    kb: [1.0, 1.10, 0, 0, 20, -30], dur: 9500 }
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
console.log(`Generated ${items.length} cinematic HTMLs (chapters 21-40)`);
