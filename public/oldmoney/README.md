# public/oldmoney — footage for the OldMoneyReel

Thirty-six shots generated on Higgsfield (Kling 3.0 pro, 9:16, 5 s, silent) for the
"Old money." estate reel. `src/oldmoney/shots.ts` points at `<shot id>.mp4` here. The media is
gitignored; regenerate any missing shot from the table below with the prompt skeleton in
`.claude/skills/montage-reel/SKILL.md` (late-afternoon golden hour, misty English country estate,
soft warm low sun, muted greens and cream, no text, no people) and drop it in as `<id>.mp4`.

Set `src: null` on any shot to fall back to a procedural placeholder plate in that shot's palette.

## The shot list (36 shots)

| id | Footage | Palette |
|---|---|---|
| `manor-drive` | Gravel drive · stone manor | honey |
| `library` | Oak library · brass lamp | oak |
| `horse-paddock` | Bay horse · misty paddock | mist |
| `tea-service` | Silver tea service · linen | cream |
| `vintage-bentley` | Vintage Bentley · gravel | moss |
| `staircase` | Sweeping staircase · afternoon | oak |
| `lake` | Still lake · boathouse | slate |
| `tweed` | Tweed and gloves · hall chair | burgundy |
| `topiary` | Yew topiary · long shadows | moss |
| `great-hall` | Great hall · stone fireplace | brass |
| `pocket-watch` | Pocket watch · leather desk | brass |
| `rose-garden` | Walled rose garden · dew | burgundy |
| `croquet` | Croquet lawn · dusk | moss |
| `conservatory` | Conservatory · ferns · mist | mist |
| `decanter` | Crystal decanter · sideboard | honey |
| `chapel` | Estate chapel · evening | slate |
| `gates` | Wrought-iron gates · mist | mist |
| `riding-boots` | Riding boots · boot room | oak |
| `manor-aerial` | Manor and parterre · aerial | honey |
| `letter-desk` | Fountain pen · wax seal · hands | cream |
| `stables` | Stable block · brick arches | brass |
| `dining-table` | Long table · candelabra | honey |
| `labrador` | Labrador · country kitchen | oak |
| `fountain` | Stone fountain · courtyard | cream |
| `gallery` | Gilt frames · long corridor | brass |
| `rowing-boat` | Wooden rowing boat · lake | slate |
| `orangery` | Orangery · citrus in terracotta | moss |
| `whisky-study` | Cut crystal · leather chair · fire | burgundy |
| `hedgerow-lane` | Hedgerow lane · sun through mist | moss |
| `signet-ring` | Signet ring · mahogany dresser | brass |
| `greenhouse` | Victorian greenhouse · condensation | mist |
| `cricket` | Cricket pavilion · dusk | cream |
| `lantern-walk` | Gas lanterns · gravel path · dusk | honey |
| `four-poster` | Four-poster · leaded windows | cream |
| `deer-park` | Red deer · misty park · dawn | mist |
| `manor-dusk` | Manor at dusk · windows lit | slate |

## Spec

- **Vertical 9:16**, 1080×1920, ≥ 1.5 s per clip (the longest cut is the 3.3 s end-card hold).
- **Daylight, soft and misty.** The grade desaturates and adds a parchment tint; harsh midday
  sun or saturated colour will fight it.
- `.mp4` (H.264) or `.mov`, or a still `.jpg`/`.png`.

## Music

Export silent and add a sound in the Instagram app, or set `music: "oldmoney/music.mp3"` in
`defaultOldMoneyReelProps`.
