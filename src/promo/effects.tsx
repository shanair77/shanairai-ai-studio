/**
 * promo/effects — frame-driven "cinemagraph" motion for still images.
 *
 * These make a photograph feel alive using ONLY `useCurrentFrame()` + `interpolate()` (no CSS
 * animations, per the house rules): a sweeping specular highlight, drifting bokeh, candle
 * flicker, organic handheld drift, and film grain. They compose over a <Photo>. Every value is
 * a pure function of the frame, so renders stay deterministic (no Math.random at render — a
 * seeded hash places the bokeh instead).
 */

import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { useScale } from "../format";

/** Deterministic 0–1 hash for a seed (mulberry32 step) — replaces Math.random at render. */
const rand = (seed: number): number => {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** A diagonal specular band that sweeps across the frame once — a glint on glass, metal, skin. */
export const LightSweep: React.FC<{
  start?: number;
  dur?: number;
  angle?: number;
  opacity?: number;
  thickness?: number;
}> = ({ start = 0, dur = 60, angle = 22, opacity = 0.32, thickness = 16 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + dur], [-30, 130], {
    easing: Easing.inOut(Easing.ease),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, transparent ${p - thickness}%, rgba(255,246,230,${opacity}) ${p}%, transparent ${p + thickness}%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

/** Soft drifting, twinkling bokeh — candlelight, city lights, studio spill. */
export const Bokeh: React.FC<{ count?: number; seed?: number; rgb?: string; maxOpacity?: number; drift?: number }> = ({
  count = 14,
  seed = 1,
  rgb = "255,214,150",
  maxOpacity = 0.5,
  drift = 22,
}) => {
  const frame = useCurrentFrame();
  const { scale } = useScale();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = rand(seed + i * 4) * 100;
        const y = rand(seed + i * 4 + 1) * 100;
        const r = scale(18 + rand(seed + i * 4 + 2) * 64);
        const ph = rand(seed + i * 4 + 3) * 6.28;
        const dx = Math.sin(frame * 0.02 + ph) * drift;
        const dy = Math.cos(frame * 0.016 + ph * 1.3) * drift;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame * 0.05 + ph * 2));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: r,
              height: r,
              borderRadius: "50%",
              translate: `${scale(dx)}px ${scale(dy)}px`,
              background: `radial-gradient(circle, rgba(${rgb},${(maxOpacity * tw).toFixed(3)}) 0%, rgba(${rgb},0) 70%)`,
              filter: `blur(${scale(2)}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** A warm glow that flickers like a candle at a point in the frame. */
export const Flicker: React.FC<{ x?: number; y?: number; rgb?: string; size?: number; strength?: number }> = ({
  x = 0.5,
  y = 0.68,
  rgb = "255,170,80",
  size = 55,
  strength = 0.34,
}) => {
  const frame = useCurrentFrame();
  const f = 0.6 + 0.25 * Math.sin(frame * 0.4) + 0.12 * Math.sin(frame * 0.9 + 1) + 0.08 * Math.sin(frame * 1.9 + 2);
  const a = Math.max(0, Math.min(1, f)) * strength;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(${size}% ${size}% at ${x * 100}% ${y * 100}%, rgba(${rgb},${a.toFixed(3)}) 0%, transparent 62%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

/** Organic handheld drift — tiny summed-sine translate + rotate. Overscans so edges never show. */
export const Handheld: React.FC<{ amp?: number; rot?: number; children?: React.ReactNode }> = ({
  amp = 7,
  rot = 0.4,
  children,
}) => {
  const frame = useCurrentFrame();
  const { scale } = useScale();
  const x = (Math.sin(frame * 0.11) + 0.5 * Math.sin(frame * 0.23 + 1)) * amp;
  const y = (Math.cos(frame * 0.09 + 2) + 0.5 * Math.cos(frame * 0.19)) * amp;
  const r = Math.sin(frame * 0.07 + 0.5) * rot;
  return (
    <AbsoluteFill style={{ translate: `${scale(x)}px ${scale(y)}px`, rotate: `${r}deg`, scale: 1.08 }}>
      {children}
    </AbsoluteFill>
  );
};

/** Subtle animated film grain over the whole frame (frame-driven noise seed). */
export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const frame = useCurrentFrame();
  const seed = frame % 24;
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity, pointerEvents: "none" }}>
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <filter id="promo-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#promo-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** The effect keys a <Photo> can request. */
export type FxKey = "sweep" | "bokeh" | "flicker";

/** Render the requested overlay effects (handheld is applied by <Photo> as a wrapper). */
export const FxLayer: React.FC<{ fx?: FxKey[]; len: number; bokehRgb?: string; flickerAt?: [number, number] }> = ({
  fx,
  len,
  bokehRgb,
  flickerAt,
}) => {
  if (!fx || fx.length === 0) return null;
  return (
    <>
      {fx.includes("sweep") ? <LightSweep start={Math.round(len * 0.1)} dur={Math.round(len * 0.8)} /> : null}
      {fx.includes("bokeh") ? <Bokeh seed={7} rgb={bokehRgb} /> : null}
      {fx.includes("flicker") ? <Flicker x={flickerAt?.[0] ?? 0.5} y={flickerAt?.[1] ?? 0.68} /> : null}
    </>
  );
};
