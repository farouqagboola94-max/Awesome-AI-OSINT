/* Build a crossfaded highlight-reel from trimmed segments of existing clips.
   usage: node gen-sizzle.mjs manifest.json out.mp4 */
import fs from 'fs';
import { spawn } from 'child_process';

const FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const [manifestPath, outPath] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const { clips, xfade } = manifest; // clips: [{src, ss, t}], xfade: seconds

const inputs = [];
const filterParts = [];
clips.forEach((c, i) => {
  inputs.push('-ss', String(c.ss), '-t', String(c.t), '-i', c.src);
  filterParts.push(`[${i}:v]setpts=PTS-STARTPTS,fps=30,format=yuv420p[v${i}]`);
});

let offsets = [];
let cum = clips[0].t;
let chain = 'v0';
for (let i = 1; i < clips.length; i++) {
  const offset = cum - xfade;
  offsets.push(offset);
  const outLabel = i === clips.length - 1 ? 'vout' : `vx${i}`;
  filterParts.push(`[${chain}][v${i}]xfade=transition=fade:duration=${xfade}:offset=${offset.toFixed(3)}[${outLabel}]`);
  chain = outLabel;
  cum = cum + clips[i].t - xfade;
}
const totalDuration = cum;

const filterComplex = filterParts.join(';');
console.log('Total duration:', totalDuration.toFixed(2), 's');
console.log('Offsets:', offsets.map(o => o.toFixed(2)).join(', '));

const args = [
  '-y', '-hide_banner', '-loglevel', 'error',
  ...inputs,
  '-filter_complex', filterComplex,
  '-map', '[vout]',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
  '-movflags', '+faststart',
  outPath
];

const proc = spawn(FF, args, { stdio: 'inherit' });
proc.on('close', code => {
  if (code !== 0) { console.error('ffmpeg failed', code); process.exit(1); }
  console.log('OK', outPath, `(${totalDuration.toFixed(2)}s)`);
  fs.writeFileSync(manifestPath.replace('.json', '.offsets.json'), JSON.stringify({ offsets, totalDuration }, null, 2));
});
