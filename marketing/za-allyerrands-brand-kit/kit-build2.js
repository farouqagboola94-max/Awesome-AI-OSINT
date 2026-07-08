// Brand IP kit part 2 — plates 15-50 + emitter.
const fs = require('fs');
const path = require('path');
const { H, plates, plate } = require('./kit-build.js');

/* ============ C. PATTERNS (tiles) ============ */
const patternPlate = (id, name, inner) =>
  plate(id, name, 1600, 1600, `<div style="position:absolute;inset:0">${inner}</div>
    <div style="position:absolute;right:60px;bottom:52px;font-size:26px;letter-spacing:5px;color:rgba(247,255,249,0.55)">${name.toUpperCase()}</div>`);

let routes = '';
for (let i = 0; i < 5; i++) {
  const y = 160 + i * 300;
  routes += `<path d="M-40 ${y} C 300 ${y - 160} 500 ${y + 160} 840 ${y} S 1400 ${y - 160} 1700 ${y}" stroke="#16e56b" stroke-width="7" stroke-dasharray="2 26" stroke-linecap="round" fill="none" opacity="0.8"/>
  <circle cx="${240 + i * 260}" cy="${y + (i % 2 ? 60 : -40)}" r="16" fill="#c6ff4a"/>`;
}
patternPlate('ip15-pattern-route', 'Route lines', `<svg width="1600" height="1600">${routes}</svg>`);

let bok = '';
for (let i = 0; i < 40; i++) {
  const x = (i * 397) % 1600, y = (i * 631) % 1600, r = 30 + (i * 37) % 130;
  const c = ['#16e56b', '#c6ff4a', '#0aa94b'][i % 3];
  bok += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="0.${12 + (i % 4) * 6}" filter="url(#b)"/>`;
}
patternPlate('ip16-pattern-bokeh', 'Night bokeh',
  `<svg width="1600" height="1600"><defs><filter id="b"><feGaussianBlur stdDeviation="26"/></filter></defs>${bok}</svg>`);

let ticks = '';
for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
  const on = (r + c) % 3 === 0;
  ticks += `<g transform="translate(${100 + c * 200} ${100 + r * 200}) rotate(${(r + c) % 2 ? -8 : 8})">
    <path d="M0 14 14 28 40 -4" stroke="${on ? '#c6ff4a' : '#16e56b'}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${on ? 0.95 : 0.35}"/></g>`;
}
patternPlate('ip17-pattern-ticks', 'Handled ticks', `<svg width="1600" height="1600">${ticks}</svg>`);

patternPlate('ip18-pattern-dispatch', 'Dispatch grid', `
  <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(22,229,107,0.2) 2px,transparent 2px),linear-gradient(90deg,rgba(22,229,107,0.2) 2px,transparent 2px);background-size:130px 130px"></div>
  <svg width="1600" height="1600" style="position:absolute;inset:0">
    <circle cx="390" cy="390" r="14" fill="#c6ff4a"/><circle cx="1170" cy="650" r="14" fill="#c6ff4a"/>
    <circle cx="650" cy="1170" r="14" fill="#c6ff4a"/><circle cx="1300" cy="1300" r="14" fill="#16e56b"/>
    <path d="M390 390 1170 650 650 1170 1300 1300" stroke="#16e56b" stroke-width="5" stroke-dasharray="3 20" fill="none"/></svg>`);

let lines = '';
for (let i = 0; i < 22; i++) {
  lines += `<div style="position:absolute;left:${-300 + i * 110}px;top:-200px;width:${18 + (i % 3) * 14}px;height:2100px;background:${i % 4 === 0 ? '#c6ff4a' : '#16e56b'};opacity:${i % 4 === 0 ? 0.8 : 0.28};transform:rotate(24deg)"></div>`;
}
patternPlate('ip19-pattern-speedlines', 'Speed lines', lines);

let bomb = '';
const words = ['SHARP SHARP', 'NO WAHALA', 'HANDLED.', 'SEND IT.', 'Za.', 'YOUR DOUBLE'];
for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) {
  const w = words[(r + c * 3) % words.length];
  const col = ['#16e56b', '#c6ff4a', '#f7fff9'][(r + c) % 3];
  bomb += `<div style="position:absolute;left:${40 + c * 560 + (r % 2) * 90}px;top:${20 + r * 230}px;font-family:var(--anton);font-size:96px;color:${col};opacity:${(r + c) % 3 === 2 ? 0.25 : 0.9};transform:rotate(${(r + c) % 2 ? -7 : 5}deg)">${w}</div>`;
}
patternPlate('ip20-pattern-stickerbomb', 'Sticker bomb', bomb);

/* ============ D. ICONS ============ */
const iconTile = (name, label, sz = 150) => `
  <div style="background:#0a1f12;border:3px solid rgba(22,229,107,0.25);border-radius:30px;padding:44px 20px;display:flex;flex-direction:column;align-items:center;gap:26px;flex:1">
    ${H.icon(name, sz)}<div style="font-size:24px;letter-spacing:3px">${label}</div></div>`;

plate('ip21-icons-services', 'Service icon set', 1600, 1200,
  `<div class="sheet"><div><div class="lbl">BRAND IP &bull; 21</div><h2>Service Icons</h2></div>
   <div class="row" style="gap:26px">${iconTile('basket', 'GROCERIES')}${iconTile('box', 'PICKUPS')}${iconTile('pill', 'PHARMACY')}</div>
   <div class="row" style="gap:26px">${iconTile('shirt', 'LAUNDRY')}${iconTile('receipt', 'BILLS')}${iconTile('flame', 'GAS')}</div></div>`);

plate('ip22-icons-process', 'Process icon set', 1600, 800,
  `<div class="sheet"><div><div class="lbl">BRAND IP &bull; 22</div><h2>Process Icons</h2></div>
   <div class="row" style="gap:26px">${iconTile('send', 'SEND IT', 130)}${iconTile('route', 'WE ROUTE', 130)}${iconTile('door', 'DELIVERED', 130)}${iconTile('shield', 'VERIFIED', 130)}</div></div>`);

/* ============ E. MASCOT ============ */
plate('ip23-mascot-front', 'Mascot — Ally', 1200, 1400,
  `<div class="dotgrid"></div><div class="stack" style="gap:50px">${H.mascot(3.4)}
   <div style="font-family:var(--anton);font-size:64px">ALLY — YOUR DOUBLE</div></div>`);

plate('ip24-mascot-run', 'Mascot — running', 1600, 1200,
  `<div class="dotgrid"></div>${H.mascot(3.6, 'run')}`);

plate('ip25-mascot-badge', 'Mascot badge', 1200, 1200,
  `<div class="roundel" style="width:640px;height:640px;background:var(--green);box-shadow:0 0 0 30px rgba(22,229,107,0.22)">
     <div style="transform:translateY(30px) scale(1.7)">${H.mascot(1.2)}</div></div>`);

plate('ip26-mascot-wheel', 'Mascot — on the move', 1600, 1200,
  `<div class="dotgrid"></div><div class="stack" style="gap:40px">${H.mascot(2.9, 'wheel')}
   ${H.pill('EVERY RUN. EVERY TIME.', 28)}</div>`);

/* ============ F. SOCIAL KIT ============ */
plate('ip27-ig-avatar', 'IG avatar', 1024, 1024,
  `<div class="plate green" style="position:absolute;inset:0"></div>
   <div style="position:relative;font-family:var(--anton);font-size:430px;color:var(--forest)">Za<span style="color:var(--white)">.</span></div>`);

const storyShell = (inner, bg = '') => `
  ${bg}<div style="position:absolute;inset:120px 70px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:44px">${inner}</div>
  <div style="position:absolute;bottom:64px;left:50%;translate:-50% 0;font-size:26px;letter-spacing:5px;color:rgba(247,255,249,0.7);white-space:nowrap">Za.allyErrands &bull; DOLPHIN ESTATE</div>`;

plate('ip28-story-announcement', 'Story — announcement', 1080, 1920,
  storyShell(`<div class="kick" style="font-size:30px;color:var(--lime)">TEMPLATE 01 &bull; ANNOUNCEMENT</div>
   <div style="font-family:var(--anton);font-size:130px;line-height:1.04">HEADLINE<br>GOES <span style="color:var(--green)">HERE.</span></div>
   <div style="font-size:34px;line-height:1.5;max-width:760px;color:rgba(247,255,249,0.85)">Supporting line sits here in Archivo.</div>
   ${H.pill('DM OR WHATSAPP TO ORDER', 30)}`, '<div class="dotgrid"></div>'));

plate('ip29-story-testimonial', 'Story — testimonial', 1080, 1920,
  storyShell(`<div class="kick" style="font-size:30px;color:var(--lime)">TEMPLATE 02 &bull; REVIEW</div>
   <div style="font-size:64px;color:var(--lime)">★★★★★</div>
   <div style="font-family:var(--anton);font-size:76px;line-height:1.15">“THEY PICKED IT UP BEFORE I FINISHED MY MEETING.”</div>
   <div style="font-size:30px;letter-spacing:4px;color:var(--green)">— RESIDENT, BLOCK C</div>`));

plate('ip30-post-spotlight', 'Post — service spotlight', 1080, 1350,
  `<div class="dotgrid"></div><div class="stack" style="gap:40px">
   ${H.icon('basket', 220, 'var(--lime)', 1.5)}
   <div class="kick" style="font-size:28px;color:var(--green)">SERVICE SPOTLIGHT</div>
   <div style="font-family:var(--anton);font-size:110px">GROCERY RUNS</div>
   <div style="font-size:32px;max-width:760px;line-height:1.5;color:rgba(247,255,249,0.85)">Send the list. Get it at your door.</div>
   ${H.pill('ORDER NOW', 30)}</div>`);

plate('ip31-post-offer', 'Post — offer/price', 1080, 1350,
  `<div class="plate lime" style="position:absolute;inset:0"></div>
   <div class="stack" style="position:relative;gap:36px;color:var(--forest)">
   <div class="kick" style="font-size:28px;color:var(--forest)">TEMPLATE &bull; OFFER</div>
   <div style="font-family:var(--anton);font-size:150px;line-height:1;color:var(--forest)">OFFER<br>HEADLINE</div>
   <div style="background:var(--forest);color:var(--lime);font-family:var(--anton);font-size:56px;padding:18px 54px;transform:rotate(-2deg)">DETAIL LINE HERE</div>
   <div style="font-size:28px;letter-spacing:4px">Za.allyErrands &bull; DOLPHIN ESTATE</div></div>`);

plate('ip32-carousel-cover', 'Carousel cover', 1080, 1350,
  `<div class="dotgrid"></div><div class="stack" style="gap:38px">
   <div class="kick" style="font-size:28px;color:var(--lime)">SWIPE →</div>
   <div style="font-family:var(--anton);font-size:120px;line-height:1.05">5 ERRANDS<br>YOU CAN <span style="color:var(--green)">RETIRE</span><br>TODAY</div>
   <div style="width:200px;height:8px;background:var(--grad-run)"></div></div>`);

const hi = (icon, label) => `<div style="display:flex;flex-direction:column;align-items:center;gap:22px">
  <div class="roundel" style="width:210px;height:210px;background:#0a1f12;box-shadow:0 0 0 6px rgba(22,229,107,0.5)">${H.icon(icon, 100, 'var(--lime)', 1.6)}</div>
  <div style="font-size:24px;letter-spacing:3px">${label}</div></div>`;
plate('ip33-highlight-covers', 'IG highlight covers', 1600, 800,
  `<div class="row" style="gap:56px">${hi('basket', 'SERVICES')}${hi('price', 'PRICES')}${hi('star', 'REVIEWS')}${hi('route', 'HOW IT WORKS')}${hi('chat', 'ORDER')}</div>`);

plate('ip34-whatsapp-status', 'WhatsApp status template', 1080, 1920,
  storyShell(`<div class="kick" style="font-size:30px;color:var(--lime)">TODAY'S RUNS</div>
   <div style="font-family:var(--anton);font-size:96px;line-height:1.1">SENDING A RIDER TO<br><span style="color:var(--green)">[ AREA ]</span> AT <span style="color:var(--green)">[ TIME ]</span></div>
   <div style="font-size:32px;line-height:1.5;color:rgba(247,255,249,0.85)">Reply now to add your errand to this run.</div>
   ${H.pill('REPLY TO BOOK', 30)}`));

plate('ip35-wa-profile-cover', 'WhatsApp business cover', 1600, 900,
  `<div class="dotgrid"></div><div class="row" style="gap:70px">
   ${H.roundel(300)}<div><div style="font-family:var(--anton);font-size:110px">Za.allyErrands</div>
   <div style="font-size:30px;letter-spacing:4px;color:var(--green);margin-top:14px">ERRANDS &amp; DELIVERY &bull; REPLIES IN MINUTES</div></div></div>`);

plate('ip36-x-header', 'X / Twitter header', 1500, 500,
  `<div class="dotgrid"></div><div class="row" style="gap:50px">
   <div style="font-family:var(--anton);font-size:96px">YOUR ERRANDS. <span style="color:var(--lime)">OUR PROBLEM.</span></div></div>`);

/* ============ G. PRINT & PHYSICAL ============ */
plate('ip37-business-card', 'Business card F/B', 1600, 1000,
  `<div class="row" style="gap:50px">
   <div style="width:660px;height:396px;border-radius:28px;background:var(--grad-depth);border:3px solid rgba(22,229,107,0.4);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px">
     ${H.wordmark(64)}<div style="font-size:20px;letter-spacing:4px;color:var(--green)">YOUR ERRANDS. OUR PROBLEM.</div></div>
   <div style="width:660px;height:396px;border-radius:28px;background:var(--green);color:var(--forest);display:flex;flex-direction:column;justify-content:center;padding:0 60px;gap:16px">
     <div style="font-family:var(--anton);font-size:44px;color:var(--forest)">[ YOUR NAME ]</div>
     <div style="font-size:22px;letter-spacing:2px">FOUNDER &bull; Za.allyErrands</div>
     <div style="font-size:22px;letter-spacing:2px">[ WHATSAPP NUMBER ]</div>
     <div style="font-size:22px;letter-spacing:2px">DOLPHIN ESTATE &bull; LAGOS</div></div></div>`);

plate('ip38-flyer-a5', 'Flyer A5', 1240, 1754,
  `<div class="dotgrid"></div><div style="position:absolute;inset:100px 90px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:44px">
   ${H.roundel(190)}
   <div style="font-family:var(--anton);font-size:104px;line-height:1.04">TOO BUSY<br>TO RUN <span style="color:var(--green)">ERRANDS?</span></div>
   <div style="font-size:30px;line-height:1.55;color:rgba(247,255,249,0.88);max-width:900px">Groceries &bull; pickups &bull; pharmacy &bull; bills &bull; laundry.<br>Send it on WhatsApp — consider it done.</div>
   <div style="display:flex;gap:22px;flex-wrap:wrap;justify-content:center">
     ${H.icon('basket', 90)}${H.icon('box', 90)}${H.icon('pill', 90)}${H.icon('receipt', 90)}${H.icon('shirt', 90)}</div>
   ${H.pill('[ WHATSAPP NUMBER HERE ]', 34)}
   <div style="font-size:26px;letter-spacing:4px;color:var(--green)">Za.allyErrands &bull; DOLPHIN ESTATE &bull; LAGOS</div></div>`);

const shirtShell = (front) => `
  <svg width="1200" height="1150" viewBox="0 0 600 575">
    <path d="M180 90 240 60c10 25 110 25 120 0l60 30 70 80-70 55v290H180V225l-70-55z" fill="#0a1f12" stroke="#16e56b" stroke-width="4"/>
    ${front}
  </svg>`;
plate('ip39-tshirt-front', 'Rider tee — front', 1400, 1400,
  shirtShell(`<text x="300" y="245" text-anchor="middle" font-family="Anton" font-size="44" fill="#f7fff9">Za<tspan fill="#16e56b">.</tspan></text>
    <text x="300" y="295" text-anchor="middle" font-family="Archivo Black" font-size="16" letter-spacing="4" fill="#16e56b">YOUR DOUBLE</text>`));

plate('ip40-vest-back', 'Rider vest — back', 1400, 1400,
  shirtShell(`<text x="300" y="230" text-anchor="middle" font-family="Anton" font-size="52" fill="#c6ff4a">ON A RUN</text>
    <text x="300" y="285" text-anchor="middle" font-family="Anton" font-size="30" fill="#f7fff9">FOR SOMEBODY SMART.</text>
    <text x="300" y="340" text-anchor="middle" font-family="Archivo Black" font-size="15" letter-spacing="4" fill="#16e56b">Za.allyErrands &bull; DOLPHIN ESTATE</text>`));

plate('ip41-delivery-bag', 'Delivery bag panel', 1400, 1400,
  `<div style="width:900px;height:960px;border-radius:60px;background:var(--grad-depth);border:6px solid var(--green);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px">
   ${H.roundel(230)}<div style="font-family:var(--anton);font-size:84px;text-align:center;line-height:1.1">HANDLE<br>WITH SPEED.</div>
   <div style="font-size:26px;letter-spacing:4px;color:var(--lime)">Za.allyErrands</div></div>`);

const sticker = (inner, rot) => `<div style="transform:rotate(${rot}deg);background:var(--forest);border:8px solid var(--white);border-radius:44px;padding:40px 60px;box-shadow:0 20px 50px rgba(0,0,0,0.45)">${inner}</div>`;
plate('ip42-sticker-set', 'Die-cut sticker set', 1600, 1200,
  `<div style="display:flex;flex-wrap:wrap;gap:60px;align-items:center;justify-content:center;max-width:1400px">
   ${sticker(`<div style="font-family:var(--anton);font-size:74px;color:var(--lime)">NO WAHALA</div>`, -5)}
   ${sticker(`<div style="font-family:var(--anton);font-size:74px;color:var(--green)">HANDLED ✓</div>`, 4)}
   ${sticker(H.wordmark(58), -3)}
   ${sticker(`<div style="font-family:var(--anton);font-size:74px;color:var(--white)">SHARP <span style="color:var(--lime)">SHARP</span></div>`, 6)}</div>`);

plate('ip43-door-hanger', 'Door hanger', 1000, 1600,
  `<div style="width:660px;height:1300px;border-radius:60px;background:var(--mint);color:var(--forest);display:flex;flex-direction:column;align-items:center;padding:70px 50px;gap:38px;text-align:center">
   <div style="width:170px;height:170px;border-radius:50%;border:14px solid var(--forest)"></div>
   <div style="font-family:var(--anton);font-size:66px;line-height:1.08;color:var(--forest)">YOUR ERRAND<br>WAS <span style="color:#0aa94b">HANDLED.</span></div>
   <div style="font-size:26px;line-height:1.5">Delivered by Za.allyErrands while you were living your life.</div>
   <div style="background:var(--forest);color:var(--lime);font-family:var(--anton);font-size:34px;padding:20px 40px;border-radius:999px">SEND THE NEXT ONE</div></div>`);

plate('ip44-scooter-livery', 'Scooter livery strip', 1800, 900,
  `<div style="position:absolute;inset:0;background:var(--green)"></div>
   <div style="position:absolute;left:0;right:0;top:310px;height:280px;background:var(--forest);transform:skewY(-3deg);display:flex;align-items:center;justify-content:center;gap:70px">
   ${H.wordmark(120)}<div style="font-family:var(--anton);font-size:56px;color:var(--lime)">YOUR DOUBLE, EN ROUTE →</div></div>`);

/* ============ H. DIGITAL & OPS ============ */
plate('ip45-wa-menu', 'WhatsApp order menu', 1080, 1920,
  `<div style="position:absolute;inset:110px 80px;display:flex;flex-direction:column;gap:30px">
   <div class="row" style="justify-content:flex-start;gap:30px">${H.roundel(120)}<div style="font-family:var(--anton);font-size:56px">ORDER MENU</div></div>
   ${['GROCERY RUN', 'PICKUP / DROP-OFF', 'PHARMACY DASH', 'BILLS &amp; QUEUES', 'LAUNDRY RUN', 'CUSTOM ERRAND'].map((x, i) =>
     `<div style="background:#0a1f12;border:3px solid rgba(22,229,107,0.3);border-radius:26px;padding:36px 40px;font-size:38px"><span style="color:var(--lime);font-family:var(--anton)">${i + 1}.</span>&nbsp; ${x}</div>`).join('')}
   <div style="margin-top:12px;font-size:28px;line-height:1.5;color:rgba(247,255,249,0.8);text-align:center">Reply with a number + details.<br>We confirm price &amp; ETA in minutes.</div></div>`);

plate('ip46-receipt-header', 'Receipt header', 1400, 800,
  `<div style="width:1160px;background:var(--mint);color:var(--forest);border-radius:40px;padding:70px;display:flex;flex-direction:column;gap:26px">
   <div class="row" style="justify-content:space-between;width:100%">
     <div class="wm on-light" style="font-family:var(--anton);font-size:72px"><span class="za">Za.</span>allyErrands</div>
     <div style="font-family:var(--anton);font-size:54px;color:#0aa94b">RUN #0001</div></div>
   <div style="height:4px;background:repeating-linear-gradient(90deg,#05100a 0 26px,transparent 26px 44px)"></div>
   <div style="display:flex;justify-content:space-between;font-size:26px;letter-spacing:2px">
     <span>DATE: ____/____/____</span><span>RIDER: __________</span><span>ZONE: DOLPHIN</span></div></div>`);

plate('ip47-web-hero', 'Website hero', 1920, 1080,
  `<div class="dotgrid"></div><div style="position:absolute;inset:0;display:flex;align-items:center;padding:0 130px;gap:90px">
   <div style="flex:1.3"><div class="kick" style="font-size:26px;color:var(--lime);margin-bottom:30px">DOLPHIN ESTATE &bull; LAGOS</div>
     <div style="font-family:var(--anton);font-size:128px;line-height:1.02">YOUR ERRANDS,<br>HANDLED <span style="color:var(--green)">WHILE<br>YOU WORK.</span></div>
     <div style="margin-top:44px">${H.pill('ORDER ON WHATSAPP', 32)}</div></div>
   <div style="flex:0.7;display:flex;justify-content:center">${H.mascot(2.6, 'run')}</div></div>`);

plate('ip48-email-signature', 'Email signature', 1400, 500,
  `<div class="row" style="gap:50px">
   ${H.roundel(200)}<div style="border-left:4px solid var(--green);padding-left:50px">
   <div style="font-family:var(--anton);font-size:56px">[ YOUR NAME ]</div>
   <div style="font-size:24px;letter-spacing:3px;color:var(--green);margin:12px 0">Za.allyErrands &bull; YOUR TIME, MANAGED.</div>
   <div style="font-size:24px;letter-spacing:2px;color:rgba(247,255,249,0.8)">[ WHATSAPP ] &bull; DOLPHIN ESTATE, LAGOS</div></div></div>`);

plate('ip49-maps-cover', 'Google profile cover', 1600, 900,
  `<div class="plate green" style="position:absolute;inset:0"></div>
   <div class="stack" style="position:relative;color:var(--forest);gap:30px">
   <div style="font-family:var(--anton);font-size:130px;color:var(--forest)">Za.allyErrands</div>
   <div style="font-size:32px;letter-spacing:5px">ERRANDS &amp; DELIVERY &bull; DOLPHIN ESTATE</div>
   <div style="background:var(--forest);color:var(--lime);font-family:var(--anton);font-size:44px;padding:16px 48px">OPEN &bull; REPLIES FAST</div></div>`);

plate('ip50-loyalty-card', 'Loyalty punch card', 1600, 1000,
  `<div style="width:1240px;height:760px;border-radius:48px;background:var(--grad-depth);border:4px solid rgba(22,229,107,0.45);padding:70px;display:flex;flex-direction:column;gap:44px">
   <div class="row" style="justify-content:space-between;width:100%">${H.wordmark(66)}
     <div style="font-family:var(--anton);font-size:44px;color:var(--lime)">RUN CLUB</div></div>
   <div style="font-size:28px;letter-spacing:3px;color:rgba(247,255,249,0.85)">EVERY RUN COUNTS. COLLECT TICKS, EARN PERKS.</div>
   <div class="row" style="gap:34px;justify-content:flex-start">
     ${Array.from({ length: 8 }, (_, i) => `<div class="roundel" style="width:110px;height:110px;background:${i < 3 ? 'var(--green)' : '#0a1f12'};box-shadow:0 0 0 4px rgba(22,229,107,0.4)">${i < 3 ? `<span style='font-size:52px;color:var(--forest)'>✓</span>` : ''}</div>`).join('')}</div>
   <div style="font-size:24px;letter-spacing:2px;color:var(--green)">[ REWARD DETAILS SET BY Za.allyErrands ]</div></div>`);

/* ---------------- emit ---------------- */
const tpl = p => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${p.name}</title>
<link rel="stylesheet" href="brand.css">
<style>html,body{width:${p.w}px;height:${p.h}px}</style></head>
<body><div class="plate ${p.cls || ''}" style="width:${p.w}px;height:${p.h}px">${p.body}</div></body></html>`;

for (const p of plates) fs.writeFileSync(path.join(__dirname, `${p.id}.html`), tpl(p));
fs.writeFileSync(path.join(__dirname, 'kit-manifest.json'),
  JSON.stringify(plates.map(({ id, name, w, h }) => ({ id, name, w, h })), null, 1));
console.log('plates:', plates.length);
