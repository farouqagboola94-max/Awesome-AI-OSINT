'use strict';
// Do the reading features actually work on a standalone issue page?
//
// The existing suites check that the markup and the modules are present. That
// is not the same claim. Every control in the reader — the pager, the type
// scale, focus mode, the glossary popover, Field Notes — is built by
// script.js at runtime against a DOM it was written for when index.html held
// all four issues at once. Presence proves the slice carried the chrome
// across; only driving the controls proves they still do anything.

const { newPage, watchErrors, Results } = require('./lib/harness');

const visiblePage = () => {
  const pages = [...document.querySelectorAll('.issue-reader-panel .reader-page')];
  return pages.findIndex(p => getComputedStyle(p).display !== 'none');
};

module.exports = async function readerFeatures(ctx, base) {
  const r = new Results();
  const page = await newPage(ctx);
  const errors = watchErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/read/issue-1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // ── the pager is built and starts at the first page
  const built = await page.evaluate(() => ({
    pages: document.querySelectorAll('.issue-reader-panel .reader-page').length,
    tools: document.querySelectorAll('.reader-tools').length,
    nav: document.querySelectorAll('.reader-nav button').length,
    terms: document.querySelectorAll('.gl-term, [data-term]').length,
  }));
  r.ok('pager built the story into pages', built.pages > 3, String(built.pages));
  r.ok('reader toolbar built', built.tools === 1, String(built.tools));
  r.ok('previous/next controls built', built.nav === 2, String(built.nav));
  r.ok('glossary annotated the prose', built.terms > 5, String(built.terms));
  r.ok('starts on the first page',
    await page.evaluate(visiblePage) === 0);

  // ── Book navigation keeps the issue order and chapter order visible.
  const book = await page.evaluate(() => ({
    nav: document.querySelectorAll('.book-navigator').length,
    issues: document.querySelectorAll('.book-navigator .book-issue').length,
    chapters: document.querySelectorAll('.book-navigator [data-page]').length,
    current: document.querySelector('.book-navigator .book-issue.current')?.textContent.trim() || '',
  }));
  r.ok('book navigation is present', book.nav === 1, JSON.stringify(book));
  r.ok('book navigation keeps all four issues in order', book.issues === 4, JSON.stringify(book));
  r.ok('book navigation marks the current issue', /Issue #01/.test(book.current), JSON.stringify(book));
  r.ok('book navigation lists the current issue chapters', book.chapters > 3, JSON.stringify(book));

  await page.click('.book-navigator [data-page="2"]');
  await page.waitForTimeout(400);
  r.ok('chapter navigation opens the selected page', await page.evaluate(visiblePage) === 2);
  await page.click('.book-navigator [data-page="0"]');
  await page.waitForTimeout(300);

  // ── turning pages, by button and by keyboard
  await page.click('.reader-nav button:last-of-type');
  await page.waitForTimeout(400);
  r.ok('Next Page turns the page', await page.evaluate(visiblePage) === 1);

  await page.click('.reader-nav button:first-of-type');
  await page.waitForTimeout(400);
  r.ok('Previous Page turns back', await page.evaluate(visiblePage) === 0);

  await page.evaluate(() => document.querySelector('.story-content').focus?.());
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  const afterKey = await page.evaluate(visiblePage);
  r.ok('arrow keys turn pages', afterKey === 1, String(afterKey));
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(300);

  // ── the deep link in the address bar tracks what is being read
  await page.click('.reader-nav button:last-of-type');
  await page.waitForTimeout(400);
  r.ok('URL updates to a shareable deep link',
    /#read-i1-p\d+$/.test(page.url()), page.url());

  // ── type scale
  const scale = await page.evaluate(async () => {
    const content = document.querySelector('.issue-reader-panel .story-content');
    const before = getComputedStyle(content).getPropertyValue('--rs') ||
                   getComputedStyle(content).fontSize;
    document.querySelector('.reader-tools .rt-inc').click();
    await new Promise(f => setTimeout(f, 300));
    const bigger = getComputedStyle(content).getPropertyValue('--rs') ||
                   getComputedStyle(content).fontSize;
    document.querySelector('.reader-tools .rt-dec').click();
    await new Promise(f => setTimeout(f, 300));
    const back = getComputedStyle(content).getPropertyValue('--rs') ||
                 getComputedStyle(content).fontSize;
    return { before: before.trim(), bigger: bigger.trim(), back: back.trim() };
  });
  r.ok('A+ increases the type scale', scale.bigger !== scale.before, JSON.stringify(scale));
  r.ok('A- returns it', scale.back === scale.before, JSON.stringify(scale));

  // ── focus mode
  const focus = await page.evaluate(async () => {
    document.querySelector('.reader-tools .rt-focus').click();
    await new Promise(f => setTimeout(f, 350));
    const on = document.body.className;
    document.querySelector('.reader-tools .rt-focus').click();
    await new Promise(f => setTimeout(f, 350));
    return { on, off: document.body.className };
  });
  r.ok('focus mode toggles on', /focus/.test(focus.on), focus.on || '(no class)');
  r.ok('focus mode toggles off', !/reader-focus/.test(focus.off), focus.off || '(none)');

  // ── inline lore terms. The story's terms are .lore-term with their own
  //    tooltip (#lore-tip, created by JS), shown on hover — a different
  //    system from the .gl-term/#glPop glossary on the home page.
  const gloss = await page.evaluate(async () => {
    const term = document.querySelector('.lore-term');
    if (!term) return { none: true };
    term.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    await new Promise(f => setTimeout(f, 400));
    const tip = document.getElementById('lore-tip');
    return {
      term: term.getAttribute('data-term'),
      shown: !!tip && tip.classList.contains('show'),
      title: tip?.querySelector('.lt-term')?.textContent.trim() || '',
      body: (tip?.querySelector('.lt-def')?.textContent || '').trim().length,
      describedby: term.getAttribute('aria-describedby'),
    };
  });
  r.ok('hovering an inline lore term shows its tooltip', gloss.shown === true, JSON.stringify(gloss));
  r.ok('the tooltip names the term', gloss.title === gloss.term, JSON.stringify(gloss));
  r.ok('the tooltip carries a definition', gloss.body > 10, String(gloss.body));
  r.ok('the term points at the tooltip for screen readers',
    gloss.describedby === 'lore-tip', String(gloss.describedby));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);

  // ── Field Notes: select a passage, save it, find it in the drawer
  const note = await page.evaluate(async () => {
    const para = document.querySelector('.issue-reader-panel .reader-page:not([style*="display: none"]) .story-prose')
              || document.querySelector('.issue-reader-panel .story-prose');
    if (!para) return { none: true };
    const range = document.createRange();
    const text = [...para.childNodes].find(n => n.nodeType === 3 && n.textContent.trim().length > 40);
    if (!text) return { noText: true };
    range.setStart(text, 0);
    range.setEnd(text, 40);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
    para.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await new Promise(f => setTimeout(f, 500));
    const bar = document.getElementById('fnBar');
    return {
      selected: sel.toString().trim().slice(0, 30),
      barShown: !!bar && !bar.hasAttribute('hidden'),
    };
  });
  r.ok('selecting story text offers the notes toolbar',
    note.barShown === true, JSON.stringify(note));

  const saved = await page.evaluate(async () => {
    const btn = document.querySelector('#fnBar button');
    if (!btn) return { noButton: true };
    btn.click();
    await new Promise(f => setTimeout(f, 600));
    const marks = document.querySelectorAll('mark.fn-hl').length;
    window.CatalystFieldNotes.open();
    await new Promise(f => setTimeout(f, 500));
    const drawer = document.getElementById('fnDrawer');
    const items = drawer ? drawer.querySelectorAll('article.fn-note').length : 0;
    return { marks, drawerOpen: !!drawer && !drawer.hasAttribute('hidden'), items };
  });
  r.ok('saving a note highlights the passage', saved.marks > 0, JSON.stringify(saved));
  r.ok('the notes drawer opens', saved.drawerOpen === true, JSON.stringify(saved));
  r.ok('the saved note is listed in the drawer', saved.items > 0, JSON.stringify(saved));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // ── the note survives a reload: that is the whole point of saving it
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const persisted = await page.evaluate(async () => {
    window.CatalystFieldNotes.open();
    await new Promise(f => setTimeout(f, 600));
    const drawer = document.getElementById('fnDrawer');
    return drawer ? drawer.querySelectorAll('article.fn-note').length : 0;
  });
  r.ok('notes persist across a reload', persisted > 0, String(persisted));

  r.ok('no JS errors while driving every control',
    errors.length === 0, errors.slice(0, 3).join(' | '));

  await page.close();
  return r;
};
