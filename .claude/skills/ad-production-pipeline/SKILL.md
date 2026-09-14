---
name: ad-production-pipeline
description: >-
  The Shanair.AI Ad Creation Pipeline — the end-to-end workflow this repo uses to produce a
  cinematic, multi-scene vertical commercial with a consistent AI protagonist, assembled in
  Remotion and rendered to an exact-length master plus derivative cuts. Use this WHENEVER the
  user wants to make, extend, or re-cut a commercial / ad / promo / campaign video for a brand —
  a new 60/30/15s spot, another destination or scene, a new client campaign, or a variant of an
  existing Jet Set / Shanair film — even if they don't name "the pipeline". It covers identity
  lock, generation + QA, audio, declarative assembly, staged renders, watermark/safe-area
  checks, and cutdowns. Not for one-off single-clip generation or non-video design work.
metadata:
  tags: commercial, ad, campaign, remotion, video, ai-generation, soul, voiceover, cutdown, vertical
---

# Ad Production Pipeline (Shanair.AI Ad Creation Pipeline)

This repo builds commercials as **code**: a declarative `CompositionSchema` compiles to an exact
frame count, so the timeline is deterministic, re-renderable, and re-cuttable. This skill is the
method for producing one. It takes a **brand**, a **protagonist** (a trained identity), a set of
**destinations/scenes**, and a **VO script**, and runs them through generation → assembly → QA →
render. The Jet Set Adventures × Shanair AI film is the reference implementation — read the real
files it points to rather than reinventing them.

**Before anything else:** skim `references/architecture.md` (what to reuse and where it lives),
`references/generation-tools.md` (identity lock + how to call the generation MCPs with cost
control), and `references/qa-ffmpeg.md` (the exact QA/ffmpeg commands). Also consult the
`remotion-best-practices` skill for authoring rules — CSS animation does not render; animate with
`useCurrentFrame()` + `interpolate()`.

## The non-negotiable rules (why the output reads as film, not an AI montage)

These are lessons already paid for. Break them and the video regresses to the exact defects they fix.

- **Native fps.** Render at the source footage's own cadence (this project standardised on **24fps**
  because the clips are native 24). Running a 24fps timeline at 30 forces a 5:4 pulldown that
  freezes every fifth frame — measurable judder. Never "upgrade" fps to 30.
- **Cut, don't dissolve.** Hard cuts by default. Allow at most **one earned dissolve**, and only
  where it fades a frame into itself (a shot generated from its predecessor's end frame). A dissolve
  between two unrelated shots ghosts one set of faces/limbs over the other — the artefact to avoid.
- **Identity is locked before footage exists.** Train the protagonist as a reusable Soul first, and
  drive continuity with **start-image chaining** (each shot generated from the previous shot's
  approved end frame). Text prompts alone drift the face between adjacent shots.
- **Narration sets the clock.** Generate the VO first, **measure the real file durations**, then build
  the timeline around them. Never force narration into a pre-baked cut.
- **A through-line.** Recurring wardrobe + one recognisable face turn N shots into one journey. Use
  identity-agnostic framing only where a face genuinely can't be held.
- **Audio hierarchy:** VO > music bed > ambience > SFX. Only narration ducks the bed. Keep
  `sourcePeakDb` (technical headroom) separate from the creative mix — never flatten everything to
  equal loudness.
- **Provenance + a budget ceiling.** Set a picture-credit ceiling before generating, preflight cost,
  and log every generated take (prompt, id, credits, accept/reject reason). Stop and report if the
  ceiling is approached. See `references/generation-tools.md`.

## The pipeline

Work top to bottom, but expect to loop within a stage (generate → QA → regenerate) until a shot
passes. Approve at the three render gates before spending the next stage's effort.

### 1 · Concept & structure
Turn the brief into an act structure with a clear emotional arc (the reference film: Decision →
Caribbean → Ghana → Dubai → Celebration → Payoff → Endcard). Decide the protagonist's role and how
the brand resolves in the close.

### 2 · Identity lock (first)
Confirm or train the protagonist Soul BEFORE generating footage. See `references/generation-tools.md`
§Identity. Record the `soul_id`. If reusing an existing twin, verify its look against the authoritative
reference so you don't silently ship a different-looking person.

### 3 · Narration, then timing
Write/great the VO copy. Generate it, then measure each clip's duration (`ffprobe`). These durations
are the skeleton every scene length is fitted to.

### 4 · Shot list
Enumerate the shots (the reference master is 17), each with: act, destination, wardrobe, the human
action that must complete on screen, and whether it's motion (image-to-video) or a still moved by
Ken Burns. A still is correct when the camera move *is* the shot; motion is correct when a body must
act (walk, exhale, enter water).

### 5 · Picture generation + QA loop
For each shot: Soul → still (image model) → start-image chain → image-to-video. Preflight cost, stay
under the ceiling, and QA every take for identity, hand/anatomy, signage, wardrobe/prop continuity,
architecture, and how it reads *inside the edit* (not just in isolation). Log accepts/rejects. Keep
rejected takes separate. Details + tool calls: `references/generation-tools.md`.

### 6 · Sound design
Source VO, ambience, SFX, and a music bed. Run each through the acquire → normalise → verify pipeline
(`src/acquisition/`, `scripts/`) so clipping, silence-floor and loop-seam gates pass before anything
reaches the mix. Position ambience/SFX with J-cuts and L-cuts; be selective — don't layer sound just
because an asset exists. See `references/architecture.md` §Audio.

### 7 · Declarative assembly
Author one `CompositionSchema` config (scenes, durations, transitions, Ken Burns, scrims, typography
beats, audio cue times, music ducking). Reuse the existing scene/transition/brand registries and the
`MediaBackdrop` media scene. Copy the pattern from `src/jetset/CampaignConfig*.tsx`. Register the
composition in `src/Root.tsx`. Verify the frame math resolves to the exact target
(e.g. 1440 frames = 60.000s): `sum(scene) − sum(transition overlaps)`.

### 8 · Staged renders (approval gates)
Render and get sign-off in order: **Picture+VO → Audio master → Final master**. Never call the first
render final. Command in `references/qa-ffmpeg.md`.

### 9 · QA beyond "tests pass"
Run `npm run lint` (eslint + tsc). Then the media QA in `references/qa-ffmpeg.md`: probe specs,
extract representative stills and inspect anatomy/signage/identity, run black-frame and repeated-frame
(judder) detection, check the endcard website spelling, and — for vertical social — run the TikTok
safe-area overlay. Scan generated stills/clips for provider watermarks (e.g. the Gemini/Nano-Banana
sparkle) and remove with `delogo` rather than regenerating.

### 10 · Derivative cuts
Build 30s/15s (or other) cuts by **re-timing master shots by label**, never by rebuilding. Copy the
`deriveTwin.ts` + `CampaignConfigTwin30/15.tsx` pattern: a derive layer pulls each shot from the master
config and supplies a new duration, and reuses the master cutdown's audio/music mix verbatim. A fix in
the master then flows into every cut automatically.

## Final report
When done, report: concept, continuity strategy, shot list with model/provider per shot,
accepted/rejected/regenerated counts, credits spent + remaining, VO/music/SFX, mix QA, exact
duration/frame count, resolution/fps/codec, tests, stills/ranges inspected, errors found & corrected,
final render path(s), known limitations, and what to improve next time.
