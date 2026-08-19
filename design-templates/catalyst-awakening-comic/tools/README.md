# Tools

Two independent tools live here.

- `build_pages.py` — composes the standalone per-issue reader pages
- `panel_prompt_forge.py` — an art-direction prompt loop for Arc II panels

---

# build_pages.py — the per-issue reader pages

`index.html` carries all four free issues in a tabbed reader. That is right
for someone browsing the site, and wrong for everything else: every issue
shared the home page's title, description and share image, so a link to
Issue #2 previewed as "Catalyst: The Awakening — Free Lagos Noir Comic",
and a search engine had one URL to rank for four stories.

This script gives each issue its own page — `/read/issue-1` … `/read/issue-4` —
with its own `<title>`, description, canonical URL, `ComicIssue` structured
data, breadcrumb, `rel=prev`/`rel=next`, and its actual cover as the share
image. The tabbed reader on the home page stays exactly as it was; the two
are alternative routes to the same story, and each panel now carries a link
out to its own page.

## Usage

```bash
python3 tools/build_pages.py           # write read/issue-{1..4}.html
python3 tools/build_pages.py --check   # exit 1 if they are stale (no writes)
```

**Run it after editing anything shared.** The nav, the footer, every modal,
the script tags and the story markup are all sliced out of `index.html` at
build time, so a change there does not reach the issue pages until this runs.
`--check` is the guard: it rebuilds in memory and compares, so it fails
loudly rather than letting the two drift.

## Where each fact comes from

Nothing about an issue is written down twice. The script only knows each
issue's slug and cover filename; everything else it reads back out of a file
that already holds it:

| Fact | Source |
| --- | --- |
| Story markup, cover art, page count | the `#panel-iN` block in `index.html` |
| Displayed title (caps, e.g. `ṢÀNGÓ'S DAUGHTER`) | the panel's `.reader-issue-title` |
| Proper-case title (`Ṣàngó's Daughter`) | the `ComicSeries` JSON-LD in `index.html` |
| Synopsis and publication date | the matching `<item>` in `feed.xml` |

The two titles are separate on purpose: the caps form is a design choice that
belongs on the page and reads badly in a `<title>` tag or a share card, and
case-folding it back is not safe for Yoruba diacritics.

## Things that bite

- **`nav` is styled by class, not element.** A bare `nav {}` rule used to make
  every `<nav>` on the site a fixed, full-width, z-index-1000 bar. The
  breadcrumb added here became an invisible overlay that swallowed every
  click on the page. The rule is now `nav:not([class]), .mobile-nav`.
- **Top-level code in `script.js` must be guarded.** It is one IIFE shared by
  all five pages; an unguarded `document.querySelector(...).foo` throws and
  silently kills every module defined below it. That is what the marquee
  clone did.
- **Not every overlay is in the chrome blocks.** A few sit between content
  sections — `EXTRA_CHROME` lists the ones the reader needs. Only move an
  overlay that is positioned against the page; `#aseLevelUp` is
  `position:absolute; inset:0` against its parent card and would cover the
  viewport if lifted out.
- **Netlify's SPA catch-all rewrites everything to `index.html`.** An explicit
  `/read/:slug` rule sits ahead of it in `netlify.toml`, and a `/read/*`
  headers block gives the extensionless URLs their CSP.

---

# panel_prompt_forge.py — Panel Prompt Forge

An execute → verify → iterate loop for drafting art-direction prompts that
stay visually consistent with the CatalystVerse style bible — built for
Arc II and beyond, where dozens of artists/panels need to look like one
continuous world.

## How it works

- **Writer Node** drafts (or revises) a prompt for a scene.
- **Director Node** checks it deterministically against `style_bible.json`
  — required visual tags per scene type, a banned-phrase list, and a
  minimum length — and returns specific, actionable feedback on failure
  ("missing: purple-gold light, Yoruba script overlay").
- The loop feeds Director feedback back into the Writer until the prompt
  passes or `--max-attempts` is hit (default 5).
- Every **approved** prompt is appended to `ledger.json`. On the next run
  for the same `scene_type`, the Writer is shown 1-2 past approved
  prompts as exemplars — so quality compounds across sessions instead of
  starting cold every time. This is the same principle as reinforcement
  learning's experience replay: sample stored past outcomes to steer
  future generation, rather than only ever reacting to the newest input.

## Usage

```bash
# See available scene types
python3 panel_prompt_forge.py --list-scene-types

# Draft a prompt (simulation mode — no API key needed, deterministic, free)
python3 panel_prompt_forge.py "Bayo faces the Architect" --scene-type character_reveal

# Draft with the real Claude API (better prompts, costs tokens)
export ANTHROPIC_API_KEY=sk-...
pip install anthropic
python3 panel_prompt_forge.py "The Balogun Bleed opens over the market" --scene-type orisha_manifestation
```

## Extending the style bible

Edit `style_bible.json` as new visual motifs get established in canon —
it's the single source of truth for "does this panel look like our
universe." Each `scene_types` entry has:

- `required_tags` — what the Director enforces (keep this scene-appropriate;
  don't just copy the global `base_tags` into every scene type)
- `flavor_pool` — suggested details fed to the Writer, not enforced
- `description` — when to use this scene type

`banned_phrases` catches generic-superhero drift; `min_prompt_length`
catches technically-tag-stuffed one-liners that pass the tag check but
aren't actually a usable prompt.

## Files

- `panel_prompt_forge.py` — the loop
- `style_bible.json` — required tags, flavor pool, and banned phrases per scene type
- `ledger.json` — every approved prompt ever produced (the replay buffer); starts empty, grows with use
