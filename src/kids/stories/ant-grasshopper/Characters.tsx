/**
 * The Ant and the Grasshopper — flat pastel characters and props (inline SVG, frame-driven).
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { C, place, type Placed } from "../../kit";

/** Story-specific pastel colours. */
export const AC = {
  gh: "#B5E3A1",
  ghDark: "#97D17F",
  ghBelly: "#DFF4CC",
  ghWing: "#D3F0C4",
  ant: "#EDB3AA",
  antDark: "#DC9A92",
  antLight: "#F8D3CC",
  guitar: "#FFC9A0",
  guitarDark: "#F2AE7E",
  neck: "#D9B99B",
  phone: "#BFAEE6",
  screen: "#F4F8FF",
  solar: "#9EC3EE",
  solarDark: "#7FA8DC",
  battery: "#F59AA8",
  scarf: "#F59AB8",
  scarfDark: "#E9819F",
  snow: "#FAFCFF",
  snowShade: "#E3EAF7",
  orange: "#FFC38E",
  orangeDark: "#F6A66E",
  soup: "#FFD27E",
};

/** Convert a point in a character's 400×400 space to composition pixels. */
export const toScene = (p: Placed, v: { x: number; y: number }) => {
  const size = p.size ?? 200;
  const vx = p.flip ? 400 - v.x : v.x;
  return { x: p.x - size / 2 + (vx * size) / 400, y: p.y - size + (v.y * size) / 400 };
};

const limb = (x1: number, y1: number, x2: number, y2: number, color: string, w: number, key?: string) => (
  <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round" />
);

/* ───────────────────────────── Guitar ───────────────────────────── */

/** A little guitar drawn along +x from its body centre (0, 0). */
const GuitarShape: React.FC = () => (
  <g>
    <rect x={30} y={-8} width={118} height={16} rx={6} fill={AC.neck} />
    <rect x={142} y={-13} width={34} height={26} rx={8} fill={AC.guitarDark} />
    <circle cx={-12} cy={0} r={46} fill={AC.guitar} />
    <circle cx={30} cy={0} r={34} fill={AC.guitar} />
    <circle cx={10} cy={0} r={13} fill={C.ink} opacity={0.7} />
    <rect x={-40} y={-14} width={10} height={28} rx={4} fill={AC.guitarDark} />
    {[-4, 0, 4].map((y) => (
      <line key={y} x1={-36} y1={y} x2={150} y2={y} stroke="#fff" strokeWidth={1.4} opacity={0.8} />
    ))}
  </g>
);

/* ───────────────────────────── Grasshopper ───────────────────────────── */

export type GrasshopperProps = Placed & {
  /** "play" strums the guitar, "back" slings it behind him, "none" hides it. */
  guitar?: "play" | "back" | "none";
  /** 0..1 strumming speed. */
  strum?: number;
  eyes?: "open" | "happy" | "sad" | "wide";
  mouthOpen?: number;
  sad?: boolean;
  /** Hopping / dancing on the spot, 0..1. */
  bounce?: number;
  /** Walking (legs step). */
  walk?: number;
  /** Shivering in the cold. */
  shiver?: boolean;
  /** Knocking on a door with the front arm. */
  knock?: boolean;
  wave?: boolean;
  scarf?: boolean;
  /** Laughing: head bobs. */
  laugh?: boolean;
  headTilt?: number;
};

export const Grasshopper: React.FC<GrasshopperProps> = (props) => {
  const frame = useCurrentFrame();
  const {
    guitar = "none",
    strum = 0,
    eyes = "open",
    mouthOpen = 0,
    sad,
    bounce = 0,
    walk = 0,
    shiver,
    knock,
    wave,
    scarf,
    laugh,
    headTilt = 0,
  } = props;
  const hop = bounce * Math.abs(Math.sin(frame / 5)) * -24;
  const jitter = shiver ? Math.sin(frame * 2.3) * 3 : 0;
  const breathe = 1 + Math.sin(frame / 14) * 0.02;
  const blinking = eyes === "open" && (frame + 23) % 96 < 4;
  const laughBob = laugh ? Math.abs(Math.sin(frame / 3.5)) * -7 : 0;
  const ph = frame / 6;
  const stepA = walk * Math.sin(ph) * 16;
  const lift = walk * Math.abs(Math.sin(ph)) * -4;
  const antWiggle = Math.sin(frame / 8) * 5;

  // arms
  const strumOff = guitar === "play" ? Math.sin(frame / (2.2 + (1 - strum) * 6)) * 9 * Math.max(0.3, strum) : 0;
  let nearPaw = { x: 236, y: 330 };
  let farPaw = { x: 176, y: 330 };
  if (guitar === "play") {
    nearPaw = { x: 212 + strumOff * 0.3, y: 296 + strumOff };
    farPaw = { x: 300, y: 232 };
  } else if (shiver) {
    nearPaw = { x: 236 + jitter, y: 282 };
    farPaw = { x: 198 - jitter, y: 290 };
  } else if (knock) {
    const k = Math.abs(Math.sin(frame / 3));
    nearPaw = { x: 300 + k * 26, y: 236 };
  } else if (wave) {
    nearPaw = { x: 290 + Math.sin(frame / 3) * 18, y: 120 };
  }

  const eye = (cx: number) => {
    const cy = 128;
    if (eyes === "happy" || blinking)
      return <path d={`M ${cx - 11} ${cy + 2} Q ${cx} ${cy - 10} ${cx + 11} ${cy + 2}`} stroke={C.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    const r = eyes === "wide" ? 15 : 12;
    return (
      <g>
        <circle cx={cx} cy={cy} r={r + 6} fill="#fff" />
        <circle cx={cx + 2} cy={cy + 1} r={r - 2} fill={C.ink} />
        <circle cx={cx + 5} cy={cy - 3} r={3.4} fill="#fff" />
        {eyes === "sad" ? (
          <path
            d={cx < 225 ? `M ${cx - 12} ${cy - 18} L ${cx + 12} ${cy - 27}` : `M ${cx - 12} ${cy - 27} L ${cx + 12} ${cy - 18}`}
            stroke={C.ink}
            strokeWidth={4}
            strokeLinecap="round"
          />
        ) : null}
      </g>
    );
  };

  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `${jitter}px ${hop + lift}px` }}>
          {/* guitar on his back */}
          {guitar === "back" ? (
            <g style={{ translate: "150px 300px", rotate: "-70deg", scale: "0.9" }}>
              <GuitarShape />
            </g>
          ) : null}
          {/* far back leg */}
          {limb(205, 330, 150, 290, AC.ghDark, 30)}
          {limb(150, 290, 205 - stepA, 390, AC.ghDark, 18)}
          <ellipse cx={218 - stepA} cy={392} rx={22} ry={8} fill={AC.ghDark} />
          {/* wing */}
          <ellipse cx={162} cy={262} rx={30} ry={86} fill={AC.ghWing} style={{ rotate: "12deg", transformOrigin: "162px 262px" }} />
          {/* body */}
          <g style={{ scale: `1 ${breathe}`, transformOrigin: "200px 350px" }}>
            <ellipse cx={204} cy={270} rx={58} ry={86} fill={AC.gh} />
            <ellipse cx={226} cy={284} rx={30} ry={60} fill={AC.ghBelly} />
            {[250, 280, 310].map((y) => (
              <path key={y} d={`M ${200} ${y} Q ${226} ${y + 8} ${252} ${y}`} stroke={AC.ghDark} strokeWidth={3} fill="none" opacity={0.5} />
            ))}
          </g>
          {/* near back leg (big folded thigh) */}
          {limb(200, 336, 128, 282, AC.gh, 36)}
          {limb(128, 282, 175 + stepA, 390, AC.gh, 20)}
          <ellipse cx={190 + stepA} cy={392} rx={24} ry={9} fill={AC.ghDark} />
          {/* far arm */}
          {limb(196, 228, farPaw.x, farPaw.y, AC.ghDark, 14)}
          <circle cx={farPaw.x} cy={farPaw.y} r={10} fill={AC.ghDark} />
          {/* guitar in front */}
          {guitar === "play" ? (
            <g style={{ translate: "200px 296px", rotate: "-30deg" }}>
              <GuitarShape />
            </g>
          ) : null}
          {/* scarf */}
          {scarf ? (
            <g>
              <rect x={168} y={190} width={92} height={30} rx={15} fill={AC.scarf} />
              <path d="M 180 210 L 170 268 L 196 266 L 202 214 Z" fill={AC.scarfDark} />
              {[180, 204, 228].map((x) => (
                <line key={x} x1={x} y1={192} x2={x} y2={218} stroke="#fff" strokeWidth={4} opacity={0.6} />
              ))}
            </g>
          ) : null}
          {/* head */}
          <g style={{ rotate: `${headTilt}deg`, translate: `0px ${laughBob}px`, transformOrigin: "220px 190px" }}>
            {/* antennae */}
            <path d={`M 200 92 Q 170 40 ${150 + antWiggle} 18`} stroke={AC.ghDark} strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d={`M 240 88 Q 268 40 ${282 - antWiggle} 16`} stroke={AC.ghDark} strokeWidth={6} fill="none" strokeLinecap="round" />
            <circle cx={150 + antWiggle} cy={18} r={9} fill={C.pinkDark} />
            <circle cx={282 - antWiggle} cy={16} r={9} fill={C.pinkDark} />
            <ellipse cx={222} cy={142} rx={66} ry={58} fill={AC.gh} />
            <ellipse cx={240} cy={170} rx={36} ry={22} fill={AC.ghBelly} />
            {eye(200)}
            {eye(250)}
            <circle cx={186} cy={166} r={10} fill={C.pink} opacity={0.75} />
            <circle cx={272} cy={164} r={10} fill={C.pink} opacity={0.75} />
            {mouthOpen > 0.15 ? (
              <ellipse cx={238} cy={176} rx={11} ry={4 + mouthOpen * 9} fill={C.ink} />
            ) : sad ? (
              <path d="M 224 182 Q 238 172 252 182" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
            ) : (
              <path d="M 222 172 Q 238 186 254 172" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
            )}
          </g>
          {/* near arm */}
          {limb(236, 232, nearPaw.x, nearPaw.y, AC.gh, 15)}
          <circle cx={nearPaw.x} cy={nearPaw.y} r={11} fill={AC.ghDark} />
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Ant ───────────────────────────── */

export type Carry = "seed" | "berry" | "leaf" | "jar" | null;

export type AntProps = Placed & {
  walk?: number;
  /** Item held above the head. */
  carry?: Carry;
  wave?: boolean;
  /** Dancing: bounce and arms up. */
  dance?: boolean;
  mouthOpen?: number;
  eyes?: "open" | "happy";
  /** The little Ant (the one who talks) wears a flower. */
  leader?: boolean;
  /** Phase offset so a line of ants doesn't move in lock-step. */
  seed?: number;
};

const CarryShape: React.FC<{ item: Exclude<Carry, null> }> = ({ item }) => {
  if (item === "seed")
    return (
      <g>
        <ellipse cx={0} cy={0} rx={42} ry={30} fill={C.butterDark} />
        <ellipse cx={-12} cy={-8} rx={14} ry={8} fill={C.butter} />
      </g>
    );
  if (item === "berry")
    return (
      <g>
        <circle cx={-18} cy={6} r={24} fill={C.pinkDark} />
        <circle cx={18} cy={6} r={24} fill={C.lavenderDark} />
        <circle cx={0} cy={-18} r={24} fill={C.pinkDark} />
        <circle cx={-8} cy={-24} r={6} fill="#fff" opacity={0.6} />
        <path d="M 0 -40 Q 4 -56 16 -60" stroke={C.leafDark} strokeWidth={5} fill="none" />
      </g>
    );
  if (item === "leaf")
    return (
      <g>
        <path d="M -56 10 Q 0 -60 56 10 Q 0 40 -56 10 Z" fill={C.leaf} />
        <path d="M -50 10 Q 0 -6 50 10" stroke={C.leafDark} strokeWidth={4} fill="none" />
      </g>
    );
  return (
    <g>
      <rect x={-30} y={-34} width={60} height={68} rx={12} fill={C.cream} />
      <rect x={-30} y={-6} width={60} height={40} rx={10} fill={AC.orange} />
      <rect x={-34} y={-44} width={68} height={16} rx={6} fill={C.lavenderDark} />
    </g>
  );
};

export const Ant: React.FC<AntProps> = (props) => {
  const frame = useCurrentFrame();
  const { walk = 0, carry = null, wave, dance, mouthOpen = 0, eyes = "open", leader, seed = 0 } = props;
  const f = frame + seed * 13;
  const ph = f / 5;
  const bob = walk * Math.abs(Math.sin(ph)) * -8 + (dance ? Math.abs(Math.sin(f / 5)) * -22 : 0);
  const legA = walk * Math.sin(ph) * 22 + (dance ? Math.sin(f / 5) * 14 : 0);
  const blinking = eyes === "open" && (f + 31) % 104 < 4;
  const breathe = 1 + Math.sin(f / 15) * 0.02;
  const antWiggle = Math.sin(f / 7) * 6;

  // arm targets
  let near = { x: 268, y: 318 };
  let far = { x: 186, y: 318 };
  if (carry) {
    near = { x: 268, y: 74 };
    far = { x: 200, y: 74 };
  } else if (dance) {
    near = { x: 300 + Math.sin(f / 4) * 14, y: 130 };
    far = { x: 150 - Math.sin(f / 4) * 14, y: 130 };
  } else if (wave) {
    near = { x: 312 + Math.sin(f / 3) * 18, y: 132 };
  }

  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${bob}px` }}>
          {/* legs */}
          {limb(206, 300, 188 - legA, 384, AC.antDark, 16)}
          <ellipse cx={196 - legA} cy={390} rx={22} ry={9} fill={C.ink} opacity={0.75} />
          {limb(232, 300, 246 + legA, 384, AC.antDark, 16)}
          <ellipse cx={256 + legA} cy={390} rx={22} ry={9} fill={C.ink} opacity={0.75} />
          {/* abdomen + thorax */}
          <g style={{ scale: `${breathe}`, transformOrigin: "200px 300px" }}>
            <ellipse cx={142} cy={276} rx={74} ry={58} fill={AC.ant} style={{ rotate: "-14deg", transformOrigin: "142px 276px" }} />
            <path d="M 104 240 Q 120 300 112 326" stroke={AC.antDark} strokeWidth={5} fill="none" opacity={0.6} />
            <path d="M 138 226 Q 154 290 146 334" stroke={AC.antDark} strokeWidth={5} fill="none" opacity={0.6} />
            <ellipse cx={220} cy={262} rx={36} ry={46} fill={AC.ant} />
            <ellipse cx={230} cy={270} rx={18} ry={28} fill={AC.antLight} />
          </g>
          {/* far arm */}
          {limb(206, 236, far.x, far.y, AC.antDark, 13)}
          <circle cx={far.x} cy={far.y} r={10} fill={AC.antDark} />
          {/* head */}
          <g>
            <path d={`M 220 120 Q 196 70 ${176 + antWiggle} 40`} stroke={AC.antDark} strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d={`M 258 118 Q 286 72 ${304 - antWiggle} 44`} stroke={AC.antDark} strokeWidth={6} fill="none" strokeLinecap="round" />
            <circle cx={176 + antWiggle} cy={40} r={9} fill={AC.antDark} />
            <circle cx={304 - antWiggle} cy={44} r={9} fill={AC.antDark} />
            <circle cx={242} cy={170} r={60} fill={AC.ant} />
            {leader ? (
              <g style={{ translate: "206px 118px" }}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 12} cy={Math.sin((a * Math.PI) / 180) * 12} r={10} fill={C.butter} />
                ))}
                <circle r={8} fill={AC.orangeDark} />
              </g>
            ) : null}
            {eyes === "happy" || blinking ? (
              <>
                <path d="M 224 164 Q 234 154 244 164" stroke={C.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />
                <path d="M 262 164 Q 272 154 282 164" stroke={C.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx={234} cy={162} r={10} fill={C.ink} />
                <circle cx={272} cy={162} r={10} fill={C.ink} />
                <circle cx={237} cy={158} r={3.4} fill="#fff" />
                <circle cx={275} cy={158} r={3.4} fill="#fff" />
              </>
            )}
            <circle cx={218} cy={186} r={10} fill={C.pink} opacity={0.8} />
            <circle cx={292} cy={184} r={10} fill={C.pink} opacity={0.8} />
            {mouthOpen > 0.15 ? (
              <ellipse cx={256} cy={196} rx={10} ry={3 + mouthOpen * 8} fill={C.ink} />
            ) : (
              <path d="M 242 190 Q 256 202 270 190" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
            )}
          </g>
          {/* carried item */}
          {carry ? (
            <g style={{ translate: "236px 40px", scale: "1.5" }}>
              <CarryShape item={carry} />
            </g>
          ) : null}
          {/* near arm */}
          {limb(236, 238, near.x, near.y, AC.ant, 14)}
          <circle cx={near.x} cy={near.y} r={11} fill={AC.antDark} />
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Phone on a tripod ───────────────────────────── */

/** The Grasshopper's phone on a little tripod, feet at (x, y). */
export const PhoneTripod: React.FC<{
  x: number;
  y: number;
  size?: number;
  /** "music" streams (notes on screen), "low" shows a low battery, "empty" an empty one. */
  screen?: "music" | "low" | "empty" | "charging";
}> = ({ x, y, size = 200, screen = "music" }) => {
  const frame = useCurrentFrame();
  const hue = [C.pink, C.butter, C.mint, C.blue][Math.floor(frame / 14) % 4];
  const blink = Math.floor(frame / 15) % 2 === 0;
  const charge = (frame % 60) / 60;
  return (
    <svg
      viewBox="0 0 100 200"
      width={size / 2}
      height={size}
      style={{ position: "absolute", left: x - size / 4, top: y - size, overflow: "visible" }}
    >
      <line x1={50} y1={110} x2={20} y2={198} stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
      <line x1={50} y1={110} x2={80} y2={198} stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
      <line x1={50} y1={110} x2={50} y2={198} stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
      <rect x={18} y={20} width={64} height={96} rx={12} fill={AC.phone} />
      <rect x={24} y={27} width={52} height={80} rx={7} fill={screen === "music" ? hue : AC.screen} />
      {screen === "music" ? (
        <g fill="#fff">
          <ellipse cx={44} cy={78} rx={8} ry={6} />
          <rect x={49} y={50} width={4} height={28} />
          <path d="M 53 50 Q 64 54 62 66 Q 58 58 53 58 Z" />
          <circle cx={68} cy={36} r={4} fill={blink ? "#F59AA8" : "#fff"} />
        </g>
      ) : (
        <g>
          <rect x={34} y={52} width={30} height={18} rx={4} fill="none" stroke={C.ink} strokeWidth={3} />
          <rect x={64} y={57} width={4} height={8} rx={1} fill={C.ink} />
          {screen === "low" ? <rect x={37} y={55} width={6} height={12} rx={2} fill={AC.battery} /> : null}
          {screen === "charging" ? <rect x={37} y={55} width={24 * charge + 2} height={12} rx={2} fill={C.leafDark} /> : null}
          {screen === "empty" && blink ? <rect x={37} y={55} width={3} height={12} rx={1} fill={AC.battery} /> : null}
        </g>
      )}
    </svg>
  );
};

/** A butterfly flitting around (cx, cy). */
export const Butterfly: React.FC<{ cx: number; cy: number; color?: string; seed?: number; size?: number }> = ({
  cx,
  cy,
  color = C.lavenderDark,
  seed = 0,
  size = 70,
}) => {
  const frame = useCurrentFrame();
  const f = frame + seed * 40;
  const x = cx + Math.sin(f / 30) * 120;
  const y = cy + Math.sin(f / 17) * 40;
  const flap = 0.35 + Math.abs(Math.sin(f / 2.5)) * 0.65;
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, overflow: "visible" }}>
      <g style={{ scale: `${flap} 1` }}>
        <ellipse cx={-22} cy={-12} rx={22} ry={18} fill={color} />
        <ellipse cx={22} cy={-12} rx={22} ry={18} fill={color} />
        <ellipse cx={-16} cy={14} rx={14} ry={12} fill={C.pink} />
        <ellipse cx={16} cy={14} rx={14} ry={12} fill={C.pink} />
      </g>
      <rect x={-4} y={-22} width={8} height={44} rx={4} fill={C.ink} opacity={0.7} />
    </svg>
  );
};
