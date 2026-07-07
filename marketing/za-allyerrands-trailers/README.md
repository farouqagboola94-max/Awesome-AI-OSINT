# Za.allyErrands — Launch Marketing Trailers

Three 18-second vertical (1080×1920, 9:16) motion-graphics trailers for the
Za.allyErrands launch in Dolphin Estate, Lagos. Built for Instagram Reels,
TikTok, WhatsApp Status, and YouTube Shorts.

## The videos

| File | Concept | Hook strategy |
|------|---------|---------------|
| `t1-stop.mp4` | **"STOP."** — Problem → Agitate → Solve | Pattern-interrupt one-word slam in frame 1, rapid-fire pain points (bank queue, market run, pharmacy trip), green wipe reveal, CTA card |
| `t2-live.mp4` | **"NOW LIVE"** — Launch anthem | Location tease ("something just landed"), 3-2-1 countdown, full-green brand burst, 6-item service carousel with counter, CTA |
| `t3-pov.mp4` | **"POV"** — How it works | POV curiosity hook, 3-step demo (WhatsApp chat bubbles → dispatch route animation → delivered check), payoff line "you did absolutely nothing" |

## Engagement hooks baked into every cut

- **0-second hook** — big text slams inside the first second (no logo intro).
- **A visual change every 1–2 seconds** — no static holds, keeps retention up.
- **Sound-off friendly** — everything is on-screen text; no dialogue needed.
- **Progress bar** along the top — signals "this is short, keep watching."
- **Counters / countdowns** (3-2-1, 01/06 services) — open loops that hold attention.
- **Loop-friendly endings** — final CTA frame cuts cleanly back into the opening slam on replay.
- **Single CTA** — "DM or WhatsApp to place your order" (no fake numbers/URLs; the
  Canva flyers still carry template placeholders like `reallygreatsite.com` — replace
  those before print).
- **Local specificity** — Dolphin Estate / Ikoyi / Lagos named on screen.

## Posting tips

1. Add a trending/upbeat audio track in the platform's editor when posting —
   videos are delivered silent on purpose so platform audio boosts reach.
2. Post T2 ("NOW LIVE") first as the announcement, T1 as the retargeting/problem
   ad, T3 as the explainer pinned to the profile.
3. Caption CTA should repeat the on-screen CTA and include the WhatsApp link.

## Regenerating / editing

Sources are plain HTML/CSS animations (`t*.html` + `shared.css`) rendered
frame-by-frame with Playwright and encoded with ffmpeg:

```bash
npm install playwright-core   # fonts: @fontsource/anton, @fontsource/archivo-black
node render.js t1-stop        # writes t1-stop.mp4
```

Edit the copy directly in the HTML files — every line of text is plain markup.
