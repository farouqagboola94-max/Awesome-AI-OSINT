# SneakersFest — 30-Video Launch Trailer Campaign

Production-ready marketing campaign for the SneakersFest launch: **30 trailer videos**, every one
built around a proven scroll-stopping hook, scripted shot-by-shot, and mapped to an exact
Higgsfield generation call so the whole batch can be fired as soon as credits are available.

## Contents

| File | What it is |
|------|-----------|
| `trailer-briefs.md` | All 30 trailer briefs — hook, script, shot beats, on-screen text, CTA, platform |
| `generation-manifest.json` | Machine-readable batch: one entry per video with model, preset, hook ID, prompt, aspect ratio, duration |

## ⚠️ Why the videos aren't rendered yet

The connected Higgsfield account has **5.62 credits**. Verified generation costs:

| Tier | Model | Cost/video | 30 videos |
|------|-------|-----------|-----------|
| Budget (fast text-to-video) | `kling3_0_turbo` | 7.5 cr | 225 cr |
| Premium (Marketing Studio ad, 15s + audio) | `marketing_studio_video` | 75 cr | 2,250 cr |

**Zero videos can be generated at the current balance.** Top up credits, then run the manifest.

### Planned spend (as split in the manifest — 1,305 credits)
- **16 premium videos** (75 cr each = 1,200 cr) — hero teasers, all 8 UGC preset-hook videos,
  the sneaker try-on, countdown, tour, and both closers (flagged `"tier": "premium"`).
- **14 budget clips** on `kling3_0_turbo` (7.5 cr each = 105 cr) — culture/FOMO clips where raw,
  native-feeling footage performs fine.
- To cut cost, any premium entry downgrades to budget (see manifest notes) — the all-budget
  floor for all 30 videos is **225 credits**.

## Campaign structure (full-funnel)

| Wave | Videos | Goal |
|------|--------|------|
| A. Hype / Announcement | 1–6 | Reach + brand awareness: cinematic teasers |
| B. UGC Pattern-Interrupt Hooks | 7–14 | Engagement: uses Higgsfield's preset hook library (Product Hit, Product Dodge, Epic Fail…) |
| C. Sneaker Culture & Try-On | 15–19 | Community: Virtual Try-On Sneakers preset, POV, ASMR |
| D. FOMO / Countdown | 20–23 | Urgency: dates, drops, limited passes |
| E. Experience Highlights | 24–27 | Consideration: what's inside the fest |
| F. Ticket Push / Retargeting | 28–30 | Conversion: direct CTA |

## Engagement hooks baked into every video

Every brief enforces the mechanics that drive watch-through and shares:

1. **0–2s pattern interrupt** — motion, impact, or an impossible image before any branding.
2. **Text hook on frame 1** — a curiosity-gap line ("They said it wouldn't fit in one city…"),
   readable with sound off.
3. **Open loop** — the payoff (date / location / headline drop) held until the final 2 seconds.
4. **Native format** — 9:16 for TikTok/Reels/Shorts, 8–15s, cuts every ≤2s.
5. **Single CTA** — one action per video ("Follow for the drop", "Link in bio — early passes").
6. **Sound-on reward** — bass hit / ASMR layer noted per brief for platforms where audio autoplay wins.

## How to run the batch (once credits are topped up)

For each entry in `generation-manifest.json`:

- **UGC preset videos** (`preset_slug` set): use Marketing Studio — create the SneakersFest
  product/brand entity once (`show_marketing_studio action='create'`), then generate with the
  listed preset + `hook_id`.
- **Direct generations**: call `generate_video` with the listed `model`, `prompt`,
  `aspect_ratio`, `duration`.
- Always preflight with `get_cost: true` before the batch and stop when the remaining balance
  drops below the next video's cost.
