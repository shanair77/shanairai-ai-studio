/**
 * HeroReveal — the cinematic composite entrance.
 *
 * Layers four moves onto one element for a dramatic title reveal: fade in, settle a slight
 * zoom (`scaleFrom` → 1), sharpen from a soft `blur`, and rise a small `distance`. Every
 * spatial value is authored at BASE_WIDTH and scaled per format; each is configurable, and
 * all share the one duration/delay/easing window. Built for Headline/HeroReveal moments.
 */

import { interpolate } from "remotion";
import { animation } from "../config/Animation";
import { timing } from "../config/Timing";
import { useScale } from "../format";
import { useAnimationProgress, type MotionProps } from "./useAnimationProgress";

export type HeroRevealProps = MotionProps & {
  /** Starting scale factor (settles to 1). Default 1.08. */
  scaleFrom?: number;
  /** Starting blur radius in base-px (scaled, settles to 0). Default 8. */
  blur?: number;
  /** Upward travel distance in base-px (scaled, settles to 0). Default 24. */
  distance?: number;
};

export const HeroReveal: React.FC<HeroRevealProps> = ({
  scaleFrom = 1.08,
  blur = animation.blur.soft,
  distance = animation.distance.sm,
  duration = timing.durations.slower,
  delay = 0,
  easing = "luxe",
  style,
  className,
  children,
}) => {
  const progress = useAnimationProgress({ duration, delay, easing });
  const { scale } = useScale();
  const s = interpolate(progress, [0, 1], [scaleFrom, 1]);
  const radius = interpolate(progress, [0, 1], [scale(blur), 0]);
  const y = interpolate(progress, [0, 1], [scale(distance), 0]);

  return (
    <div
      className={className}
      style={{
        opacity: progress,
        scale: s,
        translate: `0px ${y}px`,
        filter: `blur(${radius}px)`,
        transformOrigin: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
