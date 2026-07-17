# Registries

## Purpose

Document the generic registry kernel and the pattern every registry family follows, so scenes,
transitions, and future families (assets, brands, effects, templates) stay consistent and
type-safe. Canonical decision: [ADR-001](./adr/ADR-001-typed-scene-registration.md).

## Concepts

A **registry** maps string keys to **definitions** of a single family. The runtime lookup and
all config types are derived from **one typed map** (the single source of truth), so a
misspelled name or prop is a compile error, not a silent failure.

### Registry relationship diagram

```mermaid
graph TD
  KERNEL["registry kernel<br/>createRegistry · Registry&lt;M&gt;"]
  KERNEL --> SCENES["sceneRegistry<br/>createSceneDefinition&lt;Props&gt;"]
  KERNEL --> TRANS["transitionRegistry<br/>createTransitionDefinition&lt;Options&gt;"]
  KERNEL -. future .-> ASSET["assetRegistry<br/>createAssetDefinition"]
  KERNEL -. future .-> BRAND["brandRegistry<br/>createBrandDefinition"]
  KERNEL -. future .-> EFFECT["effectRegistry<br/>createEffectDefinition"]
  KERNEL -. future .-> TEMPLATE["templateRegistry<br/>createTemplateDefinition"]
  SCENES --> SCHEMA["CompositionSchema<br/>(scenes[].scene + props typed)"]
  TRANS --> SCHEMA2["CompositionSchema<br/>(transition.type + options typed)"]
```

## The generic kernel — `src/registry`

```ts
export type DefinitionMap = Record<string, unknown>;

export interface Registry<M extends DefinitionMap> {
  readonly entries: M;
  keys(): (keyof M & string)[];
  has(key: string): boolean;
  get<K extends keyof M & string>(key: K): M[K];   // typed lookup
  require(key: string): M[keyof M];                // dynamic lookup; throws if absent
  extend<E extends DefinitionMap>(entries: E): Registry<Omit<M, keyof E> & E>;  // immutable
}

export const createRegistry: <M extends DefinitionMap>(entries: M) => Registry<M>;
```

- **`entries` / `keys` / `has` / `get` / `require`** — read the map.
- **`extend`** — returns a *new* registry with added/overriding entries; the original is never
  mutated (hermetic, and safe for tests and third-party additions).

## The three-part recipe

Every family follows the same recipe:

1. A **`Definition` type** describing one entry.
2. A **`create<X>Definition<T>()`** factory that binds the value and captures the type `T`.
3. A **`satisfies`-checked map** + a default instance via `createRegistry`, plus a
   `ConfigFor<M>` mapped-union when the family participates in the schema.

### `createSceneDefinition` (scenes)

```ts
export type SceneDefinition<P> = { component: React.ComponentType<P>; defaultDuration: number; opaque?: boolean };

export const builtinScenes = {
  hero:  createSceneDefinition<HeroSceneProps>({ component: HeroScene }),
  quote: createSceneDefinition<QuoteSceneProps>({ component: QuoteScene }),
  // …
} satisfies SceneMap;

export const sceneRegistry = createRegistry(builtinScenes);
```

`CompositionSchema` derives `SceneConfigFor<M>` — a union discriminated on `scene`, where each
name accepts exactly that scene's props. See [BUILDING_CUSTOM_SCENES.md](./BUILDING_CUSTOM_SCENES.md).

### `createTransitionDefinition` (transitions)

```ts
export type TransitionDefinition<Options> = {
  presentation: (options: Options | undefined, ctx: TransitionContext) => TransitionPresentation<any>;
  defaultDurationInFrames?: number;
  capabilities: TransitionCapabilities;   // affectsEntering/Exiting, requiresOpaqueIncoming, supportsTransparency
};

export const builtinTransitions = {
  fade:     createTransitionDefinition({ presentation: () => fade(), capabilities: { … } }),
  dissolve: createTransitionDefinition({ presentation: () => dissolve(), capabilities: { … } }),
  slide:    createTransitionDefinition<SlideOptions>({ presentation: (o) => slide({ direction: o?.direction }), capabilities: { … } }),
  // …
} satisfies TransitionMap;

export const transitionRegistry = createRegistry(builtinTransitions);
```

See [BUILDING_CUSTOM_TRANSITIONS.md](./BUILDING_CUSTOM_TRANSITIONS.md).

## Third-party / custom additions

`extend` keeps types and runtime in one source (no module augmentation, no drift):

```ts
const studio = sceneRegistry.extend({
  testimonialWall: createSceneDefinition<TestimonialWallProps>({ component: TestimonialWall, defaultDuration: 6 }),
});
buildComposition({ id, scenes: [{ scene: "testimonialWall", props: { … } }] }, studio);
```

## Future registries

Each follows the identical recipe (ADR-001 §6):

| Family | Definition + factory | Default instance | Config discriminant |
|---|---|---|---|
| Scenes | `SceneDefinition` / `createSceneDefinition` | `sceneRegistry` | `scene` |
| Transitions | `TransitionDefinition` / `createTransitionDefinition` | `transitionRegistry` | `transition` (`type`) |
| **Assets** | `AssetDefinition` / `createAssetDefinition` | `assetRegistry` | `asset` |
| **Brands** | `BrandDefinition` / `createBrandDefinition` | `brandRegistry` | `brand` |
| **Effects** | `EffectDefinition` / `createEffectDefinition` | `effectRegistry` | `effect` |
| **Templates** | `TemplateDefinition` / `createTemplateDefinition` | `templateRegistry` | `template` |

## Examples

```ts
import { createRegistry } from "./registry";

const colors = createRegistry({ brandA: "#4B2142", brandB: "#0E1B2B" });
colors.keys();          // ["brandA", "brandB"]
colors.get("brandA");   // "#4B2142" (typed)
colors.require("nope"); // throws: Registry: no entry registered as "nope". Registered: brandA, brandB.
const more = colors.extend({ brandC: "#00E0C6" });  // new registry; `colors` unchanged
```

## Best practices

- Define a family's entries in **one** `satisfies`-checked map — never a separate parallel list.
- Use `create<X>Definition` so the entry's type is captured for config inference.
- Prefer `.extend()` for additions (immutable, typed) over any mutable global registration.
- Keep the kernel domain-agnostic; family specifics live in the family's module.

## Common mistakes

- Writing the runtime map and the config types in two places (they drift — that's the E1/E3
  problem ADR-001 fixed).
- Mutating a shared registry instead of `.extend()`-ing a new one.
- Passing a non-literal name to a typed config (the union can't narrow — use `as` or a helper).

## Extension points

To add a family: create `Definition` + `create<X>Definition` + a `satisfies`-checked map +
`createRegistry(map)`, and (if it appears in the schema) a `ConfigFor<M>` mapped-union. That's
the whole pattern — see the scenes/transitions modules as reference implementations.
