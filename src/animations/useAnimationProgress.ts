/**
 * useAnimationProgress — shared frame→progress contract for the motion primitives.
 *
 * Every animation in this library is frame-driven: it reads `useCurrentFrame()` and maps
 * it through `interpolate()` (never CSS/Tailwind transitions, which do not render). This
 * hook centralises that mapping so each primitive only has to turn a 0→1 progress value
 * into a style.
 *
 * Timing is authored in SECONDS (matching `config/Timing.ts`) and converted to frames
 * against the live `fps` from `useVideoConfig()`, so a primitive behaves identically at
 * any frame rate. Easing accepts either a named curve token (`config/Animation.ts`) or a
 * raw easing function, and defaults to the house "entrance" curve.
 */

import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easings, type EasingToken } from "../config/Animation";
import { secondsToFrames } from "../config/Timing";

/** A raw Remotion easing function. */
export type EasingFn = (input: number) => number;

/** Either a named curve from the theme or a custom easing function. */
export type EasingLike = EasingToken | EasingFn;

/** Timing knobs shared by every one-shot motion primitive (seconds). */
export type MotionTimingProps = {
  /** Length of the animation in seconds. */
  duration?: number;
  /** Lead-in before the animation begins, in seconds. */
  delay?: number;
  /** Named easing token or a custom easing function. */
  easing?: EasingLike;
};

/** Wrapper plumbing shared by every motion primitive. */
export type MotionLayoutProps = {
  /** Merged last onto the animated element — escape hatch and override point. */
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
};

/** Full prop surface for a one-shot entrance/exit primitive. */
export type MotionProps = MotionTimingProps & MotionLayoutProps;

/** Resolve a token or function into a concrete easing function. */
export const resolveEasing = (easing: EasingLike): EasingFn =>
  typeof easing === "function" ? easing : easings[easing];

/**
 * Returns eased progress in [0, 1] for a window that starts after `delay` seconds and
 * lasts `duration` seconds. Clamped outside the window (holds 0 before, 1 after).
 */
export const useAnimationProgress = ({
  duration,
  delay = 0,
  easing = "entrance",
}: {
  duration: number;
  delay?: number;
  easing?: EasingLike;
}): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = secondsToFrames(delay, fps);
  // Guard against a zero/negative window (interpolate needs a strictly rising range).
  const end = start + Math.max(1, secondsToFrames(duration, fps));

  return interpolate(frame, [start, end], [0, 1], {
    easing: resolveEasing(easing),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};
