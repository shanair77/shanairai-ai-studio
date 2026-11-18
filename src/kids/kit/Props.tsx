/**
 * Flat pastel props, speech bubbles and sparkles shared by every kids' story.
 * All motion is frame-driven (useCurrentFrame), never CSS animation.
 */

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useT, type Localized } from "./lang";
import { C } from "./palette";

/* ───────────────────────────── Food & props ───────────────────────────── */

export type PropProps = { x: number; y: number; size?: number; pop?: number };

/** Wrap a prop so `pop` (0→1) scales it in with a little overshoot. */
export const Pop: React.FC<PropProps & { children: React.ReactNode; wobble?: number }> = ({
  x,
  y,
  size = 120,
  pop = 1,
  wobble = 0,
  children,
}) => {
  const s = interpolate(pop, [0, 0.7, 1], [0, 1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size,
        width: size,
        height: size,
        transformOrigin: "50% 100%",
        scale: `${s * (1 + wobble)} ${s * (1 - wobble)}`,
      }}
    >
      {children}
    </div>
  );
};

export const Cheese: React.FC<PropProps> = (p) => (
  <Pop {...p}>
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path d="M 6 92 L 94 92 L 94 50 L 6 70 Z" fill={C.butterDark} />
      <path d="M 6 70 L 94 50 L 60 30 Z" fill={C.butter} />
      <circle cx={30} cy={80} r={6} fill={C.butter} />
      <circle cx={62} cy={74} r={8} fill={C.butter} />
      <circle cx={82} cy={84} r={4} fill={C.butter} />
    </svg>
  </Pop>
);

export const Cake: React.FC<PropProps> = (p) => (
  <Pop {...p}>
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x={10} y={50} width={80} height={44} rx={8} fill={C.pink} />
      <rect x={10} y={66} width={80} height={8} fill={C.cream} />
      <path d="M 10 56 Q 10 40 26 40 L 74 40 Q 90 40 90 56 Q 82 64 74 56 Q 66 64 58 56 Q 50 64 42 56 Q 34 64 26 56 Q 18 64 10 56 Z" fill={C.cream} />
      <circle cx={50} cy={32} r={9} fill={C.pinkDark} />
      <path d="M 50 24 Q 54 12 62 10" stroke={C.leafDark} strokeWidth={3} fill="none" />
    </svg>
  </Pop>
);

export const Jelly: React.FC<PropProps> = (p) => {
  const frame = useCurrentFrame();
  return (
    <Pop {...p} wobble={Math.sin(frame / 3) * 0.06}>
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <ellipse cx={50} cy={94} rx={46} ry={6} fill={C.lavender} />
        <path d="M 14 92 Q 10 40 30 30 Q 50 20 70 30 Q 90 40 86 92 Z" fill={C.pinkDark} />
        <path d="M 26 80 Q 22 50 34 40" stroke="#fff" strokeWidth={6} opacity={0.5} fill="none" strokeLinecap="round" />
      </svg>
    </Pop>
  );
};

export const Seeds: React.FC<PropProps> = (p) => (
  <Pop {...p}>
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {[
        [30, 84, -20],
        [50, 88, 10],
        [70, 84, 30],
        [40, 74, 40],
        [60, 74, -30],
        [50, 64, 0],
      ].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={7} ry={11} fill={C.trunkDark} style={{ rotate: `${r}deg`, transformOrigin: `${x}px ${y}px` }} />
      ))}
    </svg>
  </Pop>
);

export const Berries: React.FC<PropProps> = (p) => (
  <Pop {...p}>
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path d="M 50 40 Q 50 20 62 14" stroke={C.leafDark} strokeWidth={4} fill="none" />
      <ellipse cx={64} cy={20} rx={12} ry={6} fill={C.leaf} />
      <circle cx={34} cy={74} r={16} fill={C.pinkDark} />
      <circle cx={64} cy={76} r={16} fill={C.lavenderDark} />
      <circle cx={50} cy={52} r={16} fill={C.pinkDark} />
      <circle cx={30} cy={70} r={4} fill="#fff" opacity={0.6} />
      <circle cx={46} cy={48} r={4} fill="#fff" opacity={0.6} />
    </svg>
  </Pop>
);

export const Corn: React.FC<PropProps> = (p) => (
  <Pop {...p}>
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <ellipse cx={50} cy={54} rx={18} ry={38} fill={C.butterDark} />
      {[30, 42, 54, 66, 78].map((y) => (
        <line key={y} x1={36} y1={y} x2={64} y2={y} stroke={C.butter} strokeWidth={3} />
      ))}
      <path d="M 50 96 Q 20 80 24 40 Q 40 70 50 96 Z" fill={C.leaf} />
      <path d="M 50 96 Q 80 80 76 40 Q 60 70 50 96 Z" fill={C.leafDark} />
    </svg>
  </Pop>
);

export const Suitcase: React.FC<PropProps> = (p) => (
  <Pop {...p}>
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path d="M 38 40 L 38 28 Q 38 22 44 22 L 56 22 Q 62 22 62 28 L 62 40" stroke={C.ink} strokeWidth={5} fill="none" />
      <rect x={14} y={38} width={72} height={56} rx={8} fill={C.lavenderDark} />
      <rect x={14} y={58} width={72} height={6} fill={C.pinkDark} />
      <circle cx={30} cy={80} r={6} fill={C.butter} />
    </svg>
  </Pop>
);

/** A cartoon speech bubble anchored at its tail tip. */
export const Bubble: React.FC<{
  x: number;
  y: number;
  /** Plain string or `{ en, es }`. */
  text: Localized;
  pop: number;
  width?: number;
  fontSize?: number;
  color?: string;
  tail?: "left" | "right";
}> = ({ x, y, text, pop, width = 520, fontSize = 52, color = C.cream, tail = "left" }) => {
  const t = useT();
  const s = interpolate(pop, [0, 0.7, 1], [0, 1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const anchorX = tail === "left" ? 0.15 : 0.85;
  return (
    <div
      style={{
        position: "absolute",
        left: x - width * anchorX,
        bottom: 1080 - y + 34,
        width,
        transformOrigin: `${anchorX * 100}% 130%`,
        scale: `${s}`,
        opacity: pop > 0 ? 1 : 0,
      }}
    >
      <div
        style={{
          background: color,
          borderRadius: 48,
          padding: "26px 36px",
          fontSize,
          fontWeight: 600,
          color: C.ink,
          textAlign: "center",
          boxShadow: "0 10px 0 rgba(94,75,110,0.12)",
          lineHeight: 1.15,
        }}
      >
        {t(text)}
      </div>
      <svg
        width={60}
        height={40}
        viewBox="0 0 60 40"
        style={{ position: "absolute", left: width * anchorX - 30, bottom: -34, scale: tail === "left" ? "1 1" : "-1 1" }}
      >
        <path d="M 10 0 L 50 0 L 14 40 Z" fill={color} />
      </svg>
    </div>
  );
};

/** Little pastel hearts that pulse on "thump". */
export const Heart: React.FC<{ x: number; y: number; size: number; beat: number; color?: string }> = ({
  x,
  y,
  size,
  beat,
  color = C.pinkDark,
}) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    style={{ position: "absolute", left: x - size / 2, top: y - size / 2, scale: `${1 + beat * 0.35}`, opacity: beat > 0 ? 1 : 0.0 }}
  >
    <path d="M 50 88 C 10 60, 4 30, 26 18 C 40 10, 50 22, 50 30 C 50 22, 60 10, 74 18 C 96 30, 90 60, 50 88 Z" fill={color} />
  </svg>
);

export const Sparkle: React.FC<{ x: number; y: number; size: number; t: number; color?: string }> = ({
  x,
  y,
  size,
  t,
  color = C.butterDark,
}) => {
  const s = Math.max(0, Math.sin(t));
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ position: "absolute", left: x - size / 2, top: y - size / 2, scale: `${s}`, rotate: `${t * 20}deg` }}
    >
      <path d="M 50 0 Q 56 44 100 50 Q 56 56 50 100 Q 44 56 0 50 Q 44 44 50 0 Z" fill={color} />
    </svg>
  );
};
