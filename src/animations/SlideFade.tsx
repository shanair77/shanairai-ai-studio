/**
 * SlideFade — internal engine for the directional fade primitives.
 *
 * Fades in while travelling a scaled distance along one axis. Direction is expressed as
 * an axis + sign so FadeUp/FadeDown/FadeLeft/FadeRight are one-line wrappers over it.
 * The travel distance is authored at BASE_WIDTH and scaled via `useScale()` so motion
 * reads the same in every format. Not exported from the barrel — use the named variants.
 */

import { interpolate } from "remotion";
import { animation } from "../config/Animation";
import { timing } from "../config/Timing";
import { useScale } from "../format";
import { useAnimationProgress, type MotionProps } from "./useAnimationProgress";

/** Public props for a directional fade (FadeUp/Down/Left/Right). */
export type DirectionalFadeProps = MotionProps & {
  /** Travel distance in base-px (scaled per format). Default 48. */
  distance?: number;
};

type SlideFadeProps = DirectionalFadeProps & {
  axis: "x" | "y";
  /** +1 starts at +distance and settles to 0; -1 starts at -distance. */
  sign: 1 | -1;
};

export const SlideFade: React.FC<SlideFadeProps> = ({
  axis,
  sign,
  distance = animation.distance.md,
  duration = timing.durations.slow,
  delay = 0,
  easing = "luxe",
  style,
  className,
  children,
}) => {
  const progress = useAnimationProgress({ duration, delay, easing });
  const { scale } = useScale();
  const offset = interpolate(progress, [0, 1], [scale(distance) * sign, 0]);
  const translate = axis === "x" ? `${offset}px 0px` : `0px ${offset}px`;

  return (
    <div className={className} style={{ opacity: progress, translate, ...style }}>
      {children}
    </div>
  );
};
