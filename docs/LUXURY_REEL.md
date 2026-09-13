# LuxuryReel — a 30-second "High class." montage for Instagram

This guide explains how the reel is built, how to make it yours, and how to drive the whole
workflow through Claude Code instead of touching a video editor.

## What the reference does (and why it works)

The reference reel is not one video — it is roughly twenty 0.5–1.0 s clips of night-time
luxury (a supercar at a hotel arch, a chandelier lounge, an ambient-lit cabin, the Eiffel
Tower, a Rolls-Royce dashboard, a candlelit table) hard-cut together, with one serif line,
"High class.", pinned to the centre of every clip. Three things carry it:

1. **Rhythm.** Hard cuts at roughly one beat each. The cuts *are* the edit — no crossfades.
2. **Consistency.** Every clip is dark, warm, and shot at night, so wildly different
   locations read as one world.
3. **Restraint.** One caption, one typeface, no stickers, no motion graphics.

Think of it as a perfume ad: the product is a mood, and the montage is the bottle.

## How the composition is built

The reel lives in `src/luxury/` and is registered in `src/Root.tsx` as the `LuxuryReel`
composition (1080×1920, 30 fps, 900 frames = 30 s).

| File | Role |
|---|---|
| `shots.ts` | **The edit as data.** `SHOTS` is the footage library (id, label, `src`, palette, camera move). `CUT_LIST` is the order and length of every cut. |
| `Shot.tsx` | Renders one cut: the clip (or a placeholder plate), a light grade, and a slow push / pull / drift driven by `useCurrentFrame()`. |
| `Placeholder.tsx` | A procedural night plate (gradient + drifting bokeh) used for any shot whose `src` is still `null`, so the edit previews end to end before footage exists. |
| `Overlays.tsx` | The unifying layers: warm tint, top/bottom bands, vignette, per-frame film grain, the persistent caption, and the handle end-card. |
| `LuxuryReel.tsx` | Assembles it: one `<Sequence>` per cut, overlays on top, fade from/to black, optional music. Duration is derived from the cut list via `calculateMetadata`. |

The 30 seconds are shaped like a piece of music:

| Movement | Time | What happens |
|---|---|---|
| Establish | 0–13 s | every location once, 0.7–1.0 s each, opening on the hero shot |
| Build | 13–22 s | the same shots again at half a beat — the callback that makes a montage feel deliberate |
| Land | 22–27 s | slow back down |
| End-card | 27–30 s | caption hands over to your handle over the last shot |

Every visible thing is a prop, so the Studio props panel (or an agent) can change the
caption, handle, tagline, music, and even the shot list and cut list without editing code.

## Make it yours

1. **Footage.** The seventeen shots ship as Higgsfield-generated clips (Kling 3.0 pro, 9:16,
   5 s) referenced by URL in `src/luxury/shots.ts`. Run `node scripts/download-luxury-clips.mjs`
   once to store them in `public/luxury/` and switch the shot list to local files. To re-cast
   a shot, drop a new clip in and change its `src`; see `public/luxury/README.md`. Any shot
   with `src: null` renders as a placeholder plate.
2. **Caption and handle.** Edit `defaultLuxuryReelProps` in `src/luxury/LuxuryReel.tsx`, or
   change them live in the Studio props panel.
3. **Re-cut.** Reorder or retime `CUT_LIST`. Keep cuts between 0.5 and 1.4 s for the montage
   sections; the composition length follows the list automatically.
4. **Music.** Either bake a track in (`music: "luxury/music.mp3"`) or, for reach, export
   silent and add a trending sound in the Instagram app.

## Preview and render

```bash
npm run dev                                   # Remotion Studio — scrub the timeline, edit props live
npx remotion still LuxuryReel --frame=300 --scale=0.25 out/check.png   # one frame, fast
npx remotion render LuxuryReel out/luxury-reel.mp4                     # the full 30 s MP4
npm run lint                                  # eslint + tsc, the project's verification gate
```

The MP4 is H.264, 1080×1920, ready to upload to Instagram as a Reel.

## Driving it through Claude Code

Remotion turns video into code, and Claude Code edits code — so the loop becomes a
conversation instead of a timeline scrub. Open the repo in Claude Code and talk to it like
an editor:

- *"Swap the caption to 'Old money.' and make the end-card tagline 'Est. 2026'."*
- *"Drop `public/luxury/lambo.mp4` into the `lambo-arch` shot, starting 2 s in."*
- *"Make the build section faster — every cut 0.4 s — and add a slow 2 s hold on the
  chandelier before the end-card."*
- *"Render frame 450 at quarter scale so I can check the grade."*
- *"Render the full reel and tell me the file size."*

Under the hood it edits `shots.ts` or `LuxuryReel.tsx`, runs `npm run lint`, renders a
still or the MP4 with `npx remotion still` / `npx remotion render`, and reports back. The
project's `CLAUDE.md` and `.agents/skills/` already teach it the Remotion rules (frame-driven
animation only, `staticFile()` for assets, `<Sequence>` for timing), so the output renders
correctly rather than only looking right in a browser.

Two practical notes for Claude Code on the web (the remote container):

- Remotion downloads its own headless Chrome on first render, which a locked-down network
  may block. Point it at an installed browser instead:
  `npx remotion render LuxuryReel out/reel.mp4 --browser-executable=/path/to/chrome`.
- Fonts load from Google Fonts at render time (see `docs/FONTS.md`), so the render machine
  needs outbound access to `fonts.googleapis.com` / `fonts.gstatic.com`.

## Variations that keep the format

- **Different mood, same engine:** change the `look` palettes in `shots.ts` (all cool blues
  for "quiet luxury", all reds for "after dark").
- **Series:** keep the cut list, swap the sixteen `src` values per city — Paris, Dubai, Monaco.
- **Text-led:** set a different `caption` per post; the footage can stay the same.
