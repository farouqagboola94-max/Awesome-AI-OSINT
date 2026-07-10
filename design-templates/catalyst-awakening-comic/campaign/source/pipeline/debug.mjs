import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', e => console.error('ERR:', e.message));
page.on('console', m => console.log('LOG:', m.text()));
await page.goto('file://' + path.resolve(process.argv[2]));
await page.evaluate(() => document.fonts.ready);
const state = await page.evaluate(() => {
  window.seek(400);
  const s1 = document.getElementById('s1');
  const w1 = document.getElementById('w1');
  return {
    s1: {opacity: getComputedStyle(s1).opacity, display: getComputedStyle(s1).display, rect: s1.getBoundingClientRect()},
    w1: {opacity: getComputedStyle(w1).opacity, transform: getComputedStyle(w1).transform, rect: w1.getBoundingClientRect(), text: w1.textContent}
  };
});
console.log(JSON.stringify(state, null, 2));
await browser.close();
