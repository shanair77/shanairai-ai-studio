# The Country Mouse and the City Mouse — assets

Composition: `CountryMouseStory` (1920×1080, 30 fps, ~2:09). Source: `src/mouse/`.

## Narration

The story is narrated by one clip per scene. Drop them here with these names:

| File        | Scene         | Length (s) |
| ----------- | ------------- | ---------- |
| `vo01.mp3`  | Title         | 2.80       |
| `vo02.mp3`  | The meadow    | 13.76      |
| `vo03.mp3`  | Cousin visits | 17.04      |
| `vo04.mp3`  | The journey   | 8.48       |
| `vo05.mp3`  | The feast     | 16.00      |
| `vo06.mp3`  | The cat       | 16.24      |
| `vo07.mp3`  | The dog       | 12.32      |
| `vo08.mp3`  | Going home    | 15.28      |
| `vo09.mp3`  | The moral     | 9.20       |

The takes were generated with ElevenLabs (voice: "Jon – Children's Storyteller",
model `eleven_v4`) in the flow "Country Mouse & City Mouse narration". Download each
take from that flow in order and save it under the name above.

Any clip that is missing is simply skipped, so the video renders silently without
them. If you re-record a line and its length changes, update `voSeconds` for that
scene in `src/mouse/story.ts`; scene lengths and every on-screen cue follow it.

## Music (optional)

Put a soft loop in this folder and set the `music` prop (e.g. `"mouse/music.mp3"`).
It plays under the narration at `musicVolume` (default 0.12) with fades at both ends.

## Font

`fonts/Fredoka-latin.woff2` is Fredoka (SIL Open Font License), self-hosted so the
video renders without reaching Google Fonts.

## Render

```bash
npx remotion render src/mouse/index.ts CountryMouseStory out/CountryMouseStory.mp4
```

`src/mouse/index.ts` bundles only this composition, so it does not load the web fonts
the other compositions fetch. It is also registered in `src/Root.tsx` for the Studio.
