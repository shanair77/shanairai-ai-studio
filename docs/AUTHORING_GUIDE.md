# Authoring Guide

## Purpose

Teach you, end to end, how to author with AI-Studio: create a scene, a transition, a
composition, a theme, a brand, and reference assets. Task-oriented; links to the deep
references for detail.

## Concepts

You author at two levels:

- **Composition level (data):** describe a video as a `CompositionSchema` and build it with
  `buildComposition`. This is where most work happens.
- **Primitive level (code):** add a custom scene or transition when the built-ins don't cover
  a need, then reference it by name from config.

---

## 1. Create a composition

```ts
// src/demo/MyConfig.ts
import { type CompositionSchema } from "../composition";

export const myConfig: CompositionSchema = {
  id: "MyVideo",
  format: "vertical",                          // or width/height/fps
  transitions: { type: "fade", duration: 0.5 },// default between scenes
  timing: { defaultSceneDuration: 3 },
  scenes: [
    { scene: "hero",     duration: 3.5, props: { eyebrow: "New", title: "Launch", subtitle: "…" } },
    { scene: "centered", duration: 3,   props: { title: "How it works", body: "…", maxWidth: 900 } },
    { scene: "cta",      duration: 3,   props: { title: "Get started", actions: /* a node */ null } },
  ],
};
```

Register the built descriptor in `src/Root.tsx`:

```tsx
import { Composition } from "remotion";
import { buildComposition } from "./composition";
import { myConfig } from "./demo/MyConfig";

const built = buildComposition(myConfig);
export const MyVideo = () => (
  <Composition id={built.id} component={built.component}
    durationInFrames={built.durationInFrames} fps={built.fps}
    width={built.width} height={built.height} />
);
```

`npm run dev` to preview, `npx remotion render MyVideo out/my.mp4` to render.

## 2. Create a scene

Full walkthrough: [BUILDING_CUSTOM_SCENES.md](./BUILDING_CUSTOM_SCENES.md). In short:

```tsx
// src/scenes/StatScene.tsx — compose the shared SceneFrame + primitives + motion
import { FadeUp } from "../animations";
import { Headline, Paragraph } from "../components";
import { SceneFrame, TEXT_ALIGN, type SceneBaseProps } from "./SceneFrame";

export type StatSceneProps = SceneBaseProps & { value?: React.ReactNode; label?: React.ReactNode };
export const StatScene: React.FC<StatSceneProps> = ({ value, label, align = "center", ...frame }) => (
  <SceneFrame {...frame} align={align} justify="center">
    <FadeUp><Headline align={TEXT_ALIGN[align]}>{value}</Headline></FadeUp>
    <FadeUp delay={0.1}><Paragraph align={TEXT_ALIGN[align]}>{label}</Paragraph></FadeUp>
  </SceneFrame>
);
```

Register it (built-in) in `src/composition/SceneRegistry.ts`, or per-video via `.extend()`.

## 3. Create a transition

Full walkthrough: [BUILDING_CUSTOM_TRANSITIONS.md](./BUILDING_CUSTOM_TRANSITIONS.md). A custom
transition is a `TransitionPresentation` (from `@remotion/transitions`) plus capability
metadata, registered with `createTransitionDefinition`:

```ts
const custom = transitionRegistry.extend({
  softDissolve: createTransitionDefinition({
    presentation: () => dissolve(),               // reuse or write your own presentation
    capabilities: { affectsEntering: true, affectsExiting: true, requiresOpaqueIncoming: false, supportsTransparency: true },
  }),
});
buildComposition({ id, transitions: { type: "softDissolve" }, scenes: [...] }, sceneRegistry, custom);
```

## 4. Create a theme

Themes are token objects. Start from `theme` (light) or `darkTheme`, or select via
`theme: "light" | "dark"` in config. To change tokens globally, edit `src/config/*`
([THEMING.md](./THEMING.md)). To recolor per video, use a brand override (below).

## 5. Create a brand

A brand is pure config — a name, a base mode, semantic color overrides, and a mark reference:

```ts
buildComposition({
  id, scenes: [...],
  brand: {
    name: "Midnight",
    mode: "light",
    theme: { colors: { background: "#0E1B2B", textPrimary: "#E8F0FF", accent: "#00E0C6" } },
    mark: "brand/midnight-logo.png",
  },
});
```

`resolveBrand` folds this into a concrete `Theme`; `BrandThemeProvider` supplies it so every
primitive recolors. Only **colors** are overridable today (see [THEMING.md](./THEMING.md#brand-overrides)).

## 6. Create / reference assets

Assets are `public/`-relative paths or `http(s)` URLs. Reference them directly, or via a named
catalog:

```ts
buildComposition({
  id, scenes: [...],
  assets: { bed: "audio/bed.mp3", logo: "brand/logo.png" },
  music: { src: "bed", volume: 0.6, loop: true },   // "bed" resolves from the catalog
  brand: { mark: "logo" },
});
```

Files live under `public/`; `resolveAssetRef` wraps local paths in `staticFile()`.

## Examples

The shipped `src/demo/DemoConfig.ts` is a complete four-scene example with fade transitions.

## Best practices

- Prefer config + built-ins; reach for a custom scene/transition only when needed.
- Pass **content** into role slots; keep scene components content-free.
- Use catalog keys for assets so references are centralized.
- Keep durations ≥ your transition overlaps.

## Common mistakes

- Passing a pre-styled `<Headline>` into a slot that already wraps text in a role → double
  wrap. Pass the text (or use the scene's `children` escape hatch).
- Referencing an asset that isn't under `public/`.
- Using a `requiresOpaqueIncoming` transition (`fade`) into a scene you marked `opaque: false`
  — the engine rejects it; use `dissolve`.

## Extension points

- New scene/transition → the two "Building custom …" guides.
- New brand pack / asset registry → [REGISTRIES.md](./REGISTRIES.md#future-registries).
