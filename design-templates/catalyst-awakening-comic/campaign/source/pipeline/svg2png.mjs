import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';
const files = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage();
for (const f of files) {
  const svg = fs.readFileSync(f, 'utf-8');
  const m = svg.match(/viewBox="[\d\.\s\-]+"\s+width="(\d+)"\s+height="(\d+)"/);
  const w = m ? parseInt(m[1]) : 1080;
  const h = m ? parseInt(m[2]) : 1080;
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<style>body,html{margin:0;padding:0;background:#06060d}</style>${svg}`);
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ type: 'png' });
  const out = f.replace(/\.svg$/, '.png').replace('brand-kit/', 'brand-kit-preview/');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buf);
  console.log('OK', out);
}
await browser.close();
