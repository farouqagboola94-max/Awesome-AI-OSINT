#!/usr/bin/env python3
"""Compose the standalone per-issue reader pages from index.html.

index.html is the single source of truth. Everything shared — the head, the
nav, every overlay and modal, the footer, the script tags — is sliced out of
it here rather than duplicated by hand, so a change to the chrome on the home
page lands on all four issue pages the next time this runs.

    python3 tools/build_pages.py            # write read/issue-{1..4}.html
    python3 tools/build_pages.py --check    # exit 1 if they are out of date

What each page gets that the tab inside index.html cannot have: its own
<title>, description and canonical URL, an og:image that is the actual cover
of that issue, ComicIssue structured data, and a breadcrumb. A link to
Issue #2 now previews as Issue #2.
"""

import argparse
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'index.html')
OUTDIR = os.path.join(ROOT, 'read')
SITE = 'https://catalyst-awakening.netlify.app'

# Slug and cover are the only per-issue facts stated here. Everything else is
# read back out of files that already hold it: the displayed title and page
# count from the panel markup in index.html, and the synopsis and publication
# date from feed.xml. Nothing about an issue is written down twice, so the
# pages cannot contradict the feed or the reader.
ISSUES = {
    1: {'slug': 'issue-1', 'cover': 'cover-issue1.webp'},
    2: {'slug': 'issue-2', 'cover': 'cover-issue2.webp'},
    3: {'slug': 'issue-3', 'cover': 'cover-issue3.webp'},
    4: {'slug': 'issue-4', 'cover': 'cover-issue4.webp'},
}

# Body-level overlays that live between content sections in index.html and
# are needed while reading. See slice_source() for why the list is short.
EXTRA_CHROME = ['glPop']

MONTHS = {m: i for i, m in enumerate(
    'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(), 1)}


def read_canonical_titles(html):
    """Mixed-case issue names, from the ComicSeries JSON-LD already in index.html.

    The panel markup renders its title in caps as a design choice — "ṢÀNGÓ'S
    DAUGHTER" — which is right on the page and wrong in a <title> tag or a
    share card. Case-folding the display string back is not safe for Yoruba
    diacritics, so the properly-cased name is read from the structured data
    where it is already written correctly.
    """
    out = {}
    for m in re.finditer(r'"name":\s*"Issue #(\d) — ((?:[^"\\]|\\.)*)"', html):
        out[int(m.group(1))] = m.group(2).replace('\\"', '"')
    missing = set(ISSUES) - set(out)
    if missing:
        raise SystemExit('index.html JSON-LD names no ComicIssue for: %s' % sorted(missing))
    return out


def read_feed():
    """Publication date and synopsis per issue, straight out of feed.xml."""
    import xml.etree.ElementTree as ET
    out = {}
    for item in ET.parse(os.path.join(ROOT, 'feed.xml')).getroot().iter('item'):
        link = item.findtext('link') or ''
        # Matches both the current per-issue URLs and the older home-page
        # fragments (/#read-i2-p0) the feed used before those pages existed.
        m = re.search(r'/read/issue-(\d)\b', link) or re.search(r'#read-i(\d)-', link)
        if not m:
            continue
        # RFC 822: "Thu, 15 Jan 2026 09:00:00 +0100"
        d = re.search(r'(\d{1,2}) (\w{3}) (\d{4})', item.findtext('pubDate') or '')
        out[int(m.group(1))] = {
            'published': '%s-%02d-%02d' % (d.group(3), MONTHS[d.group(2)], int(d.group(1))) if d else '',
            'synopsis': ' '.join((item.findtext('description') or '').split()),
        }
    missing = set(ISSUES) - set(out)
    if missing:
        raise SystemExit('feed.xml has no item for issue(s): %s' % sorted(missing))
    return out


# ────────────────────────────────────────────────────────────── slicing


def match_element(html, start, tag):
    """Index just past the close tag matching the element opening at `start`."""
    depth = 0
    i = start
    pat = re.compile(r'<(/?)%s\b' % re.escape(tag))
    while True:
        m = pat.search(html, i)
        if not m:
            raise ValueError('unclosed <%s> at %d' % (tag, start))
        if m.group(1):
            depth -= 1
            if depth == 0:
                return html.index('>', m.start()) + 1
        else:
            depth += 1
        i = m.end()


def slice_source(html):
    """Split index.html into the pieces the issue pages are assembled from."""
    head_open = html.index('<head>') + len('<head>')
    head_close = html.index('</head>')
    body_open = html.index('<body>') + len('<body>')

    # Chrome above the content: skip link, ticker, every modal, the nav.
    # It ends where the first content section begins.
    hero = html.index('<section id="hero">')
    chrome_top_end = html.rindex('<!--', body_open, hero)

    # Chrome below the content: footer through the closing scripts.
    footer = html.index('<footer>')
    chrome_bottom_end = html.index('</body>')

    # A few body-level overlays sit between content sections in index.html
    # rather than in either chrome block, so slicing chrome alone would drop
    # them. Only ones the reader itself needs belong here: #glPop is the
    # popover the glossary annotator opens on terms inside the story prose,
    # and it is position:absolute against the page, so it moves safely.
    # Deliberately NOT included: #aseLevelUp, which is position:absolute;
    # inset:0 against the Aṣẹ meter card it lives in — lifted out of that
    # card it would cover the whole viewport.
    extras = []
    for el_id in EXTRA_CHROME:
        start = html.rindex('<div', 0, html.index('id="%s"' % el_id))
        extras.append(html[start:match_element(html, start, 'div')])

    read = html.index('<section id="read">')
    read_end = match_element(html, read, 'section')
    tabs = html.index('<div class="issue-tabs">', read, read_end)
    tabs_end = match_element(html, tabs, 'div')

    panels = {}
    for n in (1, 2, 3, 4):
        p = html.index('<div class="issue-reader-panel', read)
        p = html.index('id="panel-i%d"' % n, read, read_end)
        p = html.rindex('<div class="issue-reader-panel', read, p)
        panels[n] = html[p:match_element(html, p, 'div')]

    return {
        'head': html[head_open:head_close],
        'chrome_top': html[body_open:chrome_top_end],
        'chrome_bottom': html[footer:chrome_bottom_end],
        'read_prelude': html[read:tabs],   # <section id="read"> + header block
        'panels': panels,
        'extras': extras,
    }


# ────────────────────────────────────────────────────────── path rewriting

# Section ids that exist on an issue page. Everything else a chrome link
# points at lives on the home page and has to be prefixed with "/".
LOCAL_IDS = {'read'}


def to_subdir(fragment):
    """Rewrite index.html-relative asset paths for a file one level down."""
    fragment = fragment.replace('"./assets/', '"../assets/')
    fragment = fragment.replace("'./assets/", "'../assets/")
    fragment = fragment.replace('(./assets/', '(../assets/')
    fragment = fragment.replace('"styles.css"', '"../styles.css"')
    fragment = fragment.replace('"script.js"', '"../script.js"')
    return fragment


def absolutise_hashes(fragment):
    """href="#characters" → href="/#characters" for sections not on this page."""
    def sub(m):
        target = m.group(2)
        if target in LOCAL_IDS:
            return m.group(0)
        return '%shref="/#%s"' % (m.group(1), target)
    return re.sub(r'(\s)href="#([A-Za-z][\w-]*)"', sub, fragment)


def extract(panel, cls):
    m = re.search(r'<div class="%s">(.*?)</div>' % re.escape(cls), panel, re.S)
    return re.sub(r'<[^>]+>', '', m.group(1)).strip() if m else ''


def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;')
             .replace('>', '&gt;').replace('"', '&quot;'))


def jesc(s):
    return s.replace('\\', '\\\\').replace('"', '\\"')


# ─────────────────────────────────────────────────────────────── the page


def build_head(n, meta, title, label, pages, chapters):
    """A head derived from index.html's, with this issue's identity swapped in."""
    synopsis = meta['synopsis']
    # The <meta name="description"> wants the search result to say what the page
    # is as well as what happens in it; og:description is read by someone who
    # already clicked a link, so it is the synopsis alone.
    desc = 'Issue #%02d of Catalyst: The Awakening — %s. %s Free to read, no signup.' % (
        n, title, synopsis)
    if len(desc) > 300:
        desc = desc[:297].rsplit(' ', 1)[0] + '…'
    og_desc = synopsis if len(synopsis) <= 200 else synopsis[:197].rsplit(' ', 1)[0] + '…'
    url = '%s/read/%s' % (SITE, meta['slug'])
    cover = '%s/assets/%s' % (SITE, meta['cover'])
    page_title = 'Issue #%02d: %s — Catalyst: The Awakening | Free Lagos Noir Comic' % (n, title)
    social_title = 'Catalyst #%02d: %s' % (n, title)

    prev_link = ('  <link rel="prev" href="%s/read/issue-%d">\n' % (SITE, n - 1)) if n > 1 else ''
    next_link = ('  <link rel="next" href="%s/read/issue-%d">\n' % (SITE, n + 1)) if n < 4 else ''

    return '''<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preconnect" href="https://js.paystack.co" crossorigin>
  <link rel="preconnect" href="https://qeoqxowpnrmttjupxkeb.supabase.co" crossorigin>
  <link rel="preload" as="image" href="../assets/{cover_file}" fetchpriority="high">

<!-- ═══════════════════════════════════════════════════════════
     PRIMARY SEO — this page is Issue #{nn}, not the home page.
     A link to it previews as Issue #{nn}: its own title, its own
     description, and its own cover as the share image.
═══════════════════════════════════════════════════════════ -->
<title>{page_title}</title>
<meta name="description" content="{desc}">
<meta name="author" content="Catalyst Comics Studio">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="theme-color" content="#F4B800">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="{url}">
{prev_link}{next_link}
<meta property="og:type" content="article">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{social_title}">
<meta property="og:description" content="{og_desc}">
<meta property="og:image" content="{cover}">
<meta property="og:image:secure_url" content="{cover}">
<meta property="og:image:type" content="image/webp">
<meta property="og:image:alt" content="Cover art for Catalyst: The Awakening, Issue #{nn}: {title}">
<meta property="og:site_name" content="Catalyst Comics Studio">
<meta property="og:locale" content="en_NG">
<meta property="article:published_time" content="{published}">
<meta property="article:section" content="Comics">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@catalystcomicshq">
<meta name="twitter:creator" content="@catalystcomicshq">
<meta name="twitter:title" content="{social_title}">
<meta name="twitter:description" content="{og_desc}">
<meta name="twitter:image" content="{cover}">
<meta name="twitter:image:alt" content="Cover art for Catalyst: The Awakening, Issue #{nn}: {title}">

<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="Catalyst: The Awakening — Issues" href="/feed.xml">
<link rel="manifest" href="/manifest.json">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Catalyst">

<link rel="preload" href="../assets/fonts/bebas-neue-400-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../assets/fonts/space-grotesk-400-normal-latin.woff2" as="font" type="font/woff2" crossorigin>

<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@graph": [
    {{
      "@type": "ComicIssue",
      "@id": "{url}#issue",
      "name": "Issue #{nn} — {jtitle}",
      "issueNumber": {n},
      "url": "{url}",
      "description": "{jdesc}",
      "image": {{
        "@type": "ImageObject",
        "url": "{cover}",
        "width": 1080,
        "height": 1920
      }},
      "numberOfPages": {pages},
      "datePublished": "{published}",
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "genre": ["Superhero", "Afrofuturism", "African Comics", "Urban Fantasy", "Mythology"],
      "author": {{ "@type": "Organization", "name": "Catalyst Comics Studio" }},
      "publisher": {{ "@id": "{site}/#organization" }},
      "isPartOf": {{ "@id": "{site}/#comicseries" }},
      "partOfSeries": {{
        "@type": "ComicSeries",
        "@id": "{site}/#comicseries",
        "name": "Catalyst: The Awakening",
        "url": "{site}/"
      }},
      "hasPart": [
{chapter_ld}
      ]
    }},
    {{
      "@type": "WebPage",
      "@id": "{url}#webpage",
      "url": "{url}",
      "name": "{jpage_title}",
      "description": "{jdesc}",
      "isPartOf": {{ "@id": "{site}/#website" }},
      "about": {{ "@id": "{url}#issue" }},
      "primaryImageOfPage": {{ "@type": "ImageObject", "url": "{cover}" }},
      "breadcrumb": {{
        "@type": "BreadcrumbList",
        "itemListElement": [
          {{ "@type": "ListItem", "position": 1, "name": "Home", "item": "{site}/" }},
          {{ "@type": "ListItem", "position": 2, "name": "Read Free", "item": "{site}/#read" }},
          {{ "@type": "ListItem", "position": 3, "name": "Issue #{nn} — {jtitle}", "item": "{url}" }}
        ]
      }}
    }}
  ]
}}
</script>
<link rel="stylesheet" href="../styles.css">
'''.format(
        n=n, nn='%02d' % n, cover_file=meta['cover'], cover=cover, url=url, site=SITE,
        page_title=esc(page_title), social_title=esc(social_title), title=esc(title),
        desc=esc(desc), og_desc=esc(og_desc),
        published=meta['published'], pages=pages, prev_link=prev_link, next_link=next_link,
        jtitle=jesc(title), jdesc=jesc(desc), jpage_title=jesc(page_title),
        chapter_ld=chapters,
    )


def chapter_jsonld(panel, url):
    """Each in-story chapter, so search engines can deep-link into the issue."""
    titles = re.findall(r'<div class="chapter-title">(.*?)</div>', panel, re.S)
    rows = []
    for i, t in enumerate(titles, 1):
        t = re.sub(r'<[^>]+>', '', t).strip()
        if not t:
            continue
        rows.append('        {{ "@type": "Chapter", "position": {i}, "name": "{t}", '
                    '"url": "{url}#p{i}" }}'.format(i=i, t=jesc(t), url=url))
    return ',\n'.join(rows)


def issue_nav(n, title, all_titles):
    """The tab bar, rebuilt as real links between real pages."""
    items = []
    for i in (1, 2, 3, 4):
        cls = 'issue-page-tab active' if i == n else 'issue-page-tab'
        cur = ' aria-current="page"' if i == n else ''
        items.append('    <a class="%s" href="./issue-%d"%s>Issue #%02d</a>'
                     % (cls, i, cur, i))
    return ('  <nav class="issue-tabs issue-page-tabs" aria-label="Issues">\n'
            + '\n'.join(items) + '\n  </nav>\n')


def footer_nav(n, all_titles):
    """Previous / next issue, at the end of the story where it is wanted."""
    prev_html = next_html = ''
    if n > 1:
        prev_html = ('    <a class="issue-seq-link prev" href="./issue-%d">'
                     '<span class="issue-seq-dir">← Previous</span>'
                     '<span class="issue-seq-name">Issue #%02d · %s</span></a>'
                     % (n - 1, n - 1, esc(all_titles[n - 1])))
    if n < 4:
        next_html = ('    <a class="issue-seq-link next" href="./issue-%d">'
                     '<span class="issue-seq-dir">Next →</span>'
                     '<span class="issue-seq-name">Issue #%02d · %s</span></a>'
                     % (n + 1, n + 1, esc(all_titles[n + 1])))
    else:
        next_html = ('    <a class="issue-seq-link next" href="/#access">'
                     '<span class="issue-seq-dir">Arc II →</span>'
                     '<span class="issue-seq-name">Issue #05 · Subscribe</span></a>')
    return ('  <div class="issue-seq">\n%s\n%s\n  </div>\n'
            % (prev_html, next_html)).replace('\n\n', '\n')


def build_page(n, parts, all_titles, feed, canon):
    meta = dict(ISSUES[n], **feed[n])
    panel = parts['panels'][n]
    display_title = extract(panel, 'reader-issue-title') or 'Issue #%d' % n
    title = canon[n]
    label = extract(panel, 'reader-issue-label')
    pages_txt = extract(panel, 'reader-pages')
    m = re.match(r'(\d+)', pages_txt)
    pages = int(m.group(1)) if m else 88

    url = '%s/read/%s' % (SITE, meta['slug'])
    head = build_head(n, meta, title, label, pages, chapter_jsonld(panel, url))

    # Every panel becomes the active one on its own page.
    panel = panel.replace('<div class="issue-reader-panel" id="panel-i%d">' % n,
                          '<div class="issue-reader-panel active" id="panel-i%d">' % n, 1)
    # "Open as its own page" is how the home page points here. On the page
    # itself it would be a link to the page you are already reading.
    panel = re.sub(r'\n\s*<a class="reader-permalink".*?</a>', '', panel, flags=re.S)

    body = []
    top = absolutise_hashes(to_subdir(parts['chrome_top']))
    top = top.replace('<a class="skip-link" href="/#hero">',
                      '<a class="skip-link" href="#read">', 1)
    body.append(top)
    body.append('\n<main id="issue-main">\n')
    body.append('''  <nav class="issue-crumbs" aria-label="Breadcrumb">
    <ol>
      <li><a href="/">Home</a></li>
      <li><a href="/#read">Read Free</a></li>
      <li aria-current="page">Issue #%02d</li>
    </ol>
  </nav>
''' % n)
    body.append('<section id="read" class="issue-standalone">\n')
    # The same depth photo the section carries on the home page.
    body.append('  <img class="section-photo-bg" src="../assets/corridor.webp" '
                'alt="" loading="lazy" aria-hidden="true">\n')
    # <h1>, not <h2>: on the home page the page's one top-level heading is the
    # hero title, but here the issue IS the page, so its title is the h1.
    body.append('''  <div class="read-header">
    <span class="read-free-badge reveal">✦ Free to Read — Issues 1 Through 4</span>
    <p class="section-label reveal">%s</p>
    <h1 class="section-title reveal">%s</h1>
  </div>
''' % (esc(label), esc(display_title)))
    body.append(issue_nav(n, title, all_titles))
    body.append(to_subdir(panel))
    body.append('\n')
    body.append(footer_nav(n, all_titles))
    body.append('</section>\n</main>\n')
    body.append(absolutise_hashes(to_subdir('\n'.join(parts['extras']) + '\n')))
    body.append(absolutise_hashes(to_subdir(parts['chrome_bottom'])))

    return ('<!DOCTYPE html>\n<html lang="en">\n<head>\n%s</head>\n'
            '<body data-page="issue" data-issue="%d">\n%s</body>\n</html>\n'
            % (head, n, ''.join(body)))


# ─────────────────────────────────────────────────────────────────── main


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true',
                    help='verify the built pages match index.html; do not write')
    args = ap.parse_args()

    html = open(SRC, encoding='utf-8').read()
    parts = slice_source(html)
    canon = read_canonical_titles(html)
    all_titles = canon
    feed = read_feed()

    os.makedirs(OUTDIR, exist_ok=True)
    stale = []
    for n in sorted(ISSUES):
        out = os.path.join(OUTDIR, ISSUES[n]['slug'] + '.html')
        page = build_page(n, parts, all_titles, feed, canon)
        if args.check:
            have = open(out, encoding='utf-8').read() if os.path.exists(out) else None
            if have != page:
                stale.append(os.path.relpath(out, ROOT))
            continue
        with open(out, 'w', encoding='utf-8') as f:
            f.write(page)
        print('wrote %-28s %7d bytes  (Issue #%d — %s)'
              % (os.path.relpath(out, ROOT), len(page.encode()), n, all_titles[n]))

    if args.check:
        if stale:
            print('out of date, re-run tools/build_pages.py:', ', '.join(stale))
            return 1
        print('all four issue pages are up to date with index.html')
    return 0


if __name__ == '__main__':
    sys.exit(main())
