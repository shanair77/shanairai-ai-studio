---
name: kids-story
description: >-
  Make the next narrated pastel kids' story video for the YouTube channel and upload it as a
  Private video — script, ElevenLabs narration, original lullaby, flat 2D Remotion scenes,
  custom thumbnail, Cloudinary hosting, and the Make "Kids Stories → YouTube (Private)" upload.
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

Output: a ~2 minute 1920×1080 video, a 1280×720 thumbnail, and a Private YouTube upload.

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
- Add the story to `STORIES` in `src/kids/registry.ts`.

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

## 6. Render

```bash
npx remotion render src/kids/index.ts <Id> out/<Id>.mp4 --browser-executable=$B --log=error --concurrency=4
npx remotion still  src/kids/index.ts <Id>Thumbnail out/<Id>-thumb.jpg --image-format=jpeg --jpeg-quality=92 --browser-executable=$B --log=error
```

(Remotion's own Chrome download is blocked here; always pass `--browser-executable`.)
Verify: `ffprobe` shows a video and an audio stream and the expected duration.

## 7. Upload (Private)

```bash
scripts/kids-publish.sh <slug> out/<Id>.mp4 out/<Id>-thumb.jpg   # → {"video_url", "thumbnail_url"}
```

Then run the Make scenario **7086309** "Kids Stories → YouTube (Private)" with
`mcp__Make__scenarios_run` (`responsive: true`) and data:

- `video_url`, `thumbnail_url` — from the script
- `title` — "<Story Title> | Bedtime Story for Kids" (≤ 100 chars, no `<` or `>`); the classic
  title, optionally with a short modern hook before the bar, e.g.
  "The Tortoise and the Hare (2026 Edition) | Bedtime Story for Kids"
- `description` — 2–3 warm sentences about the story, a blank line, "The moral of the story: …",
  then 3–4 hashtags (#bedtimestories #kidsstories #storytime + one specific)
- `tags` — comma-separated, ~10 (kids stories, bedtime stories, the fable's name, etc.)

The scenario uploads Private, made for kids, Film & Animation, no subscriber notification, and
sets the thumbnail (it skips the thumbnail if YouTube refuses — e.g. unverified channel).
If the run fails, read `mcp__Make__executions_get-detail`; do not re-run blindly (a re-run
uploads a second copy).

Find the new video's ID with `mcp__Make__rpc_execute`: app `youtube` v4, rpc `searchVideos`,
data `{"__IMTCONN__": 12404718, "channelId": "me", "q": "<Story Title>"}`.

## 8. Record and report

- Mark the story `done` in `docs/kids-stories/QUEUE.md` with today's date and the video ID.
- Commit everything (code, `public/kids/<slug>/` narration + music) and push.
- Finish with a short report: story title, the Studio link
  `https://studio.youtube.com/video/<id>/edit`, video length, and anything that went wrong.
