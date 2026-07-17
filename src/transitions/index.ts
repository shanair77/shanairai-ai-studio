/**
 * transitions/ — the typed transition engine (ADR-002).
 *
 * Wraps `@remotion/transitions` (`TransitionSeries`) behind the framework's registry pattern:
 * a provider-agnostic manifest of `TransitionDefinition`s with capability metadata, resolved
 * by name and assembled programmatically by the CompositionBuilder. `fade` is opaque-only
 * (Remotion's incoming-only fade); `dissolve` is the custom transparency-safe cross-dissolve.
 */

export {
  createTransitionDefinition,
  type TransitionDefinition,
  type TransitionCapabilities,
  type TransitionContext,
  type TransitionMap,
  type TransitionResolver,
  type OptionsOf,
} from "./types";

export {
  builtinTransitions,
  transitionRegistry,
  type BuiltinTransitionMap,
  type TransitionName,
  type SlideOptions,
  type WipeOptions,
  type SlideDirection,
  type WipeDirection,
} from "./TransitionRegistry";

export { dissolve } from "./presentations";
