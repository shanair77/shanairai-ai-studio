/**
 * Animation.ts — Shared animation system.
 *
 * Central easing curves and motion presets. Every animation in the engine is driven
 * by `useCurrentFrame()` + `interpolate()` (never CSS/Tailwind transitions, which do
 * not render). Presets pair a duration (from Timing) with an easing curve and a
 * spatial spec, so scenes stay visually consistent and on-brand.
 *
 * The house motion is soft, slow, and slightly overshooting — luxurious, not snappy.
 */

import { Easing } from "remotion";
import { timing } from "./Timing";

/** Named easing curves. Pass as `interpolate(..., { easing })`. */
export const easings = {
  linear: Easing.linear,
  /** Material-ish standard curve for general motion. */
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  /** Elegant ease-out — the default for elements entering. */
  entrance: Easing.bezier(0.16, 1, 0.3, 1),
  /** Quick ease-in for elements leaving. */
  exit: Easing.bezier(0.7, 0, 0.84, 0),
  /** Soft, refined deceleration — the signature "luxe" feel. */
  luxe: Easing.bezier(0.22, 1, 0.36, 1),
  /** Gentle in-out for slow drifts and holds. */
  gentle: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  /** Subtle overshoot for tasteful pops (no bounce). */
  overshoot: Easing.bezier(0.34, 1.4, 0.64, 1),
} as const;

export const animation = {
  easings,

  /** Slide travel distances in px at BASE_WIDTH (1080). Scale per format. */
  distance: {
    sm: 24,
    md: 48,
    lg: 96,
  },

  /** Scale endpoints for pop / rise / zoom entrances. */
  scale: {
    pop: { from: 0.9, to: 1 },
    rise: { from: 0.96, to: 1 },
    zoom: { from: 1.08, to: 1 },
  },

  /** Blur amounts in px for reveal and depth effects. */
  blur: {
    soft: 8,
    heavy: 20,
  },

  /**
   * Composable presets: a duration (seconds), an easing, and any spatial spec.
   * Consumed by the animation helpers in `src/animations/`.
   */
  presets: {
    fadeIn: {
      duration: timing.durations.base,
      easing: easings.entrance,
    },
    fadeInUp: {
      duration: timing.durations.slow,
      distance: 48,
      easing: easings.luxe,
    },
    fadeInDown: {
      duration: timing.durations.slow,
      distance: 48,
      easing: easings.luxe,
    },
    scaleIn: {
      duration: timing.durations.base,
      from: 0.92,
      easing: easings.overshoot,
    },
    revealBlur: {
      duration: timing.durations.slower,
      blur: 20,
      easing: easings.gentle,
    },
    kenBurns: {
      duration: timing.durations.cinematic,
      from: 1,
      to: 1.08,
      easing: easings.gentle,
    },
  },
} as const;

export type EasingToken = keyof typeof easings;
export type AnimationPreset = keyof typeof animation.presets;
export type Animation = typeof animation;
