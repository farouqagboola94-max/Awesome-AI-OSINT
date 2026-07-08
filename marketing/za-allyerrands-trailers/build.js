// Generates trailer HTML files from specs.json using the shared design system.
// Also emits audio-events.json (scene-cut times per video) for the audio synth.
const fs = require('fs');
const path = require('path');

const spec = JSON.parse(fs.readFileSync(path.join(__dirname, 'specs.json'), 'utf8'));
const DUR = spec.duration;
const pct = t => (t / DUR * 100).toFixed(3);

const audioEvents = {};

for (const video of spec.videos) {
  const scenes = video.scenes;
  let css = '';
  let html = '';
  audioEvents[video.name] = {
    vo: video.vo,
    impacts: scenes.map(s => s.t0).filter(t => t > 0),
    reveal: scenes[scenes.length - 1].t0,
  };

  scenes.forEach((sc, i) => {
    const id = `s${i + 1}`;
    const t0 = sc.t0;
    const t1 = (i + 1 < scenes.length) ? scenes[i + 1].t0 : DUR;
    const bgClass = sc.bg === 'green' ? ' bg-green' : sc.type === 'end' ? ' endblock' : '';

    // scene cut-in
    if (t0 === 0) {
      css += `#${id}{opacity:1;animation:none}\n`;
    } else {
      css += `#${id}{animation-name:cut_${id}}\n@keyframes cut_${id}{0%,${pct(t0 - 0.02)}%{opacity:0}${pct(t0)}%,100%{opacity:1}}\n`;
    }

    let inner = '';
    if (sc.type === 'slam') {
      let d = t0 + 0.12;
      if (sc.kicker) {
        css += `#${id} .kicker{animation:riseIn .35s ease-out ${d.toFixed(2)}s both}\n`;
        inner += `<div class="kicker">${sc.kicker}</div>`;
        d += 0.22;
      }
      sc.lines.forEach((ln, j) => {
        css += `#${id} .l${j}{font-size:${ln.size}px;animation:slam .45s cubic-bezier(.16,1,.3,1) ${(d + j * 0.3).toFixed(2)}s both}\n`;
        inner += `<h1 class="slamline l${j} st-${ln.style}">${ln.text}</h1>`;
      });
      inner = `<div style="display:flex;flex-direction:column;align-items:center;gap:34px">${inner}</div>`;
    } else if (sc.type === 'flashes') {
      const n = sc.items.length;
      const dur = ((sc.t1 ?? t1) - t0) / n;
      sc.items.forEach((it, j) => {
        const delay = t0 + j * dur;
        const rot = j % 2 === 0 ? '-2deg' : '2deg';
        audioEvents[video.name].impacts.push(+(delay.toFixed(2)));
        css += `#${id} .f${j}{--r:${rot};animation:flashG ${dur.toFixed(2)}s linear ${delay.toFixed(2)}s both}\n#${id} .f${j} h1{color:var(--${it.color === 'lime' ? 'lime' : it.color === 'green' ? 'green' : 'white'})}\n`;
        inner += `<div class="flashitem f${j}">${it.label ? `<span class="fl-label">${it.label} / ${String(n).padStart(2, '0')}</span>` : ''}<h1>${it.text}</h1></div>`;
      });
    } else if (sc.type === 'checklist') {
      const items = sc.items;
      const appear = 0.32, gap = (t1 - t0 - items.length * appear - 1.0) / items.length;
      let rows = '';
      items.forEach((it, j) => {
        const dIn = t0 + 0.15 + j * appear;
        const dStrike = t0 + items.length * appear + 0.6 + j * Math.max(gap, 0.28);
        audioEvents[video.name].impacts.push(+(dStrike.toFixed(2)));
        css += `#${id} .ci${j}{animation:riseIn .3s ease-out ${dIn.toFixed(2)}s both}\n`;
        css += `#${id} .ci${j} .strike{animation:strikeW .3s cubic-bezier(.5,0,.3,1) ${dStrike.toFixed(2)}s both}\n`;
        css += `#${id} .ci${j} .cchk{opacity:0;animation:popIn .25s cubic-bezier(.34,1.56,.64,1) ${(dStrike + 0.22).toFixed(2)}s both}\n`;
        rows += `<div class="citem ci${j}"><span class="cchk">✓</span>${it}<span class="strike"></span></div>`;
      });
      inner = `<div class="checkwrap2">${rows}</div>`;
    } else if (sc.type === 'end') {
      const e = spec.end;
      const d = t0 + 0.15;
      css += `#${id} .mark{animation:popIn .55s cubic-bezier(.34,1.56,.64,1) ${d.toFixed(2)}s both}\n`;
      css += `#${id} .tagline{animation:riseIn .45s ease-out ${(d + 0.55).toFixed(2)}s both}\n`;
      css += `#${id} .pill{animation-name:popIn,wiggle;animation-duration:.5s,1.4s;animation-delay:${(d + 1.05).toFixed(2)}s,${(d + 1.65).toFixed(2)}s;animation-iteration-count:1,infinite;animation-timing-function:cubic-bezier(.34,1.56,.64,1),ease-in-out;animation-fill-mode:both,both}\n`;
      css += `#${id} .loc{animation:riseIn .4s ease-out ${(d + 1.55).toFixed(2)}s both}\n`;
      const mark = e.mark.replace(/^Za\./, '<span class="za">Za.</span>');
      inner = `<div class="mark">${mark}</div><div class="tagline">${e.tagline}</div><div class="pill">${e.pill}</div><div class="loc">${e.loc}</div>`;
    }

    html += `<section class="scene${bgClass}" id="${id}">${sc.type !== 'end' && sc.bg !== 'green' ? '<div class="dots"></div>' : ''}${inner}</section>\n`;
  });

  const doc = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Za.allyErrands — ${video.name}</title>
<link rel="stylesheet" href="shared.css">
<style>\n${css}</style></head>
<body><div class="stage">
${html}
<div class="progress"></div>
<div class="watermark">Za.allyErrands &bull; Dolphin Estate</div>
</div></body></html>\n`;

  fs.writeFileSync(path.join(__dirname, `${video.name}.html`), doc);
  console.log('wrote', video.name + '.html');
}

fs.writeFileSync(path.join(__dirname, 'audio-events.json'), JSON.stringify(audioEvents, null, 2));
console.log('wrote audio-events.json');
