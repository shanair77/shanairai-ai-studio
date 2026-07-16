/**
 * VideoConfig — the canvas half of the engine's configuration.
 *
 * Resolves the raw dimensional inputs (width / height / fps / duration) that a
 * CompositionSchema declares into the concrete numbers Remotion's `<Composition>` needs.
 * A `format` preset from `config/Layout.ts` supplies sensible defaults that any explicit
 * field overrides, and `duration` (seconds) is converted to frames at the resolved fps.
 *
 * `durationInFrames` may resolve to `undefined` — that is intentional: it signals the
 * builder to let the Timeline derive total length from the scenes instead.
 */

import { formats, type FormatName } from "../config/Layout";
import { DEFAULT_FPS, secondsToFrames } from "../config/Timing";

/** Fully-resolved canvas: everything `<Composition>` needs except duration fallback. */
export type VideoConfig = {
  width: number;
  height: number;
  fps: number;
  /** Total frames, or undefined to let the Timeline derive it from the scenes. */
  durationInFrames?: number;
};

/** The dimensional fields a CompositionSchema may declare (all optional). */
export type VideoConfigInput = {
  /** Named format preset — seeds width/height/fps unless individually overridden. */
  format?: FormatName;
  width?: number;
  height?: number;
  fps?: number;
  /** Total length in seconds (converted to frames at the resolved fps). */
  duration?: number;
  /** Total length in frames (takes precedence over `duration`). */
  durationInFrames?: number;
};

/** Format used when none is specified. */
export const DEFAULT_FORMAT: FormatName = "vertical";

/** Resolve dimensional inputs into concrete canvas numbers. */
export const resolveVideoConfig = (input: VideoConfigInput = {}): VideoConfig => {
  const preset = formats[input.format ?? DEFAULT_FORMAT];
  const width = input.width ?? preset.width;
  const height = input.height ?? preset.height;
  const fps = input.fps ?? preset.fps ?? DEFAULT_FPS;
  const durationInFrames =
    input.durationInFrames ??
    (input.duration !== undefined ? secondsToFrames(input.duration, fps) : undefined);

  return { width, height, fps, durationInFrames };
};
