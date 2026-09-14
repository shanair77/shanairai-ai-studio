# Architecture — what to reuse and where it lives

Do not build a parallel implementation. A new campaign is another declarative config plus its assets;
the engine, registries, brand, media scene, audio system and provenance already exist. Reuse them so
the existing films keep rendering unchanged.

## The render chain (how a composition comes to exist)
- `src/index.ts` → `registerRoot(RemotionRoot)` — the entry Remotion loads.
- `src/Root.tsx` (`RemotionRoot`) — every `<Composition>` must be registered here or it does not exist
  to Studio/renderer. Add new commercials here.
- A campaign file (e.g. `src/JetSetTwin.tsx`) calls `buildComposition(config, sceneRegistry,
  transitionRegistry, kit.registry, brands)` and returns a `<Composition>`.
- `src/composition/` is the compiler: it folds a `CompositionSchema` (durations in seconds, transition
  overlaps) into an exact `durationInFrames`. This is what guarantees 1440 frames = 60.000s.

## The declarative config (the thing you author per campaign)
- Pattern: `src/jetset/CampaignConfig.tsx` (60s master) — read its header comment; it documents the
  fps/transition/shot-count lessons in situ.
- Fields: `id`, `format: "vertical"`, `fps`, `duration`, `brand`, `audio[]` (voiceover/ambience/sfx
  cues with `startAt`, `volume`, `loop`, `fadeIn/Out`, `role`), `music` (`asset`, `startAt`,
  `trimBefore`, `ducking`), and `scenes[]` (each: `scene: "media"`, `label`, `duration`, `transition`,
  `props` with `media: { asset, kenBurns:{from,to}, scrim }`, plus typography).
- "Same film, different picture" variant: `src/jetset/CampaignConfigTwin.tsx` — takes the master's
  non-media props by label and swaps only the media. Good template for a new protagonist over a proven
  timeline.

## Assets & brand
- Asset kit: `src/jetset/assets.ts` (master) and `src/jetset/twin-assets.ts` (twin). `defineAsset`
  ({category:image|video, source, metadata:{durationInSeconds}}) + `defineAssetKit`. Keep a new
  campaign's media in its OWN kit so the locked film's manifest stays true.
- Assets live in `public/…` and are referenced with `staticFile()` under the hood. Structure new
  media as `public/<brand>/<campaign>/{video,stills,audio/{vo,music,ambience,sfx},brand}` and never
  overwrite a prior campaign's assets. Preserve rejected takes separately (see
  `public/jetset/twin/_watermarked-originals/` for the backup convention).
- Brand + endcard: `src/jetset/brand.ts`, `src/jetset/BrandMarks.tsx` (logo, CTA, founder lower-third,
  website). Keep the real website spelling exact. The kit is installed on the BRAND, not passed to the
  builder — see the comment in `src/JetSetTwin.tsx` (`{ ...brand, assets: kit }` + `brandRegistry.extend`).
- Media scene / Ken Burns: `src/media/MediaBackdrop.tsx`. Stills are 1440×2560 against a 1080×1920 frame
  (~33% headroom) so a scale-and-pan stays inside source pixels.

## Audio system
- Provenance/lock formats are the source of truth for what was used and why:
  `src/jetset/provenance.json` (picture: model, per-shot jobId, credits, verdict, start_image),
  `src/jetset/audio-provenance.json` (VO/ambience/SFX: provider, prompt, sha256, licence,
  sourcePeakDb vs deliveryPeakDb, accept/reject), `src/jetset/audio-lock.json`, `src/jetset/audio-requests.ts`.
- Acquisition + normalisation pipeline: `src/acquisition/`, `scripts/acquire-jetset-audio.ts`,
  `scripts/normalise-audio.ts`. Normalisation is technical headroom only (a verified scalar multiple —
  timing/pitch/character unchanged); creative balance stays a mix decision in the config.

## Cutdowns
- `src/jetset/derive.ts` (`shotFrom(label, duration)`, `SHOT` label map) and `src/jetset/deriveTwin.ts`
  (`twinShotFrom` sourcing the twin master). `CampaignConfig30/15.tsx` + `CampaignConfigTwin30/15.tsx`
  reuse the master's audio/music verbatim and only swap the scene list/durations. Register cuts in a
  `*Cuts.tsx` file added to `Root.tsx`.

## Commands
- `npm run dev` — Remotion Studio. `npm run lint` — eslint + tsc (the verification step; there is no
  unit-test suite). Render: `npx remotion render src/index.ts <CompositionId> out/<name>.mp4 --codec=h264`.
