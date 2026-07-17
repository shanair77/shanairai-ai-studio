# The Framework

## Purpose

A single-page mental model of AI-Studio: how a declarative config becomes a rendered video,
and how the subsystems connect. Read this after [README.md](./README.md) and before the
subsystem references.

## Concepts

The framework is a **pipeline of layers** topped by a **configuration-driven engine**:

```
tokens → runtime → layout → typography → motion → scenes → transitions → engine → video
(config)  (format) (components)         (animations)                    (composition)
```

- **Tokens** (`config`) are the single source of design truth: colors, typography, spacing,
  timing, easing, formats, the `theme`, and the font manifest.
- **Runtime** (`format`) makes tokens format-aware: `useScale` scales by the short side so type
  reads identically in portrait/landscape/square; `SafeArea` keeps content platform-safe.
- **Layout + typography** (`components`) are the primitives everything visual composes.
- **Motion** (`animations`) drives values off `useCurrentFrame()` + `interpolate()` — never CSS
  transitions.
- **Scenes** are content-agnostic full-frame compositions of the above, exposing role slots.
- **Transitions** hand one scene to the next via `@remotion/transitions`.
- **The engine** (`composition`) resolves a `CompositionSchema` into a `<Composition>`.

## How the pieces connect

- Everything visual reads design tokens through the **theme context** (`useTheme()`), so a
  brand's color overrides recolor the whole tree ([THEMING.md](./THEMING.md)).
- Scenes and transitions are resolved **by name** from **registries** built on one generic
  kernel ([REGISTRIES.md](./REGISTRIES.md)), which is what makes the config type-safe.
- The builder assembles the React tree **programmatically** (`createElement`), so a video is
  data end-to-end — no templates.
- Fonts load once at the app entry and gate rendering, so output is deterministic
  ([FONTS.md](./FONTS.md)).

## Examples

A minimal end-to-end flow:

```ts
import { buildComposition } from "./composition";

const built = buildComposition({
  id: "Demo",
  format: "horizontal",
  transitions: { type: "dissolve", duration: 0.5 },
  scenes: [
    { scene: "hero",  duration: 3, props: { title: "Hello" } },
    { scene: "outro", duration: 3, props: { title: "Goodbye" } },
  ],
});
// built.component is a React FC; register it in a <Composition>.
```

## Best practices

- Treat the config as the interface. If something can't be expressed in the schema, it belongs
  in a registry, not hardcoded in the builder.
- Compose downward: scenes from primitives, videos from scenes.
- Keep content out of the framework — pass it as props/config.

## Common mistakes

- Reaching past the engine to render scenes manually (loses typing, transitions, timing).
- Embedding brand/content in a scene component instead of accepting it as a slot.

## Extension points

- New scene → [BUILDING_CUSTOM_SCENES.md](./BUILDING_CUSTOM_SCENES.md)
- New transition → [BUILDING_CUSTOM_TRANSITIONS.md](./BUILDING_CUSTOM_TRANSITIONS.md)
- New registry family (assets, brands, effects, templates) → [REGISTRIES.md](./REGISTRIES.md)
- The engine internals → [COMPOSITION_ENGINE.md](./COMPOSITION_ENGINE.md)
