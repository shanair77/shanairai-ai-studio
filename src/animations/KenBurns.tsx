/**
 * KenBurns — slow continuous zoom + pan over the clip.
 *
 * The classic cinematic drift for background media: scales from `from` to `to` while
 * optionally panning by `panX` / `panY` (base-px, scaled). Unlike the entrances, it runs
 * across the whole composition by default — omit `duration` to span the full clip, or set
 * it (seconds) for a shorter move. The element fills its parent, so place it inside a
 * clipping box (e.g. a `fill` Container / AbsoluteFill) so the overscan stays hidden.
 */

import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { secondsToFrames } from "../config/Timing";
import { useScale } from "../format";
import { resolveEasing, type MotionLayoutProps, type EasingLike } from "./useAnimationProgress";

export type KenBurnsProps = MotionLayoutProps & {
  /** Starting scale. Default 1. */
  from?: number;
  /** Ending scale. Default 1.08. */
  to?: number;
  /** Horizontal pan across the move, in base-px (scaled). Default 0. */
  panX?: number;
  /** Vertical pan across the move, in base-px (scaled). Default 0. */
  panY?: number;
  /** Move length in seconds. Omit to span the whole clip. */
  duration?: number;
  /** Lead-in before the move begins, in seconds. Default 0. */
  delay?: number;
  /** Named easing token or a custom easing function. Default "gentle". */
  easing?: EasingLike;
  /** CSS transform-origin for the zoom. Default "center". */
  origin?: string;
};

export const KenBurns: React.FC<KenBurnsProps> = ({
  from = 1,
  to = 1.08,
  panX = 0,
  panY = 0,
  duration,
  delay = 0,
  easing = "gentle",
  origin = "center",
  style,
  className,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const { scale: sc } = useScale();

  const start = secondsToFrames(delay, fps);
  const span = duration !== undefined ? secondsToFrames(duration, fps) : durationInFrames;
  const end = Math.max(start + 1, start + span);

  const progress = interpolate(frame, [start, end], [0, 1], {
    easing: resolveEasing(easing),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const s = interpolate(progress, [0, 1], [from, to]);
  const tx = interpolate(progress, [0, 1], [0, sc(panX)]);
  const ty = interpolate(progress, [0, 1], [0, sc(panY)]);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        scale: s,
        translate: `${tx}px ${ty}px`,
        transformOrigin: origin,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
