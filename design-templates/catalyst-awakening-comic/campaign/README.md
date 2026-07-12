# Catalyst · Sneakers Fest 2026 Campaign

Complete marketing arsenal for **Catalyst: The Awakening** — a Lagos noir comic universe.

## What's inside

| Pack | Count | Format | Details |
|------|-------|--------|---------|
| **Launch trailers** | 3 | 1080×1920 MP4 · silent | Kinetic typography, brand-timed. Add trending audio at post time. |
| **Motion 20-pack** | 20 | 1080×1920 MP4 · with beats | Punchy motion graphics with procedurally-generated afro-house percussion. |
| **Cinematic 40-pack** | 40 | 1080×1920 MP4 · scored | Ken Burns treatments of existing 4K artwork with letterbox, film grain, and synthesized cinematic scores. |
| **Brand IP Kit** | 58 files | SVG · CSS · JSON · HTML · Markdown | Full identity system: logos, tokens, social templates, print, brand book, Canva/Express-ready. |

## Directory

```
campaign/
├── trailers/           3 launch trailers (silent, add audio at post)
├── motion-pack/        10 motion-graphics videos with afro-house beats
├── cinematic/          20 cinematic scored videos over 4K comic art
├── brand-kit/          50-asset brand identity kit (SVG, tokens, templates)
└── source/             HTML timelines + fonts to reproduce all videos
    ├── pipeline/       Renderer, animation runtime, procedural audio
    ├── videos/         All animation timelines (.html)
    └── fonts/          Bebas Neue · Oswald · Space Grotesk · Crimson Pro
```

## Trailers

- **trailer-01-awakening.mp4** (14s) · "Lagos never sleeps → the Awakening"
- **trailer-02-bloodline.mp4** (16s) · "1478 → 1861 → 2026 · The bloodline"
- **trailer-03-mushin.mp4** (15s) · "19 · 5 · 1 · No capes. Only Lagos."

## Motion pack (20)

01. Read Chapter One · 02. Meet Bayo · 03. Five Gods · 04. Coordinates · 05. Free Forever · 06. Four Issues · 07. Made in Lagos · 08. Issue 5 teaser · 09. Which Orisha are you? · 10. Editorial quote

**Part two (11–20)**: 11. Meet Amara · 12. Meet Ikenna · 13. Meet Zara · 14. This Isn't Marvel (differentiation hook) · 15. Five Powers explainer · 16. Social proof stats · 17. Tap to Unlock · 18. Release Log calendar · 19. Poll Results (follow-up to #9) · 20. Follow for More outro

## Cinematic pack (40)

Ken-Burns-treated cinematics of existing 4K art.

**Chapters 1–20**: `mushin-3am`, `forge`, `shipyard`, `corridor`, `industrial`, `flares`, `intersection`, `circle`, `bayo-portrait`, `bayo-bridge`, `amara-portrait`, `ikenna`, `zara-portrait`, `zara-raw`, `battle-raw`, `team-aurora`, `team-highway`, `team-constellation`, `lagos-spirits`, `cover-finale`.

**Chapters 21–40** (part two — issue covers + epilogue beats): `issue-one` through `issue-four`, `amara-awakening`, `first-orisha`, `lagos-eternal`, `orisha-rising`, `the-strike`, plus 11 reused locations (`forge`, `shipyard`, `corridor`, `industrial`, `flares`, `intersection`, `circle`, `battle-raw`, `team-highway`, `lagos-spirits`, `noir-window`) re-treated with new crops, washes, and captions for a distinct "part two" arc.

## Brand kit

See `brand-kit/README.md` and `brand-kit/ASSET-INDEX.md` for the full 58-file list. Highlights:

- **Logos**: 10 SVG variants (primary/reversed/mono/stacked/horizontal + 4 marks)
- **Tokens**: JSON, CSS, SCSS, JS
- **Social**: 10 Instagram post + story templates
- **Platform**: Twitter/YouTube/TikTok/Discord/LinkedIn covers
- **Print & merch**: T-shirts, A2 poster, sticker sheet, enamel pin, business cards
- **Brand book**: Full HTML brand book + written guidelines + voice & tone
- **Canva/Adobe Express**: 5 import-ready HTML templates
- **Email**: newsletter header · signature · announcement banner
- **Utility**: presentation cover, convention badge, signature card, web hero, favicon

## Reproducing the videos

All video timelines are deterministic and reproducible. From `source/`:

```
node pipeline/render.mjs videos/trailer-01-awakening.html out.mp4 14000 30
```

The renderer walks each timeline frame-by-frame in Chromium and pipes JPEGs to `ffmpeg` → h264 MP4. All audio is synthesized in `pipeline/beats.py` (afro-house percussion + drone-based cinematic scores).
