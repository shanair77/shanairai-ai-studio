---
name: montage-reel
description: >-
  Build a new 30-second vertical Instagram montage reel in the LuxuryReel format — dozens of
  hard-cut, AI-generated mood clips under one persistent caption, ending on a handle end-card —
  or re-cut / re-caption the existing one. Use this whenever the user asks for "another reel like
  LuxuryReel", "a reel like the luxury one", a montage / mood reel / aesthetic reel / vibe reel for
  Instagram or TikTok, a "[Theme]." style caption video, or wants to change the caption, handle,
  tagline, footage, or cut rhythm of a montage reel — even if they never say "montage" or
  "LuxuryReel". It covers the theme brief, generating a 36-shot library on Higgsfield, the
  no-repeat cut list, download + gitignore conventions, lint, render, and phone-sized delivery.
  Not for narrated commercials with a protagonist (use ad-production-pipeline) or single clips.
metadata:
  tags: reel, montage, instagram, tiktok, vertical, remotion, higgsfield, kling, luxury, mood
---

# Montage Reel (the LuxuryReel format)

A montage reel is a perfume ad without the perfume: ~38 hard cuts of atmospheric footage, each
0.5–1.4 s, all graded to one mood, with a single serif caption pinned to the centre and a handle
end-card at the tail. The reference is `src/luxury/` (composition id `LuxuryReel`), documented in
`docs/LUXURY_REEL.md` and `public/luxury/README.md`. Read those two files before starting — the
edit is **data**, and this skill is mostly about producing the data well.

The reel lives in two places:

- `src/<reel>/shots.ts` — `SHOTS` (the footage library: id, label, `src`, palette, camera move)
  and `CUT_LIST` (order + seconds). Everything else in `src/<reel>/` is the engine and rarely
  needs touching.
- `defaultLuxuryReelProps` in `src/<reel>/LuxuryReel.tsx` — `caption`, `handle`, `tagline`,
  `music`, `endCardSeconds`.

## Decide which job this is

1. **A variant of an existing reel** (new caption, new rhythm, same footage): edit props and
   `CUT_LIST`, lint, render. Ten minutes. Skip to "Cut list" and "Render + deliver".
2. **A new reel with new footage**: copy `src/luxury/` to `src/<reel>/`, rename the exports,
   register a new `<Composition>` in `src/Root.tsx`, then follow every section below.

If the user only gave a theme, decide the caption, handle, tagline and mood yourself from the
brief and state them in the first message — they are cheap to change and expensive to ask about.

## Why 36 shots

The first LuxuryReel shipped with 16 clips and a 38-cut list, so every clip played three times and
the viewer noticed. Variety is the whole product here. Target **36 distinct shots for a 30 s
edit**: 16 for the opening "establish" movement, 16 for the faster "build", 4 for the "land",
and allow exactly two deliberate repeats — the hero shot as a callback near the end, and the shot
that holds under the end-card. Fewer shots and it feels like a loop; many more and none of them
register.

## Shot brief → prompts

Write the shot list first, as a table of `id`, one-line subject, palette, camera move. Aim for
variety on three axes at once: **scale** (macro object, interior, exterior, aerial), **subject
class** (vehicle, drink, architecture, texture, skyline, water, hands-only human touch), and
**palette** (rotate through the reel's 6–8 `ShotLook`s so no two adjacent cuts share one).

Turn each row into a prompt with this skeleton — it is what kept the LuxuryReel clips reading as
one world despite 36 different locations:

```
Vertical cinematic shot, [time of day], [mood words], [light quality], shallow depth of field,
slow [push-in | pull-out | lateral drift | upward tilt]. [One sentence of subject: what, where,
what the light does]. Photoreal, 35mm film look, no text, no people.
```

Keep "no text" (models love to invent signage) and "no people" (a stray face breaks the
anonymity that lets a viewer project themselves in). Where a human touch is wanted, say
"hands only … no faces". Name the camera move in the prompt **and** in the shot's `motion` field
so the composition's own slow move reinforces rather than fights the footage.

For a night/warm reel: "night, dark and moody, warm practical light". For a daylight reel say so
explicitly ("overcast morning, soft diffuse light, muted greens and cream") **and** retune the
`ShotLook` palettes and the `Grade` tint in `Overlays.tsx`, or the grade will fight the footage.

## Generate on Higgsfield

Use the Higgsfield MCP (`generate_video_batch`, up to 12 per call, then `jobs_wait` in groups of
≤12). Settings that match the shipped library, so new clips cut seamlessly with old ones:

| setting | value | why |
|---|---|---|
| model | `kling3_0` | what the library was shot on |
| mode | `pro` | std is visibly softer |
| sound | `off` | the reel is silent; halves the price |
| aspect_ratio | `9:16` | 1080×1920 native, no crop |
| duration | `5` | every cut is ≤ 1.4 s, 5 s leaves room for `trimStart` |

Cost is **7.5 credits per clip** at these settings (quote it once with `get_cost: true`; check
`balance` first). Thirty-six clips ≈ 270 credits; twenty ≈ 150. State the total before submitting
and stop if the balance cannot cover it.

Two things the API does that look like failures but are not:

- A batch item may come back `submission_failed` with a **preset recommendation** ("IN THE
  DARK" or similar). Nothing was charged. Resubmit that item with `declined_preset_id` set to the
  preset id and it goes through.
- `jobs_wait` reports `type: "image"` while a video job is in progress. Ignore it; the terminal
  result is a video URL. Clips take 3–6 minutes; poll both groups in the same turn.

While jobs run, do the work that does not depend on them: write `shots.ts` entries pointing at
`<reel>/<id>.mp4`, write the cut list, update the README table, run `npm run lint`.

## Download and store

`scripts/download-luxury-clips.mjs` only rewrites shots whose `src` is an `https://` URL. When
you already wrote local paths, download with curl straight into `public/<reel>/<id>.mp4` using
**absolute paths** (a `cd` inside a chained command plus backgrounded curls silently writes to
the wrong place — it happened). Verify every file with `ffprobe` (expect 1080×1920, ~5.04 s).

Footage never goes in git. Add `public/<reel>/*.mp4` (and mov/webm) to `.gitignore`, keep
`public/<reel>/README.md` tracked with the shot table so the folder can be rebuilt. This matches
LuxuryReel and every other commercial in the repo.

Make a contact sheet before rendering — one frame at 2.5 s from each new clip, tiled 5 wide — and
look at it. This ffmpeg lacks `drawtext`, so tile in a known order and read it back by position.
Re-roll anything that has text, a face, daylight in a night reel, or reads as a different world.
One abstract macro in 36 is fine; two adjacent ones are a dead spot.

## Cut list

Three movements, like a piece of music. Seconds are exact; the composition derives its duration
from the list, so the total must be **30.0** (or whatever length was asked).

| movement | cuts | seconds each | footage |
|---|---|---|---|
| establish | 16 | 0.7–1.4, hero shot longest first | shots 1–16, every location once |
| build | 16 | 0.5–0.6 alternating | shots 17–32, nothing seen yet |
| land | 4 + 1 + 1 | 0.8–1.2, slowing | 4 fresh shots, hero callback, end-card hold 3.3 |

Never cross-fade; hard cuts are the language. Don't put two cuts of the same palette or the same
subject class back to back. After writing, verify by script: count of cuts, count of distinct
shots, and the sum of seconds — do not eyeball it.

## Render + deliver

```bash
npm run lint                                    # eslint + tsc, the project gate
npx remotion render <CompId> out/<reel>.mp4     # ~3 min for 900 frames once clips are local
open out/<reel>.mp4
```

The full render is ~32 MB, just over the 30 MB limit for sending to phone/web viewers. Always
also produce a phone copy and send that:

```bash
ffmpeg -y -i out/<reel>.mp4 -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart out/<reel>-phone.mp4
```

Music: export silent by default. Instagram reach comes from adding a trending sound in-app; a
baked-in track only matters for a client deliverable (`music: "<reel>/music.mp3"`).

## Commit

Commit source, docs, README, gitignore and the Root registration; never the media. Before
committing, export the staged index with `git checkout-index --prefix=<tmp>/ -a`, symlink
`node_modules`, and run `tsc` + `eslint` there — this repo's working tree usually holds untracked
compositions, and a Root that imports them will pass locally but break a clean checkout. If Root
registers things that are not being committed, stage a trimmed Root via `git hash-object -w` +
`git update-index --cacheinfo`.

## Final report

Lead with where the file is and that it is open. Then, briefly: shot count and repeats, credits
spent and remaining, anything left out and why, and the one clip you would re-roll first if the
user wants to. Numbers in a table or on their own line, not in prose.
