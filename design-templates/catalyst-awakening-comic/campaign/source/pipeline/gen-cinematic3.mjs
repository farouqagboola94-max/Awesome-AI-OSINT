/* Cinematic pack, part three: chapters 41-90. Same template as gen-cinematic.mjs. */
import fs from 'fs';
import path from 'path';

// cycling pan presets for visual variety without hand-specifying all 50
const PANS = [
  [1.0, 1.12, 0, 20, 0, -30], [1.02, 1.16, -20, 30, 0, 20], [1.0, 1.14, 20, -20, 20, -20],
  [1.03, 1.18, 0, -30, -20, 30], [1.0, 1.10, 0, 0, 0, -30], [1.02, 1.17, 0, 30, 20, -20],
  [1.0, 1.15, 20, -30, -20, 20], [1.03, 1.19, -20, 30, 0, -30], [1.04, 1.22, 30, -40, -30, 40],
  [1.06, 1.02, 30, -10, -20, 10], [1.08, 1.0, 30, -20, -20, 20], [1.06, 1.0, -30, 10, 30, -10],
  [1.09, 1.0, 0, 0, -40, 10], [1.05, 1.0, 20, -10, 20, -20], [1.07, 1.0, -20, 20, 20, -10]
];

const items = [
  { id: '41-after-the-storm', art: 'noir-window.jpg', wash: 'wash-gold', title: 'AFTER THE STORM', caption: 'THE RAIN NEVER TELLS', quote: 'Every drop remembers<br>a name it once knew.' },
  { id: '42-cold-iron', art: 'forge.jpg', wash: 'wash-teal', title: 'COLD IRON', caption: 'ÒGÚN AT REST', quote: 'Even war gods sleep.<br>Just not for long.' },
  { id: '43-red-tide', art: 'shipyard.jpg', wash: 'wash-red', title: 'RED TIDE', caption: 'SOMETHING SHIFTED OFFSHORE', quote: 'Ọ̀ṣun warned them.<br>The water<br>didn\'t <em>listen</em>.' },
  { id: '44-the-long-wait', art: 'corridor.jpg', wash: 'wash-gold', title: 'THE LONG WAIT', caption: "TUNDE'S SAFEHOUSE", quote: 'Wire never sleeps.<br>He just changes<br><em>screens</em>.' },
  { id: '45-ghost-shift', art: 'industrial.jpg', wash: 'wash-dark', title: 'GHOST SHIFT', caption: 'THE PLANT AT 4AM', quote: 'Nobody clocks out<br>of a <em>war</em>.' },
  { id: '46-cool-burn', art: 'flares.jpg', wash: 'wash-teal', title: 'COOL BURN', caption: 'THE OFFERING, REVISITED', quote: 'Not every fire<br>is a <em>warning</em>.' },
  { id: '47-red-light-district', art: 'intersection.jpg', wash: 'wash-red', title: 'RED LIGHT DISTRICT', caption: "ẸṢÙ'S FAVORITE CORNER", quote: 'He\'s been waiting<br>at this light<br>since <em>1861</em>.' },
  { id: '48-quorum', art: 'circle.jpg', wash: 'wash-gold', title: 'QUORUM', caption: 'THE ELDERS RECONVENE', quote: 'Mama Adunni speaks last.<br>On <em>purpose</em>.' },
  { id: '49-still-water', art: 'bayo-portrait.webp', wash: 'wash-teal', title: 'STILL WATER', caption: 'BAYO, BEFORE THE STORM', quote: 'He looked calm.<br>He <em>wasn\'t</em>.' },
  { id: '50-the-crossing-again', art: 'bayo-bridge.webp', wash: 'wash-gold', title: 'THE CROSSING, AGAIN', caption: 'THIRD MAINLAND, DAWN', quote: 'Some bridges<br>you cross<br><em>twice</em>.' },
  { id: '51-the-sight-costs', art: 'amara-portrait.webp', wash: 'wash-red', title: 'THE SIGHT COSTS', caption: "AMARA'S MIGRAINE", quote: 'Every vision<br>takes something<br><em>back</em>.' },
  { id: '52-eye-of-the-storm', art: 'ikenna-portrait.webp', wash: 'wash-teal', title: 'EYE OF THE STORM', caption: 'IKENNA, UNGUARDED', quote: 'Even weather<br>gets <em>tired</em>.' },
  { id: '53-still-river', art: 'zara-portrait.webp', wash: 'wash-gold', title: 'STILL RIVER', caption: 'ZARA BEFORE APAPA', quote: 'She counts the boats<br>before she counts<br><em>anything else</em>.' },
  { id: '54-the-cost-of-winning', art: 'zara-raw.webp', wash: 'wash-red', title: 'THE COST OF WINNING', caption: 'AFTERMATH, PART TWO', quote: 'Victory bleeds<br>the same<br>as <em>loss</em>.' },
  { id: '55-second-wind', art: 'battle-raw.webp', wash: 'wash-teal', title: 'SECOND WIND', caption: 'THE FIGHT CONTINUES', quote: 'His body remembered<br>before his mind<br>caught <em>up</em>.' },
  { id: '56-the-alignment-revisited', art: 'team-aurora.webp', wash: 'wash-gold', title: 'THE ALIGNMENT', caption: 'FOUR SOULS, ONE SKY', quote: 'Even constellations<br>argue<br><em>sometimes</em>.' },
  { id: '57-midnight-convoy', art: 'team-highway.webp', wash: 'wash-red', title: 'MIDNIGHT CONVOY', caption: 'LEAVING LAGOS, TOGETHER', quote: 'Nobody drives<br>this road alone<br><em>twice</em>.' },
  { id: '58-the-pact', art: 'team-constellation.webp', wash: 'wash-teal', title: 'THE PACT', caption: 'WHAT THEY PROMISED EACH OTHER', quote: 'A promise made<br>under stars<br>is a promise <em>kept</em>.' },
  { id: '59-the-unseen-again', art: 'lagos-spirits.webp', wash: 'wash-gold', title: 'THE UNSEEN', caption: "THEY'RE STILL WATCHING", quote: 'Lagos never really sleeps.<br>Neither do<br><em>they</em>.' },
  { id: '60-fifty-issues-later', art: 'cover-finale50.webp', wash: 'wash-red', title: 'FIFTY ISSUES LATER', caption: 'THE RECKONING, RETOLD', quote: 'Every ending is a door<br>somebody forgot<br>to <em>close</em>.' },
  { id: '61-page-one-revisited', art: 'cover-issue1.webp', wash: 'wash-teal', title: 'PAGE ONE', caption: 'WHERE WE STARTED', quote: 'Nobody remembers<br>page one the way<br>it <em>happened</em>.' },
  { id: '62-the-bloodline-deeper', art: 'cover-issue2.webp', wash: 'wash-gold', title: 'THE BLOODLINE', caption: 'WHAT ISSUE TWO LEFT OUT', quote: 'History edits itself<br>if you let<br>it <em>.</em>' },
  { id: '63-the-river-uncut', art: 'cover-issue3.webp', wash: 'wash-red', title: 'THE RIVER, UNCUT', caption: "ISSUE THREE'S MISSING PAGE", quote: 'Ọ̀ṣun\'s choice cost more<br>than the story<br><em>showed</em>.' },
  { id: '64-the-reckoning-extended', art: 'cover-issue4.webp', wash: 'wash-teal', title: 'THE RECKONING', caption: 'AFTER THE LAST PANEL', quote: 'The story didn\'t end.<br>The art<br>just <em>stopped</em>.' },
  { id: '65-the-seers-first-vision', art: 'cover-amara-awakening.webp', wash: 'wash-gold', title: "THE SEER'S FIRST VISION", caption: 'BEFORE SHE HAD A NAME FOR IT', quote: 'She thought it was a headache.<br>It was<br>a <em>warning</em>.' },
  { id: '66-one-voice-becomes-five', art: 'cover-bayo-orisha1.webp', wash: 'wash-red', title: 'ONE VOICE, FIVE', caption: 'THE MOMENT IT STARTED', quote: 'He asked which god.<br>The answer was:<br><em>all of them</em>.' },
  { id: '67-the-city-remembers', art: 'cover-lagos-eternal4.webp', wash: 'wash-teal', title: 'THE CITY REMEMBERS', caption: 'LAGOS, BEFORE THE BRIDGE', quote: 'Every skyline hides<br>an older one<br><em>underneath</em>.' },
  { id: '68-the-rising-slower', art: 'cover-orisha-rising3.webp', wash: 'wash-gold', title: 'THE RISING', caption: 'HOW FIVE BECAME ONE', quote: 'Power doesn\'t<br>announce itself.<br>It <em>accumulates</em>.' },
  { id: '69-348-am', art: 'noir-window.jpg', wash: 'wash-red', title: '3:48 AM', caption: 'ONE MINUTE LATER', quote: 'Nothing happens at 3:47.<br>Everything happens<br>at <em>3:48</em>.' },
  { id: '70-the-first-strike', art: 'forge.jpg', wash: 'wash-gold', title: 'THE FIRST STRIKE', caption: 'WHERE ÒGÚN LEARNED PATIENCE', quote: 'He didn\'t rush the blade.<br>He<br><em>never does</em>.' },
  { id: '71-container-12', art: 'shipyard.jpg', wash: 'wash-dark', title: 'CONTAINER 12', caption: 'WHAT WASHED ASHORE', quote: 'Not everything that arrives<br>by water<br>was <em>invited</em>.' },
  { id: '72-one-more-door', art: 'corridor.jpg', wash: 'wash-red', title: 'ONE MORE DOOR', caption: 'THE HALLWAY NEVER ENDS', quote: 'He counted forty-two doors.<br>He only needed<br><em>one</em>.' },
  { id: '73-cooling-tower', art: 'industrial.jpg', wash: 'wash-teal', title: 'COOLING TOWER', caption: 'WHERE THE STEAM GOES', quote: 'Even machines<br><em>exhale</em>.' },
  { id: '74-green-light', art: 'intersection.jpg', wash: 'wash-teal', title: 'GREEN LIGHT', caption: 'THE OTHER CHOICE', quote: 'Ẹṣù shows you both roads.<br>He never says<br>which is <em>safer</em>.' },
  { id: '75-the-vote', art: 'circle.jpg', wash: 'wash-red', title: 'THE VOTE', caption: 'NOT EVERYONE AGREED', quote: 'Five elders.<br>Four opinions.<br>One <em>decision</em>.' },
  { id: '76-the-weight-of-five', art: 'bayo-portrait.webp', wash: 'wash-gold', title: 'THE WEIGHT OF FIVE', caption: 'WHAT CARRYING GODS FEELS LIKE', quote: 'He never asked for quiet.<br>He just<br><em>misses it</em>.' },
  { id: '77-halfway-across', art: 'bayo-bridge.webp', wash: 'wash-red', title: 'HALFWAY ACROSS', caption: 'NEITHER SIDE FELT SAFE', quote: 'The middle of a bridge<br>is the loneliest place<br>in <em>Lagos</em>.' },
  { id: '78-the-next-vision', art: 'amara-portrait.webp', wash: 'wash-gold', title: 'THE NEXT VISION', caption: 'SHE SAW ISSUE SIX COMING', quote: 'Some things you see<br>before they\'re<br><em>written</em>.' },
  { id: '79-the-storm-chooses-a-side', art: 'ikenna-portrait.webp', wash: 'wash-red', title: 'THE STORM CHOOSES', caption: "IKENNA'S RECKONING", quote: 'Weather doesn\'t<br>pick favorites.<br><em>Ikenna might</em>.' },
  { id: '80-what-shes-not-saying', art: 'zara-portrait.webp', wash: 'wash-teal', title: "WHAT SHE'S NOT SAYING", caption: "ZARA'S SILENCE", quote: 'The quietest person<br>in the room usually<br>knows the <em>most</em>.' },
  { id: '81-cracks-in-the-pact', art: 'team-aurora.webp', wash: 'wash-red', title: 'CRACKS IN THE PACT', caption: 'NOT EVERYONE TRUSTS EASILY', quote: 'Four souls, one sky,<br>zero<br><em>guarantees</em>.' },
  { id: '82-the-return-route', art: 'team-highway.webp', wash: 'wash-gold', title: 'THE RETURN ROUTE', caption: 'COMING BACK TO LAGOS', quote: 'Leaving was<br>the easy<br><em>part</em>.' },
  { id: '83-they-remember-everything', art: 'lagos-spirits.webp', wash: 'wash-red', title: 'THEY REMEMBER', caption: "THE CITY'S OLDEST WITNESSES", quote: 'Ghosts don\'t forgive.<br>They just<br><em>wait</em>.' },
  { id: '84-the-last-offering', art: 'flares.jpg', wash: 'wash-gold', title: 'THE LAST OFFERING', caption: 'BEFORE THE FIRE WENT OUT', quote: 'Some prayers<br>only work<br><em>once</em>.' },
  { id: '85-the-cost-of-five-powers', art: 'battle-raw.webp', wash: 'wash-red', title: 'THE COST OF FIVE', caption: 'WHAT IT TAKES TO HOLD THEM', quote: 'Every strike borrows<br>strength he\'ll need<br>to pay <em>back</em>.' },
  { id: '86-the-fiftieth-page', art: 'cover-finale50.webp', wash: 'wash-teal', title: 'THE FIFTIETH PAGE', caption: "WHAT THE COVER DOESN'T SHOW", quote: 'Fifty issues in,<br>the ending still<br>surprises <em>everyone</em>.' },
  { id: '87-the-other-side-of-glass', art: 'noir-window.jpg', wash: 'wash-teal', title: 'THE OTHER SIDE OF GLASS', caption: 'WHAT HE SAW IN THE REFLECTION', quote: 'The window showed him Lagos.<br>It also showed him<br><em>himself</em>.' },
  { id: '88-golden-hour-apapa', art: 'shipyard.jpg', wash: 'wash-gold', title: 'GOLDEN HOUR, APAPA', caption: "THE CALM BEFORE ZARA'S SHIFT", quote: 'Even enforcers<br>get a<br><em>sunset</em>.' },
  { id: '89-still-waiting', art: 'corridor.jpg', wash: 'wash-teal', title: 'STILL WAITING', caption: 'THE HALLWAY, EMPTY', quote: 'Some doors<br>are worth<br>the <em>wait</em>.' },
  { id: '90-the-final-awakening', art: 'cover-orisha-rising3.webp', wash: 'wash-red', title: 'THE FINAL AWAKENING', caption: 'WHAT COMES AFTER FIVE', quote: 'There\'s a sixth power<br>nobody\'s<br>named <em>yet</em>.' }
];

const template = (item, kb, dur) => {
  const [s0, s1, x0, x1, y0, y1] = kb;
  const endStart = dur - 4200;
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
CINE.kenBurns($('art'), 0, ${dur}, ${s0}, ${s1}, ${x0}, ${x1}, ${y0}, ${y1});
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
items.forEach((item, i) => {
  const kb = PANS[i % PANS.length];
  const dur = 8500 + (i % 5) * 200; // 8500-9300ms, cycling
  fs.writeFileSync(path.join(outDir, `cine-${item.id}.html`), template(item, kb, dur));
  durs.push(`cine-${item.id} ${dur}`);
});
fs.writeFileSync(listPath, durs.join('\n'));
console.log(`Generated ${items.length} cinematic HTMLs (chapters 41-90)`);
