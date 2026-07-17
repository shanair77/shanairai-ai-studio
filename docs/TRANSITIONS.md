# Transitions

## Purpose

Document the transition engine: how scenes hand off, the built-in transitions and their honest
capability metadata, the opacity contract, and how transitions are assembled. Sources:
`src/transitions/*`. Decision: [ADR-002](./adr/ADR-002-transition-architecture.md).

## Concepts

Transitions are built on `@remotion/transitions` (`TransitionSeries`) behind the registry
pattern. Each transition is a `TransitionDefinition`:

```ts
type TransitionDefinition<Options> = {
  presentation: (options: Options | undefined, ctx: TransitionContext) => TransitionPresentation<any>;
  defaultDurationInFrames?: number;
  capabilities: TransitionCapabilities;
};
```

`TransitionSeries` **renders both the exiting and entering layers simultaneously** during the
overlap and applies the presentation to each (`presentationDirection: "exiting" | "entering"`).
Whether a transition is transparency-safe depends on the **presentation**, not on
`TransitionSeries` itself.

### Capability metadata (honest, per transition)

```ts
type TransitionCapabilities = {
  affectsEntering: boolean;
  affectsExiting: boolean;
  requiresOpaqueIncoming: boolean;   // correct only over an opaque incoming scene
  supportsTransparency: boolean;     // correct even when a scene is transparent
};
```

### Built-ins

| name | source | entering | exiting | requiresOpaqueIncoming | supportsTransparency |
|---|---|:-:|:-:|:-:|:-:|
| `none` | cut | – | – | no | yes |
| `fade` | Remotion `fade()` (incoming-only) | yes | no | **yes** | no |
| `dissolve` | **custom both-sided** | yes | yes | no | **yes** |
| `slide` | Remotion `slide()` (`direction`) | yes | yes | no | yes |
| `wipe` | Remotion `wipe()` (`direction`) | yes | yes | no | yes |
| `clockWipe` | Remotion `clockWipe()` | yes | yes | no | yes |
| `iris` | Remotion `iris()` | yes | yes | no | yes |

**`fade` vs `dissolve`.** `fade` animates only the incoming layer (cheapest, no mid-point dip,
but needs an opaque incoming scene). `dissolve` is a **custom** presentation that animates both
layers (`exiting 1→0`, `entering 0→1`) and is transparency-safe.

## The opacity contract

- Scenes declare `opaque` (`SceneDefinition.opaque`, default `true`; per-instance override via
  `SceneConfig.opaque`). Built-in scenes are opaque by default (they paint a surface).
- `resolveTimeline` **rejects** a `requiresOpaqueIncoming` transition into a non-opaque incoming
  scene, with a message recommending a `supportsTransparency` transition:

  > Transition "fade" requires an opaque incoming scene, but scene "…" (index N) is declared
  > non-opaque. Use a transparency-safe transition (e.g. "dissolve").

## Assembly & duration

- Scenes connected by real transitions form a **run** rendered as one `<TransitionSeries>`;
  "cut" boundaries (0-frame, e.g. `none`) split runs so they contribute no duration.
- Overlaps are clamped to `≤ min(neighbouring scene durations)`.
- Total = `Σ(scene frames) − Σ(transition frames)` — see [COMPOSITION_ENGINE.md](./COMPOSITION_ENGINE.md).

## Examples

```ts
// default between all scenes
{ transitions: { type: "fade", duration: 0.5 } }
// per-scene override with options
{ scene: "hero", transition: { type: "slide", options: { direction: "from-left" } } }
// transparency-safe into an overlay scene
{ scene: "overlay", opaque: false, transition: { type: "dissolve", duration: 0.5 } }
```

## Best practices

- Use `fade` for opaque scenes (default), `dissolve` when a scene is transparent.
- Keep scenes at least as long as their transition overlaps.
- Pick a direction for `slide`/`wipe` via `options`.

## Common mistakes

- Treating `fade` as a true cross-dissolve — it's incoming-only (ADR-002 §2). Use `dissolve`.
- Using `fade` into a scene you marked `opaque: false` → rejected at build.
- Expecting a `none` boundary to fade — it's a hard cut (0 frames).

## Extension points

Custom / brand transitions → [BUILDING_CUSTOM_TRANSITIONS.md](./BUILDING_CUSTOM_TRANSITIONS.md)
via `transitionRegistry.extend({ … })`. Per-transition easing via a custom `timing` is a
documented extension of the presentation factory.
