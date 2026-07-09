# SneakersFest — 30 Premium Remotion Trailers

All 30 campaign trailers re-rendered with Remotion (React-based motion graphics),
upgrading every video from the first-pass Chromium pipeline to spring-physics
animations, per-wave background FX, and smoother transitions.

## Specs

- **Resolution**: 1080 x 1920 (9:16 vertical)
- **Duration**: 8 seconds (240 frames @ 30 fps)
- **Codec**: H.264 MP4
- **File size**: ~1.2-1.6 MB each

## Scene structure (all 30 videos)

| Frames | Scene | Animation |
|--------|-------|-----------|
| 0-20 | Slam word | Spring scale + radial particle burst + white flash |
| 20-70 | Hook lines | Staggered spring text + per-wave background FX |
| 70-112 | Beat 1 | Word-by-word spring reveal + accent progress bar |
| 112-152 | Beat 2 | ClipPath wipe reveal + underline bar |
| 152-198 | Brand reveal | SVG strokeDashoffset lace draw + letter cascade + zigzag strip |
| 198-240 | CTA | Spring scale chip + shine sweep + end pulse |

## Wave accents

- **Flame (#FF4D00)**: Videos 01-06, 20-23 — rising shoebox rects background
- **Volt (#D8FF3D)**: Videos 07-14, 24-27 — popping sticker shapes background
- **Grape (#6C4CF1)**: Videos 15-19, 28-30 — parallax dot grid background

## Source

Remotion project: `../pipeline/remotion/` (Trailer.tsx, Root.tsx, specs.json)
