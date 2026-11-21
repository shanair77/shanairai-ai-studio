---
name: kids-story
description: >-
  Make the next narrated pastel kids' story video for the YouTube channel and publish it
  Publicly — script, ElevenLabs narration, original lullaby, flat 2D Remotion scenes,
  custom thumbnail, Cloudinary hosting, and the Make "Kids Stories → YouTube (Public)" upload.
  Use this whenever the scheduled kids' story run fires, or the user asks for "another kids'
  story", "the next fable", "a story like the Country Mouse one", or to redo/upload a story.
  Not for ads, reels or montage videos (use ad-production-pipeline / montage-reel).
metadata:
  tags: kids, story, fable, youtube, remotion, elevenlabs, make, cloudinary, pastel
---

# Kids' story video (Country Mouse format)

The reference story is **The Country Mouse and the City Mouse**: `src/mouse/` (composition
`CountryMouseStory`). Read `src/mouse/Scenes.tsx` and `src/mouse/Characters.tsx` before
drawing anything; every new story should feel like a sibling of that one. Shared pieces live
in the kit, `src/kids/kit/` (palette, timing, StoryShell, scenery, props, thumbnail frame).

Output: a ~2 minute 1920×1080 video, a 1280×720 thumbnail, and a Public YouTube upload (made for kids).

## The 2026 spin (house style)

Every story is the classic fable with a light, modern 2026 twist: same plot, same moral, but
set in a world today's kids recognise. Think "familiar song, fresh outfit".

- **Keep the classic bones.** Same characters, same turning points, same moral. The title stays
  the classic one ("The Tortoise and the Hare") so parents can find it.
- **Add 2–3 modern touches, woven into the plot, not stickers on top.** Generic, everyday
  things: a phone or tablet, video calls, a smart watch / step counter, a delivery robot,
  drones, e-scooters and bikes, solar panels, recycling bins, food trucks, a group chat,
  streaming a song, a vlog camera, a smart speaker. One touch should actually matter to the
  story (e.g. the Hare stops to film selfies and watch "just one more video", then naps).
- **Add a 2026 echo of the moral** in the moral card where it fits naturally (e.g. "Slow and
  steady wins the race, and it's okay to put the phone down and keep going"). One short line.
- **No real brands, apps, platforms or celebrities** (no app names, no logos, no real phones),
  no internet slang that will date fast, no "likes"/"followers" chasing shown as a goal.
- **Screens are never the villain or the hero by themselves.** Gentle, not preachy: tech is
  part of life; the lesson is about the character's choices.
- **Kind and inclusive.** Diverse modern settings (city rooftops, community gardens, skate
  parks, food-truck streets, suburbs, farms), friendly neighbours, teamwork. Where the old
  tale ends harshly (e.g. the Ant and the Grasshopper), choose the kinder modern ending.
- Draw the modern props in the same flat pastel style (simple rounded shapes, no detail).
- The QUEUE has a "2026 spin" idea per story: use it as a starting point, not a script.

## 0. Pick the story

Open `docs/kids-stories/QUEUE.md`, take the first `todo`. Choose a short `slug`
(e.g. `tortoise-hare`) and a PascalCase composition id ending in `Story`
(e.g. `TortoiseHareStory`).

## 1. Write the script (8–9 scenes, ~2 minutes)

- Apply the 2026 spin (above): plan the modern touches before writing.
- Audience 3–7. Warm, simple sentences; gentle humour; a little suspense, never frightening.
  No violence, no one gets eaten or hurt, no mean-spirited jokes. Kind endings.
- Scene 1 is the spoken title ("[warmly] The Tortoise... and the Hare."). The last scene is
  the moral card + "The end!". 6–7 story scenes in between, each 8–18 s of narration
  (≈ 25–50 words). Total narration ≈ 280–330 words. Longer fairy tales (Cinderella, Jack and
  the Beanstalk, Hansel and Gretel…) may use up to 9 story scenes and ≈ 420 words (~3 min).
- Fairy tales: follow the softening and no-film-versions notes at the top of QUEUE.md. Use the
  public-domain names (e.g. "Briar Rose"), never a studio's.
- Retell in your own words. Characters are animals or simple shapes, drawn by you; never copy
  a studio's look, names or songs.
- Each story scene's text is its `captions` array (2–4 chunks, each a phrase that fits on one
  or two lines). The captions joined with spaces must equal what is spoken.
- ElevenLabs v4 tags like `[warmly]`, `[whispering]`, `[gasps]`, `[snooty]` go only in the
  narration prompt, never in the captions.

## 2. Narration (ElevenLabs)

- One `creative_generate_speech` call per scene: voice `JYUzXNeyCPmymMkfcicu`
  ("Jon – Children's Storyteller"), model `eleven_v4`, `generations_count: 1`. Create one flow
  first (`creative_create_flow`, name "<Story title> narration") and pass its `flow_id` to every
  call. Fire them in parallel, then poll `creative_get_flow_run_status`.
- **Never repeat a generation call to retry** — each call is charged. If one fails, report it.
- Download each `content_url` with `curl -sSf -o public/kids/<slug>/voNN.mp3 "<url>"`
  (host `elevenlabsusercontent.com` is allowed in the `shanairai-ai-studio` environment;
  links expire in a few hours, so download right away).
- Measure: `ffprobe -v error -show_entries format=duration -of csv=p=0 <file>` → `voSeconds`.

## 3. Music

Vary key and tempo per story so the channel isn't one tune on repeat:

```bash
python3 scripts/mouse-music.py public/kids/<slug>/music.wav --transpose <-3..4> --bpm <72..92> --seconds <video seconds + 10>
ffmpeg -v error -y -i public/kids/<slug>/music.wav -c:a libmp3lame -b:a 160k public/kids/<slug>/music.mp3 && rm public/kids/<slug>/music.wav
```

## 4. Build the story in code

Create `src/kids/stories/<slug>/`:

- `story.ts` — `SCENES: (StoryScene & { id: SceneId })[]` with `vo: "kids/<slug>/voNN.mp3"`,
  measured `voSeconds`, `lead` (0.4–0.6; title 1.6), `tail` (1.0–1.4; moral 2.6), `captions`;
  title and moral scenes use `captions: []` plus `spoken`.
- `Characters.tsx` — the story's characters as flat SVG components using `place()` /
  `Placed` from the kit and colours from `C` (add story-specific colours locally; keep them
  pastel). Give each character idle life: blink (offset so frame 0 has open eyes), breathing,
  a walk bounce, and 1–2 expressive poses (wave, mouth open, head tilt, shiver).
- `Scenes.tsx` — one component per scene id. Use `Camera`, `popAt`, `cueFrame` (cue story
  beats to phrases in the narration), `Bubble`, `Sparkle`, `Heart`, and kit scenery
  (`Meadow`, `Sky`, `OakTree`, `Skyline`, `CityStreet`) or new backgrounds you draw.
  Something must move in every shot. Keep the bottom ~170 px clear of key action (captions).
- `index.tsx` — `export const <Id>: React.FC<StoryAudioProps> = (p) => <StoryShell scenes={SCENES} components={...} {...p} />`,
  `default<Id>Props = storyAudioDefaults("kids/<slug>/music.mp3")`, and `<Id>Thumbnail`
  using `ThumbnailFrame` (2–3 word title lines, 2 characters, one prop; leave the title area open).
- Add the story to `STORIES` in `src/kids/registry.ts`, and its packaging to `PACKAGING` in
  `src/kids/series.ts`: `title` ({ en, es }), `components` (export the scene map from
  `index.tsx`), `music`, `playlist` ("fables" or "fairy-tales") and the `short` cut (step 6b).
- **All on-screen text** (title cards, speech bubbles, signs, moral card, thumbnail lines) goes
  through `const t = useT(); t({ en: "Run!", es: "¡Corre!" })` so a Spanish version needs no
  code changes. Write the Spanish string at the same time as the English one.
- The series intro sting and outro card ("Once Upon a 2026") are added automatically by
  `StoryShell`; don't draw your own.

Rules from CLAUDE.md apply: no CSS animations or transitions — everything from
`useCurrentFrame()` + `interpolate()`; `npm run lint` must pass (unused vars fail).

## 5. Check the pictures

Render one still per scene at half scale and **look at every one** (Read the PNG):

```bash
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npx remotion still src/kids/index.ts <Id> /tmp/s-<frame>.png --frame=<frame> --scale=0.5 --browser-executable=$B --log=error
```

Fix overlaps, characters floating above the ground, text hidden behind captions, and anything
that looks scary. Also check the thumbnail still.

## 5b. Copyright check (required before rendering)

The source tales are public domain; film and TV versions are not. Before rendering, check the
script, captions, title, description, tags and art against this list, and fix anything that fails:

- [ ] The story is in the queue's public-domain sources (Aesop, Grimm, Perrault, Andersen,
      Collodi, Baum's 1900 book, traditional folk tales). Nothing else without asking the owner.
- [ ] No character names that exist only in a film/TV version (e.g. "Aurora", "Maleficent", the
      seven dwarfs' film names, the film mermaid/crab/sea-witch names, the film cricket's name,
      "Tiana", "Elsa"). Use the original book names or invent new ones.
- [ ] No film/TV character designs or costumes (e.g. Snow White's bow and yellow-and-blue dress,
      ruby slippers, a green-skinned Oz witch, a feathered-hat swashbuckling cat). Our own flat
      pastel designs only.
- [ ] No song lyrics or melodies from any film or show; the music is our own lullaby script.
- [ ] No studio logos, title lettering, taglines, or words like "Disney" in titles, descriptions
      or tags. The plain story name is fine ("Snow White | Bedtime Story for Kids").
- [ ] No real brands, apps or celebrities (see the 2026 spin rules).

If any item is uncertain, choose the safer option (rename, redesign, or cut it), and say what you
changed in the final report.

## 6b. Cut the Short

Pick the 3–4 funniest or most surprising moments (45–56 s in total; the end card adds 3 s) and
describe them in `PACKAGING[<Id>].short.segments` — see the Country Mouse entry:
`{ scene, from?, to?, focusX?, panAt?, zoom? }`. Open on the hook (the most surprising beat),
not the title card; end on the moral. The 1080-wide window shows ~864 px of the 1920 scene at
the default zoom 1.25, so set `focusX` on the action and use `[from, to]` + `panAt` (seconds into
the segment) to follow it at the right beat; use `zoom: 1` (or 0.75 for the moral card) for wide
shots. Render 4–5 stills of `<Id>Short` and look at them: characters and bubbles in frame,
captions readable.

## 6. Render

```bash
npx remotion render src/kids/index.ts <Id> out/<Id>.mp4 --browser-executable=$B --log=error --concurrency=4
npx remotion still  src/kids/index.ts <Id>Thumbnail out/<Id>-thumb.jpg --image-format=jpeg --jpeg-quality=92 --browser-executable=$B --log=error
npx remotion render src/kids/index.ts <Id>Short out/<Id>Short.mp4 --browser-executable=$B --log=error --concurrency=4
```

(Remotion's own Chrome download is blocked here; always pass `--browser-executable`.)
Verify: `ffprobe` shows a video and an audio stream and the expected duration.

## 7. Upload (Public)

```bash
scripts/kids-publish.sh <slug> out/<Id>.mp4 out/<Id>-thumb.jpg   # → {"video_url", "thumbnail_url"}
scripts/kids-publish.sh <slug>-short out/<Id>Short.mp4           # → {"video_url", "thumbnail_url": ""}
```

Then run the Make scenario **7086309** "Kids Stories → YouTube (Public)" with
`mcp__Make__scenarios_run` (`responsive: true`) and data:

- `video_url`, `thumbnail_url` — from the script
- `title` — "<Story Title> | Bedtime Story for Kids" (≤ 100 chars, no `<` or `>`); the classic
  title, optionally with a short modern hook before the bar, e.g.
  "The Tortoise and the Hare (2026 Edition) | Bedtime Story for Kids"
- `description` — 2–3 warm sentences about the story, a blank line, "The moral of the story: …",
  then 3–4 hashtags (#bedtimestories #kidsstories #storytime + one specific)
- `tags` — comma-separated, ~10 (kids stories, bedtime stories, the fable's name, etc.)
- `playlist_1` — `PLD70uhyUFwQQ` ("Kids Stories", every story)
- `playlist_2` — `PLdNhP4iIPHK8` (Animal Fables) or `PLRD5dwbPreE4` (Fairy Tales)

Then run the same scenario once more for **the Short**: `video_url` from the short upload, no
`thumbnail_url`, `title` "<Story Title> 🐢 #shorts" style (≤ 100 chars, one emoji max, ends in
#shorts), a one-line description ending "Watch the whole story on our channel! #shorts
#bedtimestories", the same tags, `playlist_1` `PLVTEVa-gcp3g` (Story Shorts), no `playlist_2`.

The scenario publishes **Public** (the owner switched from Private on 2026-11-21), made for kids,
Film & Animation. It notifies subscribers only for full stories (calls with a `thumbnail_url`),
not for Shorts. Because the video goes live straight away, never upload anything you have not
checked: look at the stills, play the start and end of each render, and stop if anything is off.
It also sets the thumbnail (it skips the thumbnail if YouTube refuses — e.g. unverified channel).
If the run fails, read `mcp__Make__executions_get-detail`; do not re-run blindly (a re-run
uploads a second copy).

Find the new video's ID with `mcp__Make__rpc_execute`: app `youtube` v4, rpc `searchVideos`,
data `{"__IMTCONN__": 12404718, "channelId": "me", "q": "<Story Title>"}`.

## 7a. Spanish version (only once the Spanish channel is set up)

Check `docs/kids-stories/QUEUE.md` → "Spanish channel". If it says "not set up yet", skip this
step. Otherwise (it is set up as of 2026-11-18), do this for every new story:

1. Translate each scene's narration into warm, simple Latin American Spanish (same beats, same
   order, same tags like `[whispering]`). Keep caption chunks in step with the English ones.
2. Record with voice `KUvfKweuqSul0lbDIZUB` ("Diana – Cálida, Expresiva y Profesional"),
   `eleven_v4`, one take per scene, one flow named "<Spanish title> (narración)". Download to
   `public/kids/<slug>/esNN.mp3` and ffprobe each.
3. Add an `es: { vo, voSeconds, captions, spoken? }` block to every scene. Cues stay written
   against the English text; they scale automatically.
4. Render `<Id>Es`, `<Id>ShortEs` and `<Id>ThumbnailEs` the same way, look at a few stills,
   publish with `scripts/kids-publish.sh <slug>-es …` (and `<slug>-es-short` for the Short),
   and run the **Spanish** upload scenario listed in QUEUE.md (never the English one) with
   Spanish title/description/tags and the Spanish playlist IDs listed there: playlist_1 =
   Todos los cuentos, playlist_2 = Fábulas or Cuentos de hadas; the Short goes to Shorts only.
   Find the Spanish video IDs with `searchVideos` on connection `12412754`, and record them in
   QUEUE.md next to the English ones. Title format: "<Título> | Cuento para dormir para niños" (Short: "<Título> 🐢 #shorts").

## 7b. Compilation (every 5th story)

Count the `done` stories in QUEUE.md that have code in `src/` (The Tortoise and the Hare has code
since its 2026-11-18 remake; Compilation01 covered stories 1–5, see QUEUE.md). When that count reaches a multiple of 5, also make a compilation of
the last 5: add `{ id: "CompilationNN", title: { en, es }, storyIds: [...] }` to `COMPILATIONS`
in `src/kids/series.ts`, render `CompilationNN` (no new narration, no extra credits), make a
thumbnail by rendering a still of one of its stories' thumbnails, publish it like a story with
title "Bedtime Stories for Kids: <5 titles, shortened> | <N>-Minute Collection" (the real length; ≤ 100 chars
or YouTube rejects it), chapter
timestamps in the description (YouTube needs ≥ 10 s chapters, so start at 0:00 with the first story,
not the 2 s intro) (each story's start: 0:00 intro, then the stories in order;
read the start frames from `compilationLayout` or step through stills), `playlist_1`
`PLD70uhyUFwQQ`, `playlist_2` `PLXIyn2J-iB9Y` (Compilations). Compilations render at ~160 MB, over the Cloudinary preset's 100 MB limit (HTTP 413): re-encode first with
`ffmpeg -i out/CompilationNN.mp4 -c:v libx264 -b:v 950k -maxrate 1400k -bufsize 2800k -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart out/CompilationNN-small.mp4`
(~90 MB for 11–12 min). Note it in QUEUE.md.

## 8. Record and report

- Mark the story `done` in `docs/kids-stories/QUEUE.md` with today's date and the video ID.
- Commit everything (code, `public/kids/<slug>/` narration + music) and push.
- Finish with a short report: story title, the Studio links for the story **and** the Short
  (and the compilation, if any), video lengths, and anything that went wrong.
