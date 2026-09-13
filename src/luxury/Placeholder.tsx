/**
 * Placeholder — a procedural "night plate" that stands in for footage you haven't dropped
 * in yet. Like a lighting stand-in on a film set: it holds the shot's colour temperature
 * and mood (dark gradient + drifting bokeh practicals) so the edit, caption, and grade can be
 * judged before the real clip arrives. Fully frame-driven; nothing here uses CSS animation.
 */

import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { fontFamilies } from "../config/Typography";
import { type Shot } from "./shots";

const BOKEH_COUNT = 7;

type Bokeh = { x: number; y: number; r: number; dx: number; dy: number; alpha: number };

/** Deterministic bokeh layout per shot id — the same shot always looks the same. */
const layoutBokeh = (seed: string): Bokeh[] =>
  Array.from({ length: BOKEH_COUNT }, (_, i) => ({
    x: 8 + random(`${seed}-x-${i}`) * 84,
    y: 6 + random(`${seed}-y-${i}`) * 88,
    r: 70 + random(`${seed}-r-${i}`) * 190,
    dx: (random(`${seed}-dx-${i}`) - 0.5) * 60,
    dy: (random(`${seed}-dy-${i}`) - 0.5) * 60,
    alpha: 0.25 + random(`${seed}-a-${i}`) * 0.45,
  }));

export const Placeholder: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { base, mid, glow } = shot.look;
  const bokeh = layoutBokeh(shot.id);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(168deg, ${base} 0%, ${mid} 48%, ${base} 100%)`,
        overflow: "hidden",
      }}
    >
      {/* practical lights — soft, slow-drifting orbs */}
      {bokeh.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.r,
            height: b.r,
            marginLeft: -b.r / 2,
            marginTop: -b.r / 2,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${glow} 0%, ${glow}55 35%, transparent 70%)`,
            opacity: b.alpha,
            filter: "blur(14px)",
            translate: interpolate(frame, [0, 120], ["0px 0px", `${b.dx}px ${b.dy}px`], {
              extrapolateRight: "extend",
            }),
          }}
        />
      ))}

      {/* a faint horizon line — reads as a wet street / marble floor catching light */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "62%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${glow}66, transparent)`,
          opacity: 0.6,
        }}
      />

      {/* stand-in label so nobody mistakes the plate for a finished shot */}
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 300,
          fontFamily: fontFamilies.accent,
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: glow,
          opacity: 0.55,
        }}
      >
        Placeholder · {shot.label}
      </div>
    </AbsoluteFill>
  );
};
