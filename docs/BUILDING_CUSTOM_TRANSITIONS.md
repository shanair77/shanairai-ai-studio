# Building Custom Transitions

## Purpose

A step-by-step guide to writing a custom transition (or brand transition) and registering it
type-safely. Sources: `src/transitions/*`. Concepts: [TRANSITIONS.md](./TRANSITIONS.md),
[ADR-002](./adr/ADR-002-transition-architecture.md).

## Concepts

A transition is a **`TransitionPresentation`** (from `@remotion/transitions`) plus **capability
metadata**, wrapped in a `TransitionDefinition` via `defineTransition`:

```ts
type TransitionDefinition<Options> = {
  presentation: (options: Options | undefined, ctx: TransitionContext) => TransitionPresentation<any>;
  defaultDurationInFrames?: number;
  capabilities: TransitionCapabilities;   // affectsEntering/Exiting, requiresOpaqueIncoming, supportsTransparency
};
```

A `TransitionPresentation` is `{ component, props }`; its component receives
`presentationProgress` (0→1), `presentationDirection` (`"entering" | "exiting"`), `children`,
and `passedProps`. **Be honest in `capabilities`** — they drive the opacity contract.

## Steps

### 1. Write a presentation (`src/transitions/presentations.ts`)

Reuse a Remotion presentation, or write your own. Example — a both-sided (transparency-safe)
opacity dissolve, exactly as the built-in `dissolve`:

```tsx
import { createElement } from "react";
import { AbsoluteFill } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";

type Props = Record<string, never>;
const Component = ({ children, presentationDirection, presentationProgress }: TransitionPresentationComponentProps<Props>) =>
  createElement(AbsoluteFill,
    { style: { opacity: presentationDirection === "entering" ? presentationProgress : 1 - presentationProgress } },
    children);

export const softDissolve = (): TransitionPresentation<Props> => ({ component: Component, props: {} });
```

Presentations that need composition dimensions (like `clockWipe`/`iris`) receive them via the
factory's `ctx` argument: `presentation: (_o, ctx) => clockWipe({ width: ctx.width, height: ctx.height })`.

### 2. Define + register

As a built-in (`src/transitions/TransitionRegistry.ts`, in the `builtinTransitions` map):
```ts
softDissolve: defineTransition({
  presentation: () => softDissolve(),
  capabilities: { affectsEntering: true, affectsExiting: true, requiresOpaqueIncoming: false, supportsTransparency: true },
}),
```

…or per-video (no core change):
```ts
const custom = transitionRegistry.extend({
  plumVeil: defineTransition<{ softness?: number }>({
    presentation: (o) => plumVeil({ softness: o?.softness }),
    capabilities: { affectsEntering: true, affectsExiting: true, requiresOpaqueIncoming: false, supportsTransparency: true },
  }),
});
buildComposition({ id, transitions: { type: "plumVeil", options: { softness: 0.4 } }, scenes: [...] }, sceneRegistry, custom);
```

### 3. Options typing

`defineTransition<Options>` captures the options type; the config's
`transition.options` is then typed per transition (e.g. `{ direction?: SlideDirection }` for
`slide`). Options-less transitions use `defineTransition({ … })` (Options = `void`).

### 4. Capabilities & the opacity contract

- `requiresOpaqueIncoming: true` → the engine rejects this transition into a `opaque: false`
  scene. Set it only for incoming-only presentations (like `fade`).
- `supportsTransparency: true` → correct even over transparent scenes (both-sided or mask-based).
- `affectsEntering` / `affectsExiting` describe which layers the presentation animates
  (documentation + future tooling).

### 5. Test

- Type test: `{ type: "plumVeil", options: { softnes: 1 } }` should `@ts-expect-error`;
  `{ type: "notreal" }` should error.
- Structural test: assert the `TransitionSeries.Transition` appears with your presentation.
- Render a mid-transition smoke still.

## Examples

The built-ins (`fade`, `dissolve`, `slide`, `wipe`, `clockWipe`, `iris`) in
`TransitionRegistry.ts` are the reference implementations; `dissolve` (in `presentations.ts`) is
the reference custom presentation.

## Best practices

- Declare capabilities **honestly** — the opacity contract depends on them.
- Prefer transparency-safe presentations (both-sided / mask) unless you specifically want the
  cheaper opaque-only `fade`.
- Keep presentations pure and frame-driven (they receive `presentationProgress`).

## Common mistakes

- Marking an incoming-only presentation `supportsTransparency: true` — it will show seams on
  transparent scenes.
- Forgetting `ctx` for a dimension-dependent presentation (`clockWipe`/`iris`).
- Registering in two places instead of the single `builtinTransitions` map.

## Extension points

- Brand-pack transitions: ship a module that the caller `transitionRegistry.extend()`s.
- Per-transition easing: accept a `timing`/easing option and pass it to `linearTiming` in the
  builder (a documented extension).
