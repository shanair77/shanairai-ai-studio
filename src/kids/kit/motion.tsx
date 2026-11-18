/** Small motion helpers shared by every story's scenes. */

import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);
export const easeOut = Easing.bezier(0.2, 0.8, 0.3, 1);

/** 0→1 over `len` frames starting at `at`: drives Pop / Bubble entrances. */
export const popAt = (frame: number, at: number, len = 12) => interpolate(frame, [at, at + len], [0, 1], clamp);

/** Gentle push-in so no shot is ever fully static. */
export const Camera: React.FC<{ from?: number; to?: number; children: React.ReactNode }> = ({
  from = 1,
  to = 1.06,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ scale: `${interpolate(frame, [0, durationInFrames], [from, to], clamp)}` }}>{children}</AbsoluteFill>
  );
};
