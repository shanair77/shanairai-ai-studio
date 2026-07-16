/**
 * animations/ — Reusable motion primitives.
 *
 * Frame-driven wrappers built on `useCurrentFrame()` + `interpolate()`, consuming the
 * easing curves from `config/Animation.ts` and durations (seconds) from `config/Timing.ts`.
 * Each renders a wrapping element with an inline, animated `style`, so it composes around
 * any typography or layout primitive: `<FadeUp><Headline>…</Headline></FadeUp>`. Spatial
 * values are authored at BASE_WIDTH and scaled per format via `useScale()`.
 *
 * Never use CSS or Tailwind transition/animation classes — they do not render.
 *
 * Every primitive takes `duration` + `delay` (seconds) and an `easing` (token or function),
 * and merges a `style` passthrough last so callers can override or extend the motion.
 *
 * Entrances / exits (one-shot):
 *   FadeIn / FadeOut          — opacity.
 *   FadeUp / FadeDown         — fade + vertical travel.
 *   FadeLeft / FadeRight      — fade + horizontal travel.
 *   ScaleIn                   — fade + scale-up pop.
 *   BlurReveal                — fade + focus pull.
 *   HeroReveal                — composite fade + zoom + blur + rise.
 * Continuous / ambient:
 *   KenBurns                  — slow zoom + pan over the clip.
 *   Float                     — looping sine drift.
 *   Parallax                  — steady depth drift over the clip.
 */

export { FadeIn, type FadeInProps } from "./FadeIn";
export { FadeOut, type FadeOutProps } from "./FadeOut";
export { FadeUp, type FadeUpProps } from "./FadeUp";
export { FadeDown, type FadeDownProps } from "./FadeDown";
export { FadeLeft, type FadeLeftProps } from "./FadeLeft";
export { FadeRight, type FadeRightProps } from "./FadeRight";
export { ScaleIn, type ScaleInProps } from "./ScaleIn";
export { BlurReveal, type BlurRevealProps } from "./BlurReveal";
export { HeroReveal, type HeroRevealProps } from "./HeroReveal";
export { KenBurns, type KenBurnsProps } from "./KenBurns";
export { Float, type FloatProps } from "./Float";
export { Parallax, type ParallaxProps } from "./Parallax";

// Shared timing/easing contract, for consumers building their own motion.
export {
  useAnimationProgress,
  resolveEasing,
  type EasingFn,
  type EasingLike,
  type MotionProps,
  type MotionTimingProps,
  type MotionLayoutProps,
} from "./useAnimationProgress";
export { type DirectionalFadeProps } from "./SlideFade";
