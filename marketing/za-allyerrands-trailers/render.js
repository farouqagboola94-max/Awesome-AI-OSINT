// Frame-by-frame renderer: seeks all CSS/WAAPI animations, screenshots each
// frame, then encodes H.264 MP4. Usage: node render.js <basename-without-ext>
const { chromium } = require('playwright-core');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const FPS = 30;
const DURATION_S = 18;

(async () => {
  const name = process.argv[2];
  if (!name) { console.error('usage: node render.js <name>'); process.exit(1); }
  const framesDir = path.join(__dirname, 'frames', name);
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(__dirname, name + '.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.getAnimations({ subtree: true }).forEach(a => a.pause()));

  const total = FPS * DURATION_S;
  for (let i = 0; i < total; i++) {
    const t = (i * 1000) / FPS;
    await page.evaluate(ms => {
      document.getAnimations({ subtree: true }).forEach(a => { a.currentTime = ms; });
    }, t);
    await page.screenshot({
      path: path.join(framesDir, `f${String(i).padStart(4, '0')}.jpg`),
      type: 'jpeg', quality: 92,
    });
    if (i % 90 === 0) console.log(`${name}: frame ${i}/${total}`);
  }
  await browser.close();

  const out = path.join(__dirname, name + '.mp4');
  execFileSync(FFMPEG, [
    '-y', '-framerate', String(FPS),
    '-i', path.join(framesDir, 'f%04d.jpg'),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    out,
  ], { stdio: 'inherit' });
  console.log('wrote', out);
})();
