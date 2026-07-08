// Renders every plate in kit-manifest.json to png/<id>.png
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'kit-manifest.json'), 'utf8'));
  fs.mkdirSync(path.join(__dirname, 'png'), { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  for (const p of manifest) {
    await page.setViewportSize({ width: p.w, height: p.h });
    await page.goto('file://' + path.join(__dirname, p.id + '.html'));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(__dirname, 'png', p.id + '.png') });
    console.log('rendered', p.id);
  }
  await browser.close();
})();
