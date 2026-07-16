# ADR-001 — Typed Scene Registration & the Registry Pattern

- **Status:** Accepted — pending implementation (Phase 10D)
- **Date:** 2026-07-16
- **Deciders:** Framework architecture
- **Supersedes:** the string-keyed scene registry introduced in Phase 8
- **Related review findings:** E1 (no config↔prop type safety), E3 (scenes defined in two places), E4 (unsafe registry casts), plus the Phase 10B note (no registry factory → shared global test state)

---

## 1. Problem

The Composition Engine resolves scenes by name at runtime, but the config↔component
boundary is entirely stringly-typed:

- `CompositionSchema.SceneConfig` = `{ scene: string; props?: Record<string, unknown> }`.
- `SceneRegistry` stores `ComponentType<Record<string, unknown>>` and registers the ten
  built-ins through a **hand-maintained array** kept separate from the scene files, using
  `as unknown as SceneComponent` casts.

Consequences:

1. A misspelled scene name (`"herro"`) is caught only at **render time** (`registry.require` throws).
2. A misspelled or wrong-typed prop (`titel`, `maxWidth: "big"`) is **silently dropped** — no error anywhere.
3. Adding a scene requires editing **two** places (the scene module and the registry array),
   which can drift (E3).
4. The registry is a **global mutable singleton** with no factory, so tests share state and
   cannot construct isolated instances (Phase 10B gap).

For a framework whose entire value proposition is "describe a video as configuration," the
configuration surface having no type safety is the highest-value API defect remaining.

## 2. Alternatives considered

**A. Keep strings, add runtime validation.** Validate scene names/props at
`buildComposition` time against the registry. — Rejected: still no editor autocomplete, still
fails late (runtime, not compile time), and prop shapes can't be validated without duplicating
each scene's schema.

**B. Global module augmentation (`declare module`).** A global `SceneRegistryMap` interface
that third parties augment; `SceneName = keyof SceneRegistryMap`. — Rejected as the *primary*
mechanism: types and runtime live in two places, so they can **drift** (augment-but-forget-
register type-checks yet throws at runtime; register-but-forget-augment errors in types yet
works at runtime). It also pollutes a global type for every consumer. Retained only as a
possible future opt-in for teams wanting a purely-global name.

**C. Factory + typed map as the single source of truth (chosen).** One map literal defines
each scene's component, duration, **and** prop type; the runtime registry and all config types
are *derived* from that one map. Custom scenes extend via an immutable factory. Types and
runtime cannot drift because they share one source.

**Naming sub-decision.** `createScene<Props>()` was rejected (in this codebase a "scene" is a
React component, so `createScene` misleads). `defineScene<Props>()` was rejected for
introducing a second verb (`define`) alongside the registry's `create` verb. **`createSceneDefinition<Props>()`**
was chosen: single verb, precise noun, and it generalizes uniformly to every future family
(`createTransitionDefinition`, `createAssetDefinition`, …).

## 3. Chosen design

### 3.1 A generic registry kernel (`src/registry/`)

A dependency-free primitive that every registry family reuses, establishing one canonical
registry API:

```ts
export type DefinitionMap = Record<string, unknown>;

export interface Registry<M extends DefinitionMap> {
  readonly entries: M;
  keys(): (keyof M & string)[];
  has(key: string): boolean;
  get<K extends keyof M & string>(key: K): M[K];           // typed lookup
  require(key: string): M[keyof M];                        // dynamic lookup; throws if absent
  extend<E extends DefinitionMap>(entries: E): Registry<Omit<M, keyof E> & E>; // immutable
}

export const createRegistry = <M extends DefinitionMap>(entries: M): Registry<M>;
```

### 3.2 The scene family (built on the kernel)

```ts
export type SceneDefinition<P = unknown> = {
  component: React.ComponentType<P>;
  defaultDuration: number; // seconds
};

export const createSceneDefinition = <P>(spec: {
  component: React.ComponentType<P>;
  defaultDuration?: number;
}): SceneDefinition<P>;

export type SceneMap  = Record<string, SceneDefinition<any>>;
export type PropsOf<D> = D extends SceneDefinition<infer P> ? P : never;

// One definition site — replaces the separate array (E3) and drops the casts (E4):
export const builtinScenes = {
  hero:  createSceneDefinition<HeroSceneProps>({ component: HeroScene }),
  quote: createSceneDefinition<QuoteSceneProps>({ component: QuoteScene }),
  // … centered, split, feature, gallery, comparison, cta, logo-reveal, outro
} satisfies SceneMap;

export const sceneRegistry = createRegistry(builtinScenes);   // default singleton
export type BuiltinSceneMap = typeof builtinScenes;
```

### 3.3 Config types derived from the map (E1)

```ts
export type SceneConfigFor<M extends SceneMap> = {
  [N in keyof M & string]: {
    scene: N;
    props?: PropsOf<M[N]>;
    duration?: number; durationInFrames?: number; transition?: TransitionConfig; label?: string;
  };
}[keyof M & string];                                   // discriminated union on `scene`

export type CompositionSchemaFor<M extends SceneMap> = VideoConfigInput & {
  id: string; theme?: ThemeMode; brand?: BrandConfig; music?: MusicConfig;
  scenes: SceneConfigFor<M>[]; transitions?: TransitionConfig; timing?: TimingConfig; assets?: AssetCatalog;
};

export type CompositionSchema = CompositionSchemaFor<BuiltinSceneMap>;   // default
```

`buildComposition` gains two overloads so the default path stays ergonomic and custom
registries infer their config:

```ts
function buildComposition(config: CompositionSchema): BuiltComposition;                                   // default singleton
function buildComposition<M extends SceneMap>(config: CompositionSchemaFor<M>, registry: Registry<M>): BuiltComposition;
// implementation is unchanged: it iterates config.scenes over the erased SceneResolver
```

The **type safety lives at the config-authoring surface only**; `Timeline` and
`CompositionBuilder` continue to operate on an erased `SceneResolver`
(`require(string) → { component, defaultDuration }`), so the render plumbing does not change.

### 3.4 Authoring examples

```ts
// ✓ valid                                   // ✗ compile errors (previously silent / runtime-only):
{ scene: "hero",  props: { title: "AI Studio", maxWidth: 1200 } }
{ scene: "herro", props: {} }                // 'herro' is not a scene name
{ scene: "hero",  props: { titel: "x" } }    // 'titel' is not in HeroSceneProps
{ scene: "quote", props: { maxWidth: "big" } } // number expected

// Custom scene, fully typed, no augmentation:
const studio = sceneRegistry.extend({
  testimonialWall: createSceneDefinition<TestimonialWallProps>({ component: TestimonialWall, defaultDuration: 6 }),
});
buildComposition({ id: "Promo", scenes: [{ scene: "testimonialWall", props: { /* typed */ } }] }, studio);
```

## 4. Dependency impact

- **Changed, all within `composition/`:** `SceneRegistry.ts` (map + `createSceneDefinition` +
  `createRegistry` usage), `CompositionSchema.ts` (config types derived from the map),
  `CompositionBuilder.ts` (overloads only; internals identical), `index.ts` (exports).
  `Timeline.ts` is effectively unchanged (already erased; never reads `SceneDefinition.name`).
- **New kernel:** `src/registry/` — dependency-free, sits below every domain layer.
- **New type-level edge:** `CompositionSchema.ts → SceneRegistry.ts` (imports the map type +
  `PropsOf`). `SceneRegistry.ts` does **not** import `CompositionSchema` ⇒ **no cycle**
  (verified against current imports). Both are intra-layer (`composition/`).
- **Untouched:** every scene component, `components/`, `animations/`, `config/`, `format/`.
  Visual layers stay unaware. **Runtime output is unchanged** (same components, durations,
  builder) — the demo must re-render byte-identical.

## 5. Migration strategy

1. Add the `src/registry/` kernel (`Registry<M>`, `createRegistry`, `DefinitionMap`).
2. Rewrite `SceneRegistry.ts`: `createSceneDefinition`, `builtinScenes` map, `sceneRegistry =
   createRegistry(builtinScenes)`; keep the erased `SceneResolver` for Timeline/Builder. Drop
   the unused `SceneDefinition.name` (name = map key) and the `as unknown as` casts.
3. Derive `SceneConfigFor` / `CompositionSchemaFor` and concrete `SceneConfig` /
   `CompositionSchema` in `CompositionSchema.ts`.
4. Overload `buildComposition`; internals unchanged.
5. Update `composition/index.ts` exports (add `createSceneDefinition`, `createRegistry`,
   `Registry`, `SceneMap`, `PropsOf`, `SceneName`, `CompositionSchemaFor`; retire the mutating
   `registerScene` in favour of `.extend()`).
6. Update the two affected suites (`SceneRegistry.test`, `Timeline.test`) for the new shapes,
   and **add a type-level suite** (`expectTypeOf` + `// @ts-expect-error`) proving unknown
   scene names and wrong props are now compile errors — a permanent E1 regression guard, run
   under the existing `test:typecheck` path.
7. Gate the phase on: (a) `demoConfig` type-checks unchanged, (b) the demo re-renders
   **byte-identical**, (c) the new type tests pass. `npm run verify` green.

**Migration risk is low and contained:** runtime behaviour is unchanged; only `composition/`,
two test suites, and one config are touched. `registerScene` is replaced by immutable
`.extend()` (only tests use it today).

## 6. Future extension points

Every future registry follows the **same three-part recipe**, reusing the kernel:

| Family        | Definition + factory                                  | Default instance                        | Config discriminant |
|---------------|-------------------------------------------------------|-----------------------------------------|---------------------|
| Scenes        | `SceneDefinition` / `createSceneDefinition<Props>`    | `sceneRegistry = createRegistry(…)`     | `scene`             |
| Transitions   | `TransitionDefinition` / `createTransitionDefinition` | `transitionRegistry = createRegistry(…)`| `transition`        |
| Assets        | `AssetDefinition` / `createAssetDefinition`           | `assetRegistry = createRegistry(…)`     | `asset`             |
| Effects       | `EffectDefinition` / `createEffectDefinition`         | `effectRegistry = createRegistry(…)`    | `effect`            |
| Brands        | `BrandDefinition` / `createBrandDefinition`           | `brandRegistry = createRegistry(…)`     | `brand`             |
| Templates     | `TemplateDefinition` / `createTemplateDefinition`     | `templateRegistry = createRegistry(…)`  | `template`          |

Conventions each family inherits: single-verb `create<X>Definition` factories; a `satisfies`-checked
map as the single source of truth; a default instance via `createRegistry`; immutable `.extend()`
for third-party additions; a `ConfigFor<M>` mapped-union when the family participates in a
schema. This is how X3 (the transition-system decision) and the empty `transitions/`, `effects/`
layers will be built — as typed registries, not ad-hoc modules.

## 7. Consequences

- **Positive:** compile-time safety for scene names and props (E1); one definition site (E3);
  no unsafe casts (E4); hermetic, extendable registries (Phase 10B gap); a reusable pattern for
  all future registries; runtime unchanged.
- **Negative / accepted:** `createSceneDefinition` is verbose at call sites; mapped-union
  configs can produce dense TS errors on a wrong prop; non-literal `scene` values do not narrow
  (need `as`); `ReactNode` props reaffirm that config is code, not JSON. All are documented and
  judged acceptable against the safety gained.
