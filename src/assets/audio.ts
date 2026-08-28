/**
 * assets/audio — frame-driven audio helpers (fade envelope, trim, ducking).
 *
 * `audioVolume` builds a Remotion `VolumeProp` (a number, or a `(frame) => number` when a fade
 * is requested), applying a linear fade-in over the first `fadeInFrames` and a fade-out over the
 * last `fadeOutFrames` of the clip's `totalFrames`.
 *
 * `duckedVolume` extends that with SIDECHAIN DUCKING: given a set of frame windows (typically
 * the voiceover cues resolved by the composition builder), it ramps the volume down to `level`
 * across each window and back up afterwards, so a music bed sits under narration without the
 * author hand-authoring an automation curve. Windows may overlap or be unsorted; closely-spaced
 * ones are MERGED first (`mergeDuckWindows`) so the bed stays down through a gap too short to
 * ramp back up and down again — otherwise two quick lines make the music audibly pump between
 * them, which is the classic giveaway of automated ducking.
 *
 * Both are pure and unit-tested.
 */

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

/** A frame window during which another source should duck. */
export type DuckWindow = {
  /** First frame of the window. */
  start: number;
  /** Last frame of the window (exclusive of the ramp-out that follows). */
  end: number;
};

/** Linear head/tail fade factor (0–1) for a clip of `totalFrames`. */
const fadeFactor = (frame: number, fadeInFrames: number, fadeOutFrames: number, totalFrames: number): number => {
  let f = 1;
  if (fadeInFrames > 0) f *= clamp01(frame / fadeInFrames);
  if (fadeOutFrames > 0 && totalFrames > 0) f *= clamp01((totalFrames - frame) / fadeOutFrames);
  return f;
};

/**
 * Sort and merge windows separated by `gap` frames or less, so a short pause between two cues
 * does not let the duck lift and fall again. Callers pass `2 * rampFrames` as the gap: any hole
 * smaller than a full ramp-out plus ramp-in cannot be traversed cleanly and should stay closed.
 */
export const mergeDuckWindows = (windows: DuckWindow[], gap: number): DuckWindow[] => {
  const valid = windows.filter((w) => w.end > w.start).sort((a, b) => a.start - b.start);
  const merged: DuckWindow[] = [];
  for (const w of valid) {
    const last = merged[merged.length - 1];
    if (last && w.start - last.end <= gap) last.end = Math.max(last.end, w.end);
    else merged.push({ start: w.start, end: w.end });
  }
  return merged;
};

/**
 * How fully ducked a frame is, 0 (open) → 1 (fully ducked), taking the deepest window.
 * Each window ramps in over the `rampFrames` BEFORE `start` and out over the `rampFrames`
 * AFTER `end`, so the duck is already in place when the narration begins.
 *
 * Expects windows already passed through `mergeDuckWindows` — it does not merge, so that the
 * merge cost is paid once per composition rather than once per frame.
 */
export const duckAmount = (frame: number, windows: DuckWindow[], rampFrames: number): number => {
  let deepest = 0;
  for (const w of windows) {
    if (w.end <= w.start) continue;
    let a: number;
    if (frame >= w.start && frame <= w.end) a = 1;
    else if (rampFrames > 0 && frame < w.start && frame >= w.start - rampFrames) a = (frame - (w.start - rampFrames)) / rampFrames;
    else if (rampFrames > 0 && frame > w.end && frame <= w.end + rampFrames) a = ((w.end + rampFrames) - frame) / rampFrames;
    else a = 0;
    if (a > deepest) deepest = a;
  }
  return clamp01(deepest);
};

/** Volume as a constant, or a frame-driven fade envelope when fades are requested. */
export const audioVolume = (
  base: number,
  fadeInFrames: number,
  fadeOutFrames: number,
  totalFrames: number,
): number | ((frame: number) => number) => {
  if (fadeInFrames <= 0 && fadeOutFrames <= 0) return base;
  return (frame: number): number => {
    const v = base * fadeFactor(frame, fadeInFrames, fadeOutFrames, totalFrames);
    return v < 0 ? 0 : v;
  };
};

/**
 * Volume with head/tail fades AND ducking to `level` across `windows`.
 *
 * Falls back to `audioVolume` when there is nothing to duck, so a track without narration
 * over it keeps the cheaper constant/simple-envelope form.
 */
export const duckedVolume = (
  base: number,
  fadeInFrames: number,
  fadeOutFrames: number,
  totalFrames: number,
  windows: DuckWindow[],
  level: number,
  rampFrames: number,
): number | ((frame: number) => number) => {
  const active = mergeDuckWindows(windows, rampFrames * 2);
  if (active.length === 0) return audioVolume(base, fadeInFrames, fadeOutFrames, totalFrames);

  return (frame: number): number => {
    const ducked = base + (level - base) * duckAmount(frame, active, rampFrames);
    const v = ducked * fadeFactor(frame, fadeInFrames, fadeOutFrames, totalFrames);
    return v < 0 ? 0 : v;
  };
};
