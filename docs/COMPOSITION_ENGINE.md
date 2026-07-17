# Composition Engine

## Purpose

Document the engine that turns a `CompositionSchema` (data) into a `<Composition>`-ready
descriptor — validation, canvas resolution, brand resolution, timeline resolution, and
programmatic assembly. Lives in `src/composition`.

## Concepts

The engine is a pure pipeline of small, testable functions:

```mermaid
flowchart LR
  CFG["CompositionSchema<br/>(config data)"] --> VAL["validateComposition<br/>(structural checks)"]
  CFG --> VID["resolveVideoConfig<br/>(w/h/fps/duration)"]
  CFG --> BR["resolveBrand<br/>(theme + mark)"]
  CFG --> TL["resolveTimeline<br/>(scenes + boundaries + total)"]
  TL --> BUILD["buildComposition<br/>(assemble TransitionSeries)"]
  VID --> BUILD
  BR --> BUILD
  VAL --> BUILD
  BUILD --> DESC["BuiltComposition<br/>{ id, component, durationInFrames, fps, width, height }"]
  DESC --> COMP["&lt;Composition&gt;"]
```

### Pieces

| Module | Role |
|---|---|
| `CompositionSchema.ts` | The declarative shape (typed via registries) + `validateComposition` + asset resolution. |
| `VideoConfig.ts` | `resolveVideoConfig` — format preset / explicit dims / duration → `{ width, height, fps, durationInFrames? }`. |
| `BrandConfig.ts` | `resolveBrand` — brand config → concrete `Theme`; `BrandThemeProvider` / `useBrandTheme`. |
| `SceneRegistry.ts` | Typed scene registry (`sceneRegistry`, `createSceneDefinition`, `builtinScenes`). |
| `Timeline.ts` | `resolveTimeline` — scenes + boundary transitions + clamped frames + total. |
| `CompositionBuilder.ts` | `buildComposition` — validates, resolves, assembles the tree, returns `BuiltComposition`. |

### The timeline model

`resolveTimeline` produces the **slim** model (ADR-002 §5):

- `scenes[]` — each `{ durationInFrames, opaque, component, props, … }`.
- `boundaries[]` — same length as `scenes`; `boundaries[i]` is the transition **into**
  `scenes[i]` (`boundaries[0]` is a 0-frame cut). Each carries the resolved transition
  definition, options, and **clamped** overlap frames (`≤ min(neighbour durations)`).
- `durationInFrames = Σ(scene frames) − Σ(boundary frames)`.

It also enforces the **opacity contract**: a transition whose `requiresOpaqueIncoming` is set
is rejected against a non-opaque incoming scene (see [TRANSITIONS.md](./TRANSITIONS.md)).

### Assembly

`buildComposition` groups scenes into **runs** of transition-connected scenes (split at
0-frame "cut" boundaries) and renders each run as a positioned `<Sequence>` wrapping a
`<TransitionSeries>` (interleaved `.Sequence` / `.Transition`). Music (`<Audio>`) and
`BrandThemeProvider` are outer siblings, so audio continuity and brand theming are preserved.
Everything is built with `React.createElement` — no hardcoded JSX.

## Examples

```ts
import { buildComposition } from "./composition";

const built = buildComposition({
  id: "Promo",
  format: "vertical",
  duration: 12,                       // optional; else derived from scenes
  brand: { mode: "dark", theme: { colors: { accent: "#00E0C6" } } },
  music: { src: "audio/bed.mp3", volume: 0.6 },
  transitions: { type: "fade", duration: 0.5 },
  scenes: [
    { scene: "hero",  duration: 3.5, props: { title: "…" } },
    { scene: "quote", duration: 3,   props: { quote: "…", attribution: "…" } },
    { scene: "outro", duration: 3,   props: { title: "…" } },
  ],
});
```

Custom registries via the second overload:

```ts
const studio = sceneRegistry.extend({ myScene: createSceneDefinition<MyProps>({ component: MyScene }) });
buildComposition({ id, scenes: [{ scene: "myScene", props: { … } }] }, studio);
```

## Best practices

- Let duration derive from scenes unless you need a fixed length; if you set `duration`, keep
  it ≥ the content length (the engine clamps to ≥ 1 frame but won't extend content).
- Resolve assets by catalog key (`assets`) so references live in one place.
- Keep the builder free of business logic — express variation through config + registries.

## Common mistakes

- Expecting `resolveTimeline` to place absolute frame windows — it no longer does;
  `TransitionSeries` owns overlap timing (ADR-002).
- Setting a transition longer than a neighbouring scene — it's clamped; make scenes long enough
  for the overlap you want.
- Passing an unregistered scene/transition name — a compile error at the config surface, a
  thrown error at resolve time for dynamic names.

## Extension points

- Custom scenes/transitions via `.extend()` (see the registries doc).
- Additional config fields flow through `CompositionSchema` + `resolveTimeline`; keep the
  erased `*Base` shapes in sync so the builder stays type-safe.
