/**
 * ScaleIn — fade in while scaling up to full size.
 *
 * Grows `children` from `from` (default 0.92) to 1 while fading in, giving a tasteful
 * pop. Defaults to the "overshoot" easing for a soft settle. Scale origin is the centre.
 */

import { interpolate } from "remotion";
import { timing } from "../config/Timing";
import { useAnimationProgress, type MotionProps } from "./useAnimationProgress";

export type ScaleInProps = MotionProps & {
  /** Starting scale factor (settles to 1). Default 0.92. */
  from?: number;
};

export const ScaleIn: React.FC<ScaleInProps> = ({
  from = 0.92,
  duration = timing.durations.base,
  delay = 0,
  easing = "overshoot",
  style,
  className,
  children,
}) => {
  const progress = useAnimationProgress({ duration, delay, easing });
  const scale = interpolate(progress, [0, 1], [from, 1]);

  return (
    <div
      className={className}
      style={{ opacity: progress, scale, transformOrigin: "center", ...style }}
    >
      {children}
    </div>
  );
};
