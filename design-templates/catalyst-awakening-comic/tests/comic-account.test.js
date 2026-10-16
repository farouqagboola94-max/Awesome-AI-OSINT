'use strict';
const { newPage, watchErrors, Results } = require('./lib/harness');

module.exports = async function comicAccount(ctx, base) {
  const r = new Results(), page = await newPage(ctx), errors = watchErrors(page);
  page.setDefaultTimeout(8000);
  // Fixture content exercises the reader UI without substituting production art.
  await page.route('**/private/issue01/manifest.json', route => route.fulfill({ json: {
    pages: Array.from({ length: 88 }, (_, i) => ({ page: i + 1, scene: 1, title: 'Fixture scene', image: '/assets/cover-issue1.webp', cues: [] }))
  } }));
  await page.route('**/private/issue01/cover.webp', route => route.fulfill({ status: 204 }));
  await page.goto(base + '/read/issue-1-comic', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('#page-select').options.length === 88);
  await page.click('#note-toggle');
  const note = '<img src=x onerror="window.comicNoteExecuted=true">';
  await page.fill('#note-text', note);
  await page.click('#note-modal button.active');
  r.ok('adding a note bookmarks its page', (await page.locator('#bm-count').textContent()) === '1');
  await page.click('#bm-list-toggle');
  r.ok('a note is displayed as text', (await page.locator('.bm-card-note').textContent()).includes(note));
  r.ok('saved notes cannot inject markup or scripts', await page.evaluate(() => !window.comicNoteExecuted && !document.querySelector('.bm-card-note img')));
  await page.click('#bm-drawer button[aria-label="Close drawer"]');
  await page.selectOption('#page-select', '8');
  r.ok('comic reading position is saved separately from prose', await page.evaluate(() => CatalystStorage.getItem('catalyst_comic_page_i1') === '8'));
  await page.click('#bm-list-toggle');
  await page.click('.bm-card-actions button.active');
  r.ok('a saved bookmark opens its page', (await page.locator('#page-select').inputValue()) === '1');
  r.ok('bookmark navigation closes the drawer', await page.locator('#bm-drawer').isHidden());
  r.ok('the private reader introduces no browser errors', errors.length === 0, errors.join('\n'));
  await page.close();
  return r;
};
