import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('file://' + path.resolve(process.argv[2]));
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => window.seek(400));
const info = await page.evaluate(() => {
  const w1 = document.getElementById('w1');
  const s1 = document.getElementById('s1');
  const stage = document.querySelector('.stage');
  // What computed color and background does w1 have?
  const w1cs = getComputedStyle(w1);
  const s1cs = getComputedStyle(s1);
  const bodyCs = getComputedStyle(document.body);
  // Check element at center point
  const at = document.elementFromPoint(540, 960);
  return {
    w1_color: w1cs.color, w1_font: w1cs.fontFamily, w1_visibility: w1cs.visibility, w1_display: w1cs.display,
    s1_bg: s1cs.backgroundColor, s1_visibility: s1cs.visibility,
    body_bg: bodyCs.backgroundColor,
    at_center: at ? {tag: at.tagName, id: at.id, class: at.className} : null,
    scenes_opacity: [...document.querySelectorAll('.scene')].map(s => ({id: s.id, opacity: getComputedStyle(s).opacity}))
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
