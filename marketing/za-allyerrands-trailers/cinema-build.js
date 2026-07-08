// Generates cinematic trailer HTML from cinema-specs.json.
// Emits cinema-audio-events.json (scene cuts + score variant per video).
const fs = require('fs');
const path = require('path');

const spec = JSON.parse(fs.readFileSync(path.join(__dirname, 'cinema-specs.json'), 'utf8'));
const DUR = spec.duration;
const pct = t => (t / DUR * 100).toFixed(3);

// deterministic pseudo-random
function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bokehLayer(rnd, warm) {
  const cols = warm
    ? ['#c6ff4a', '#ffd76a', '#16e56b', '#f2fbf4']
    : ['#16e56b', '#c6ff4a', '#4ade80', '#f2fbf4'];
  let s = '';
  for (let i = 0; i < 26; i++) {
    const size = 40 + rnd() * 200;
    const x = rnd() * 100, y = rnd() * 100;
    const c = cols[Math.floor(rnd() * cols.length)];
    const op = (0.05 + rnd() * 0.16).toFixed(2);
    const dur = (12 + rnd() * 14).toFixed(1);
    const del = (-rnd() * 12).toFixed(1);
    s += `<span style="width:${size.toFixed(0)}px;height:${size.toFixed(0)}px;left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;background:${c};opacity:${op};animation-duration:${dur}s;animation-delay:${del}s"></span>`;
  }
  return `<div class="bokeh bgfill">${s}</div>`;
}

function streaksLayer(rnd) {
  let s = '';
  for (let i = 0; i < 14; i++) {
    const w = 220 + rnd() * 520;
    const y = 8 + rnd() * 84;
    const c = ['#c6ff4a', '#16e56b', '#f2fbf4'][Math.floor(rnd() * 3)];
    const op = (0.12 + rnd() * 0.3).toFixed(2);
    const dur = (4.5 + rnd() * 5).toFixed(1);
    const del = (-rnd() * 7).toFixed(1);
    s += `<i style="width:${w.toFixed(0)}px;top:${y.toFixed(1)}%;left:${(rnd() * 90).toFixed(1)}%;background:${c};opacity:${op};animation-duration:${dur}s;animation-delay:${del}s"></i>`;
  }
  return `<div class="streaks bgfill">${s}</div>`;
}

const audioEvents = {};
for (const video of spec.videos) {
  const scenes = video.scenes;
  const rnd = mulberry([...video.name].reduce((a, ch) => a + ch.charCodeAt(0), 7));
  let css = '', html = '';
  audioEvents[video.name] = {
    score: video.score,
    impacts: scenes.map(s => s.t0).filter(t => t > 0),
    reveal: scenes[scenes.length - 1].t0,
  };

  scenes.forEach((sc, i) => {
    const id = `s${i + 1}`;
    const t0 = sc.t0;
    const t1 = (i + 1 < scenes.length) ? scenes[i + 1].t0 : DUR;
    const isEnd = sc.type === 'end';

    // crossfade cut-in (0.5s)
    if (t0 === 0) css += `#${id}{opacity:1}\n`;
    else css += `#${id}{animation:cut_${id} 18s linear both}\n@keyframes cut_${id}{0%,${pct(t0 - 0.5)}%{opacity:0}${pct(t0)}%,100%{opacity:1}}\n`;

    // Ken Burns on the bg layer
    const kb = i % 2 === 0 ? 'kbA' : 'kbB';
    css += `#${id} .bgfx{animation:${kb} ${(t1 - t0 + 1).toFixed(2)}s linear ${t0.toFixed(2)}s both}\n`;

    // background layers
    let bgBase = 'bg-night';
    let extra = '';
    if (sc.bg === 'bokeh') { extra = bokehLayer(rnd, false); }
    else if (sc.bg === 'streaks') { extra = streaksLayer(rnd); }
    else if (sc.bg === 'rain') { extra = bokehLayer(rnd, false) + '<div class="rain"></div>'; }
    else if (sc.bg === 'dawn') { bgBase = 'bg-dawn'; extra = bokehLayer(rnd, true); }
    else if (sc.bg === 'ember') { bgBase = 'bg-ember'; extra = bokehLayer(rnd, true); }
    else if (sc.bg === 'grid') { bgBase = 'bg-grid'; }

    let inner = '';
    if (isEnd) {
      const e = spec.end;
      const d = t0 + 0.3;
      css += `#${id} .ckicker{animation:kickIn 1s ease-out ${d.toFixed(2)}s both}\n`;
      css += `#${id} .mark{animation:popIn .7s cubic-bezier(.34,1.56,.64,1) ${(d + 0.5).toFixed(2)}s both}\n`;
      css += `#${id} .tag2{animation:cineIn 1s ease-out ${(d + 1.1).toFixed(2)}s both}\n`;
      css += `#${id} .cpill{animation-name:popIn,wiggle;animation-duration:.55s,1.5s;animation-delay:${(d + 1.7).toFixed(2)}s,${(d + 2.35).toFixed(2)}s;animation-iteration-count:1,infinite;animation-timing-function:cubic-bezier(.34,1.56,.64,1),ease-in-out;animation-fill-mode:both,both}\n`;
      css += `#${id} .sub3{animation:cineIn .9s ease-out ${(d + 2.2).toFixed(2)}s both}\n`;
      const mark = e.mark.replace(/^Za\./, '<span class="za">Za.</span>');
      inner = `<div class="ckicker">${e.kicker}</div><div class="mark">${mark}</div><div class="tag2">${e.tag2}</div><div class="cpill">${e.pill}</div><div class="sub3">${e.sub3}</div>`;
    } else {
      let d = t0 + 0.35;
      if (sc.kicker) {
        css += `#${id} .ckicker{animation:kickIn 1s ease-out ${d.toFixed(2)}s both}\n`;
        inner += `<div class="ckicker">${sc.kicker}</div>`;
        d += 0.4;
      }
      sc.lines.forEach((ln, j) => {
        css += `#${id} .l${j}{font-size:${ln.size}px;animation:cineIn 1.15s cubic-bezier(.22,1,.36,1) ${(d + j * 0.55).toFixed(2)}s both}\n`;
        inner += `<h1 class="cline l${j} ${ln.style}">${ln.text}</h1>`;
      });
    }

    html += `<section class="cscene ${isEnd ? 'cend' : ''}" id="${id}">
  <div class="bgfx ${bgBase}" style="position:absolute;inset:-12%">${extra}</div>
  <div class="content">${inner}</div>
</section>\n`;
  });

  const doc = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Za.allyErrands — ${video.name}</title>
<link rel="stylesheet" href="cinema.css">
<style>
.bgfill{position:absolute;inset:0}
.bokeh span{position:absolute;border-radius:50%;filter:blur(22px)}
${css}</style></head>
<body><div class="stage">
${html}
<div class="grade"></div>
<div class="vignette"></div>
<div class="sweep"></div>
<div class="grain"></div>
<div class="bars"></div>
<div class="cprogress"></div>
<div class="cwatermark">Za.allyErrands &bull; DOLPHIN ESTATE</div>
</div></body></html>\n`;

  fs.writeFileSync(path.join(__dirname, `${video.name}.html`), doc);
  console.log('wrote', video.name + '.html');
}
fs.writeFileSync(path.join(__dirname, 'cinema-audio-events.json'), JSON.stringify(audioEvents, null, 2));
console.log('wrote cinema-audio-events.json');
