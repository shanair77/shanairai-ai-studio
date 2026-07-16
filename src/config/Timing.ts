/**
 * Timing.ts — Shared timing system.
 *
 * Durations are authored in SECONDS so they read naturally and stay fps-independent.
 * Convert to frames at render time with `secondsToFrames(seconds, fps)` — always
 * source `fps` from `useVideoConfig()` rather than assuming 30.
 */

/** Fallback fps for compositions that don't specify one. */
export const DEFAULT_FPS = 30;

/** Seconds → whole frames at the given fps. */
export const secondsToFrames = (seconds: number, fps: number = DEFAULT_FPS): number =>
  Math.round(seconds * fps);

/** Frames → seconds at the given fps. */
export const framesToSeconds = (frames: number, fps: number = DEFAULT_FPS): number =>
  frames / fps;

export const timing = {
  fps: DEFAULT_FPS,

  /** Element enter/exit and micro-motion, in seconds. */
  durations: {
    instant: 0.15,
    fast: 0.3,
    base: 0.5,
    slow: 0.8,
    slower: 1.2,
    cinematic: 2,
  },

  /** Per-item offset when animating a list/group in sequence, in seconds. */
  stagger: {
    tight: 0.05,
    base: 0.1,
    loose: 0.2,
  },

  /** Common lead-in delays before an element begins, in seconds. */
  delay: {
    none: 0,
    short: 0.2,
    base: 0.4,
    long: 0.8,
  },

  /** Default on-screen lifetimes for whole scenes, in seconds. */
  scene: {
    short: 3,
    base: 5,
    long: 8,
    hold: 1.5,
  },
} as const;

export type DurationToken = keyof typeof timing.durations;
export type SceneDurationToken = keyof typeof timing.scene;
export type Timing = typeof timing;
