/**
 * Parallax — steady depth drift across the clip.
 *
 * Translates `children` a scaled `distance` along one axis over the whole composition,
 * multiplied by `speed`. Give layered elements different speeds (and `reverse` for
 * opposing motion) to fake depth as the scene plays. Linear by default so the drift is
 * even; frame-driven via `useCurrentFrame()` + `interpolate()`.
 */

import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { animation } from "../config/Animation";
import { secondsToFrames } from "../config/Timing";
import { useScale } from "../format";
import { resolveEasing, type MotionLayoutProps, type EasingLike } from "./useAnimationProgress";

export type ParallaxProps = MotionLayoutProps & {
  /** Total travel across the clip, in base-px (scaled). Default 96. */
  distance?: number;
  /** Multiplier on the travel — higher reads as "closer". Default 1. */
  speed?: number;
  /** Axis of travel. Default "y". */
  axis?: "x" | "y";
  /** Reverse the direction of travel. Default false. */
  reverse?: boolean;
  /** Lead-in before the drift begins, in seconds. Default 0. */
  delay?: number;
  /** Named easing token or a custom easing function. Default "linear". */
  easing?: EasingLike;
};

export const Parallax: React.FC<ParallaxProps> = ({
  distance = animation.distance.lg,
  speed = 1,
  axis = "y",
  reverse = false,
  delay = 0,
  easing = "linear",
  style,
  className,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const { scale } = useScale();

  const start = secondsToFrames(delay, fps);
  const end = Math.max(start + 1, durationInFrames);
  const travel = scale(distance) * speed * (reverse ? -1 : 1);

  const offset = interpolate(frame, [start, end], [0, travel], {
    easing: resolveEasing(easing),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translate = axis === "x" ? `${offset}px 0px` : `0px ${offset}px`;

  return (
    <div className={className} style={{ translate, ...style }}>
      {children}
    </div>
  );
};
