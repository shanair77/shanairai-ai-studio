/**
 * Float — gentle, looping ambient drift.
 *
 * Oscillates `children` along one axis with a sine wave for a soft "floating" idle motion
 * — no start or end, it simply loops. `amplitude` (base-px, scaled) sets the travel and
 * `period` the seconds per full cycle. A `delay` holds it still before the drift begins.
 *
 * Frame-driven like everything else: the sine phase comes from `useCurrentFrame()` and its
 * output is mapped to pixels through `interpolate()`.
 */

import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { secondsToFrames } from "../config/Timing";
import { useScale } from "../format";
import { type MotionLayoutProps } from "./useAnimationProgress";

export type FloatProps = MotionLayoutProps & {
  /** Peak travel from centre, in base-px (scaled). Default 12. */
  amplitude?: number;
  /** Seconds per full oscillation. Default 3. */
  period?: number;
  /** Axis of travel. Default "y". */
  axis?: "x" | "y";
  /** Hold still for this many seconds before drifting. Default 0. */
  delay?: number;
};

export const Float: React.FC<FloatProps> = ({
  amplitude = 12,
  period = 3,
  axis = "y",
  delay = 0,
  style,
  className,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { scale } = useScale();

  const start = secondsToFrames(delay, fps);
  const periodFrames = Math.max(1, secondsToFrames(period, fps));
  const elapsed = Math.max(0, frame - start);
  const wave = Math.sin((elapsed / periodFrames) * Math.PI * 2); // -1 → 1
  const offset = interpolate(wave, [-1, 1], [-scale(amplitude), scale(amplitude)]);
  const translate = axis === "x" ? `${offset}px 0px` : `0px ${offset}px`;

  return (
    <div className={className} style={{ translate, ...style }}>
      {children}
    </div>
  );
};
