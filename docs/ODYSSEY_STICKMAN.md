# OdysseyStickman

A ~97 s, 1080×1920 faceless stickman cartoon: Odysseus's journey from Ithaca to Troy and
back home. Everything is drawn in code (SVG). It uses no footage, no AI generations and no
network fonts.

```bash
npx remotion render OdysseyStickman out/OdysseyStickman.mp4
npx remotion still OdysseyStickman --frame=700 --scale=0.4   # spot-check one frame
```

## Files

| File | What it holds |
| --- | --- |
| `src/odyssey/OdysseyStickman.tsx` | `STORY` (beats: chapter, seconds, years, narration), HUD, word-by-word narration card, boiling-ink filter |
| `src/odyssey/scenes.tsx` | One component per beat, each a pure function of its local frame |
| `src/odyssey/Stickman.tsx` | Pose-driven faceless stick figure + pose library (walk, run, cheer, row, sit…) |
| `src/odyssey/Props.tsx` | Sea, ships, Troy's walls, the wooden horse, Cyclops cave props, pigs, Scylla, whirlpool… |
| `src/odyssey/fonts.generated.ts` | Patrick Hand (OFL) and Permanent Marker (Apache 2.0), embedded as base64 |

## Editing

- **Re-time or rewrite a beat:** edit its entry in `STORY`. The composition length follows.
  Scene animations are keyed to frame numbers inside each scene, so if you shorten a beat a
  lot, check its scene's timings too.
- **Characters have no faces.** They are told apart by costume: Odysseus has a red crest and
  cape, Penelope a blue dress, and the beggar disguise is a brown hood.
- **Voiceover:** the video is silent and the narration is on-screen. To add a voice, generate
  narration audio, drop it in `public/odyssey/`, and add an `<Audio>` from `@remotion/media`
  per beat (or one track for the whole video, re-timing `seconds` to match).
