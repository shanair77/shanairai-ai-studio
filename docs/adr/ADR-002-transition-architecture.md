# ADR-002 — Transition Architecture (`TransitionSeries` + typed transition registry)

- **Status:** Accepted — Phase 12 implementation
- **Date:** 2026-07-16
- **Deciders:** Framework architecture
- **Related:** review finding X3 (transition-system decision), X2 (current fade shows seams on transparent scenes); ADR-001 (the registry pattern this reuses)
- **Supersedes conceptually:** the internal fade-overlap implementation in `CompositionBuilder` (Phase 8)

---

## 1. Problem

The engine needs a real transition system — multiple effects (fade, slide, wipe, zoom, blur,
mask, branded), scene-level overrides, a default, config-driven assembly, and typed
registration — without owning a bespoke, correctness-sensitive transition engine.

Today `CompositionBuilder` renders each scene in its own overlapping `<Sequence>` and fades
the **incoming** scene in via `SceneClip` (`opacity 0→1`). It supports only `fade`, and — the
X2 defect — it fades incoming over an **assumed-opaque** outgoing scene, so a transparent
scene produces a seam or double-exposure.

## 2. Critical correction (vs. the Phase-11 draft)

**`@remotion/transitions`' built-in `fade()` is not a true, transparency-safe cross-dissolve.**
Per the official docs, `fade()` fades **only the incoming** layer and leaves the outgoing
layer unchanged, and it "works properly when the incoming scene is fully opaque." That is the
**same limitation** as our current `SceneClip`. Adopting `TransitionSeries` therefore does
**not** by itself resolve X2.

The benefit of `TransitionSeries` must be split into two independent claims:

- **Claim 1 — sequencing & simultaneous rendering (unconditionally true).**
  `TransitionSeries` owns scene sequencing, overlap **duration**, and renders **both** the
  exiting and entering sequences **simultaneously** during the overlap window, applying the
  chosen presentation to each (with `presentationDirection: "exiting" | "entering"`). This is
  a genuine, correctness-preserving framework win over hand-rolling.

- **Claim 2 — alpha-safe cross-dissolve (NOT automatic).**
  A dissolve that is correct when scenes are transparent requires **either**
  - **(a)** an **opacity guarantee** that the incoming scene fully covers the frame opaquely
    (then `fade()` is correct and is the cheapest, cleanest option — no mid-point dip), **or**
  - **(b)** a **custom presentation** that animates **both** layers appropriately
    (exiting `opacity 1→0`, entering `opacity 0→1`), which preserves correctness without
    assuming opacity.

So X2 is resolved by **a custom transparency-safe `dissolve` presentation + an explicit
opacity contract**, built *on top of* `TransitionSeries` — not by `TransitionSeries` or
`fade()` alone.

## 3. Alternatives considered

- **Option A — keep the internal Sequence-overlap model and implement all transitions
  ourselves.** Low scaffolding cost, but reaching feature parity (both-sided animation, masks
  for slide/wipe/clockWipe/iris, correct compositing) means re-implementing `TransitionSeries`
  — exactly the multi-year debt X3 warns about.
- **Option B — adopt `@remotion/transitions` (`TransitionSeries`), assembled programmatically
  from config, with a typed `transitionRegistry` on the ADR-001 kernel, plus a custom
  transparency-safe `dissolve` and an opacity contract.** Chosen.

The correction in §2 does **not** change the recommendation: Option B still wins, because the
transparency-safe dissolve is ~10 lines *on top of* `TransitionSeries`, mask-based transitions
(transparency-safe by geometry) come from the library, and Claim 1 is a real unconditional
win. Under Option A we would have to build the simultaneous-rendering framework, the masks,
**and** the dissolve ourselves.

## 4. Decision

Adopt `TransitionSeries`, assembled via `createElement` (no hardcoded JSX), driven by a typed
`transitionRegistry` built on the generic kernel. Represent every transition's behavior with
an explicit **capability model**, enforce an **opacity contract**, and ship a **custom
transparency-safe `dissolve`** as a first-class built-in distinct from `fade`.

### 4.1 Opacity contract

- **Scenes declare opacity.** `SceneDefinition` gains `opaque?: boolean` (default `true` — the
  built-ins paint an opaque `surface`). A scene *instance* may override via `SceneConfig.opaque`
  when used transparently (translucent surface, alpha background, overlay usage).
  Effective opacity = `sceneConfig.opaque ?? sceneDefinition.opaque ?? true`.
- **Transitions declare capabilities** (see §4.2).
- **The builder/validator enforces the contract.** For each boundary, if the transition's
  `requiresOpaqueIncoming` is `true` and the incoming scene is not opaque, `validateComposition`
  throws a clear error recommending a `supportsTransparency` transition (e.g. `dissolve`).
  Fail-fast, at config time, before rendering.

### 4.2 Transition capability model

```ts
export type TransitionCapabilities = {
  /** Animates the entering (incoming) layer. */
  affectsEntering: boolean;
  /** Animates the exiting (outgoing) layer. */
  affectsExiting: boolean;
  /** Correct ONLY when the incoming scene fully covers the frame opaquely. */
  requiresOpaqueIncoming: boolean;
  /** Preserves correctness when either scene has transparency. */
  supportsTransparency: boolean;
};

export type TransitionDefinition<Options> = {
  /** Builds a @remotion/transitions TransitionPresentation from options. */
  presentation: (options: Options) => TransitionPresentation<Options>;
  /** Default overlap length in frames (falls back to the theme base duration). */
  defaultDurationInFrames?: number;
  capabilities: TransitionCapabilities;
};

export const createTransitionDefinition = <Options = void>(
  spec: Omit<TransitionDefinition<Options>, never>,
): TransitionDefinition<Options> => spec;
```

### 4.3 Built-in transition registry (capabilities are explicit and honest)

| name       | source                | affectsEntering | affectsExiting | requiresOpaqueIncoming | supportsTransparency |
|------------|-----------------------|:---------------:|:--------------:|:----------------------:|:--------------------:|
| `none`     | hard cut              | –               | –              | no                     | yes                  |
| `fade`     | Remotion `fade()`     | yes             | no             | **yes**                | no                   |
| `dissolve` | **custom (both-sides)** | yes           | yes            | no                     | **yes**              |
| `slide`    | Remotion `slide()`    | yes             | yes            | no                     | yes                  |
| `wipe`     | Remotion `wipe()`     | yes             | yes            | no                     | yes                  |
| `zoom`     | Remotion `scale()`    | yes             | (impl)         | (impl)                 | (impl)               |
| `clockWipe`| Remotion `clockWipe()`| yes             | yes            | no                     | yes                  |

`fade` is retained as the **opaque-optimized** dissolve (cheapest, no mid-point luminance dip)
and is honest about `requiresOpaqueIncoming: true`. `dissolve` is the **transparency-safe**
cross-dissolve (animates both layers). `zoom` capabilities are pinned once its presentation is
implemented (marked `(impl)` until then; conservative defaults `requiresOpaqueIncoming: true`).

The custom `dissolve` presentation, conceptually:

```ts
// entering → opacity = progress ; exiting → opacity = 1 - progress
const DissolveComponent = ({ presentationDirection, presentationProgress, children }) =>
  createElement(AbsoluteFill,
    { style: { opacity: presentationDirection === "entering" ? presentationProgress : 1 - presentationProgress } },
    children);
```

### 4.4 Default transition

The composition default stays `{ type: "none" }`. `fade` remains valid and correct for the
default opaque scenes; authors choose `dissolve` when a scene is transparent (or the contract
error steers them there).

## 5. Config-driven assembly & duration

- **Assembly:** `createElement(TransitionSeries, null, [Sequence, Transition, Sequence, …])`,
  interleaving `TransitionSeries.Sequence` (scene) and `TransitionSeries.Transition`
  (`presentation` from the registry, `timing: linearTiming({ durationInFrames })`). Fully
  config-driven; music and `BrandThemeProvider` remain outer siblings, so **audio continuity is
  unaffected** (`TransitionSeries` is visual-only).
- **Total duration:** `TransitionSeries` does not surface its length outward, and Remotion needs
  `<Composition durationInFrames>` up front, so a **slim resolver** computes
  **Σ(scene frames) − Σ(transition frames)** (clamped) — the same arithmetic `Timeline` does
  today. `Timeline` therefore **slims and changes** (drops absolute `from`/overlap placement,
  keeps duration + per-boundary transition specs); it does **not** disappear.

## 6. Dependency impact

- **New dependency:** `@remotion/transitions@4.0.489` (version-matched).
- **Changed (composition/ + new transitions/):** `src/transitions/` (definitions, built-in map,
  `transitionRegistry`, the custom `dissolve`); `CompositionSchema` (typed `TransitionType` from
  the registry, optional `options`/`timing`, scene `opaque`, contract validation); `Timeline`
  (slim resolver); `CompositionBuilder` (assemble `TransitionSeries`).
- **Untouched:** scenes, components, animations, config tokens, format, the registry kernel
  (reused). `DemoConfig` stays valid (`{ type: "fade", duration: 0.5 }` still compiles/renders).
- **Direction preserved:** `transitions/` → `../registry` + `@remotion/transitions` (downward);
  `CompositionSchema` → `transitions` for the typed `TransitionType` (intra/adjacent-layer, no
  cycle). Mirrors the scene registry's edges.

## 7. Consequences

- **Positive:** real multi-effect transitions; correct simultaneous rendering; X2 resolved *for
  real* via `dissolve` + contract (not hand-waved via `fade`); typed, extensible registry;
  honest capability metadata; a rich, named vocabulary for a future AI Director; we own only the
  thin config/registry/assembly layer.
- **Negative / accepted:** a new dependency to version-track; `Timeline`/`CompositionBuilder`
  restructuring (runtime-observable, guarded by duration-parity + render tests); `fade` remains
  opaque-only (documented, contract-enforced); perfect blending of two arbitrary *semi*-
  transparent layers is inherently limited — `dissolve` is the standard pragmatic approximation,
  correct for the common "one layer transparent" case.

## 8. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Treating `fade()` as a true cross-dissolve (the corrected error) | — | Explicit capability flags + `dissolve` built-in + contract validation |
| Transparent incoming scene + `requiresOpaqueIncoming` transition | Medium | `validateComposition` fails fast, recommends a `supportsTransparency` transition |
| `Timeline`/`Builder` restructuring regresses output | Medium | Duration-parity assertion vs current model; per-transition render stills; `DemoConfig` byte-diff |
| New dependency drift from Remotion core | Low | Pin to `4.0.489`; bump with Remotion |
| Transition duration exceeding a neighbor sequence | Low | Resolver clamps to `min(neighbors)` as today |
| Scene-embedded audio hard-cut at a boundary | Low / known | Global music unaffected; documented out-of-scope; revisit with audio-aware transitions |
| `dissolve` mid-point luminance dip on opaque scenes | Low | Keep `fade` as the opaque-optimized default option |

## 9. Testing strategy

- **Pure:** slim `resolveTimeline` — per-scene frames, per-boundary transition specs, clamping,
  **total-duration parity** with the current model for `none`/`fade`.
- **Contract:** `validateComposition` **rejects** a `requiresOpaqueIncoming` transition into a
  non-opaque scene, and **accepts** a `supportsTransparency` one; effective-opacity resolution
  (`config ?? definition ?? true`).
- **Structural (no render):** assemble-from-config test asserting the interleaved
  `Sequence`/`Transition` children — order, `durationInFrames`, presentation identity, timing
  frames — proving config-driven assembly without rendering.
- **Type-level:** `transitionRegistry` names + `options` via `expectTypeOf` + `@ts-expect-error`
  (mirrors `SceneTypes.test`).
- **Visual/render:** one still per transition at mid-progress; a **transparent-scene** case
  demonstrating **`dissolve` correct vs. `fade` seam** (the concrete X2 proof); `DemoConfig`
  re-render diff for `fade` on opaque scenes.

## 10. Future extension points

Brand-pack transitions ship as custom presentations registered via
`transitionRegistry.extend({...})` with declared capabilities; per-transition easing via the
`timing` field; audio-aware transitions later. Follows the ADR-001 recipe exactly:
`createTransitionDefinition<Options>` + `createRegistry` + a `ConfigFor`-style discriminant.

## 11. Public API examples

```ts
export const builtinTransitions = {
  none:     createTransitionDefinition({ presentation: none, defaultDurationInFrames: 0,
              capabilities: { affectsEntering: false, affectsExiting: false, requiresOpaqueIncoming: false, supportsTransparency: true } }),
  fade:     createTransitionDefinition({ presentation: fade,
              capabilities: { affectsEntering: true, affectsExiting: false, requiresOpaqueIncoming: true, supportsTransparency: false } }),
  dissolve: createTransitionDefinition({ presentation: dissolve, // custom, both-sided
              capabilities: { affectsEntering: true, affectsExiting: true, requiresOpaqueIncoming: false, supportsTransparency: true } }),
  slide:    createTransitionDefinition<{ direction?: SlideDirection }>({ presentation: slide,
              capabilities: { affectsEntering: true, affectsExiting: true, requiresOpaqueIncoming: false, supportsTransparency: true } }),
} satisfies TransitionMap;

export const transitionRegistry = createRegistry(builtinTransitions);

// Backward-compatible + typed + capability-checked:
{ transitions: { type: "fade", duration: 0.5 } }                                  // valid (opaque scenes)
{ scene: "overlayCard", opaque: false, transition: { type: "dissolve", duration: 0.5 } } // transparency-safe
{ scene: "overlayCard", opaque: false, transition: { type: "fade" } }             // ✗ validateComposition throws:
//   "fade requiresOpaqueIncoming but scene 'overlayCard' is not opaque — use a supportsTransparency transition (e.g. dissolve)."
{ transition: { type: "slide", options: { direction: "from-left" } } }
// ✗ { type: "sldie" }  → compile error (unknown transition)
```
