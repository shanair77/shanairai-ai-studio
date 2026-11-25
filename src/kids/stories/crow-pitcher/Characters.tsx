/**
 * The Crow and the Pitcher — flat pastel characters and props (inline SVG, frame-driven).
 * Characters face right by default (`flip` faces them left); feet sit at the bottom of
 * their 400×400 box. Pip is a little dusky-lilac crow; her friends are a sleepy snail,
 * a busy bee and the community garden's friendly delivery robot.
 */

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, clamp, place, type Placed } from "../../kit";

/** Story-specific pastel colours. */
export const PC = {
  crow: "#9893B8",
  crowDark: "#7C77A0",
  crowBelly: "#C9C4E0",
  beak: "#FBC97A",
  beakDark: "#EFAE5A",
  feet: "#F3B46B",
  glass: "#E4F6FC",
  glassEdge: "#A9D8EC",
  water: "#94D3EF",
  waterTop: "#BDE6F7",
  pebble: "#D4CBC1",
  pebbleDark: "#B9AEA2",
  pebbleLight: "#E8DDD2",
  snail: "#D6EDB5",
  snailDark: "#B9DA93",
  shell: "#F6B8C8",
  shellDark: "#E596AE",
  bee: "#FFE08A",
  beeStripe: "#8C7BA8",
  robot: "#CDEBF3",
  robotDark: "#A6D4E3",
  robotFace: "#6A5A7C",
  led: "#A8F0CE",
  ledPink: "#F7B6CB",
  flag: "#F6B3A9",
};

/** Convert a point in a character's 400×400 space to composition pixels. */
export const toScene = (p: Placed, v: { x: number; y: number }) => {
  const size = p.size ?? 200;
  const vx = p.flip ? 400 - v.x : v.x;
  return { x: p.x - size / 2 + (vx * size) / 400, y: p.y - size + (v.y * size) / 400 };
};

const limb = (x1: number, y1: number, x2: number, y2: number, color: string, w: number) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round" />
);

/* ───────────────────────────── Pebbles ───────────────────────────── */

/** A smooth round pebble centred at (cx, cy). */
export const PebbleShape: React.FC<{ cx: number; cy: number; r: number; tone?: number }> = ({ cx, cy, r, tone = 0 }) => (
  <g>
    <ellipse cx={cx} cy={cy} rx={r * 1.15} ry={r * 0.9} fill={tone % 3 === 1 ? PC.pebbleLight : tone % 3 === 2 ? PC.pebbleDark : PC.pebble} />
    <ellipse cx={cx - r * 0.35} cy={cy - r * 0.35} rx={r * 0.35} ry={r * 0.2} fill="#fff" opacity={0.55} />
  </g>
);

/* ───────────────────────────── Pip the crow ───────────────────────────── */

export type CrowPose = "stand" | "fly" | "peck" | "drop" | "push" | "stretch" | "think" | "drink" | "dance" | "cheer";

export type CrowProps = Placed & {
  pose?: CrowPose;
  /** Hopping walk. */
  hop?: number;
  /** Beak open 0..1. */
  mouthOpen?: number;
  eyes?: "open" | "happy" | "wide" | "worried" | "determined";
  headTilt?: number;
  /** Holding a pebble in her beak. */
  pebble?: boolean;
  seed?: number;
};

export const Crow: React.FC<CrowProps> = (props) => {
  const frame = useCurrentFrame();
  const { pose = "stand", hop = 0, mouthOpen = 0, eyes = "open", headTilt = 0, pebble, seed = 0 } = props;
  const f = frame + seed * 7;
  const breathe = 1 + Math.sin(f / 14) * 0.02;
  const blinking = (eyes === "open" || eyes === "wide") && (f + 37) % 92 < 4;
  const hopY = hop ? -Math.abs(Math.sin(f / 4)) * 40 * hop : 0;
  const dance = pose === "dance" || pose === "cheer";
  const danceY = dance ? -Math.abs(Math.sin(f / 5)) * 30 : 0;
  const sway = pose === "dance" ? Math.sin(f / 5) * 8 : 0;

  // whole-bird lean around the feet
  const lean = pose === "peck" ? 78 : pose === "drink" ? 70 : pose === "drop" ? 25 : pose === "push" ? 18 : 0;
  const stretchUp = pose === "stretch" ? 64 + Math.sin(f / 4) * 6 : 0;
  const flap = Math.sin(f / 2.6);
  let wing = 0; // folded
  if (pose === "fly") wing = -70 + flap * 40;
  else if (pose === "think") wing = -105;
  else if (pose === "push") wing = -40;
  else if (pose === "stretch") wing = -30 + flap * 8;
  else if (pose === "cheer") wing = -110 + flap * 20;
  else if (pose === "dance") wing = -60 + flap * 30;

  const tilt = headTilt + (pose === "stretch" ? -18 : 0) + (pose === "think" ? 10 : 0);
  const open = Math.max(mouthOpen, pebble ? 0.25 : 0);

  const eye = (cx: number, cy: number) => {
    if (eyes === "happy" || blinking)
      return <path d={`M ${cx - 12} ${cy + 3} Q ${cx} ${cy - 10} ${cx + 12} ${cy + 3}`} stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />;
    const r = eyes === "wide" ? 15 : 12;
    return (
      <g>
        <circle cx={cx} cy={cy} r={r + 5} fill="#fff" />
        <circle cx={cx + 2} cy={cy} r={r} fill={C.ink} />
        <circle cx={cx + 6} cy={cy - 4} r={4} fill="#fff" />
        {eyes === "worried" ? <path d={`M ${cx - 16} ${cy - 22} L ${cx + 14} ${cy - 28}`} stroke={PC.crowDark} strokeWidth={6} strokeLinecap="round" /> : null}
        {eyes === "determined" ? <path d={`M ${cx - 16} ${cy - 28} L ${cx + 16} ${cy - 20}`} stroke={PC.crowDark} strokeWidth={7} strokeLinecap="round" /> : null}
      </g>
    );
  };

  const legLen = pose === "fly" ? 26 : 56 + stretchUp;
  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${hopY + danceY}px`, rotate: `${lean + sway}deg`, transformOrigin: "200px 392px" }}>
          {/* legs */}
          {limb(184, 392 - legLen, 180, 388, PC.feet, 9)}
          {limb(216, 392 - legLen, 222, 388, PC.feet, 9)}
          <path d="M 160 392 L 180 386 L 196 392" stroke={PC.feet} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 204 392 L 222 386 L 240 392" stroke={PC.feet} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <g style={{ translate: `0px ${-stretchUp - (pose === "fly" ? 20 : 0)}px` }}>
            {/* tail */}
            <path d="M 126 270 L 34 312 Q 30 330 52 330 L 40 356 Q 50 368 70 352 L 140 316 Z" fill={PC.crowDark} />
            {/* body */}
            <g style={{ scale: `1 ${breathe}`, transformOrigin: "200px 340px" }}>
              <ellipse cx={196} cy={262} rx={90} ry={82} fill={PC.crow} />
              <ellipse cx={226} cy={284} rx={50} ry={54} fill={PC.crowBelly} />
            </g>
            {/* head */}
            <g style={{ rotate: `${tilt}deg`, transformOrigin: "236px 200px" }}>
              {/* head tuft */}
              <g fill={PC.crowDark}>
                <ellipse cx={220} cy={86} rx={10} ry={24} style={{ rotate: "-24deg", transformOrigin: "220px 104px" }} />
                <ellipse cx={238} cy={80} rx={10} ry={26} />
                <ellipse cx={256} cy={88} rx={9} ry={22} style={{ rotate: "24deg", transformOrigin: "256px 106px" }} />
              </g>
              <circle cx={240} cy={156} r={72} fill={PC.crow} />
              {eye(266, 142)}
              <circle cx={240} cy={186} r={13} fill={C.pinkDark} opacity={0.35} />
              {/* beak */}
              <g style={{ rotate: `${open * 22}deg`, transformOrigin: "300px 170px" }}>
                <path d="M 300 170 L 356 168 Q 336 184 300 188 Z" fill={PC.beakDark} />
              </g>
              <path d="M 298 146 Q 352 150 368 166 L 300 172 Z" fill={PC.beak} />
              {pebble ? (
                <g style={{ translate: `${348}px ${178 + open * 10}px` }}>
                  <PebbleShape cx={0} cy={0} r={16} />
                </g>
              ) : null}
            </g>
            {/* wing */}
            <g style={{ rotate: `${wing}deg`, transformOrigin: "214px 226px" }}>
              <path d="M 214 226 Q 150 214 104 262 Q 96 300 120 306 Q 176 300 222 256 Z" fill={PC.crowDark} />
              <path d="M 120 300 L 100 316 M 136 302 L 122 322" stroke={PC.crowDark} strokeWidth={12} strokeLinecap="round" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── The sleepy snail ───────────────────────────── */

export type SnailProps = Placed & {
  /** 0 = tucked in the shell, 1 = all the way out. */
  peek?: number;
  /** Eye stalks stretch 0..1. */
  stretch?: number;
  eyes?: "open" | "sleepy" | "happy" | "wide";
  mouthOpen?: number;
  /** Little happy bounce. */
  dance?: boolean;
  seed?: number;
};

export const Snail: React.FC<SnailProps> = (props) => {
  const frame = useCurrentFrame();
  const { peek = 1, stretch = 0, eyes = "open", mouthOpen = 0, dance, seed = 0 } = props;
  const f = frame + seed * 11;
  const out = interpolate(peek, [0, 1], [-130, 0], clamp);
  const stalk = 1 + stretch * 0.9 + Math.sin(f / 9) * 0.05;
  const bob = dance ? -Math.abs(Math.sin(f / 5)) * 18 : 0;
  const blinking = eyes === "open" && (f + 19) % 100 < 4;
  const eyeAt = (base: { x: number; y: number }, tip: { x: number; y: number }) => ({
    x: base.x + (tip.x - base.x) * stalk,
    y: base.y + (tip.y - base.y) * stalk,
  });
  const e1 = eyeAt({ x: 316, y: 250 }, { x: 296, y: 170 });
  const e2 = eyeAt({ x: 356, y: 248 }, { x: 376, y: 174 });
  const eyeball = (p: { x: number; y: number }) => (
    <g>
      <circle cx={p.x} cy={p.y} r={21} fill="#fff" />
      {eyes === "happy" || blinking ? (
        <path d={`M ${p.x - 10} ${p.y + 2} Q ${p.x} ${p.y - 8} ${p.x + 10} ${p.y + 2}`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      ) : (
        <circle cx={p.x + 2} cy={p.y + (eyes === "sleepy" ? 3 : 0)} r={eyes === "wide" ? 12 : 10} fill={C.ink} />
      )}
      {eyes === "sleepy" ? <path d={`M ${p.x - 21} ${p.y - 2} A 21 21 0 0 1 ${p.x + 21} ${p.y - 2} Z`} fill={PC.snailDark} /> : null}
    </g>
  );
  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${bob}px` }}>
          {/* body + head (slides into the shell) */}
          <g style={{ translate: `${out}px 0px`, opacity: interpolate(peek, [0, 0.25], [0, 1], clamp) }}>
            <path d="M 36 392 Q 36 348 100 344 L 276 338 Q 286 252 330 238 Q 384 230 388 302 Q 392 362 378 392 Z" fill={PC.snail} />
            <path d="M 50 392 L 370 392" stroke={PC.snailDark} strokeWidth={12} strokeLinecap="round" />
            {limb(316, 250, e1.x, e1.y, PC.snailDark, 11)}
            {limb(356, 248, e2.x, e2.y, PC.snailDark, 11)}
            {eyeball(e1)}
            {eyeball(e2)}
            <circle cx={318} cy={300} r={12} fill={C.pinkDark} opacity={0.35} />
            {mouthOpen > 0.15 ? (
              <ellipse cx={356} cy={306} rx={11} ry={5 + mouthOpen * 11} fill={C.ink} />
            ) : (
              <path d="M 338 300 Q 354 316 370 298" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
            )}
          </g>
          {/* shell */}
          <circle cx={190} cy={270} r={104} fill={PC.shell} />
          <path
            d="M 190 270 m 0 -14 a 14 14 0 1 1 -14 14 a 30 30 0 0 1 30 -30 a 46 46 0 0 1 46 46 a 62 62 0 0 1 -62 62 a 80 80 0 0 1 -80 -80"
            stroke={PC.shellDark}
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx={150} cy={210} rx={22} ry={12} fill="#fff" opacity={0.45} style={{ rotate: "-30deg", transformOrigin: "150px 210px" }} />
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Bee ───────────────────────────── */

/** A little bee centred at (x, y). */
export const Bee: React.FC<{ x: number; y: number; size?: number; flip?: boolean; happy?: boolean }> = ({ x, y, size = 110, flip, happy }) => {
  const frame = useCurrentFrame();
  const w = Math.sin(frame * 1.6) * 18;
  return (
    <svg viewBox="-60 -60 120 120" width={size} height={size} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, overflow: "visible", scale: flip ? "-1 1" : "1 1" }}>
      <ellipse cx={-6} cy={-30} rx={16} ry={24} fill="#fff" opacity={0.85} style={{ rotate: `${-20 + w}deg`, transformOrigin: "-6px -10px" }} />
      <ellipse cx={10} cy={-30} rx={14} ry={22} fill="#fff" opacity={0.75} style={{ rotate: `${20 - w}deg`, transformOrigin: "10px -10px" }} />
      <ellipse cx={0} cy={0} rx={38} ry={28} fill={PC.bee} />
      <rect x={-14} y={-27} width={10} height={54} fill={PC.beeStripe} opacity={0.85} />
      <rect x={6} y={-27} width={10} height={54} fill={PC.beeStripe} opacity={0.85} />
      <path d="M -38 0 L -50 0" stroke={PC.beeStripe} strokeWidth={5} strokeLinecap="round" />
      <circle cx={26} cy={-4} r={5} fill={C.ink} />
      {happy ? <path d="M 22 8 Q 28 14 34 8" stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" /> : null}
      <circle cx={30} cy={8} r={4} fill={C.pinkDark} opacity={0.4} />
    </svg>
  );
};

/* ───────────────────────────── Delivery robot ───────────────────────────── */

export type RobotProps = Placed & {
  /** Rolling (wheels turn, little bob). */
  rolling?: boolean;
  /** Pebbles on the tray. */
  pebbles?: number;
  /** Lights flashing. */
  blink?: boolean;
  /** Face shows hearts. */
  love?: boolean;
  seed?: number;
};

export const Robot: React.FC<RobotProps> = (props) => {
  const frame = useCurrentFrame();
  const { rolling, pebbles = 0, blink, love, seed = 0 } = props;
  const f = frame + seed * 5;
  const bob = rolling ? Math.sin(f / 2.5) * 3 : Math.sin(f / 16) * 2;
  const spin = rolling ? f * 14 : 0;
  const flash = blink ? Math.floor(f / 5) % 2 === 0 : (f + 10) % 60 < 30;
  const look = (f + 30) % 120 < 6;
  const tray = Array.from({ length: Math.max(0, Math.min(10, Math.round(pebbles))) });
  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        {/* wheels */}
        {[110, 200, 290].map((cx) => (
          <g key={cx} style={{ translate: `${cx}px 360px`, rotate: `${spin}deg` }}>
            <circle r={32} fill={C.ink} opacity={0.82} />
            <circle r={13} fill={PC.robotDark} />
            <rect x={-3} y={-28} width={6} height={14} fill={PC.robotDark} />
          </g>
        ))}
        <g style={{ translate: `0px ${bob}px` }}>
          {/* antenna + flag */}
          <line x1={110} y1={168} x2={110} y2={46} stroke={PC.robotDark} strokeWidth={7} strokeLinecap="round" />
          <path d={`M 112 48 Q 150 ${54 + Math.sin(f / 4) * 8} 176 ${62 + Math.sin(f / 4 + 1) * 6} L 112 86 Z`} fill={PC.flag} />
          {/* body */}
          <rect x={64} y={170} width={276} height={168} rx={44} fill={PC.robot} />
          <rect x={64} y={300} width={276} height={38} rx={19} fill={PC.robotDark} />
          {/* face screen */}
          <rect x={228} y={196} width={98} height={84} rx={26} fill={PC.robotFace} />
          {love ? (
            [252, 300].map((cx) => (
              <path key={cx} d={`M ${cx} 250 C ${cx - 16} 238, ${cx - 14} 222, ${cx} 230 C ${cx + 14} 222, ${cx + 16} 238, ${cx} 250 Z`} fill={PC.ledPink} />
            ))
          ) : look ? (
            [254, 300].map((cx) => <rect key={cx} x={cx - 10} y={236} width={20} height={5} rx={2.5} fill={PC.led} />)
          ) : (
            [254, 300].map((cx) => <rect key={cx} x={cx - 8} y={222} width={16} height={26} rx={8} fill={PC.led} />)
          )}
          <path d="M 262 262 Q 277 272 292 262" stroke={PC.led} strokeWidth={4} fill="none" strokeLinecap="round" />
          {/* side lights */}
          {[100, 140, 180].map((cx, i) => (
            <circle key={cx} cx={cx} cy={226} r={10} fill={flash === (i % 2 === 0) ? PC.led : blink ? PC.ledPink : PC.robotDark} />
          ))}
          {/* tray */}
          <rect x={76} y={150} width={252} height={24} rx={12} fill={C.lavenderDark} />
          {tray.map((_, i) => {
            const row = i < 6 ? 0 : 1;
            const col = row === 0 ? i : i - 6;
            const cx = row === 0 ? 104 + col * 40 : 124 + col * 40;
            return <PebbleShape key={i} cx={cx} cy={140 - row * 22} r={16} tone={i} />;
          })}
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── The glass pitcher ───────────────────────────── */

/** Pitcher local space: 100 wide × 160 tall, bottom at y = 160. */
const PITCHER_BODY =
  "M 24 160 Q 10 160 10 142 L 14 66 Q 16 42 32 32 L 32 16 Q 26 10 22 4 L 78 4 Q 74 10 68 16 L 68 32 Q 84 42 86 66 L 90 142 Q 90 160 76 160 Z";

/** Top of the pitcher's mouth in composition pixels. */
export const pitcherRim = (x: number, y: number, h: number) => ({ x, y: y - h + (h / 160) * 5, w: (h / 160) * 56 });

/**
 * A tall glass pitcher. Centre-bottom at (x, y), height h. `level` 0..1 is the water height,
 * `pebbles` sit at the bottom. Draw `front` as a second copy over anything inside it.
 */
export const Pitcher: React.FC<{
  x: number;
  y: number;
  h: number;
  level?: number;
  pebbles?: number;
  front?: boolean;
  shine?: number;
  rotate?: number;
  id: string;
}> = ({ x, y, h, level = 0.12, pebbles = 0, front, shine = 0, rotate = 0, id }) => {
  const frame = useCurrentFrame();
  const w = (h * 100) / 160;
  const top = 158 - Math.min(0.97, level) * 150;
  const wave = Math.sin(frame / 6) * 1.2;
  const stones = Array.from({ length: Math.max(0, Math.round(pebbles)) });
  return (
    <svg
      viewBox="0 0 100 160"
      width={w}
      height={h}
      style={{ position: "absolute", left: x - w / 2, top: y - h, overflow: "visible", rotate: `${rotate}deg`, transformOrigin: "50% 100%" }}
    >
      <defs>
        <clipPath id={`pitcher-${id}`}>
          <path d={PITCHER_BODY} />
        </clipPath>
      </defs>
      {front ? (
        <g>
          <path d={PITCHER_BODY} fill={PC.glass} opacity={0.28} />
          <path d="M 22 60 Q 20 100 24 140" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.75} />
          <path d={PITCHER_BODY} fill="none" stroke={PC.glassEdge} strokeWidth={2.4} />
          <ellipse cx={50} cy={5} rx={28} ry={3.4} fill="none" stroke={PC.glassEdge} strokeWidth={2.4} />
        </g>
      ) : (
        <g>
          {/* handle */}
          <path d="M 70 34 Q 104 36 100 74 Q 96 104 86 110" stroke={PC.glassEdge} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={PITCHER_BODY} fill={PC.glass} opacity={0.75} />
          <g clipPath={`url(#pitcher-${id})`}>
            <rect x={0} y={top} width={100} height={170} fill={PC.water} />
            <path d={`M 0 ${top} Q 25 ${top - 3 + wave} 50 ${top} T 100 ${top} L 100 ${top + 5} L 0 ${top + 5} Z`} fill={PC.waterTop} />
            {stones.map((_, i) => {
              const row = Math.floor(i / 5);
              const col = i % 5;
              const cx = 20 + col * 15 + (row % 2) * 7;
              return <PebbleShape key={i} cx={cx} cy={152 - row * 11} r={6.4} tone={i} />;
            })}
          </g>
        </g>
      )}
      {shine > 0
        ? [0, 1, 2].map((i) => {
            const s = Math.max(0, Math.sin(shine * 3 + i * 1.3));
            return (
              <path
                key={i}
                d="M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z"
                fill="#fff"
                style={{ translate: `${[26, 72, 40][i]}px ${[40, 70, 110][i]}px`, scale: `${s}` }}
              />
            );
          })
        : null}
    </svg>
  );
};

/** A falling pebble (composition pixels), from `a` to `b` over t 0..1. Hidden outside 0..1. */
export const FallingPebble: React.FC<{ a: { x: number; y: number }; b: { x: number; y: number }; t: number; r?: number }> = ({ a, b, t, r = 18 }) => {
  if (t <= 0 || t >= 1) return null;
  const x = a.x + (b.x - a.x) * t;
  const y = a.y + (b.y - a.y) * t * t;
  return (
    <svg viewBox="-30 -30 60 60" width={60} height={60} style={{ position: "absolute", left: x - 30, top: y - 30, overflow: "visible" }}>
      <PebbleShape cx={0} cy={0} r={r} />
    </svg>
  );
};
