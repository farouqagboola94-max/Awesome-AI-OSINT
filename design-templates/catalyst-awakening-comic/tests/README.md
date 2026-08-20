# Site checks

The site is hand-written HTML, CSS and JavaScript with no build step and no
runtime dependencies. That is a deliberate choice, and it has a cost: there is
no compiler to tell you that a CSS selector now matches more than you meant,
or that a dialog is still in the tab order while invisible. These checks are
that compiler.

Every assertion here corresponds to a bug that actually shipped. None of them
were written speculatively.

## Running them

```bash
npm install && npx playwright install chromium   # once

npm run check:pages   # issue pages still match index.html
npm test              # browser checks (all suites)

node design-templates/catalyst-awakening-comic/tests/run.js a11y   # one suite
python3 design-templates/catalyst-awakening-comic/tests/validate_static.py
```

`npm` commands run from the repository root, where `package.json` lives — kept
out of the published directory so `node_modules` is never deployed.

CI runs all four steps on any change under the site directory
(`.github/workflows/site-checks.yml`).

## What each part covers

| File | Covers |
| --- | --- |
| `validate_static.py` | XML well-formedness, JSON-LD parses, no page links to a missing local file, sitemap and feed point at pages that exist, each page's canonical URL matches its own path |
| `issue-pages.test.js` | The four generated pages: per-issue metadata and structured data, the story renders, shared chrome survived the slice, JS modules initialise against a one-panel DOM, navigation and deep links between pages |
| `home.test.js` | index.html is unharmed by changes made for the issue pages: nav geometry, mobile nav, the tabbed reader, search, deep links cold and warm, no horizontal overflow |
| `a11y.test.js` | Invariants on all five pages: no invisible dialog is keyboard-reachable, one `h1` and it comes first, no placeholder headings, every visible control has a name, every dialog has an accessible name |

## The bugs these exist to prevent

- **A bare `nav {}` rule.** Every `<nav>` on the site became a fixed,
  full-width, z-index-1000 bar. A semantic breadcrumb added to an issue page
  turned into an invisible overlay covering the page and swallowing every
  click. Caught now by the nav-geometry and viewport-centre checks in
  `home.test.js`.
- **`opacity: 0` used as "hidden".** Five dialogs closed without
  `visibility: hidden`. Opacity does not remove anything from the
  accessibility tree, so those dialogs stayed in the tab order and were
  announced by screen readers — sixteen phantom tab stops on the home page,
  with nothing visibly wrong. This is the check to keep.
- **Unguarded top-level code in `script.js`.** It is one IIFE shared by all
  five pages; an unguarded `document.querySelector(...).foo` throws and
  silently kills every module defined below it. The "no JS errors" and
  "module live" assertions cover this.
- **Generated pages drifting from their source.** `--check` rebuilds in
  memory and compares, so an edit to shared chrome that was never re-generated
  fails loudly instead of shipping a stale page.

## Writing a new check

Put it in the suite it belongs to, then **prove it fails**: reintroduce the
bug, watch it go red, restore. A regression test that cannot fail is worse
than no test, because it reads like coverage.

Third-party scripts (Supabase, Paystack, the CDN copy of three.js) are blocked
during tests — they are unreachable from CI, and the site is built to work
without them, so blocking keeps a failure a real finding rather than a
network timeout.
