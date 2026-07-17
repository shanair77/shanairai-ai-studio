/**
 * TransitionRegistry — the typed transition lookup, built on the generic registry kernel.
 *
 * `builtinTransitions` is the single source of truth: each entry binds a presentation factory
 * to capability metadata. `fade` is Remotion's incoming-only fade (opaque-only, cheap);
 * `dissolve` is the custom transparency-safe cross-dissolve. Custom / brand-pack transitions
 * join type-safely via `transitionRegistry.extend({...})`. Mirrors the scene registry (ADR-001).
 */

import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { iris } from "@remotion/transitions/iris";
import { none } from "@remotion/transitions/none";
import { slide, type SlideDirection } from "@remotion/transitions/slide";
import { wipe, type WipeDirection } from "@remotion/transitions/wipe";
import { createRegistry } from "../registry";
import { dissolve } from "./presentations";
import { createTransitionDefinition, type TransitionMap } from "./types";

export type SlideOptions = { direction?: SlideDirection };
export type WipeOptions = { direction?: WipeDirection };
export type { SlideDirection, WipeDirection };

/** The built-in transitions with honest capability metadata (ADR-002 §4.3). */
export const builtinTransitions = {
  none: createTransitionDefinition({
    presentation: () => none(),
    defaultDurationInFrames: 0,
    capabilities: { affectsEntering: false, affectsExiting: false, requiresOpaqueIncoming: false, supportsTransparency: true },
  }),
  fade: createTransitionDefinition({
    // Remotion's incoming-only fade — correct only over an opaque incoming scene.
    presentation: () => fade(),
    capabilities: { affectsEntering: true, affectsExiting: false, requiresOpaqueIncoming: true, supportsTransparency: false },
  }),
  dissolve: createTransitionDefinition({
    // Custom both-sided cross-dissolve — transparency-safe.
    presentation: () => dissolve(),
    capabilities: { affectsEntering: true, affectsExiting: true, requiresOpaqueIncoming: false, supportsTransparency: true },
  }),
  slide: createTransitionDefinition<SlideOptions>({
    presentation: (options) => slide({ direction: options?.direction }),
    capabilities: { affectsEntering: true, affectsExiting: true, requiresOpaqueIncoming: false, supportsTransparency: true },
  }),
  wipe: createTransitionDefinition<WipeOptions>({
    presentation: (options) => wipe({ direction: options?.direction }),
    capabilities: { affectsEntering: true, affectsExiting: true, requiresOpaqueIncoming: false, supportsTransparency: true },
  }),
  clockWipe: createTransitionDefinition({
    presentation: (_options, ctx) => clockWipe({ width: ctx.width, height: ctx.height }),
    capabilities: { affectsEntering: true, affectsExiting: true, requiresOpaqueIncoming: false, supportsTransparency: true },
  }),
  iris: createTransitionDefinition({
    presentation: (_options, ctx) => iris({ width: ctx.width, height: ctx.height }),
    capabilities: { affectsEntering: true, affectsExiting: true, requiresOpaqueIncoming: false, supportsTransparency: true },
  }),
} satisfies TransitionMap;

export type BuiltinTransitionMap = typeof builtinTransitions;

/** The strongly-typed union of built-in transition names. */
export type TransitionName = keyof BuiltinTransitionMap & string;

/** The default transition registry (built-ins). Extend it for custom transitions. */
export const transitionRegistry = createRegistry(builtinTransitions);
