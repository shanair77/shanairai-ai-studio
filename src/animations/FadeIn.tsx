/**
 * FadeIn — opacity 0 → 1.
 *
 * The plainest entrance: reveals `children` by interpolating opacity from the current
 * frame. Duration, delay, and easing are all configurable; wraps any typography or
 * layout primitive.
 */

import { timing } from "../config/Timing";
import { useAnimationProgress, type MotionProps } from "./useAnimationProgress";

export type FadeInProps = MotionProps;

export const FadeIn: React.FC<FadeInProps> = ({
  duration = timing.durations.base,
  delay = 0,
  easing = "entrance",
  style,
  className,
  children,
}) => {
  const opacity = useAnimationProgress({ duration, delay, easing });

  return (
    <div className={className} style={{ opacity, ...style }}>
      {children}
    </div>
  );
};
