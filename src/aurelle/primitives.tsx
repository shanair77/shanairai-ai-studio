/**
 * aurelle/primitives — the bespoke cinematic motion vocabulary for ShanairAICommercial45.
 *
 * These turn flat campaign stills into cinematography WITHOUT touching biology: the camera,
 * light and frame move — never the model's face, hands or the product geometry. Everything is
 * a pure function of `useCurrentFrame()` (no CSS transitions), and every size is authored in
 * base-px and scaled by `useScale()` so it reads identically at any resolution.
 *
 * Reused from the existing film where they already solve the problem: `ramp`, `Appear`,
 * `ClipRise`, `Scrim`, `Vignette`, `GoldRule`, `EASE` (promo/primitives) and `LightSweep`,
 * `Bokeh`, `FilmGrain`, `Handheld` (promo/effects). This module adds only what AURELLE needs
 * on top: framed camera moves with a focal point, flash photography, detail crops, the design-
 * software cursor + selection box, exploded layer planes, and luxury kinetic type.
 */

import React from "react";
import { AbsoluteFill, Freeze, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useScale } from "../format";
import { resolveEasing, type EasingLike } from "../animations/useAnimationProgress";
import { ramp } from "../promo/primitives";
import { CREAM, GOLD, INK, PLATINUM, withAlpha } from "../promo/palette";
import { hasVideo, slotStill, slotVideo, type MediaSlot } from "./media";

/* ─────────────────────────── camera ─────────────────────────── */

export type CineImageProps = {
  src: string;
  /** Object focal point (0–1). Faces/products are kept in frame by choosing this well. */
  focalX?: number;
  focalY?: number;
  /** Scale keyframes across [startF, endF] — a slow push (to>from) or pull-back (to<from). */
  from?: number;
  to?: number;
  /** Lateral / vertical camera drift across the move, in base-px. */
  panX?: number;
  panY?: number;
  /** Rotation across the move, in degrees (use only where physically motivated). */
  rotate?: number;
  /** Local frame the move starts / ends. endF defaults to the clip's last frame. */
  startF?: number;
  endF?: number;
  easing?: EasingLike;
  /** Focus-pull: blur in px at the start / end of the move. */
  blurFrom?: number;
  blurTo?: number;
  /** Exposure: brightness multiplier at start / end. */
  brightnessFrom?: number;
  brightnessTo?: number;
  style?: React.CSSProperties;
};

/**
 * A framed camera move over a still: continuous scale + drift (+ optional rotate / focus-pull /
 * exposure), clipped so overscan never shows. The workhorse of the AURELLE act.
 */
export const CineImage: React.FC<CineImageProps> = ({
  src,
  focalX = 0.5,
  focalY = 0.45,
  from = 1.06,
  to = 1.12,
  panX = 0,
  panY = 0,
  rotate = 0,
  startF = 0,
  endF,
  easing = "luxe",
  blurFrom = 0,
  blurTo = 0,
  brightnessFrom = 1,
  brightnessTo = 1,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { scale } = useScale();
  const end = endF ?? durationInFrames;
  const p = interpolate(frame, [startF, end], [0, 1], {
    easing: resolveEasing(easing),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const s = interpolate(p, [0, 1], [from, to]);
  const tx = scale(interpolate(p, [0, 1], [0, panX]));
  const ty = scale(interpolate(p, [0, 1], [0, panY]));
  const rot = interpolate(p, [0, 1], [0, rotate]);
  const blur = interpolate(p, [0, 1], [blurFrom, blurTo]);
  const bright = interpolate(p, [0, 1], [brightnessFrom, brightnessTo]);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: INK, ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          translate: `${tx}px ${ty}px`,
          rotate: `${rot}deg`,
          scale: s,
          filter: blur > 0.05 ? `blur(${blur}px) brightness(${bright})` : `brightness(${bright})`,
          willChange: "transform, filter",
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${focalX * 100}% ${focalY * 100}%`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** A locked plate — same framing as CineImage but with no motion (for the freeze). */
export const StillImage: React.FC<{
  src: string;
  focalX?: number;
  focalY?: number;
  scale?: number;
  blur?: number;
  brightness?: number;
  style?: React.CSSProperties;
}> = ({ src, focalX = 0.5, focalY = 0.45, scale: s = 1.12, blur = 0, brightness = 1, style }) => (
  <AbsoluteFill style={{ overflow: "hidden", backgroundColor: INK, ...style }}>
    <div
      style={{
        width: "100%",
        height: "100%",
        scale: s,
        filter: `blur(${blur}px) brightness(${brightness})`,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${focalX * 100}% ${focalY * 100}%` }}
      />
    </div>
  </AbsoluteFill>
);

/** A zoomed crop of a region of a still — used to pull six detail hits out of the contact sheet. */
export const DetailCrop: React.FC<{
  src: string;
  focalX: number;
  focalY: number;
  zoom: number;
  /** Micro push added across the hit, in scale units. Default 0.06. */
  push?: number;
  /** Direction of a tiny lateral drift, in base-px. Default 0. */
  driftX?: number;
  style?: React.CSSProperties;
}> = ({ src, focalX, focalY, zoom, push = 0.06, driftX = 0, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { scale } = useScale();
  const p = ramp(frame, [0, durationInFrames]);
  const s = zoom * (1 + push * p);
  const tx = scale(interpolate(p, [0, 1], [0, driftX]));
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: INK, ...style }}>
      {/* zoom ORIGINATES at the focal point so the intended panel fills the frame */}
      <div style={{ width: "100%", height: "100%", scale: s, translate: `${tx}px 0px`, transformOrigin: `${focalX * 100}% ${focalY * 100}%` }}>
        <Img
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${focalX * 100}% ${focalY * 100}%` }}
        />
      </div>
    </AbsoluteFill>
  );
};

/* ─────────────────────────── still → video plate ─────────────────────────── */

/** Real footage, cover-framed to a focal point, with an optional subtle push and freeze. */
const VideoPlate: React.FC<{
  src: string;
  focalX: number;
  focalY: number;
  /** Subtle scale keyframes across the clip — footage carries the real motion, this only settles it. */
  push?: [number, number];
  trimBefore?: number;
  brightnessFrom?: number;
  brightnessTo?: number;
  /** Freeze the clip at this source frame (for the intentional 0:15 freeze). */
  freezeAtFrame?: number;
  style?: React.CSSProperties;
}> = ({ src, focalX, focalY, push = [1, 1.05], trimBefore, brightnessFrom = 1, brightnessTo = 1, freezeAtFrame, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [push[0], push[1]], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bright = interpolate(frame, [0, durationInFrames], [brightnessFrom, brightnessTo], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const inner = (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: INK, filter: `brightness(${bright})`, ...style }}>
      <OffthreadVideo
        src={staticFile(src)}
        muted
        trimBefore={trimBefore}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${focalX * 100}% ${focalY * 100}%`, scale: p }}
      />
    </AbsoluteFill>
  );
  return freezeAtFrame !== undefined ? <Freeze frame={freezeAtFrame}>{inner}</Freeze> : inner;
};

/**
 * The workhorse of the video-first pipeline: render a slot as REAL footage when its clip is
 * present, otherwise as the master still with the full editorial camera move. Swapping a still
 * for a clip (media.ts + videoManifest) needs no change here or in the edit.
 */
export const Plate: React.FC<{
  slot: MediaSlot;
  focalX?: number;
  focalY?: number;
  /** Still-only camera move (ignored once a clip is present). */
  from?: number;
  to?: number;
  panX?: number;
  panY?: number;
  rotate?: number;
  startF?: number;
  endF?: number;
  easing?: EasingLike;
  blurFrom?: number;
  blurTo?: number;
  brightnessFrom?: number;
  brightnessTo?: number;
  /** Subtle push applied to the clip (footage carries the motion; this only settles it). */
  videoPush?: [number, number];
  videoTrimBefore?: number;
  /** Freeze both modes at this frame — footage at its source frame, still at its terminal scale. */
  freezeAtFrame?: number;
  style?: React.CSSProperties;
}> = ({
  slot,
  focalX = 0.5,
  focalY = 0.45,
  from = 1.06,
  to = 1.12,
  panX = 0,
  panY = 0,
  rotate = 0,
  startF = 0,
  endF,
  easing = "luxe",
  blurFrom = 0,
  blurTo = 0,
  brightnessFrom = 1,
  brightnessTo = 1,
  videoPush = [1, 1.05],
  videoTrimBefore,
  freezeAtFrame,
  style,
}) => {
  if (hasVideo(slot)) {
    return (
      <VideoPlate
        src={slotVideo(slot)}
        focalX={focalX}
        focalY={focalY}
        push={videoPush}
        trimBefore={videoTrimBefore}
        brightnessFrom={brightnessFrom}
        brightnessTo={brightnessTo}
        freezeAtFrame={freezeAtFrame}
        style={style}
      />
    );
  }
  if (freezeAtFrame !== undefined) {
    return <StillImage src={slotStill(slot)} focalX={focalX} focalY={focalY} scale={to} brightness={brightnessTo} style={style} />;
  }
  return (
    <CineImage
      src={slotStill(slot)}
      focalX={focalX}
      focalY={focalY}
      from={from}
      to={to}
      panX={panX}
      panY={panY}
      rotate={rotate}
      startF={startF}
      endF={endF}
      easing={easing}
      blurFrom={blurFrom}
      blurTo={blurTo}
      brightnessFrom={brightnessFrom}
      brightnessTo={brightnessTo}
      style={style}
    />
  );
};

/**
 * Detail-montage plate: one distinct SHOT per hit — a full-frame clip when present, else the
 * slot's still filling the frame (cover) with a micro push. Each hit is its own image/clip, so
 * dropping a proper vertical still (or clip) into the slot renders it edge-to-edge.
 */
export const DetailPlate: React.FC<{
  slot: MediaSlot;
  focalX?: number;
  focalY?: number;
  push?: number;
  driftX?: number;
  style?: React.CSSProperties;
}> = ({ slot, focalX = 0.5, focalY = 0.5, push = 0.06, driftX = 0, style }) => {
  if (hasVideo(slot)) {
    return <VideoPlate src={slotVideo(slot)} focalX={focalX} focalY={focalY} push={[1, 1 + push]} style={style} />;
  }
  return <DetailCrop src={slotStill(slot)} focalX={focalX} focalY={focalY} zoom={1.06} push={push} driftX={driftX} style={style} />;
};

/* ─────────────────────────── light / exposure ─────────────────────────── */

/** White exposure pops for flash photography — each entry is a local frame the flash fires. */
export const FlashBurst: React.FC<{ flashes: number[]; strength?: number; rgb?: string }> = ({
  flashes,
  strength = 0.9,
  rgb = "255,252,245",
}) => {
  const frame = useCurrentFrame();
  let a = 0;
  for (const f of flashes) {
    // sharp attack (~2f), quick decay (~10f)
    const up = interpolate(frame, [f - 2, f], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const down = interpolate(frame, [f, f + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    a = Math.max(a, up * down);
  }
  if (a <= 0.001) return null;
  return (
    <AbsoluteFill
      style={{ background: `rgba(${rgb},${(a * strength).toFixed(3)})`, mixBlendMode: "screen", pointerEvents: "none" }}
    />
  );
};

/** A tonal grade wash — unify the frame toward a color, or push it toward near-black. */
export const Grade: React.FC<{ color?: string; strength?: number; blend?: React.CSSProperties["mixBlendMode"] }> = ({
  color = INK,
  strength = 0.2,
  blend = "multiply",
}) => <AbsoluteFill style={{ background: withAlpha(color, strength), mixBlendMode: blend, pointerEvents: "none" }} />;

/* ─────────────────────────── kinetic type ─────────────────────────── */

/** A luxury word reveal: letter-spacing expands out from tight while opacity lifts. */
export const TrackingReveal: React.FC<{
  children: React.ReactNode;
  in?: [number, number];
  from?: number;
  to?: number;
  style?: React.CSSProperties;
}> = ({ children, in: inRange = [0, 24], from = 0.02, to = 0.36, style }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, inRange);
  return (
    <div
      style={{
        opacity: interpolate(p, [0, 0.4, 1], [0, 1, 1]),
        letterSpacing: `${interpolate(p, [0, 1], [from, to])}em`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────── design-software UI ─────────────────────────── */

/** A precise, minimal design-tool cursor (arrow) that travels between points and clicks. */
export const Cursor: React.FC<{
  /** Path points as [x,y] fractions of the frame, visited across [startF, endF]. */
  path: Array<[number, number]>;
  startF: number;
  endF: number;
  /** Local frame a click pulse plays (cursor dips + a ring pings). */
  clickAt?: number;
  color?: string;
}> = ({ path, startF, endF, clickAt, color = CREAM }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { scale } = useScale();
  if (frame < startF) return null;

  const t = interpolate(frame, [startF, endF], [0, 1], {
    easing: resolveEasing("gentle"),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const seg = Math.min(path.length - 1, Math.max(0, Math.floor(t * (path.length - 1))));
  const local = t * (path.length - 1) - seg;
  const [ax, ay] = path[seg];
  const [bx, by] = path[Math.min(path.length - 1, seg + 1)];
  const x = interpolate(local, [0, 1], [ax, bx]) * width;
  const y = interpolate(local, [0, 1], [ay, by]) * height;

  const click = clickAt !== undefined ? ramp(frame, [clickAt, clickAt + 6], [1, 0]) : 0;
  const dip = clickAt !== undefined ? 1 - 0.16 * ramp(frame, [clickAt - 3, clickAt + 3], [0, 1]) * ramp(frame, [clickAt + 3, clickAt + 9], [1, 0]) : 1;
  const size = scale(46);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {clickAt !== undefined && click > 0 ? (
        <div
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: scale(70) * (1 - click),
            height: scale(70) * (1 - click),
            marginLeft: -scale(35) * (1 - click),
            marginTop: -scale(35) * (1 - click),
            borderRadius: "50%",
            border: `${scale(2)}px solid ${withAlpha(GOLD, click)}`,
          }}
        />
      ) : null}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ position: "absolute", left: x, top: y, scale: dip, filter: `drop-shadow(0 ${scale(2)}px ${scale(6)}px rgba(0,0,0,0.6))` }}
      >
        <path d="M3 2 L3 20 L8 15 L11.5 22 L14 21 L10.5 14 L17 14 Z" fill={color} stroke={INK} strokeWidth={1} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

export type Rect = { x: number; y: number; w: number; h: number };

/** A design-software selection: an outline that draws in, corner handles, and a dimension chip. */
export const SelectionBox: React.FC<{
  rect: Rect;
  in?: [number, number];
  label?: string;
  color?: string;
  /** Handle style. Default "corners". */
  handles?: "corners" | "none";
}> = ({ rect, in: inRange = [0, 12], label, color = GOLD, handles = "corners" }) => {
  const frame = useCurrentFrame();
  const { scale, scaleRounded } = useScale();
  const p = ramp(frame, inRange);
  if (p <= 0) return null;
  const hs = scale(16);
  const border = scaleRounded(2);

  const handle = (pos: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    width: hs,
    height: hs,
    background: INK,
    border: `${border}px solid ${color}`,
    ...pos,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: scale(rect.x),
        top: scale(rect.y),
        width: scale(rect.w),
        height: scale(rect.h),
        border: `${border}px solid ${withAlpha(color, p)}`,
        boxShadow: `0 0 ${scale(20)}px ${withAlpha(color, 0.25 * p)}`,
        opacity: p,
      }}
    >
      {handles === "corners"
        ? [
            { top: -hs / 2, left: -hs / 2 },
            { top: -hs / 2, right: -hs / 2 },
            { bottom: -hs / 2, left: -hs / 2 },
            { bottom: -hs / 2, right: -hs / 2 },
          ].map((pos, i) => <div key={i} style={handle(pos)} />)
        : null}
      {label ? (
        <div
          style={{
            position: "absolute",
            top: -scale(38),
            left: 0,
            fontFamily: `"Jost", sans-serif`,
            fontSize: scale(20),
            letterSpacing: "0.14em",
            color: INK,
            background: color,
            padding: `${scale(3)}px ${scale(10)}px`,
            borderRadius: scale(4),
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/** A named plane in the exploded composition — a labelled card that floats to a depth offset. */
export const LayerCard: React.FC<{
  label: string;
  /** Destination offset in base-px and depth (scale) reached across [in]. */
  x: number;
  y: number;
  depth?: number;
  rotate?: number;
  in?: [number, number];
  out?: [number, number];
  width: number;
  height: number;
  selected?: boolean;
  children?: React.ReactNode;
}> = ({ label, x, y, depth = 1, rotate = 0, in: inRange = [0, 20], out, width, height, selected = false, children }) => {
  const frame = useCurrentFrame();
  const { scale, scaleRounded } = useScale();
  const pIn = ramp(frame, inRange);
  const pOut = out ? ramp(frame, out, [1, 0]) : 1;
  const op = pIn * pOut;
  const tx = scale(x) * pIn;
  const ty = scale(y) * pIn;
  const s = interpolate(pIn, [0, 1], [1, depth]);
  const rot = interpolate(pIn, [0, 1], [0, rotate]);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: scale(width),
        height: scale(height),
        marginLeft: -scale(width) / 2,
        marginTop: -scale(height) / 2,
        translate: `${tx}px ${ty}px`,
        rotate: `${rot}deg`,
        scale: s,
        opacity: op,
        borderRadius: scale(10),
        overflow: "hidden",
        border: `${scaleRounded(selected ? 3 : 1)}px solid ${withAlpha(selected ? GOLD : PLATINUM, selected ? 0.9 : 0.28)}`,
        boxShadow: `0 ${scale(30)}px ${scale(70)}px rgba(0,0,0,${0.5 * op})`,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          left: scale(10),
          bottom: scale(10),
          fontFamily: `"Jost", sans-serif`,
          fontSize: scale(17),
          letterSpacing: "0.16em",
          color: withAlpha(CREAM, 0.82),
          background: withAlpha(INK, 0.6),
          padding: `${scale(3)}px ${scale(9)}px`,
          borderRadius: scale(4),
        }}
      >
        {label}
      </div>
    </div>
  );
};
