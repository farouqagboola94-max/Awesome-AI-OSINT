'use strict';
// Minimal test harness: a static server, a browser, and an assertion counter.
// No framework — the site has no build step and this keeps it that way. The
// only dependency is Playwright's chromium.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SITE = path.resolve(__dirname, '..', '..');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

// Serves the site the way Netlify does for our purposes: extensionless URLs
// resolve to the matching .html file, so tests exercise the real /read/issue-2
// path rather than a filename the deployed site never uses.
function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      let rel = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      if (rel.endsWith('/')) rel += 'index.html';
      let file = path.join(SITE, rel);
      if (!file.startsWith(SITE)) { res.writeHead(403).end(); return; }
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        if (fs.existsSync(file + '.html')) file += '.html';
        else { res.writeHead(404).end('not found'); return; }
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({
      server,
      base: `http://127.0.0.1:${server.address().port}`,
      stop: () => new Promise(r => server.close(r)),
    }));
  });
}

// Supabase, Paystack and the CDN copies of three.js are unreachable from CI.
// Blocking them keeps a failing test a real finding rather than a network
// timeout — and the site is built to work without them.
const THIRD_PARTY = /supabase|paystack|jsdelivr|unpkg|googleapis|gstatic|google-analytics/;

async function newPage(ctx) {
  const page = await ctx.newPage();
  await page.route(THIRD_PARTY, r => r.abort());
  return page;
}

// Aborting a request logs "Failed to load resource" — that is the harness, not
// the page. Everything else counts.
function watchErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => {
    if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text());
  });
  return errors;
}

function watchBadRequests(page, base) {
  const bad = [];
  page.on('response', r => {
    const u = r.url();
    if (THIRD_PARTY.test(u) || !u.startsWith(base)) return;
    if (r.status() >= 400) bad.push(`${r.status()} ${u.replace(base, '')}`);
  });
  return bad;
}

class Results {
  constructor() { this.pass = 0; this.failures = []; }
  ok(name, cond, detail) {
    if (cond) this.pass++;
    else this.failures.push(name + (detail ? `  →  ${detail}` : ''));
  }
  get fail() { return this.failures.length; }
}

// Runs inside the page: is this element hidden from assistive technology?
// opacity:0 is deliberately NOT treated as hidden — that is the bug this
// suite exists to catch.
const HIDDEN_FROM_A11Y = `el => {
  let e = el;
  while (e && e !== document.body) {
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden' ||
        e.hasAttribute('hidden') || e.getAttribute('aria-hidden') === 'true') return true;
    e = e.parentElement;
  }
  return false;
}`;

module.exports = {
  SITE, startServer, newPage, watchErrors, watchBadRequests, Results,
  HIDDEN_FROM_A11Y, chromium, THIRD_PARTY,
};
