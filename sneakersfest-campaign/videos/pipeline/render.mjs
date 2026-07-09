import { chromium } from 'playwright-core';
import { spawn } from 'child_process';
import { readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const FFMPEG = join(__dir, 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg');
const OUT = join(__dir, 'out');
mkdirSync(OUT, { recursive: true });

const FPS = 24, DUR = 8.0, FRAMES = Math.round(FPS * DUR);
const specs = JSON.parse(readFileSync(join(__dir, 'specs.json'), 'utf8'));
const only = process.argv[2] ? specs.filter(s => String(s.id) === process.argv[2]) : specs;

const b64 = f => readFileSync(join(__dir, 'fonts', f)).toString('base64');
const fontCss = `
@font-face { font-family:'Bebas'; src:url(data:font/ttf;base64,${b64('bebas.ttf')}) format('truetype'); }
@font-face { font-family:'Hanken'; font-weight:900; font-style:italic; src:url(data:font/ttf;base64,${b64('hanken-blackitalic.ttf')}) format('truetype'); }
@font-face { font-family:'SourceSans'; src:url(data:font/ttf;base64,${b64('sourcesans.ttf')}) format('truetype'); }
`;

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb'],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('file://' + join(__dir, 'template.html'));
await page.addStyleTag({ content: fontCss });
await page.evaluate(() => document.fonts.ready);

for (const spec of only) {
  const t0 = Date.now();
  await page.evaluate(s => window.setupSpec(s), spec);
  const outFile = join(OUT, `${spec.slug}.mp4`);
  const ff = spawn(FFMPEG, [
    '-y', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-crf', '21',
    '-movflags', '+faststart', outFile,
  ], { stdio: ['pipe', 'ignore', 'ignore'] });
  const done = new Promise((res, rej) => { ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))); ff.on('error', rej); });

  for (let f = 0; f < FRAMES; f++) {
    await page.evaluate(t => window.seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await done;
  console.log(`${spec.slug}.mp4 done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
await browser.close();
console.log('ALL DONE');
