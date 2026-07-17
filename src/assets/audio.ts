/**
 * assets/audio — frame-driven audio helpers (fade envelope + trim).
 *
 * `audioVolume` builds a Remotion `VolumeProp` (a number, or a `(frame) => number` when a fade
 * is requested), applying a linear fade-in over the first `fadeInFrames` and a fade-out over the
 * last `fadeOutFrames` of the clip's `totalFrames`. Pure and unit-tested.
 */

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Volume as a constant, or a frame-driven fade envelope when fades are requested. */
export const audioVolume = (
  base: number,
  fadeInFrames: number,
  fadeOutFrames: number,
  totalFrames: number,
): number | ((frame: number) => number) => {
  if (fadeInFrames <= 0 && fadeOutFrames <= 0) return base;
  return (frame: number): number => {
    let v = base;
    if (fadeInFrames > 0) v *= clamp01(frame / fadeInFrames);
    if (fadeOutFrames > 0 && totalFrames > 0) v *= clamp01((totalFrames - frame) / fadeOutFrames);
    return v < 0 ? 0 : v;
  };
};
