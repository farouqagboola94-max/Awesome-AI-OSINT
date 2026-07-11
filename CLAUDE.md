# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This repo serves two distinct purposes that live side by side:

1. **An "awesome list"** (`README.md`) — a curated list of articles, videos, and tools related to using AI for OSINT (open-source intelligence). Forked from `ubikron/Awesome-AI-OSINT`.
2. **A static website** (`design-templates/catalyst-awakening-comic/`) — "Catalyst: The Awakening", a Lagos noir comic universe site rooted in Yoruba mythology, deployed to Netlify at `https://catalyst-awakening.netlify.app`.

There is no build system, package manager, test suite, or linter. Everything is hand-authored static content.

## Repository structure

```
README.md                                  # The awesome list (curated links)
netlify.toml                               # Netlify deploy config: publish dir + cache/security headers
design-templates/
  catalyst-awakening-comic/
    index.html                             # The entire website — single ~18,000-line self-contained file
    favicon.svg
    robots.txt
    sitemap.xml
    assets/                                # WebP/JPG artwork (covers, character portraits, backgrounds)
    images/                                # Additional PNG character art
```

## The Catalyst Awakening website

### Architecture

- **Single-file site**: all HTML, CSS (`<style>` blocks), and JavaScript (`<script>` blocks) live in `index.html`. There are no external CSS/JS files, no framework, no build step.
- The page is organized as a long scroll of `<section id="...">` blocks: `hero`, `manifesto`, `universe`, `lagos-map`, `locations`, `characters`, `panels`, `mission-dispatch`, `oracle-terminal`, `ase-scanner`, `cover-gallery`, `artwork-gallery`, `wanted-board`, `threat-war-room`, `villains`, `faction-dossiers`, `power-tier`, `ase-battle`, `power-clash`, `hero-quiz`, and more. Locate a feature by grepping for its `section id=`.
- Interactive features (quizzes, battle simulators, terminals) are implemented in vanilla JS inside inline `<script>` tags.
- SEO metadata (title, description, Open Graph, Twitter cards) is maintained in the `<head>`; keep it in sync with content changes. `sitemap.xml` and `robots.txt` point at the Netlify URL.

### Deployment

- Netlify publishes `design-templates/catalyst-awakening-comic` directly (see `netlify.toml`); there is no build command. Pushing to the deployed branch is what ships changes.
- `netlify.toml` sets cache headers: HTML always revalidates, `/assets/*` are cached immutable for 1 year. **Because assets are immutable-cached, replace an image by adding a new filename rather than overwriting an existing one**, or returning visitors will keep seeing the old file.
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) are also defined in `netlify.toml` — preserve them when editing.

### Conventions

- Artwork lives in `assets/` (mostly `.webp` for covers/portraits, `.jpg` for photographic backgrounds) and `images/` (`.png` character art). Prefer WebP for new artwork.
- Content is thematically consistent: Yoruba mythology (Orishas — Ṣàngó, Ògún, Obatàlá), Lagos locations (Mushin, etc.), noir tone. Keep diacritics in Yoruba names intact.
- Inline styles are common on section tags; match the existing dark palette (blacks, deep reds like `rgba(196,30,58,...)`).

## The awesome list (README.md)

- Follow standard awesome-list conventions: entries are `[Title](URL)` links with two trailing spaces for line breaks, grouped under `##`/`###` headings (Articles and videos → per-tool subsections like ChatGPT, Grok, Claude; Tools; etc.).
- Add new entries to the appropriate existing section rather than creating new top-level sections.
- Do not remove existing entries when adding new ones.

## Git workflow

- Default branch: `main`. Work happens on `claude/*` feature branches which are then merged.
- Commit messages use conventional-commit style prefixes (`feat:`, `chore:`) with a short imperative description.
