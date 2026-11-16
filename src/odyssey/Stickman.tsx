/**
 * Stickman — a faceless, pose-driven SVG stick figure.
 *
 * Coordinates are local: (0, 0) is the ground point between the feet, +y is down.
 * Every limb is two segments whose angles are absolute degrees measured from
 * "straight down": 0 = down, 90 = forward (+x, the way the figure faces),
 * -90 = backward, 180 = straight up. The hip height is solved from the legs so the
 * lowest foot always touches the ground, which makes walk cycles plant naturally.
 *
 * Characters are told apart by costume, never by a face: Odysseus wears a red crest
 * and cape, Penelope a blue dress, the beggar a hood, and so on.
 */

import React from "react";

export const INK = "#1f1a14";

export type Pose = {
  lArm: [number, number];
  rArm: [number, number];
  lLeg: [number, number];
  rLeg: [number, number];
  /** Torso lean in degrees, positive = forward. */
  lean?: number;
};

export type Item = "spear" | "sword" | "bow" | "staff" | "wand" | "oar" | "cup" | "stake" | null;

export type StickmanProps = {
  x: number;
  y: number;
  s?: number;
  /** 1 = facing right, -1 = facing left. */
  face?: 1 | -1;
  pose: Pose;
  color?: string;
  helmet?: boolean;
  crest?: string;
  cape?: string;
  dress?: string;
  hair?: string;
  hood?: string;
  wings?: string;
  /** Single cyclops eye: "open" | "shut" | "hurt". */
  eye?: "open" | "shut" | "hurt";
  item?: Item;
  /** Angle of the held item in degrees (0 = pointing up, 90 = forward). */
  itemAngle?: number;
  shield?: boolean;
  /** A bundle (baby) held at the chest. */
  baby?: boolean;
  earplugs?: boolean;
  opacity?: number;
};

const LEN = { head: 22, torso: 82, upper: 44, fore: 42, thigh: 52, shin: 50 };
const D = Math.PI / 180;

type P = { x: number; y: number };
const pt = (o: P, len: number, a: number): P => ({
  x: o.x + len * Math.sin(a * D),
  y: o.y + len * Math.cos(a * D),
});

/** Solve every joint of a pose in local coordinates. */
export const joints = (pose: Pose) => {
  const lean = pose.lean ?? 0;
  const drop = (leg: [number, number]) =>
    LEN.thigh * Math.cos(leg[0] * D) + LEN.shin * Math.cos(leg[1] * D);
  const hip: P = { x: 0, y: -Math.max(drop(pose.lLeg), drop(pose.rLeg), 10) };
  const up = 180 - lean;
  const neck = pt(hip, LEN.torso, up);
  const shoulder = pt(hip, LEN.torso * 0.9, up);
  const head = pt(neck, LEN.head + 4, up);
  const limb = (o: P, a: [number, number], l1: number, l2: number) => {
    const mid = pt(o, l1, a[0]);
    return { mid, end: pt(mid, l2, a[1]) };
  };
  return {
    hip,
    neck,
    shoulder,
    head,
    lArm: limb(shoulder, pose.lArm, LEN.upper, LEN.fore),
    rArm: limb(shoulder, pose.rArm, LEN.upper, LEN.fore),
    lLeg: limb(hip, pose.lLeg, LEN.thigh, LEN.shin),
    rLeg: limb(hip, pose.rLeg, LEN.thigh, LEN.shin),
  };
};

/** World position of a joint for a placed figure. */
export const worldPoint = (p: P, x: number, y: number, s = 1, face: 1 | -1 = 1): P => ({
  x: x + p.x * s * face,
  y: y + p.y * s,
});

const HeldItem: React.FC<{ item: Item; at: P; angle: number; color: string }> = ({
  item,
  at,
  angle,
  color,
}) => {
  if (!item) return null;
  const common = { stroke: color, strokeWidth: 7, strokeLinecap: "round" as const, fill: "none" };
  let body: React.ReactNode = null;
  switch (item) {
    case "spear":
      body = (
        <>
          <line x1={0} y1={70} x2={0} y2={-150} {...common} />
          <path d="M -11 -145 L 0 -185 L 11 -145 Z" fill={color} />
        </>
      );
      break;
    case "sword":
      body = (
        <>
          <line x1={0} y1={8} x2={0} y2={-80} {...common} strokeWidth={8} />
          <line x1={-16} y1={-6} x2={16} y2={-6} {...common} />
        </>
      );
      break;
    case "bow":
      body = (
        <>
          <path d="M 0 -95 Q 55 0 0 95" {...common} stroke="#7a4a1d" strokeWidth={9} />
          <line x1={0} y1={-95} x2={0} y2={95} stroke={color} strokeWidth={2.5} />
        </>
      );
      break;
    case "staff":
      body = <path d="M 0 110 L 0 -80 Q 0 -105 -20 -100" {...common} stroke="#6b4423" />;
      break;
    case "wand":
      body = (
        <>
          <line x1={0} y1={10} x2={0} y2={-60} {...common} strokeWidth={5} />
          <path
            d="M 0 -88 L 6 -72 L 22 -72 L 9 -62 L 14 -46 L 0 -56 L -14 -46 L -9 -62 L -22 -72 L -6 -72 Z"
            fill="#f2c230"
            stroke={color}
            strokeWidth={2}
          />
        </>
      );
      break;
    case "oar":
      body = (
        <>
          <line x1={0} y1={-40} x2={0} y2={150} {...common} stroke="#7a4a1d" />
          <ellipse cx={0} cy={170} rx={11} ry={30} fill="#7a4a1d" />
        </>
      );
      break;
    case "cup":
      body = <path d="M -14 -30 L 14 -30 L 8 0 L -8 0 Z M 0 0 L 0 10" fill="#c99a2e" stroke={color} strokeWidth={3} />;
      break;
    case "stake":
      body = (
        <>
          <line x1={0} y1={160} x2={0} y2={-240} {...common} stroke="#7a4a1d" strokeWidth={14} />
          <path d="M -7 -238 L 0 -275 L 7 -238 Z" fill="#e0662a" />
        </>
      );
      break;
  }
  return <g transform={`translate(${at.x} ${at.y}) rotate(${angle})`}>{body}</g>;
};

export const Stickman: React.FC<StickmanProps> = ({
  x,
  y,
  s = 1,
  face = 1,
  pose,
  color = INK,
  helmet,
  crest = "#b3261e",
  cape,
  dress,
  hair,
  hood,
  wings,
  eye,
  item = null,
  itemAngle = 0,
  shield,
  baby,
  earplugs,
  opacity = 1,
}) => {
  const j = joints(pose);
  const sw = 9;
  const line = (a: P, b: P, c: P) => (
    <polyline
      points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`}
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
  const { head, neck, hip } = j;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * face} ${s})`} opacity={opacity}>
      {wings ? (
        <g fill={wings} stroke={color} strokeWidth={3}>
          <path d={`M ${neck.x} ${neck.y + 10} Q ${neck.x - 90} ${neck.y - 40} ${neck.x - 110} ${neck.y + 60} Q ${neck.x - 60} ${neck.y + 40} ${neck.x} ${neck.y + 40} Z`} />
        </g>
      ) : null}
      {cape ? (
        <path
          d={`M ${neck.x - 4} ${neck.y + 6} Q ${hip.x - 40} ${hip.y - 20} ${hip.x - 46} ${hip.y + 28} L ${hip.x - 6} ${hip.y + 6} Z`}
          fill={cape}
          stroke={color}
          strokeWidth={3}
        />
      ) : null}
      {hair ? (
        <path
          d={`M ${head.x - 18} ${head.y - 12} Q ${head.x - 44} ${head.y + 40} ${head.x - 30} ${head.y + 92} L ${head.x - 4} ${head.y + 20} Z`}
          fill={hair}
          stroke={color}
          strokeWidth={3}
        />
      ) : null}
      {/* back limbs */}
      {line(hip, j.lLeg.mid, j.lLeg.end)}
      {line(j.shoulder, j.lArm.mid, j.lArm.end)}
      {/* torso */}
      <line x1={hip.x} y1={hip.y} x2={neck.x} y2={neck.y} stroke={color} strokeWidth={sw + 1} strokeLinecap="round" />
      {dress ? (
        <path
          d={`M ${neck.x - 9} ${neck.y + 18} L ${neck.x + 9} ${neck.y + 18} L ${hip.x + 40} ${hip.y + 42} L ${hip.x - 40} ${hip.y + 42} Z`}
          fill={dress}
          stroke={color}
          strokeWidth={3.5}
          strokeLinejoin="round"
        />
      ) : null}
      {hood ? (
        <path
          d={`M ${neck.x} ${neck.y - 6} L ${hip.x + 34} ${hip.y + 36} L ${hip.x - 34} ${hip.y + 36} Z`}
          fill={hood}
          stroke={color}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      ) : null}
      {line(hip, j.rLeg.mid, j.rLeg.end)}
      {/* head — deliberately faceless */}
      <circle cx={head.x} cy={head.y} r={LEN.head} fill={color} />
      {eye ? (
        <g>
          <circle cx={head.x + 4} cy={head.y - 2} r={13} fill="#fffbe9" />
          {eye === "open" ? <circle cx={head.x + 8} cy={head.y - 2} r={5.5} fill={INK} /> : null}
          {eye === "shut" ? <line x1={head.x - 8} y1={head.y} x2={head.x + 16} y2={head.y} stroke={INK} strokeWidth={3} /> : null}
          {eye === "hurt" ? (
            <path d={`M ${head.x - 5} ${head.y - 11} L ${head.x + 13} ${head.y + 7} M ${head.x + 13} ${head.y - 11} L ${head.x - 5} ${head.y + 7}`} stroke="#b3261e" strokeWidth={4} />
          ) : null}
        </g>
      ) : null}
      {hood ? (
        <path
          d={`M ${head.x - 30} ${head.y + 22} Q ${head.x - 34} ${head.y - 40} ${head.x + 6} ${head.y - 32} Q ${head.x + 34} ${head.y - 22} ${head.x + 26} ${head.y + 6}`}
          fill="none"
          stroke={hood}
          strokeWidth={12}
          strokeLinecap="round"
        />
      ) : null}
      {helmet ? (
        <g>
          <path
            d={`M ${head.x - 25} ${head.y + 2} Q ${head.x - 26} ${head.y - 30} ${head.x} ${head.y - 30} Q ${head.x + 26} ${head.y - 30} ${head.x + 25} ${head.y + 2} Z`}
            fill="#c99a2e"
            stroke={color}
            strokeWidth={3}
          />
          <path
            d={`M ${head.x - 26} ${head.y - 22} Q ${head.x - 6} ${head.y - 72} ${head.x + 24} ${head.y - 30} Q ${head.x - 2} ${head.y - 44} ${head.x - 26} ${head.y - 22} Z`}
            fill={crest}
            stroke={color}
            strokeWidth={3}
          />
        </g>
      ) : null}
      {earplugs ? (
        <circle cx={head.x - 2} cy={head.y + 2} r={6} fill="#f2c230" stroke={color} strokeWidth={2} />
      ) : null}
      {baby ? (
        <g>
          <ellipse cx={neck.x + 22} cy={neck.y + 34} rx={24} ry={15} fill="#f5e6c4" stroke={color} strokeWidth={3} />
          <circle cx={neck.x + 40} cy={neck.y + 26} r={10} fill={color} />
        </g>
      ) : null}
      {line(j.shoulder, j.rArm.mid, j.rArm.end)}
      <HeldItem item={item} at={j.rArm.end} angle={itemAngle} color={color} />
      {shield ? (
        <g>
          <circle cx={j.lArm.end.x} cy={j.lArm.end.y} r={32} fill="#c99a2e" stroke={color} strokeWidth={4} />
          <circle cx={j.lArm.end.x} cy={j.lArm.end.y} r={14} fill="none" stroke={color} strokeWidth={3} />
        </g>
      ) : null}
    </g>
  );
};

/* ------------------------------------------------------------------ poses */

export const standPose = (f: number, phase = 0): Pose => {
  const b = Math.sin(f * 0.08 + phase) * 3;
  return { lArm: [-10 + b, -6 + b], rArm: [10 - b, 6 - b], lLeg: [-8, -8], rLeg: [8, 8] };
};

export const walkPose = (f: number, speed = 0.28, amp = 26, phase = 0): Pose => {
  const p = Math.sin(f * speed + phase);
  const bendL = Math.max(0, -p) * 26;
  const bendR = Math.max(0, p) * 26;
  return {
    lArm: [-amp * p, -amp * p + 18],
    rArm: [amp * p, amp * p + 18],
    lLeg: [amp * p, amp * p - bendL],
    rLeg: [-amp * p, -amp * p - bendR],
    lean: 4,
  };
};

export const runPose = (f: number, phase = 0): Pose => {
  const p = Math.sin(f * 0.5 + phase);
  return {
    lArm: [-50 * p, -50 * p + 70],
    rArm: [50 * p, 50 * p + 70],
    lLeg: [45 * p, 45 * p - Math.max(0, -p) * 60],
    rLeg: [-45 * p, -45 * p - Math.max(0, p) * 60],
    lean: 14,
  };
};

export const wavePose = (f: number, phase = 0): Pose => {
  const w = Math.sin(f * 0.35 + phase) * 22;
  return { lArm: [-10, -6], rArm: [140, 170 + w], lLeg: [-8, -8], rLeg: [8, 8] };
};

export const cheerPose = (f: number, phase = 0): Pose => {
  const w = Math.sin(f * 0.4 + phase) * 15;
  return { lArm: [-150 - w, -170 - w], rArm: [150 + w, 170 + w], lLeg: [-12, -12], rLeg: [12, 12] };
};

export const rowPose = (f: number, phase = 0): Pose => {
  const p = Math.sin(f * 0.22 + phase);
  return { lArm: [60 + 25 * p, 80 + 25 * p], rArm: [65 + 25 * p, 85 + 25 * p], lLeg: [80, 0], rLeg: [80, 0], lean: 10 * p };
};

export const thrustPose = (f: number, phase = 0): Pose => {
  const p = (Math.sin(f * 0.3 + phase) + 1) / 2;
  return { lArm: [60, 80], rArm: [40 + 40 * p, 70 + 25 * p], lLeg: [25, 20], rLeg: [-25, -20], lean: 8 + 8 * p };
};

export const sitPose = (f: number, phase = 0): Pose => {
  const b = Math.sin(f * 0.06 + phase) * 3;
  return { lArm: [30 + b, 70], rArm: [35 + b, 75], lLeg: [85, 5], rLeg: [80, 0], lean: 6 };
};

export const cowerPose = (f: number, phase = 0): Pose => {
  const shake = Math.sin(f * 1.7 + phase) * 4;
  return { lArm: [150 + shake, 200], rArm: [150 - shake, 200], lLeg: [30, -10], rLeg: [-20, -30], lean: -6 + shake };
};

export const pullPose = (f: number, phase = 0): Pose => {
  const p = Math.sin(f * 0.25 + phase) * 6;
  return { lArm: [95 + p, 95 + p], rArm: [90 + p, 90 + p], lLeg: [-30, -25], rLeg: [20, 15], lean: -22 };
};

export const hugPose = (): Pose => ({ lArm: [95, 140], rArm: [100, 150], lLeg: [-6, -6], rLeg: [8, 8], lean: 6 });
