# public/luxury — footage for the LuxuryReel

The sixteen shots were generated with Higgsfield (Kling 3.0 pro, 9:16, 5 s, silent; `chef` and
`champagne` with Seedance 2.5 at 1080p) and
`src/luxury/shots.ts` currently points at the CDN URLs Higgsfield returned, so `npm run dev`
plays them immediately. CDN links are not permanent — make them yours with:

```bash
node scripts/download-luxury-clips.mjs
```

It saves each clip here as `<shot id>.mp4` and rewrites `shots.ts` to the local paths.

To re-cast a shot, drop a new clip in here and point the shot at it:

```ts
{ id: "lambo-arch", label: "Lamborghini · hotel entrance", src: "luxury/lambo-arch.mp4", ... }
```

Set `src: null` on any shot to fall back to a procedural placeholder plate in that shot's
palette.

## The shot list (16 shots)

| id | Footage | Feel |
|---|---|---|
| `lambo-arch` | Supercar idling at a hotel / villa entrance at night | warm stone, amber lanterns |
| `chandelier` | Slow tilt across a crystal chandelier in a lounge | gold |
| `car-interior` | Cabin with ambient LED strips (violet / magenta) | violet |
| `eiffel` | Eiffel Tower lit at night, from a balcony | gold on navy |
| `skyline` | Rooftop / infinity pool with a city skyline | cool blue |
| `rolls-dash` | Rolls-Royce or Bentley dashboard, city out the window | cream / tan |
| `candlelit` | Table for two, candle, view behind | amber |
| `chef` | Private chef plating at a kitchen counter | warm white |
| `marina` | Yacht in a marina at sunset | pink / purple sky |
| `aerial` | City lights from the air at night | gold dots on black |
| `bar` | Cocktail bar, low light, bottles backlit | amber |
| `penthouse` | Penthouse window, city at night (also the end-card backdrop) | deep blue |
| `watch` | Macro of a watch face / cufflinks | silver |
| `jet` | Private jet on the tarmac, stairs down | grey-blue |
| `lobby` | Marble hotel lobby, slow walk-in | warm |
| `champagne` | Champagne pour, close | gold |

## Spec

- **Vertical 9:16** (1080×1920 or larger). Horizontal clips still work — the reel uses
  `object-fit: cover` and adds its own slow push/drift — but they crop hard, so frame for
  vertical when you shoot or download.
- **Dark and moody.** The grade darkens and warms everything; clips that are already bright
  and daylight will fight it.
- **At least 1.5 s per clip.** The longest single cut is 3.3 s (`penthouse` end-card); every
  other shot is used for ≤ 1.4 s. Use `trimStart` on a shot to pick the best moment.
- `.mp4` (H.264) or `.mov`, or a still `.jpg`/`.png` (the camera move makes a still feel like
  footage).

## Music

Put a track at `public/luxury/music.mp3` and set `music: "luxury/music.mp3"` in the
composition's default props (`src/luxury/LuxuryReel.tsx`) to bake it in. For Instagram
reach, the usual move is the opposite: **export silent and add a trending sound inside the
Instagram app** — that is exactly what the reference reel does (the attribution line under
the handle is IG's own audio overlay).
