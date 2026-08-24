#!/usr/bin/env node
'use strict';
// Runs every suite against a local copy of the site.
//
//   node tests/run.js              all suites
//   node tests/run.js a11y home    only those
//
// Requires Playwright's chromium. If it is not resolvable, set NODE_PATH to
// wherever playwright lives, or `npm i -D playwright && npx playwright install chromium`.

const path = require('path');
const { startServer, chromium } = require('./lib/harness');

const SUITES = {
  'issue-pages': require('./issue-pages.test.js'),
  home: require('./home.test.js'),
  a11y: require('./a11y.test.js'),
  'css-subset': require('./css-subset.test.js'),
  'reduced-motion': require('./reduced-motion.test.js'),
  'reader-features': require('./reader-features.test.js'),
  'reading-state': require('./reading-state.test.js'),
};

(async () => {
  const wanted = process.argv.slice(2);
  const names = wanted.length ? wanted : Object.keys(SUITES);
  for (const n of names) {
    if (!SUITES[n]) {
      console.error(`unknown suite: ${n}\navailable: ${Object.keys(SUITES).join(', ')}`);
      process.exit(2);
    }
  }

  const site = await startServer();
  const browser = await chromium.launch();
  let pass = 0;
  const failures = [];

  try {
    for (const n of names) {
      const started = Date.now();
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      let r;
      try {
        r = await SUITES[n](ctx, site.base);
      } catch (err) {
        failures.push(`${n}: suite threw — ${err.message}`);
        await ctx.close();
        console.log(`  ${n.padEnd(14)} ERRORED  ${err.message}`);
        continue;
      }
      await ctx.close();
      pass += r.pass;
      r.failures.forEach(f => failures.push(`${n}: ${f}`));
      const secs = ((Date.now() - started) / 1000).toFixed(1);
      console.log(`  ${n.padEnd(14)} ${String(r.pass).padStart(3)} passed  ${
        r.fail ? `${r.fail} FAILED` : '         '}  ${secs}s`);
    }
  } finally {
    await browser.close();
    await site.stop();
  }

  console.log(`\n${pass} passed, ${failures.length} failed`);
  if (failures.length) {
    console.log('\nFAILURES:');
    failures.forEach(f => console.log('  ✗ ' + f));
  }
  process.exit(failures.length ? 1 : 0);
})().catch(err => { console.error(err); process.exit(1); });
