# SneakersFest — 30 Rendered Marketing Trailer Videos

Thirty ready-to-post vertical trailer videos (1080×1920, 9:16, 8s, 24fps, H.264 MP4),
rendered as branded motion-graphics from the campaign briefs in `../trailer-briefs.md`
and the brand IP system in `../brand-ip/`.

## Engagement structure (every video)

| Time | Phase | Hook mechanic |
|------|-------|---------------|
| 0.0–0.5s | Slam word | Pattern interrupt: one word slams in with a white flash |
| 0.5–2.2s | Hook line | Curiosity-gap text on brand accent, speed lines, camera shake |
| 2.2–5.0s | Two beat cuts | Hard cuts, alternating Court Black / Chalk backgrounds |
| 5.0–6.5s | Brand reveal | Lace Loop mark draws itself in, wordmark pops, tread strip slides |
| 6.5–8.0s | CTA | One CTA chip + "SEE YOU ON THE FLOOR." + end pulse |

All videos are sound-off-first (text carries the message). Add a trending track on
TikTok/Reels at post time for the sound-on layer — silent masters keep music licensing
flexible per platform.

## Waves

- `01–06` Hype/announcement (Flame) · `07–14` UGC hooks (Volt) · `15–19` Culture (Grape)
- `20–23` FOMO/countdown (Flame) · `24–27` Experience (Volt) · `28–30` Ticket push (Grape)

## Upgrade path

These are the zero-credit motion-graphics masters. To upgrade any of them to filmed-style
AI footage, run the matching entry in `../generation-manifest.json` on Higgsfield once
credits are topped up (7.5 cr budget / 75 cr premium per video) — same hooks, same copy.

Render pipeline (reproducible): `/home/user/render/` — `template.html` (deterministic
frame renderer) + `specs.json` (per-video copy) + `render.mjs` (headless Chromium →
ffmpeg H.264). Re-render everything with `node render.mjs`, or one video with
`node render.mjs <id>`.
