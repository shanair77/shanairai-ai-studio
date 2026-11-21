/**
 * The Three Little Pigs — flat pastel characters and props (inline SVG, frame-driven).
 * Characters face right by default (`flip` faces them left); feet sit at the bottom of
 * their 400×400 box.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { C, place, type Placed } from "../../kit";

/** Story-specific pastel colours. */
export const PC = {
  pig: "#F9C6D3",
  pigDark: "#EEA2B7",
  pigLight: "#FDE3EA",
  snout: "#F4AFC2",
  wolf: "#BDB8D6",
  wolfDark: "#9F99C0",
  wolfBelly: "#E7E4F2",
  straw: "#FBE29A",
  strawDark: "#EFC96A",
  stick: "#D6B08C",
  stickDark: "#B98E6A",
  brick: "#F2A99A",
  brickDark: "#DD8E80",
  mortar: "#FBE9E2",
  roof: "#BFAEE6",
  roofDark: "#A895DA",
  solar: "#9EC3EE",
  solarDark: "#7FA8DC",
  hardHat: "#FFD66E",
  overalls: "#A9C8F0",
  overallsDark: "#8DB2E4",
  cap: "#FFC98E",
  dress: "#AEE3CF",
  dressDark: "#8ED3BA",
  apron: "#D9CCF2",
  scarf: "#FFD27E",
  screen: "#F4F8FF",
  wind: "#FFFFFF",
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

/* ───────────────────────────── Small held props ───────────────────────────── */

/** A tablet with a bright, colour-cycling screen, centred at (0, 0). */
const TabletShape: React.FC = () => {
  const frame = useCurrentFrame();
  const hue = [C.mint, C.butter, C.pink, C.blue][Math.floor(frame / 20) % 4];
  return (
    <g>
      <rect x={-42} y={-30} width={84} height={60} rx={10} fill={C.lavenderDark} />
      <rect x={-35} y={-23} width={70} height={46} rx={6} fill={hue} />
      <circle cx={0} cy={0} r={9} fill="#fff" opacity={0.8} />
      <path d="M -3 -5 L 5 0 L -3 5 Z" fill={C.ink} opacity={0.6} />
    </g>
  );
};

const TrowelShape: React.FC = () => (
  <g>
    <rect x={-6} y={-6} width={36} height={12} rx={6} fill={PC.stickDark} />
    <path d="M 30 0 L 44 -4 L 80 -18 L 84 0 L 80 18 L 44 4 Z" fill={C.blue} />
  </g>
);

const BrickShape: React.FC = () => (
  <g>
    <rect x={-34} y={-17} width={68} height={34} rx={6} fill={PC.brick} />
    <rect x={-34} y={-17} width={68} height={10} rx={5} fill={PC.mortar} opacity={0.6} />
  </g>
);

/** A spotted bundle on a stick, slung over the shoulder. */
const BundleShape: React.FC<{ color: string }> = ({ color }) => (
  <g>
    <line x1={0} y1={0} x2={-110} y2={-70} stroke={PC.stickDark} strokeWidth={8} strokeLinecap="round" />
    <circle cx={-118} cy={-80} r={34} fill={color} />
    <circle cx={-128} cy={-90} r={6} fill="#fff" opacity={0.7} />
    <circle cx={-104} cy={-70} r={6} fill="#fff" opacity={0.7} />
    <path d="M -100 -108 Q -90 -118 -84 -104" stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);

/* ───────────────────────────── Pig ───────────────────────────── */

export type PigKind = "straw" | "sticks" | "brick" | "mama";
export type PigHold = "tablet" | "bundle" | "trowel" | "brick" | "spoon" | null;

export type PigProps = Placed & {
  kind: PigKind;
  walk?: number;
  /** Running: fast legs, leaning forward, arms pumping. */
  run?: boolean;
  wave?: boolean;
  /** Both arms up. */
  cheer?: boolean;
  dance?: boolean;
  /** Little hop on the spot, 0..1. */
  bounce?: number;
  mouthOpen?: number;
  eyes?: "open" | "happy" | "wide";
  hold?: PigHold;
  /** Laying bricks: the near arm taps up and down. */
  work?: boolean;
  headTilt?: number;
  /** Phase offset so a group doesn't move in lock-step. */
  seed?: number;
};

export const Pig: React.FC<PigProps> = (props) => {
  const frame = useCurrentFrame();
  const {
    kind,
    walk = 0,
    run,
    wave,
    cheer,
    dance,
    bounce = 0,
    mouthOpen = 0,
    eyes = "open",
    hold = null,
    work,
    headTilt = 0,
    seed = 0,
  } = props;
  const f = frame + seed * 7;
  const speed = run ? 2.4 : 5;
  const legs = run ? 1 : walk;
  const ph = f / speed;
  const step = legs * Math.sin(ph) * (run ? 22 : 14);
  const lift = legs * Math.abs(Math.sin(ph)) * (run ? -14 : -6);
  const hop = (bounce + (dance ? 0.6 : 0)) * Math.abs(Math.sin(f / 5)) * -26;
  const sway = dance ? Math.sin(f / 6) * 7 : 0;
  const lean = run ? 9 : 0;
  const breathe = 1 + Math.sin(f / 15) * 0.02;
  const blinking = eyes === "open" && (f + 31) % 100 < 4;
  const earFlap = Math.sin(f / 9) * 4 + (run ? Math.sin(f / 2) * 8 : 0);
  const tailWag = Math.sin(f / 6) * 10;

  const skin = PC.pig;
  const skinDark = PC.pigDark;

  // arm targets
  let near = { x: 268, y: 318 };
  let far = { x: 140, y: 318 };
  if (cheer || dance) {
    const d = dance ? Math.sin(f / 5) * 16 : 0;
    near = { x: 300 + d, y: 182 };
    far = { x: 118 - d, y: 186 };
  } else if (wave) {
    near = { x: 300 + Math.sin(f / 3.2) * 20, y: 176 };
  } else if (run) {
    near = { x: 270 + Math.sin(ph) * 30, y: 300 };
    far = { x: 150 - Math.sin(ph) * 30, y: 300 };
  }
  if (hold === "tablet") {
    near = { x: 262, y: 286 };
    far = { x: 196, y: 290 };
  } else if (hold === "trowel" && !cheer && !wave) {
    near = work ? { x: 300, y: 300 + Math.abs(Math.sin(f / 4)) * -26 } : { x: 290, y: 304 };
  } else if (hold === "brick" && !run) {
    near = { x: 268, y: 266 };
    far = { x: 186, y: 268 };
  } else if (hold === "bundle") {
    far = { x: 176, y: 236 };
  } else if (hold === "spoon") {
    near = { x: 286, y: 270 + Math.sin(f / 5) * 10 };
  }

  const eye = (cx: number) => {
    const cy = 150;
    if (eyes === "happy" || blinking)
      return <path d={`M ${cx - 11} ${cy + 3} Q ${cx} ${cy - 9} ${cx + 11} ${cy + 3}`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
    const r = eyes === "wide" ? 14 : 11;
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={C.ink} />
        <circle cx={cx + 4} cy={cy - 4} r={4} fill="#fff" />
      </g>
    );
  };

  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${hop + lift}px`, rotate: `${lean + sway}deg`, transformOrigin: "200px 400px" }}>
          {/* bundle behind the body */}
          {hold === "bundle" ? (
            <g style={{ translate: "176px 236px" }}>
              <BundleShape color={kind === "straw" ? PC.cap : kind === "sticks" ? PC.dress : PC.overalls} />
            </g>
          ) : null}
          {/* curly tail */}
          <path
            d="M 112 300 q -30 -6 -26 -30 q 4 -18 20 -10 q 10 8 -4 16"
            stroke={skinDark}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            style={{ rotate: `${tailWag}deg`, transformOrigin: "112px 300px" }}
          />
          {/* legs */}
          {limb(172, 340, 172 - step, 390, skinDark, 30)}
          {limb(232, 340, 232 + step, 390, skin, 30)}
          <ellipse cx={176 - step} cy={394} rx={20} ry={9} fill={C.ink} opacity={0.55} />
          <ellipse cx={236 + step} cy={394} rx={20} ry={9} fill={C.ink} opacity={0.55} />
          {/* far arm */}
          {limb(150, 262, far.x, far.y, skinDark, 24)}
          {/* body */}
          <g style={{ scale: `1 ${breathe}`, transformOrigin: "200px 370px" }}>
            <ellipse cx={202} cy={290} rx={92} ry={80} fill={skin} />
            <ellipse cx={218} cy={302} rx={52} ry={50} fill={PC.pigLight} />
            {kind === "sticks" ? (
              <g>
                <path d="M 136 262 L 268 262 L 300 352 Q 202 376 104 352 Z" fill={PC.dress} />
                <path d="M 112 340 Q 202 364 292 340" stroke={PC.dressDark} strokeWidth={8} fill="none" />
                {[150, 200, 250].map((x) => (
                  <circle key={x} cx={x} cy={312} r={7} fill="#fff" opacity={0.7} />
                ))}
              </g>
            ) : null}
            {kind === "brick" ? (
              <g>
                <path d="M 120 300 L 284 300 L 290 352 Q 202 372 114 352 Z" fill={PC.overalls} />
                <rect x={166} y={262} width={72} height={52} rx={10} fill={PC.overalls} />
                <rect x={160} y={226} width={14} height={50} rx={6} fill={PC.overallsDark} />
                <rect x={230} y={226} width={14} height={50} rx={6} fill={PC.overallsDark} />
                <rect x={186} y={276} width={32} height={20} rx={5} fill={PC.overallsDark} />
              </g>
            ) : null}
            {kind === "mama" ? (
              <g>
                <path d="M 150 250 L 262 250 L 286 356 Q 206 374 126 356 Z" fill={PC.apron} />
                <path d="M 176 290 Q 206 304 236 290 L 232 320 Q 206 330 180 320 Z" fill={C.lavenderDark} />
                <circle cx={206} cy={250} r={9} fill={C.pinkDark} />
              </g>
            ) : null}
            {kind === "straw" ? <path d="M 150 248 Q 206 276 262 246" stroke={PC.cap} strokeWidth={14} fill="none" strokeLinecap="round" /> : null}
          </g>
          {/* head */}
          <g style={{ rotate: `${headTilt}deg`, transformOrigin: "205px 220px" }}>
            <path d={`M 140 104 L 128 ${44 - earFlap} L 186 80 Z`} fill={skinDark} strokeLinejoin="round" stroke={skinDark} strokeWidth={10} />
            <path d={`M 240 78 L 292 ${40 + earFlap} L 278 106 Z`} fill={skin} strokeLinejoin="round" stroke={skin} strokeWidth={10} />
            <circle cx={208} cy={162} r={90} fill={skin} />
            {eye(184)}
            {eye(250)}
            <circle cx={162} cy={196} r={14} fill={C.pinkDark} opacity={0.45} />
            <circle cx={290} cy={190} r={13} fill={C.pinkDark} opacity={0.45} />
            {/* snout */}
            <ellipse cx={236} cy={190} rx={36} ry={26} fill={PC.snout} />
            <ellipse cx={224} cy={190} rx={6} ry={9} fill={skinDark} />
            <ellipse cx={248} cy={190} rx={6} ry={9} fill={skinDark} />
            {mouthOpen > 0.15 ? (
              <ellipse cx={236} cy={230} rx={14} ry={4 + mouthOpen * 10} fill={C.ink} />
            ) : (
              <path d="M 218 226 Q 236 240 254 226" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
            )}
            {/* hats */}
            {kind === "straw" ? (
              <g>
                <path d="M 128 112 Q 140 50 210 46 Q 278 50 288 108 Z" fill={PC.cap} />
                <path d="M 250 104 Q 300 96 330 112 Q 300 122 250 116 Z" fill={PC.cap} />
                <circle cx={208} cy={50} r={8} fill={C.pinkDark} />
              </g>
            ) : null}
            {kind === "sticks" ? (
              <g style={{ translate: "212px 72px" }}>
                <path d="M 0 0 L -34 -20 L -34 20 Z" fill={PC.dressDark} />
                <path d="M 0 0 L 34 -20 L 34 20 Z" fill={PC.dressDark} />
                <circle r={10} fill={PC.dress} />
              </g>
            ) : null}
            {kind === "brick" ? (
              <g>
                <path d="M 126 112 Q 130 40 210 38 Q 290 40 292 112 Z" fill={PC.hardHat} />
                <rect x={110} y={104} width={196} height={16} rx={8} fill={C.butterDark} />
                <rect x={202} y={40} width={16} height={66} rx={6} fill={C.butterDark} />
              </g>
            ) : null}
            {kind === "mama" ? (
              <g style={{ translate: "150px 84px" }}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 12} cy={Math.sin((a * Math.PI) / 180) * 12} r={10} fill={C.butter} />
                ))}
                <circle r={8} fill={C.pinkDark} />
              </g>
            ) : null}
          </g>
          {/* held props in front */}
          {hold === "tablet" ? (
            <g style={{ translate: "232px 274px", rotate: "-8deg" }}>
              <TabletShape />
            </g>
          ) : null}
          {hold === "trowel" ? (
            <g style={{ translate: `${near.x}px ${near.y}px`, rotate: "20deg" }}>
              <TrowelShape />
            </g>
          ) : null}
          {hold === "brick" && !run ? (
            <g style={{ translate: "228px 250px" }}>
              <BrickShape />
            </g>
          ) : null}
          {hold === "spoon" ? (
            <g style={{ translate: `${near.x}px ${near.y}px`, rotate: "-40deg" }}>
              <rect x={-4} y={-40} width={8} height={40} rx={4} fill={C.lavenderDark} />
              <ellipse cx={0} cy={-46} rx={12} ry={9} fill={C.lavenderDark} />
            </g>
          ) : null}
          {/* near arm */}
          {limb(262, 258, near.x, near.y, skin, 26)}
          <circle cx={near.x} cy={near.y} r={14} fill={skinDark} />
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Wolf ───────────────────────────── */

export type WolfProps = Placed & {
  walk?: number;
  /** 0..1 cheeks puffed up (breathing in). */
  puff?: number;
  /** Blowing out: little "o" mouth. */
  blow?: boolean;
  eyes?: "grumpy" | "surprised" | "tired" | "closed";
  mouthOpen?: number;
  /** Near arm reaches forward to press a doorbell. */
  ring?: boolean;
  /** Tired droop: ears down, slumped. */
  droop?: boolean;
  /** Yawning (with droop). */
  yawn?: number;
  seed?: number;
};

export const Wolf: React.FC<WolfProps> = (props) => {
  const frame = useCurrentFrame();
  const { walk = 0, puff = 0, blow, eyes = "grumpy", mouthOpen = 0, ring, droop, yawn = 0, seed = 0 } = props;
  const f = frame + seed * 5;
  const ph = f / 6;
  const step = walk * Math.sin(ph) * 16;
  const lift = walk * Math.abs(Math.sin(ph)) * -6;
  const breathe = 1 + Math.sin(f / 16) * 0.02 + puff * 0.06;
  const blinking = eyes !== "closed" && eyes !== "tired" && (f + 13) % 110 < 4;
  const tailWag = Math.sin(f / 10) * 6;
  const slump = droop ? 10 : 0;
  const earDrop = droop ? 26 : 0;
  const cheekR = 18 + puff * 22;

  const near = ring ? { x: 352, y: 290 } : droop ? { x: 262, y: 344 } : { x: 258 + walk * Math.sin(ph) * 14, y: 336 };
  const far = droop ? { x: 150, y: 344 } : { x: 150 - walk * Math.sin(ph) * 14, y: 336 };

  const eye = (cx: number, cy: number, inner: boolean) => {
    if (eyes === "closed" || blinking)
      return <path d={`M ${cx - 11} ${cy} Q ${cx} ${cy + 8} ${cx + 11} ${cy}`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
    const r = eyes === "surprised" ? 14 : 11;
    return (
      <g>
        <circle cx={cx} cy={cy} r={r + 5} fill="#fff" />
        <circle cx={cx + 2} cy={cy + 1} r={r - 2} fill={C.ink} />
        <circle cx={cx + 5} cy={cy - 3} r={3.5} fill="#fff" />
        {eyes === "tired" ? <rect x={cx - r - 6} y={cy - r - 6} width={(r + 6) * 2} height={r + 6} rx={6} fill={PC.wolf} /> : null}
        {eyes === "grumpy" ? (
          <path
            d={inner ? `M ${cx - 16} ${cy - 18} L ${cx + 14} ${cy - 10}` : `M ${cx - 14} ${cy - 10} L ${cx + 16} ${cy - 18}`}
            stroke={PC.wolfDark}
            strokeWidth={9}
            strokeLinecap="round"
          />
        ) : null}
      </g>
    );
  };

  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${lift + slump}px` }}>
          {/* fluffy tail */}
          <path
            d="M 130 320 Q 40 320 34 230 Q 70 260 92 250 Q 80 290 130 290 Z"
            fill={PC.wolfDark}
            style={{ rotate: `${tailWag}deg`, transformOrigin: "130px 310px" }}
          />
          <path d="M 44 240 Q 56 256 70 252" stroke={PC.wolfBelly} strokeWidth={10} fill="none" strokeLinecap="round" style={{ rotate: `${tailWag}deg`, transformOrigin: "130px 310px" }} />
          {/* legs */}
          {limb(176, 330, 176 - step, 390 - slump, PC.wolfDark, 30)}
          {limb(228, 330, 228 + step, 390 - slump, PC.wolf, 30)}
          <ellipse cx={182 - step} cy={394 - slump} rx={22} ry={9} fill={PC.wolfDark} />
          <ellipse cx={236 + step} cy={394 - slump} rx={22} ry={9} fill={PC.wolfDark} />
          {/* far arm */}
          {limb(158, 238, far.x, far.y, PC.wolfDark, 24)}
          <circle cx={far.x} cy={far.y} r={13} fill={PC.wolfDark} />
          {/* body */}
          <g style={{ scale: `${1 + puff * 0.04} ${breathe}`, transformOrigin: "200px 360px" }}>
            <ellipse cx={202} cy={276} rx={78} ry={92} fill={PC.wolf} />
            <ellipse cx={222} cy={292} rx={44} ry={64} fill={PC.wolfBelly} />
          </g>
          {/* scarf */}
          <rect x={150} y={186} width={118} height={30} rx={15} fill={PC.scarf} />
          <path d="M 170 206 L 160 262 L 188 260 L 194 210 Z" fill={C.butterDark} />
          {/* head */}
          <g style={{ translate: `0px ${slump * 0.6}px`, rotate: droop ? "8deg" : "0deg", transformOrigin: "210px 190px" }}>
            <path d={`M 150 96 L ${150 - earDrop} ${26 + earDrop} L 196 74 Z`} fill={PC.wolfDark} stroke={PC.wolfDark} strokeWidth={10} strokeLinejoin="round" />
            <path d={`M 230 70 L ${258 + earDrop} ${14 + earDrop * 1.2} L 272 88 Z`} fill={PC.wolf} stroke={PC.wolf} strokeWidth={10} strokeLinejoin="round" />
            <path d="M 236 76 L 256 34 L 262 84 Z" fill={C.pink} opacity={droop ? 0 : 0.8} />
            <ellipse cx={210} cy={128} rx={78} ry={70} fill={PC.wolf} />
            {/* snout */}
            <ellipse cx={286} cy={152} rx={54} ry={32} fill={PC.wolfBelly} />
            <circle cx={334} cy={140} r={15} fill={C.ink} />
            <circle cx={330} cy={135} r={4} fill="#fff" opacity={0.7} />
            {/* puffed cheek */}
            <circle cx={262} cy={170} r={cheekR} fill={PC.wolfBelly} />
            <circle cx={262} cy={170} r={cheekR * 0.45} fill={C.pink} opacity={0.5 + puff * 0.3} />
            {eye(196, 116, false)}
            {eye(248, 112, true)}
            {blow ? (
              <ellipse cx={318} cy={174} rx={9} ry={10} fill={C.ink} />
            ) : yawn > 0.1 ? (
              <ellipse cx={300} cy={176} rx={16} ry={6 + yawn * 14} fill={C.ink} />
            ) : mouthOpen > 0.15 ? (
              <path d={`M 280 172 Q 304 ${176 + mouthOpen * 22} 326 168 Z`} fill={C.ink} />
            ) : puff > 0.3 ? (
              <circle cx={318} cy={174} r={4} fill={C.ink} />
            ) : (
              <path d={eyes === "tired" ? "M 284 178 Q 304 170 324 176" : "M 282 176 Q 304 168 326 172"} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
            )}
          </g>
          {/* near arm */}
          {limb(250, 236, near.x, near.y, PC.wolf, 26)}
          <circle cx={near.x} cy={near.y} r={14} fill={PC.wolfDark} />
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Little props ───────────────────────────── */

/** A little round smart speaker that bounces to the beat; feet at (x, y). */
export const Speaker: React.FC<{ x: number; y: number; size?: number; on?: boolean }> = ({ x, y, size = 120, on = true }) => {
  const frame = useCurrentFrame();
  const thump = on ? Math.abs(Math.sin(frame / 4)) : 0;
  const ring = [C.pink, C.butter, C.mint, C.blue][Math.floor(frame / 10) % 4];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", left: x - size / 2, top: y - size, overflow: "visible" }}>
      <g style={{ scale: `${1 + thump * 0.05} ${1 - thump * 0.05}`, transformOrigin: "50px 100px" }}>
        <rect x={18} y={20} width={64} height={78} rx={30} fill={C.lavenderDark} />
        <circle cx={50} cy={64} r={22} fill={C.lavender} />
        <circle cx={50} cy={64} r={10 + thump * 4} fill={C.ink} opacity={0.6} />
        <rect x={30} y={30} width={40} height={6} rx={3} fill={on ? ring : C.cream} />
      </g>
    </svg>
  );
};

/** Music notes floating up from (x, y). */
export const MusicNotes: React.FC<{ x: number; y: number; opacity?: number }> = ({ x, y, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const colors = [C.pinkDark, C.lavenderDark, C.leafDark, C.butterDark];
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const t = ((frame + i * 22) % 88) / 88;
        const o = opacity * (t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1);
        return (
          <svg
            key={i}
            viewBox="0 0 40 50"
            width={54}
            height={66}
            style={{
              position: "absolute",
              left: x + Math.sin(t * 6 + i) * 50 + i * 24,
              top: y - t * 260,
              opacity: o,
              rotate: `${Math.sin(t * 5 + i) * 15}deg`,
            }}
          >
            <ellipse cx={12} cy={40} rx={10} ry={8} fill={colors[i]} />
            <rect x={19} y={6} width={5} height={34} fill={colors[i]} />
            {i % 2 ? <path d="M 24 6 Q 38 10 34 24 Q 30 14 24 14 Z" fill={colors[i]} /> : null}
          </svg>
        );
      })}
    </>
  );
};
