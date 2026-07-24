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
metadata, registered with `defineTransition`:

```ts
const custom = transitionRegistry.extend({
  softDissolve: defineTransition({
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

A brand is registered content — a name, a base mode, and semantic color overrides — selected by
name (never inlined):

```ts
const brands = createRegistry({
  midnight: defineBrand({
    name: "Midnight",
    mode: "light",
    theme: { colors: { background: "#0E1B2B", textPrimary: "#E8F0FF", accent: "#00E0C6" } },
  }),
});

buildComposition(
  { id, scenes: [...], brand: "midnight" },
  sceneRegistry, transitionRegistry, assetRegistry, brands,
);
```

`resolveBrand` folds the selected brand into a concrete `Theme`; `BrandProvider` supplies it so every
primitive recolors. Only **colors** are overridable today (see [THEMING.md](./THEMING.md#brand-overrides)).

## 6. Create / reference assets

Assets are registered by name against the asset registry (a `public/`-relative path or an `http(s)`
URL), then referenced by that name:

```ts
const assets = createRegistry({
  bed: defineAsset({ category: "audio", source: "audio/bed.mp3" }),
});

buildComposition(
  { id, scenes: [...], music: { asset: "bed", volume: 0.6, loop: true } },
  sceneRegistry, transitionRegistry, assets, brandRegistry,
);
```

Files live under `public/`; the asset resolver wraps local paths in `staticFile()`.

## 7. Create a template

A **template** packages a reusable *kind* of video as a pure function from typed `params` to
configuration. It never returns React — `buildFromTemplate` merges its output and delegates to
`buildComposition`. Select a template by name and supply its params via a `TemplateComposition`
(kept separate from `CompositionSchema`).

```ts
import { createRegistry } from "./registry";
import { buildFromTemplate, defineTemplate } from "./templates";

const promo = defineTemplate({
  name: "promo",
  format: "horizontal",
  capabilities: { formats: ["horizontal", "square"], providesTransitions: true, minScenes: 2, maxScenes: 4 },
  validate: (p: { productName: string; tagline?: string }) => {
    if (!p.productName) throw new Error("promo: `productName` is required.");
  },
  build: (p) => ({
    scenes: [
      { scene: "hero", duration: 2, props: { title: p.productName, subtitle: p.tagline } },
      { scene: "outro", duration: 2 },
    ],
    transitions: { type: "dissolve", duration: 0.5 },   // the template's default choreography
  }),
  meta: { description: "Hero → outro promo.", category: "marketing" },
});

const templates = createRegistry({ promo });
const built = buildFromTemplate(
  { id: "LaunchQ3", template: "promo", brand: "midnight", params: { productName: "Nova", tagline: "Ship faster" } },
  templates,
);
```

Templates provide **defaults, never policy** — a caller can always override the transition, music,
and timing. Precedence: transition `scene > caller > template > brand > framework`; music
`caller > template > brand audio > none`; timing `caller > template > framework`. `capabilities`
are machine-readable and enforced before/after `build` (unsupported format, missing required
brand, scene-count bounds); `meta` is human-facing and never affects rendering. The framework
ships **no** templates — author your own pack. See [ADR-005](./adr/ADR-005-template-engine.md).

### 7a. Add a parameter schema (optional)

Give a template a declarative `parameters` schema (ADR-006) and `buildFromTemplate` resolves +
validates the caller's params (applying defaults) **before** `build` runs — so `build` receives
clean, defaulted, deeply-readonly values. It's additive: templates without a schema keep the raw
params + imperative `validate` path.

```ts
const promo = defineTemplate({
  name: "promo",
  parameters: {
    parameters: [
      { key: "productName", type: "string", required: true, constraints: { min: 1, max: 40 }, metadata: { label: "Product name" } },
      { key: "tagline", type: "string", default: "Ship faster" },
      { key: "logo", type: "image", metadata: { help: "A registered image asset name" } },
      { key: "cta", type: "group", constraints: { fields: [
        { key: "label", type: "string", required: true },
        { key: "url", type: "url" },
      ] } },
    ],
  },
  build: (p) => ({ scenes: [{ scene: "hero", duration: 2, props: { title: p.productName, subtitle: p.tagline } }, { scene: "outro", duration: 2 }] }),
});
```

Types: `string`, `text`, `number`, `boolean`, `enum`, `color`, `image`, `video`, `audio`, `brand`,
`date`, `url`, `list`, `group`. Per-parameter **policy** lives in nested objects (`constraints`,
`conditions`, `metadata`, `ui`). Asset/brand params validate **names only** (existence + category).
Custom validators are referenced by **name** from `validatorRegistry` (never inline closures), so
schemas stay JSON — ready for a future AI Director / form / Studio surface. The Parameter Engine is
**pure data**: no React, no Provider. See [ADR-006](./adr/ADR-006-parameter-engine.md).

## Examples

The shipped `src/demo/DemoConfig.ts` is a complete four-scene example with fade transitions.

## Best practices

- Prefer config + built-ins; reach for a custom scene/transition only when needed.
- Pass **content** into role slots; keep scene components content-free.
- Reference assets by registry name so references are centralized.
- Keep durations ≥ your transition overlaps.

## Common mistakes

- Passing a pre-styled `<Headline>` into a slot that already wraps text in a role → double
  wrap. Pass the text (or use the scene's `children` escape hatch).
- Referencing an asset that isn't under `public/`.
- Using a `requiresOpaqueIncoming` transition (`fade`) into a scene you marked `opaque: false`
  — the engine rejects it; use `dissolve`.

## Extension points

- New scene/transition → the two "Building custom …" guides.
- New brand pack / asset registry / template pack → [REGISTRIES.md](./REGISTRIES.md#future-registries).
