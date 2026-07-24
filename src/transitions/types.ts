/**
 * transitions/types — the transition family's definition contract (ADR-002).
 *
 * Mirrors the scene family: a `TransitionDefinition<Options>` binds a presentation factory,
 * an optional default overlap, and honest capability metadata; `defineTransition`
 * captures the options type for config inference. Presentations come from
 * `@remotion/transitions` (or custom ones); the definition wraps them behind a uniform
 * factory that also receives composition dimensions (needed by clockWipe / iris).
 */

import type { TransitionPresentation } from "@remotion/transitions";

/** Composition dimensions a presentation may need (clockWipe / iris). */
export type TransitionContext = { width: number; height: number };

/**
 * Honest description of what a transition does to each layer and its opacity requirements.
 * The opacity contract (see resolver) uses `requiresOpaqueIncoming` / `supportsTransparency`.
 */
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
  /** Build a @remotion/transitions presentation from options + composition context. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presentation: (options: Options | undefined, context: TransitionContext) => TransitionPresentation<any>;
  /** Default overlap in frames (falls back to the theme base duration in the resolver). */
  defaultDurationInFrames?: number;
  capabilities: TransitionCapabilities;
};

/** Bind a presentation + capabilities into a typed transition definition. */
export const defineTransition = <Options = void>(
  spec: TransitionDefinition<Options>,
): TransitionDefinition<Options> => spec;

/** A map of transition name → definition. Prop/option type erased to `any` per entry. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TransitionMap = Record<string, TransitionDefinition<any>>;

/** Extract a transition definition's options type. */
export type OptionsOf<D> = D extends TransitionDefinition<infer O> ? O : never;

/** Minimal erased contract the resolver depends on (satisfied by any transition Registry). */
export type TransitionResolver = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  require(type: string): TransitionDefinition<any>;
  has(type: string): boolean;
  keys(): string[];
};
