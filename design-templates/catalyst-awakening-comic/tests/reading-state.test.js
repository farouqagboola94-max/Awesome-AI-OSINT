'use strict';
// Does the site remember where this reader stopped, and act on it?
//
// The reader has always written its position to localStorage on every page
// turn. Nothing outside the reader itself read it back: someone three pages
// into Issue #3 and someone who had never opened it were shown identical tab
// bars and an identical card saying "Read Issue #03".
//
// Two claims are worth testing and they are different. One is cosmetic — the
// tab shows a rule, the card says "Continue". The other is the promise: that
// following that link puts you back on page 4. A feature that says "you
// stopped on page 4 of 11" and then opens page 1 is worse than one that says
// nothing, so both halves are checked here.
//
// The states are seeded rather than performed. Reading eleven pages of Issue
// #3 through the UI to arrive at the same three keys would test the pager,
// which reader-features already drives; what is under test here is what the
// rest of the site does with what the pager wrote.

const { newPage, watchErrors, Results } = require('./lib/harness');

const TABS = () => [...document.querySelectorAll('.issue-page-tab')].map(t => ({
  href: t.getAttribute('href'),
  text: t.textContent.trim(),
  read: t.classList.contains('tab-read'),
  reading: t.classList.contains('tab-reading'),
  bar: t.querySelector('.tab-progress > span')?.style.width || null,
  // Announced, not drawn: the tick and the rule are meaningless to a screen
  // reader, so the same fact has to exist as text.
  announced: t.querySelector('.tab-state')?.textContent.trim() || '',
}));

const CARD = () => ({
  cta: document.querySelector('.handoff-cta')?.textContent.trim() || '',
  href: document.querySelector('.handoff-card')?.getAttribute('href') || '',
  resume: document.querySelector('.handoff-facts .fact-resume')?.textContent.trim() || '',
  facts: document.querySelectorAll('.handoff-facts span').length,
});

module.exports = async function readingState(ctx, base) {
  const r = new Results();
  const page = await newPage(ctx);
  const errors = watchErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  // ── a reader with no history is shown no history
  await page.goto(`${base}/read/issue-2`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${base}/read/issue-2`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const fresh = await page.evaluate(TABS);
  const freshCard = await page.evaluate(CARD);
  r.ok('a first-time reader sees no progress claimed anywhere',
    fresh.every(t => !t.read && !t.reading && (t.bar === '0%' || !t.bar)),
    JSON.stringify(fresh.map(t => [t.read, t.reading, t.bar])));
  r.ok('every tab still reads as its issue',
    fresh.every((t, i) => t.text === `Issue #0${i + 1}`), fresh.map(t => t.text).join(' / '));
  r.ok('the card invites a first read', freshCard.cta.startsWith('Read Issue #03'), freshCard.cta);
  r.ok('and claims no position', freshCard.resume === '', freshCard.resume);
  r.ok('the card carries its three facts and no more',
    freshCard.facts === 3, String(freshCard.facts));

  // ── a returning reader: Issue #1 finished, Issue #3 abandoned on page 4
  await page.evaluate(() => {
    localStorage.setItem('catalyst_read_1', '1');
    localStorage.setItem('catalyst_page_i1', '12');
    localStorage.setItem('catalyst_pages_i1', '12');
    localStorage.setItem('catalyst_page_i3', '4');
    localStorage.setItem('catalyst_pages_i3', '12');
  });
  await page.goto(`${base}/read/issue-2`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const back = await page.evaluate(TABS);
  r.ok('the finished issue is marked read', back[0].read === true && back[0].bar === '100%',
    JSON.stringify(back[0]));
  r.ok('and says so in words, not only with a tick',
    /read/i.test(back[0].announced), back[0].announced);
  r.ok('the abandoned issue is marked in progress',
    back[2].reading === true && back[2].read === false, JSON.stringify(back[2]));
  r.ok('its rule is proportional to how far in they got',
    back[2].bar === '33%', back[2].bar);
  r.ok('and the exact position is announced',
    back[2].announced === '— page 4 of 12', back[2].announced);
  r.ok('an unopened issue claims nothing',
    !back[3].read && !back[3].reading && back[3].bar === '0%', JSON.stringify(back[3]));
  r.ok('the issue being read is not marked from a stale key',
    !back[1].read, JSON.stringify(back[1]));

  const card = await page.evaluate(CARD);
  r.ok('the card no longer asks them to start what they started',
    card.cta.startsWith('Continue Issue #03'), card.cta);
  r.ok('it says exactly where they stopped',
    card.resume === 'You stopped on page 4 of 12', card.resume);

  // ── the promise: following it must actually resume
  await page.click('.handoff-card');
  await page.waitForURL(/issue-3/, { timeout: 8000 });
  await page.waitForTimeout(1500);
  const landed = await page.evaluate(() => {
    const ps = [...document.querySelectorAll('.issue-reader-panel .reader-page')];
    return {
      index: ps.findIndex(p => getComputedStyle(p).display !== 'none'),
      counter: document.querySelector('.rc-count')?.textContent.trim() || '',
    };
  });
  r.ok('following it opens the page they stopped on, not page one',
    landed.index === 4, JSON.stringify(landed));
  r.ok('and the reader agrees that is where it is',
    /PAGE 4 OF 12/i.test(landed.counter), landed.counter);

  // ── the bar has to follow the pager, not be painted once at load
  const live = await page.evaluate(async () => {
    const before = document.querySelector('.issue-page-tab[href="./issue-3"] .tab-progress > span').style.width;
    document.querySelector('.reader-nav button:last-of-type').click();
    await new Promise(f => setTimeout(f, 700));
    const tab = document.querySelector('.issue-page-tab[href="./issue-3"]');
    return {
      before,
      after: tab.querySelector('.tab-progress > span').style.width,
      announced: tab.querySelector('.tab-state').textContent.trim(),
      stored: localStorage.getItem('catalyst_page_i3'),
    };
  });
  r.ok('turning a page moves this issue\'s rule straight away',
    live.after !== live.before, JSON.stringify(live));
  r.ok('and the announced position moves with it',
    live.announced === '— page 5 of 12', live.announced);
  r.ok('the new position is what was written to storage',
    live.stored === '5', live.stored);

  // ── the denominator is recorded, not guessed
  const totals = await page.evaluate(() => localStorage.getItem('catalyst_pages_i3'));
  r.ok('the pager records how many pages the issue has',
    totals === '12', totals);

  // ── a position written before this shipped has no total to divide by
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('catalyst_page_i4', '3');
  });
  await page.goto(`${base}/read/issue-3`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const legacy = await page.evaluate(TABS);
  r.ok('an old position still marks the issue as started',
    legacy[3].reading === true, JSON.stringify(legacy[3]));
  r.ok('without inventing a percentage it cannot know',
    legacy[3].announced === '— in progress', legacy[3].announced);

  // ── the journey strip stands down where it could only say one thing
  const strips = await page.evaluate(() => document.querySelectorAll('.reader-journey').length);
  r.ok('no one-chip journey strip on a standalone issue page', strips === 0, String(strips));
  const homePage = await newPage(ctx);
  await homePage.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  await homePage.waitForTimeout(1800);
  const homeChips = await homePage.evaluate(() =>
    document.querySelectorAll('.reader-journey button').length);
  r.ok('but it still carries all four issues on the home page',
    homeChips === 4, String(homeChips));
  await homePage.close();

  r.ok('no JS errors anywhere in this', errors.length === 0, errors.slice(0, 3).join(' | '));

  await page.close();
  return r;
};
