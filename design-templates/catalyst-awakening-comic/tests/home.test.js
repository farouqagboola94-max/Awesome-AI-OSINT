'use strict';
// The home page. index.html shares styles.css and script.js with the four
// issue pages, so every change made for those has to be proved harmless here.
// The nav rule in particular: it used to be a bare `nav {}`, which turned any
// <nav> on the site into a fixed full-width bar — a semantic breadcrumb on an
// issue page became an invisible overlay that swallowed every click.

const { newPage, watchErrors, Results } = require('./lib/harness');

module.exports = async function home(ctx, base) {
  const r = new Results();
  const page = await newPage(ctx);
  const errors = watchErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  r.ok('no JS errors on the home page', errors.length === 0, errors.slice(0, 3).join(' | '));

  // ── the site nav is still the fixed bar it was
  const nav = await page.evaluate(() => {
    const n = document.querySelector('nav:not([class])');
    if (!n) return null;
    const cs = getComputedStyle(n);
    const box = n.getBoundingClientRect();
    return {
      position: cs.position, top: cs.top, zIndex: cs.zIndex, display: cs.display,
      alignItems: cs.alignItems, justifyContent: cs.justifyContent,
      backdrop: cs.backdropFilter !== 'none',
      width: Math.round(box.width), left: Math.round(box.left),
      scrollW: n.scrollWidth, clientW: n.clientWidth,
    };
  });
  r.ok('nav element found', !!nav);
  r.ok('nav is fixed', nav?.position === 'fixed', nav?.position);
  r.ok('nav sits below the 36px ticker', nav?.top === '36px', nav?.top);
  r.ok('nav z-index preserved', nav?.zIndex === '1000', nav?.zIndex);
  r.ok('nav is a flex row', nav?.display === 'flex', nav?.display);
  r.ok('nav items centred', nav?.alignItems === 'center', nav?.alignItems);
  r.ok('nav justified space-between', nav?.justifyContent === 'space-between', nav?.justifyContent);
  r.ok('nav spans the viewport', nav && nav.width >= 1439 && nav.left === 0, JSON.stringify(nav));
  r.ok('nav keeps its backdrop blur', nav?.backdrop === true);
  r.ok('nav contents fit the bar', nav && nav.scrollW <= nav.clientW + 1,
    nav && `${nav.scrollW} > ${nav.clientW}`);

  // ── nothing invisible is covering the page (how the breadcrumb bug read)
  const centre = await page.evaluate(() => {
    const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
    return el ? el.tagName + '.' + (el.className || '').toString().split(' ')[0] : null;
  });
  r.ok('viewport centre is content, not a stray nav overlay', !/^NAV/.test(centre || ''), centre);

  const overflow = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth, win: document.documentElement.clientWidth }));
  r.ok('no horizontal overflow at 1440px', overflow.doc <= overflow.win + 1, JSON.stringify(overflow));

  // ── every shared module registered
  const mods = await page.evaluate(() => ({
    search: typeof window.CatalystSearch?.open === 'function',
    notes: typeof window.CatalystFieldNotes?.open === 'function',
    trap: typeof window.CatalystFocusTrap?.anyOpen === 'function',
    jump: typeof window.catalystJumpTo === 'function',
    showIssue: typeof window.showIssue === 'function',
    goToIssue: typeof window.goToIssue === 'function',
    readerScale: typeof window.catalystReaderScale === 'function',
    flag: window.CATALYST_PAGE,
    // The marquee clone used to be unguarded; guarding it must not have
    // switched it off on the page that actually has a marquee.
    marqueeTracks: document.querySelector('.marquee-track')?.parentElement
      ?.querySelectorAll('.marquee-track').length || 0,
  }));
  for (const k of ['search', 'notes', 'trap', 'jump', 'showIssue', 'goToIssue', 'readerScale']) {
    r.ok(`module live: ${k}`, mods[k] === true);
  }
  r.ok('home is not flagged as an issue page', mods.flag?.issuePage === false);
  r.ok('marquee track duplicated for the loop', mods.marqueeTracks === 2, String(mods.marqueeTracks));

  // ── the tabbed reader still works
  const reader = await page.evaluate(() => ({
    panels: document.querySelectorAll('.issue-reader-panel').length,
    tabs: document.querySelectorAll('.issue-tab').length,
    active: document.querySelector('.issue-reader-panel.active')?.id,
    permalinks: [...document.querySelectorAll('.reader-permalink')].map(a => a.getAttribute('href')),
  }));
  r.ok('all four panels present', reader.panels === 4, String(reader.panels));
  r.ok('all four tabs present', reader.tabs === 4, String(reader.tabs));
  r.ok('issue 1 active by default', reader.active === 'panel-i1', reader.active);
  r.ok('each panel links to its own page',
    reader.permalinks.length === 4 &&
    reader.permalinks.every((h, i) => h === `/read/issue-${i + 1}`), reader.permalinks.join(','));

  await page.click('.issue-tab:nth-of-type(3)');
  await page.waitForTimeout(300);
  r.ok('tabs still swap panels',
    await page.evaluate(() => document.querySelector('.issue-reader-panel.active')?.id) === 'panel-i3');

  // ── search, including diacritic folding
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(350);
  r.ok('Ctrl/Cmd-K opens search',
    await page.evaluate(() => document.getElementById('cmdk')?.classList.contains('open')) === true);
  await page.fill('#cmdkInput', 'sango');
  await page.waitForTimeout(300);
  const hits = await page.evaluate(() =>
    [...document.querySelectorAll('.cmdk-row')].map(e => e.textContent.trim()));
  r.ok('"sango" finds Ṣàngó (diacritic-insensitive)',
    hits.some(t => /ng[óo]/i.test(t)), hits.slice(0, 3).join(' | '));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  r.ok('Escape closes search',
    await page.evaluate(() => document.getElementById('cmdk')?.classList.contains('open')) === false);

  // ── deep links, cold and warm
  await page.goto('about:blank');
  await page.goto(`${base}/index.html#read-i2-p3`, { waitUntil: 'networkidle' });
  await page.waitForFunction(
    () => document.querySelector('.issue-reader-panel.active')?.id === 'panel-i2',
    null, { timeout: 5000 }).catch(() => {});
  const cold = await page.evaluate(() => {
    const a = document.querySelector('.issue-reader-panel.active');
    const ps = [...(a?.querySelectorAll('.reader-page') || [])];
    return { panel: a?.id, page: ps.findIndex(p => getComputedStyle(p).display !== 'none') };
  });
  r.ok('#read-i2-p3 on a cold load opens issue 2 page 3',
    cold.panel === 'panel-i2' && cold.page === 3, JSON.stringify(cold));

  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => { location.hash = '#read-i3-p2'; });
  await page.waitForFunction(
    () => document.querySelector('.issue-reader-panel.active')?.id === 'panel-i3',
    null, { timeout: 5000 }).catch(() => {});
  const warm = await page.evaluate(() => {
    const a = document.querySelector('.issue-reader-panel.active');
    const ps = [...(a?.querySelectorAll('.reader-page') || [])];
    return { panel: a?.id, page: ps.findIndex(p => getComputedStyle(p).display !== 'none') };
  });
  r.ok('a deep link followed without a reload also works',
    warm.panel === 'panel-i3' && warm.page === 2, JSON.stringify(warm));
  await page.close();

  // ── mobile: the other consumer of the nav rule
  const m = await newPage(ctx);
  await m.setViewportSize({ width: 390, height: 844 });
  await m.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  await m.waitForTimeout(600);

  const closed = await m.evaluate(() => {
    const n = document.getElementById('mobileNav');
    const cs = getComputedStyle(n);
    return { position: cs.position, top: cs.top, zIndex: cs.zIndex, dir: cs.flexDirection,
             offscreen: n.getBoundingClientRect().left >= innerWidth - 1 };
  });
  r.ok('mobile nav is fixed', closed.position === 'fixed', closed.position);
  r.ok('mobile nav pinned to top:0, not the desktop 36px', closed.top === '0px', closed.top);
  r.ok('mobile nav is a column', closed.dir === 'column', closed.dir);
  r.ok('mobile nav z-index preserved', closed.zIndex === '1050', closed.zIndex);
  r.ok('mobile nav starts off-screen', closed.offscreen === true, JSON.stringify(closed));

  await m.click('#hamburger');
  await m.waitForTimeout(600);
  const opened = await m.evaluate(() => {
    const n = document.getElementById('mobileNav');
    const box = n.getBoundingClientRect();
    return { open: n.classList.contains('open'), right: getComputedStyle(n).right,
             onscreen: box.right <= innerWidth + 1 && box.left < innerWidth,
             links: n.querySelectorAll('a').length };
  });
  r.ok('hamburger opens the mobile nav', opened.open === true);
  r.ok('mobile nav slides fully on-screen',
    opened.right === '0px' && opened.onscreen, JSON.stringify(opened));
  r.ok('mobile nav keeps its links', opened.links >= 8, String(opened.links));

  const mOver = await m.evaluate(() => ({
    doc: document.documentElement.scrollWidth, win: document.documentElement.clientWidth }));
  r.ok('no horizontal overflow at 390px', mOver.doc <= mOver.win + 1, JSON.stringify(mOver));
  await m.close();

  return r;
};
