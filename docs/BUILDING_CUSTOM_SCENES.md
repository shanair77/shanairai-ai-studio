# Building Custom Scenes

## Purpose

A step-by-step guide to writing a new scene and registering it type-safely. Sources:
`src/scenes/*`, `src/composition/SceneRegistry.ts`. Concepts: [REGISTRIES.md](./REGISTRIES.md),
[ADR-001](./adr/ADR-001-typed-scene-registration.md).

## Concepts

A **scene** is a content-agnostic, full-frame composition. It:

- builds on the shared **`SceneFrame`** (surface + optional background layer + `SafeArea` +
  aligned `Column`);
- exposes **role slots** (`title`, `body`, `actions`, `panes`, …) as `React.ReactNode` props +
  a `children` escape hatch — it carries **no content**;
- composes typography + layout + motion (with staggered `delay`s);
- is registered by name so config can address it with full typing.

`SceneBaseProps` (surface, background, safeArea, delay, style, className, children) is the shared
prop base every scene extends.

## Steps

### 1. Write the scene (`src/scenes/StatScene.tsx`)

```tsx
import { FadeUp } from "../animations";
import { Eyebrow, Headline, Paragraph } from "../components";
import { SceneFrame, TEXT_ALIGN, staggered, type Alignment, type SceneBaseProps } from "./SceneFrame";

export type StatSceneProps = SceneBaseProps & {
  eyebrow?: React.ReactNode;
  value?: React.ReactNode;
  label?: React.ReactNode;
  align?: Alignment;
  maxWidth?: number;
};

export const StatScene: React.FC<StatSceneProps> = ({
  eyebrow, value, label, align = "center", maxWidth, delay = 0, ...frame
}) => {
  const ta = TEXT_ALIGN[align];
  const items: Array<(d: number) => React.ReactNode> = [];
  if (eyebrow) items.push((d) => <FadeUp delay={d}><Eyebrow align={ta}>{eyebrow}</Eyebrow></FadeUp>);
  if (value)   items.push((d) => <FadeUp delay={d}><Headline align={ta} maxWidth={maxWidth}>{value}</Headline></FadeUp>);
  if (label)   items.push((d) => <FadeUp delay={d}><Paragraph align={ta} maxWidth={maxWidth}>{label}</Paragraph></FadeUp>);
  return (
    <SceneFrame {...frame} align={align} justify="center">
      {items.map((build, i) => <React.Fragment key={i}>{build(staggered(delay, i))}</React.Fragment>)}
    </SceneFrame>
  );
};
```

Rules: **compose only existing primitives**, use tokens (no raw hex/px), animate via motion
primitives, keep it content-free (slots + `children`).

### 2. Export it (`src/scenes/index.ts`)

```ts
export { StatScene, type StatSceneProps } from "./StatScene";
```

### 3a. Register as a built-in (`src/composition/SceneRegistry.ts`)

Add to the `builtinScenes` map (the single source of truth):
```ts
export const builtinScenes = {
  // …existing…
  stat: defineScene<StatSceneProps>({ component: StatScene }),
} satisfies SceneMap;
```
Now `{ scene: "stat", props: { value: "42%", label: "…" } }` is fully typed everywhere.

### 3b. …or register per-video (no core change)

```ts
const studio = sceneRegistry.extend({
  stat: defineScene<StatSceneProps>({ component: StatScene, defaultDuration: 4 }),
});
buildComposition({ id, scenes: [{ scene: "stat", props: { value: "42%" } }] }, studio);
```

### 4. Transparency (optional)

If a scene renders transparently (translucent surface / overlay), mark it so the opacity
contract applies: `defineScene<…>({ component, opaque: false })`, or per instance
`{ scene: "stat", opaque: false }`. See [TRANSITIONS.md](./TRANSITIONS.md).

### 5. Test

- Type test: `{ scene: "stat", props: { valeu: 1 } }` should `@ts-expect-error`.
- Render a smoke still: `npx remotion still <id> --frame=…`.

## Examples

See the ten built-ins (`HeroScene`, `SplitScene`, `GalleryScene`, …) — `SplitScene`/
`ComparisonScene` show orientation branching via `useFormat`; `FeatureScene`/`GalleryScene` show
staggering distributed `children`.

## Best practices

- Slots take **content** (text/nodes); the scene applies the typographic role + motion.
- Stagger entrances with increasing `delay` (`staggered` helper).
- Default `align`/`maxWidth`/`surface` sensibly; expose them as props.

## Common mistakes

- Importing from `composition` (upward dependency) — scenes depend downward only.
- Hardcoding content, colors, or sizes.
- Registering in a second place instead of the single `builtinScenes` map (drift — the E3
  problem ADR-001 fixed).

## Extension points

- Reuse `SceneFrame` for any new scene; extend `SceneBaseProps`.
- Ship scenes in a plugin by exposing a registry the caller `.extend()`s.
