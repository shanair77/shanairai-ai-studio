# public/luxury — footage for the LuxuryReel

Drop your clips in here, then point each shot at them in `src/luxury/shots.ts`:

```ts
{ id: "lambo-arch", label: "Lamborghini · hotel entrance", src: "luxury/lambo-arch.mp4", ... }
```

Until a shot has a `src`, the reel renders a procedural placeholder plate in that shot's
palette so the cut, caption, and grade can still be previewed.

## What to collect (16 shots)

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
