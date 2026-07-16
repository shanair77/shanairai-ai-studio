/**
 * FadeOut — opacity 1 → 0.
 *
 * Fades `children` away over the window. Pair with a `delay` to hold the element on
 * screen before it exits. Uses the quicker "exit" easing by default.
 */

import { interpolate } from "remotion";
import { timing } from "../config/Timing";
import { useAnimationProgress, type MotionProps } from "./useAnimationProgress";

export type FadeOutProps = MotionProps;

export const FadeOut: React.FC<FadeOutProps> = ({
  duration = timing.durations.base,
  delay = 0,
  easing = "exit",
  style,
  className,
  children,
}) => {
  const progress = useAnimationProgress({ duration, delay, easing });
  const opacity = interpolate(progress, [0, 1], [1, 0]);

  return (
    <div className={className} style={{ opacity, ...style }}>
      {children}
    </div>
  );
};
