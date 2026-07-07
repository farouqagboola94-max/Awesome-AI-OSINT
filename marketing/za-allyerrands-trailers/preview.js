// Spot-check renderer: captures given timestamps as PNGs.
// usage: node preview.js <name> <t1> <t2> ...
const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const [name, ...times] = process.argv.slice(2);
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(__dirname, name + '.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.getAnimations({ subtree: true }).forEach(a => a.pause()));
  for (const ts of times) {
    await page.evaluate(ms => {
      document.getAnimations({ subtree: true }).forEach(a => { a.currentTime = ms; });
    }, parseFloat(ts) * 1000);
    await page.screenshot({ path: path.join(__dirname, 'frames', `${name}_${ts}s.png`), scale: 'css' });
  }
  await browser.close();
})();
