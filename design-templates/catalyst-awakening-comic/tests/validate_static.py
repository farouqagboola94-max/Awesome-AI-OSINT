#!/usr/bin/env python3
"""Checks on the static files themselves, before a browser is involved.

Catches the class of mistake that never throws at runtime: a feed that stopped
being well-formed XML, a JSON-LD block with a stray comma, a sitemap listing a
page that no longer exists, or an issue page pointing at a cover that was
renamed. Run from anywhere:

    python3 tests/validate_static.py
"""

import collections
import glob
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_URL = 'https://catalyst-awakening.netlify.app'

failures = []
checks = 0


def check(name, cond, detail=''):
    global checks
    checks += 1
    if not cond:
        failures.append(name + (('  →  ' + str(detail)) if detail else ''))


def rel(p):
    return os.path.relpath(p, SITE)


# Custom properties declared in styles.css's :root, available to every
# stylesheet and to index.html's inline <style>.
PALETTE = set(re.findall(
    r'(--[A-Za-z0-9_-]+)\\s*:',
    open(os.path.join(SITE, 'styles.css'), encoding='utf-8').read()))


# Custom properties set on elements rather than in a stylesheet: inline
# style attributes in the HTML, and setProperty() calls in script.js.
INLINE_PROPS = set()
for _f in ('index.html', 'script.js'):
    _t = open(os.path.join(SITE, _f), encoding='utf-8').read()
    for _attr in re.findall(r'style="([^"]*)"', _t):
        INLINE_PROPS |= set(re.findall(r'(--[A-Za-z0-9_-]+)\s*:', _attr))
    INLINE_PROPS |= set(re.findall(r'setProperty\(\s*[\'"](--[A-Za-z0-9_-]+)', _t))


# Font families that are safe to name without shipping them: CSS generics and
# faces every target platform already has.
GENERIC_FONTS = {
    'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
    'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded',
    'inherit', 'initial', 'unset', 'revert',
    '-apple-system', 'blinkmacsystemfont', 'segoe ui', 'roboto', 'helvetica',
    'helvetica neue', 'arial', 'georgia', 'times', 'times new roman', 'courier',
    'courier new', 'verdana', 'tahoma', 'monaco', 'menlo', 'consolas',
    'apple color emoji', 'segoe ui emoji', 'noto color emoji',
}


def check_fonts(pages):
    """Every typeface the design names must actually ship.

    The site self-hosts its faces; nothing loads them by side effect any more.
    So a family named in CSS that has no woff2 in assets/fonts silently falls
    back and the design quietly stops being the design. This has happened
    twice: Space Mono was used 67 times and never loaded, and the artwork
    gallery's category headers asked for Cinzel Decorative and rendered as
    Times. Neither threw anything; both were invisible until measured.
    """
    shipped = set()
    for f in glob.glob(os.path.join(SITE, 'assets', 'fonts', '*.woff2')):
        fam = re.sub(r'-\d{3}-.*', '', os.path.basename(f)).replace('-', ' ')
        shipped.add(fam.lower())
    check('self-hosted typefaces found', len(shipped) >= 3, sorted(shipped))

    declared = {}
    for src in ['styles.css', 'issue.css'] + pages:
        path = os.path.join(SITE, src)
        if not os.path.exists(path):
            continue
        text = open(path, encoding='utf-8').read()
        for m in re.finditer(r'font-family\s*:\s*([^;}"]*)', text):
            for raw in m.group(1).split(','):
                fam = raw.strip().strip('\'"').strip()
                if not fam or fam.startswith('var(') or fam.endswith(')'):
                    continue
                key = fam.lower()
                if key in GENERIC_FONTS:
                    continue
                declared.setdefault(key, (fam, src))

    for key, (fam, src) in sorted(declared.items()):
        check('typeface is self-hosted: %s' % fam, key in shipped,
              'named in %s but no assets/fonts/%s-*.woff2'
              % (src, key.replace(' ', '-')))


def main():
    pages = ['index.html'] + sorted(rel(p) for p in glob.glob(os.path.join(SITE, 'read', '*.html')))

    # ── XML feeds parse
    for f in ('feed.xml', 'sitemap.xml'):
        try:
            ET.parse(os.path.join(SITE, f))
            check('%s is well-formed XML' % f, True)
        except Exception as e:
            check('%s is well-formed XML' % f, False, e)

    # ── every JSON-LD block is valid JSON
    for page in pages:
        html = open(os.path.join(SITE, page), encoding='utf-8').read()
        blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
        check('%s has structured data' % page, len(blocks) >= 1, '%d blocks' % len(blocks))
        for i, b in enumerate(blocks):
            try:
                json.loads(b)
                check('%s JSON-LD block %d parses' % (page, i), True)
            except Exception as e:
                check('%s JSON-LD block %d parses' % (page, i), False, e)

        # ── every local asset a page references actually exists
        missing = []
        for m in re.finditer(r'(?:src|href)="(?!https?:|mailto:|data:|#)([^"?#]+)', html):
            target = m.group(1)
            base = SITE if target.startswith('/') else os.path.dirname(os.path.join(SITE, page))
            path = os.path.normpath(os.path.join(base, target.lstrip('/')))
            if os.path.exists(path) or os.path.exists(path + '.html'):
                continue
            missing.append(target)
        check('%s references no missing local files' % page, not missing, ', '.join(sorted(set(missing))[:5]))

    # ── sitemap and feed only point at pages that exist
    def local_path(url):
        p = url.replace(SITE_URL, '').lstrip('/').split('#')[0]
        return os.path.join(SITE, p or 'index.html')

    sm = ET.parse(os.path.join(SITE, 'sitemap.xml')).getroot()
    ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    locs = [e.text.strip() for e in sm.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    urls = [u for u in locs if not u.endswith(('.webp', '.png', '.jpg', '.svg'))]
    for u in urls:
        p = local_path(u)
        check('sitemap URL exists: %s' % u.replace(SITE_URL, '') or '/',
              os.path.exists(p) or os.path.exists(p + '.html'), p)
    for u in locs:
        if u.endswith(('.webp', '.png', '.jpg', '.svg')):
            check('sitemap image exists: %s' % os.path.basename(u), os.path.exists(local_path(u)))

    feed = ET.parse(os.path.join(SITE, 'feed.xml')).getroot()
    items = list(feed.iter('item'))
    check('feed lists every issue', len(items) == 4, '%d items' % len(items))
    for item in items:
        link = (item.findtext('link') or '').strip()
        p = local_path(link)
        check('feed link exists: %s' % link.replace(SITE_URL, ''),
              os.path.exists(p) or os.path.exists(p + '.html'), p)
        check('feed item has a title', bool((item.findtext('title') or '').strip()))
        check('feed item has a date', bool((item.findtext('pubDate') or '').strip()))

    check_fonts(pages)

    # ── @font-face declarations and the files on disk must correspond 1:1.
    # A declared-but-missing file is a silent fallback. An orphan file is worse
    # than dead weight: the over-weight check above reads available weights
    # from the filenames, so a stray woff2 would make it believe a weight is
    # available that no @font-face actually declares.
    css = open(os.path.join(SITE, 'styles.css'), encoding='utf-8').read()
    declared = set(re.findall(r'fonts/([\w.-]+\.woff2)', css))
    on_disk = {os.path.basename(f)
               for f in glob.glob(os.path.join(SITE, 'assets', 'fonts', '*.woff2'))}
    check('every @font-face file exists', not (declared - on_disk),
          ', '.join(sorted(declared - on_disk)[:4]))
    check('no orphan font files on disk', not (on_disk - declared),
          ', '.join(sorted(on_disk - declared)[:4]))
    check('@font-face count matches file count',
          css.count('@font-face') == len(on_disk),
          '%d blocks vs %d files' % (css.count('@font-face'), len(on_disk)))


    # -- Yoruba orthography. Ase is written with underdots (U+1E63 s-dot,
    # U+1EB9 e-dot), never with an acute. Two of the key-art images render it
    # with an acute, so the wrong form is in circulation and easy to copy into
    # the copy. Re-lettering the artwork is a separate job; this keeps the
    # wrong form out of the text, where it would also reach screen readers,
    # the feed and search engines.
    WRONG = ['AS\u00c9', 'As\u00e9', 'as\u00e9', 'ASE\u0301', 'Ase\u0301', 'ase\u0301']
    for src in ['index.html', 'llms.txt', 'feed.xml', 'sitemap.xml', 'script.js'] + pages:
        path = os.path.join(SITE, src)
        if not os.path.exists(path):
            continue
        text = open(path, encoding='utf-8').read()
        found = [w for w in WRONG if w in text]
        check('%s spells Ase with underdots, not acutes' % src, not found, ', '.join(found))


    # ── the issue pages must not pull the 3D library. They carry the shared
    # #bg3d canvas but have no hero, so Three.js would download and run a WebGL
    # particle field behind the story for as long as someone reads it.
    # init3DBackground() falls back to a cheap 2D canvas when THREE is absent.
    for src in [p for p in pages if p.startswith('read/')]:
        text = open(os.path.join(SITE, src), encoding='utf-8').read()
        check('%s does not load three.js' % src, 'three' not in text.lower().split('</body>')[0]
              or not re.search(r'<script[^>]*three', text, re.I), 'three.js script tag present')


    # ── no rule may ask for a weight bolder than any face that family ships.
    # When it does the browser fakes bold by smearing the outlines, which on a
    # display cut is very visible. Bebas Neue ships one weight, so a heading's
    # UA-default bold was being faked on 95 elements before this was measured.
    weights = collections.defaultdict(set)
    for f in glob.glob(os.path.join(SITE, 'assets', 'fonts', '*.woff2')):
        m = re.match(r'(.+?)-(\d{3})-(\w+)-', os.path.basename(f))
        if m:
            weights[m.group(1).replace('-', ' ').lower()].add(int(m.group(2)))

    def css_blocks(text, is_html):
        """Declaration blocks. For HTML, only what is inside <style> — running a
        brace-matching scan over prose backtracks catastrophically (39s on one
        page; the whole check took 104s before this)."""
        chunks = re.findall(r'<style[^>]*>(.*?)</style>', text, re.S) if is_html else [text]
        for chunk in chunks:
            for m in re.finditer(r'([^{}]*)\{([^{}]*)\}', chunk):
                yield m.group(1), m.group(2)

    for src in ['styles.css'] + pages:
        path = os.path.join(SITE, src)
        if not os.path.exists(path):
            continue
        text = open(path, encoding='utf-8').read()
        over = []
        for sel, body in css_blocks(text, src.endswith('.html')):
            fam = re.search(r"font-family\s*:\s*['\"]([^'\"]+)['\"]", body)
            wt = re.search(r'font-weight\s*:\s*(\d+)', body)
            if not (fam and wt):
                continue
            key = fam.group(1).lower()
            if key in weights and int(wt.group(1)) > max(weights[key]):
                name = sel.strip().splitlines()[-1][:40] if sel.strip() else '?'
                over.append('%s wants %s %s (max %d)'
                            % (name, fam.group(1), wt.group(1), max(weights[key])))
        check('%s asks for no weight bolder than ships' % src, not over, '; '.join(over[:3]))


    # ── every var(--x) resolves to a property that is actually declared
    #
    # A misspelled custom property is the quietest failure CSS has. There is
    # no warning and no fallback: the declaration is simply thrown away at
    # computed-value time and the element inherits instead. `color: var(--bone)`
    # where the palette declares `--bone-white` does not turn the text bone —
    # it turns it whatever the parent was, which on a card that is itself a
    # link means default link blue. That shipped here once already.
    for src_name in ('styles.css', 'issue.css', 'index.html'):
        text = open(os.path.join(SITE, src_name), encoding='utf-8').read()
        if src_name.endswith('.html'):
            text = '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', text, re.S))
        declared = set(re.findall(r'(--[A-Za-z0-9_-]+)\s*:', text))
        # A property can equally be declared on the element -- style="--stat-w:97%"
        # -- or set from script with setProperty('--rs', ...). Both are real
        # declarations; only a name nothing anywhere sets is a typo.
        declared |= INLINE_PROPS
        used = set()
        for m in re.finditer(r'var\(\s*(--[A-Za-z0-9_-]+)\s*([,)])', text):
            # var(--x, fallback) is a deliberate default, not a typo.
            if m.group(2) == ')':
                used.add(m.group(1))
        # index.html's inline <style> legitimately uses the palette declared in
        # styles.css, so names are pooled across the three sources.
        undefined = sorted(used - declared - PALETTE)
        check('%s uses no undeclared custom property' % src_name,
              not undefined, ', '.join(undefined[:5]))

    # ── the canonical URL a page claims is the URL it is served at
    for page in pages:
        html = open(os.path.join(SITE, page), encoding='utf-8').read()
        m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
        check('%s declares a canonical URL' % page, bool(m))
        if not m:
            continue
        expected = '/' if page == 'index.html' else '/' + page[:-len('.html')]
        got = m.group(1).replace(SITE_URL, '') or '/'
        check('%s canonical matches its path' % page, got == expected, '%s != %s' % (got, expected))

    print('%d checks, %d failed' % (checks, len(failures)))
    if failures:
        print('\nFAILURES:')
        for f in failures:
            print('  x ' + f)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
