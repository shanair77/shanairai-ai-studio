/**
 * BlurReveal — fade in while sharpening from a blur.
 *
 * Interpolates a `blur()` filter from `blur` base-px (scaled per format) down to 0 while
 * fading in, for a soft focus-pull reveal. Slower and gentle by default.
 */

import { interpolate } from "remotion";
import { animation } from "../config/Animation";
import { timing } from "../config/Timing";
import { useScale } from "../format";
import { useAnimationProgress, type MotionProps } from "./useAnimationProgress";

export type BlurRevealProps = MotionProps & {
  /** Starting blur radius in base-px (scaled, settles to 0). Default 20. */
  blur?: number;
};

export const BlurReveal: React.FC<BlurRevealProps> = ({
  blur = animation.blur.heavy,
  duration = timing.durations.slower,
  delay = 0,
  easing = "gentle",
  style,
  className,
  children,
}) => {
  const progress = useAnimationProgress({ duration, delay, easing });
  const { scale } = useScale();
  const radius = interpolate(progress, [0, 1], [scale(blur), 0]);

  return (
    <div className={className} style={{ opacity: progress, filter: `blur(${radius}px)`, ...style }}>
      {children}
    </div>
  );
};
