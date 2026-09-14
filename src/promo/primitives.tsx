/**
 * promo/primitives — the film's frame-driven motion vocabulary + the hero-footage plate.
 *
 * Every value here is derived from `useCurrentFrame()` through `interpolate()` — no CSS
 * transitions or Tailwind animation classes (they don't render deterministically). Transforms
 * use the `scale` / `translate` / `filter` shorthands, per the house rules. Sizes authored in
 * base-px are scaled by `useScale()` so the film reads identically at any output resolution.
 */

import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KenBurns, type KenBurnsProps } from "../animations";
import { useScale } from "../format";
import { withAlpha, CREAM, INK } from "./palette";
import { HERO_SRC } from "./config";

/** House easing — a soft, cinematic ease-in-out. */
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
/** A crisper ease for UI/kinetic moves. */
export const EASE_OUT = Easing.out(Easing.cubic);

/** interpolate with clamped extrapolation and the house ease (unless overridden). */
export const ramp = (
  frame: number,
  range: [number, number],
  out: [number, number] = [0, 1],
  easing = EASE,
): number =>
  interpolate(frame, range, out, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export type AppearProps = {
  /** Fade/slide-in window [start, end] in local frames. */
  in?: [number, number];
  /** Optional fade/slide-out window [start, end]. */
  out?: [number, number];
  /** Slide distance in base-px (from below). Default 28. */
  y?: number;
  /** Max entrance blur in px (motion-blur feel). Default 8. */
  blur?: number;
  /** Entrance scale start. Default 1 (no zoom). */
  scaleFrom?: number;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
};

/** The workhorse entrance/exit: opacity + rise + de-blur, all frame-driven. */
export const Appear: React.FC<AppearProps> = ({
  in: inRange = [0, 12],
  out,
  y = 28,
  blur = 8,
  scaleFrom = 1,
  style,
  className,
  children,
}) => {
  const frame = useCurrentFrame();
  const { scale } = useScale();
  const pIn = ramp(frame, inRange);
  const pOut = out ? ramp(frame, out, [1, 0]) : 1;
  const opacity = pIn * pOut;
  const ty = (1 - pIn) * y;
  const b = (1 - pIn) * blur;
  const s = interpolate(pIn, [0, 1], [scaleFrom, 1]);

  return (
    <div
      className={className}
      style={{
        opacity,
        translate: `0 ${scale(ty)}px`,
        scale: s,
        filter: b > 0.05 ? `blur(${b}px)` : undefined,
        willChange: "opacity, transform, filter",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export type ClipRiseProps = {
  /** Rise window [start, end] in local frames. */
  in?: [number, number];
  /** Rise distance as a fraction of the line height (1 = fully hidden below). Default 1. */
  amount?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/** A line that rises out from behind a hard mask — the premium title reveal. */
export const ClipRise: React.FC<ClipRiseProps> = ({ in: inRange = [0, 16], amount = 1, style, children }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, inRange);
  return (
    <div style={{ overflow: "hidden", ...style }}>
      <div style={{ translate: `0 ${(1 - p) * amount * 100}%`, opacity: interpolate(p, [0, 0.2, 1], [0, 1, 1]) }}>
        {children}
      </div>
    </div>
  );
};

/** A directional legibility scrim (bottom by default) drawn in the brand ink. */
export const Scrim: React.FC<{ from?: "bottom" | "top" | "full"; strength?: number; color?: string }> = ({
  from = "bottom",
  strength = 1,
  color = INK,
}) => {
  const angle = from === "top" ? "180deg" : "0deg";
  const bg =
    from === "full"
      ? withAlpha(color, 0.5 * strength)
      : `linear-gradient(${angle}, ${withAlpha(color, 0.86 * strength)} 0%, ${withAlpha(
          color,
          0.5 * strength,
        )} 26%, ${withAlpha(color, 0.12 * strength)} 52%, ${withAlpha(color, 0)} 72%)`;
  return <AbsoluteFill style={{ background: bg }} />;
};

/** A soft cinematic vignette — keeps eyes centered, darkens edges under type. */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.5 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 80% at 50% 42%, ${withAlpha(INK, 0)} 42%, ${withAlpha(
        INK,
        0.55 * strength,
      )} 100%)`,
    }}
  />
);

export type HeroClipProps = {
  /** Seconds into the master to start at. */
  at: number;
  /** Ken Burns drift over the plate. Omit for a locked-off frame. */
  kenBurns?: KenBurnsProps;
  /** Object focal point (0–1). Default centered a touch high (faces sit high in frame). */
  focalX?: number;
  focalY?: number;
  /** Cover opacity, for dissolves. */
  opacity?: number;
  style?: React.CSSProperties;
};

/**
 * A frame from the finished Jet Set master, trimmed to `at` seconds and rendered muted and
 * full-bleed. `trimBefore` is measured in COMPOSITION frames (Remotion seeks the 24fps source
 * to the correct timestamp regardless), so `at * fps` lands on the intended shot.
 */
export const HeroClip: React.FC<HeroClipProps> = ({
  at,
  kenBurns,
  focalX = 0.5,
  focalY = 0.42,
  opacity,
  style,
}) => {
  const { fps } = useVideoConfig();
  const plate = (
    <OffthreadVideo
      src={staticFile(HERO_SRC)}
      muted
      trimBefore={Math.round(at * fps)}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${focalX * 100}% ${focalY * 100}%` }}
    />
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: INK, opacity, ...style }}>
      {kenBurns ? <KenBurns {...kenBurns}>{plate}</KenBurns> : plate}
    </AbsoluteFill>
  );
};

/** A thin gold hairline rule that draws itself in from the center. */
export const GoldRule: React.FC<{ in?: [number, number]; width?: number; height?: number; color?: string }> = ({
  in: inRange = [0, 18],
  width = 200,
  height = 3,
  color = CREAM,
}) => {
  const frame = useCurrentFrame();
  const { scale } = useScale();
  const p = ramp(frame, inRange);
  return (
    <div
      style={{
        width: scale(width) * p,
        height: scale(height),
        background: color,
        borderRadius: 999,
      }}
    />
  );
};
