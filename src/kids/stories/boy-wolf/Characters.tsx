/**
 * The Boy Who Cried Wolf — flat pastel characters and props (inline SVG, frame-driven).
 * Characters face right by default (`flip` faces them left); feet sit at the bottom of
 * their 400×400 box. The Wolf is the series' friendly-grumpy wolf from The Three Little Pigs.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { C, place, type Placed } from "../../kit";

export { Wolf } from "../three-pigs/Characters";

/** Story-specific pastel colours. */
export const BC = {
  bear: "#E4C1A2",
  bearDark: "#CFA382",
  bearLight: "#F6E4D3",
  nose: "#8A6A5C",
  bandana: "#9FD9C8",
  bandanaDark: "#7FC6B1",
  wool: "#FFFDF7",
  woolShade: "#EFE8F5",
  sheepFace: "#B7ACCB",
  sheepDark: "#9A8FB3",
  collar: "#8FD3C0",
  walkie: "#F2A1B8",
  walkieDark: "#DB8099",
  alert: "#F48FA6",
  crook: "#C9A07C",
  tear: "#9CCBF2",
  roofRed: "#F2B0A3",
  roofBlue: "#AFC9EE",
  roofLilac: "#C9B8EC",
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

/* ───────────────────────────── Held props ───────────────────────────── */

/** A chunky walkie-talkie with a big button; centred at (0, 0). `beep` flashes the light. */
export const WalkieShape: React.FC<{ beep?: boolean }> = ({ beep }) => {
  const frame = useCurrentFrame();
  const on = beep && Math.floor(frame / 5) % 2 === 0;
  return (
    <g>
      <rect x={-6} y={-74} width={10} height={40} rx={5} fill={BC.walkieDark} />
      <circle cx={-1} cy={-76} r={8} fill={on ? C.butterDark : BC.walkieDark} />
      <rect x={-28} y={-40} width={56} height={84} rx={14} fill={BC.walkie} />
      {[-24, -14, -4].map((y) => (
        <rect key={y} x={-16} y={y} width={32} height={5} rx={2.5} fill={BC.walkieDark} />
      ))}
      <circle cx={0} cy={22} r={12} fill={on ? C.butterDark : C.cream} />
    </g>
  );
};

/** A phone held up; `beep` flashes an alert on the screen. Centred at (0, 0). */
export const PhoneShape: React.FC<{ beep?: boolean; map?: boolean }> = ({ beep, map }) => {
  const frame = useCurrentFrame();
  const on = beep && Math.floor(frame / 5) % 2 === 0;
  return (
    <g>
      <rect x={-22} y={-38} width={44} height={76} rx={9} fill={C.lavenderDark} />
      <rect x={-17} y={-31} width={34} height={60} rx={5} fill={on ? BC.alert : map ? C.mint : C.cream} />
      {on ? <text x={0} y={12} fontSize={36} fontWeight={700} fill="#fff" textAnchor="middle">!</text> : null}
      {map ? (
        <>
          <circle cx={-6} cy={-10} r={4} fill={C.pinkDark} />
          <circle cx={7} cy={4} r={4} fill={C.pinkDark} />
          <circle cx={-4} cy={16} r={4} fill={C.pinkDark} />
        </>
      ) : null}
    </g>
  );
};

/** Little "beep beep" waves around a point. */
export const BeepWaves: React.FC<{ x: number; y: number; on?: boolean; color?: string }> = ({ x, y, on = true, color = BC.alert }) => {
  const frame = useCurrentFrame();
  if (!on) return null;
  return (
    <svg viewBox="-100 -100 200 200" width={200} height={200} style={{ position: "absolute", left: x - 100, top: y - 100, overflow: "visible" }}>
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 6) % 18) / 18;
        return (
          <g key={i} opacity={1 - t}>
            <path d={`M ${30 + t * 40} ${-30 - t * 20} Q ${50 + t * 50} 0 ${30 + t * 40} ${30 + t * 20}`} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" />
            <path d={`M ${-30 - t * 40} ${-30 - t * 20} Q ${-50 - t * 50} 0 ${-30 - t * 40} ${30 + t * 20}`} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
};

/* ───────────────────────────── Toby (bear cub) ───────────────────────────── */

export type BearPose = "stand" | "shout" | "laugh" | "sit" | "yawn" | "think";

export type BearProps = Placed & {
  pose?: BearPose;
  walk?: number;
  run?: boolean;
  wave?: boolean;
  mouthOpen?: number;
  eyes?: "open" | "happy" | "wide" | "sad" | "sly";
  hold?: "crook" | "walkie" | null;
  /** Walkie light flashing. */
  beep?: boolean;
  tears?: boolean;
  headTilt?: number;
  seed?: number;
};

export const Bear: React.FC<BearProps> = (props) => {
  const frame = useCurrentFrame();
  const { pose = "stand", walk = 0, run, wave, mouthOpen = 0, eyes = "open", hold = null, beep, tears, headTilt = 0, seed = 0 } = props;
  const f = frame + seed * 7;
  const legs = run ? 1 : walk;
  const ph = f / (run ? 2.6 : 5);
  const step = legs * Math.sin(ph) * (run ? 22 : 14);
  const lift = legs * Math.abs(Math.sin(ph)) * (run ? -14 : -6);
  const breathe = 1 + Math.sin(f / 15) * 0.02;
  const blinking = (eyes === "open" || eyes === "wide") && (f + 37) % 100 < 4;
  const sit = pose === "sit";
  const laughShake = pose === "laugh" ? Math.sin(f / 2) * 4 : 0;
  const shoutHop = pose === "shout" ? Math.abs(Math.sin(f / 4)) * -10 : 0;
  const lean = run ? 8 : 0;
  const bodyDrop = sit ? 44 : 0;

  // arm targets (400 box). near = viewer side (right), far = behind.
  let near = { x: 266, y: 320 };
  let far = { x: 142, y: 320 };
  if (pose === "shout") {
    near = { x: 300, y: 196 };
    far = { x: 108 + Math.sin(f / 3) * 14, y: 150 };
  } else if (pose === "laugh") {
    near = { x: 250, y: 300 };
    far = { x: 170, y: 304 };
  } else if (pose === "yawn") {
    near = { x: 236, y: 134 };
    far = { x: 112, y: 140 };
  } else if (pose === "think") {
    near = { x: 270, y: 222 };
  } else if (wave) {
    near = { x: 304 + Math.sin(f / 3.2) * 20, y: 170 };
  } else if (run) {
    near = { x: 270 + Math.sin(ph) * 30, y: 300 };
    far = { x: 150 - Math.sin(ph) * 30, y: 300 };
  }
  if (hold === "walkie" && pose !== "shout" && pose !== "yawn" && !wave) near = { x: 282, y: 270 };
  if (hold === "crook" && pose === "stand" && !wave) near = { x: 292, y: 300 };
  if (sit) {
    near = { ...near, y: near.y + bodyDrop };
    far = { ...far, y: far.y + bodyDrop };
  }

  const eye = (cx: number) => {
    const cy = 152;
    if (eyes === "happy" || blinking || pose === "laugh" || pose === "yawn")
      return <path d={`M ${cx - 12} ${cy + 3} Q ${cx} ${cy - 10} ${cx + 12} ${cy + 3}`} stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />;
    if (eyes === "sad")
      return (
        <g>
          <circle cx={cx} cy={cy + 2} r={10} fill={C.ink} />
          <circle cx={cx + 3} cy={cy - 1} r={3.5} fill="#fff" />
          <path d={`M ${cx - 14} ${cy - 16} L ${cx + 12} ${cy - 22}`} stroke={BC.bearDark} strokeWidth={6} strokeLinecap="round" style={{ rotate: cx < 200 ? "-14deg" : "14deg", transformOrigin: `${cx}px ${cy - 18}px` }} />
        </g>
      );
    if (eyes === "sly")
      return (
        <g>
          <circle cx={cx + 3} cy={cy} r={10} fill={C.ink} />
          <rect x={cx - 16} y={cy - 18} width={32} height={14} fill={BC.bear} />
          <path d={`M ${cx - 14} ${cy - 4} L ${cx + 14} ${cy - 6}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    const r = eyes === "wide" ? 14 : 11;
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={C.ink} />
        <circle cx={cx + 4} cy={cy - 4} r={4} fill="#fff" />
      </g>
    );
  };

  const mouthY = 212;
  const open = pose === "shout" ? 0.8 + Math.abs(Math.sin(f / 3)) * 0.2 : pose === "laugh" ? 0.5 + Math.abs(Math.sin(f / 2.5)) * 0.4 : pose === "yawn" ? 1 : mouthOpen;

  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `${laughShake}px ${lift + shoutHop}px`, rotate: `${lean}deg`, transformOrigin: "200px 400px" }}>
          {/* crook behind the body */}
          {hold === "crook" ? (
            <g style={{ translate: `${near.x}px ${near.y}px` }}>
              <path d="M 0 90 L 0 -150 Q 0 -196 -36 -196 Q -66 -196 -66 -166" stroke={BC.crook} strokeWidth={14} fill="none" strokeLinecap="round" />
            </g>
          ) : null}
          {/* legs */}
          {sit ? (
            <>
              {limb(176, 360, 246, 386, BC.bearDark, 34)}
              {limb(214, 360, 290, 384, BC.bear, 34)}
              <ellipse cx={258} cy={386} rx={18} ry={14} fill={BC.bearLight} />
              <ellipse cx={300} cy={384} rx={18} ry={14} fill={BC.bearLight} />
            </>
          ) : (
            <>
              {limb(176, 340, 176 - step, 386, BC.bearDark, 34)}
              {limb(230, 340, 230 + step, 386, BC.bear, 34)}
              <ellipse cx={180 - step} cy={392} rx={22} ry={10} fill={BC.bearDark} />
              <ellipse cx={234 + step} cy={392} rx={22} ry={10} fill={BC.bearDark} />
            </>
          )}
          {/* far arm */}
          {limb(152, 262 + bodyDrop, far.x, far.y, BC.bearDark, 26)}
          <circle cx={far.x} cy={far.y} r={14} fill={BC.bearDark} />
          {/* body */}
          <g style={{ translate: `0px ${bodyDrop}px`, scale: `1 ${breathe}`, transformOrigin: "200px 370px" }}>
            <ellipse cx={202} cy={286} rx={86} ry={80} fill={BC.bear} />
            <ellipse cx={214} cy={300} rx={50} ry={50} fill={BC.bearLight} />
            {/* bandana */}
            <path d="M 142 222 Q 206 250 268 220 L 262 240 Q 206 268 148 242 Z" fill={BC.bandana} />
            <path d="M 196 248 L 214 292 L 232 246 Z" fill={BC.bandanaDark} />
          </g>
          {/* head */}
          <g style={{ translate: `0px ${bodyDrop}px`, rotate: `${headTilt + (pose === "yawn" ? -6 : 0)}deg`, transformOrigin: "205px 220px" }}>
            <circle cx={140} cy={84} r={34} fill={BC.bear} />
            <circle cx={140} cy={84} r={18} fill={BC.bearLight} />
            <circle cx={272} cy={80} r={34} fill={BC.bear} />
            <circle cx={272} cy={80} r={18} fill={BC.bearLight} />
            <circle cx={206} cy={160} r={92} fill={BC.bear} />
            {eye(176)}
            {eye(244)}
            <circle cx={150} cy={196} r={14} fill={C.pinkDark} opacity={0.4} />
            <circle cx={284} cy={192} r={13} fill={C.pinkDark} opacity={0.4} />
            <ellipse cx={222} cy={196} rx={46} ry={32} fill={BC.bearLight} />
            <ellipse cx={226} cy={180} rx={15} ry={11} fill={BC.nose} />
            {open > 0.15 ? (
              <ellipse cx={226} cy={mouthY} rx={13 + open * 4} ry={4 + open * 13} fill={C.ink} />
            ) : (
              <path d={eyes === "sad" ? `M 210 ${mouthY + 6} Q 226 ${mouthY - 6} 242 ${mouthY + 6}` : `M 208 ${mouthY - 4} Q 226 ${mouthY + 12} 244 ${mouthY - 4}`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
            )}
            {tears ? (
              [0, 1].map((i) => {
                const t = ((f + i * 18) % 36) / 36;
                return <ellipse key={i} cx={i ? 254 : 168} cy={170 + t * 40} rx={7} ry={10} fill={BC.tear} opacity={1 - t} />;
              })
            ) : null}
          </g>
          {/* walkie in the near hand */}
          {hold === "walkie" ? (
            <g style={{ translate: `${near.x}px ${near.y - 10}px`, rotate: pose === "shout" ? "-10deg" : "0deg", scale: "0.9" }}>
              <WalkieShape beep={beep} />
            </g>
          ) : null}
          {/* near arm */}
          {limb(260, 256 + bodyDrop, near.x, near.y, BC.bear, 28)}
          <circle cx={near.x} cy={near.y} r={15} fill={BC.bearDark} />
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Sheep ───────────────────────────── */

export type SheepProps = Placed & {
  walk?: number;
  run?: boolean;
  graze?: boolean;
  hop?: number;
  eyes?: "open" | "happy" | "wide";
  /** Little tracker collar light blinking. */
  ping?: boolean;
  seed?: number;
};

const WOOL: [number, number, number][] = [
  [130, 260, 50],
  [180, 228, 56],
  [240, 230, 54],
  [282, 262, 46],
  [250, 300, 52],
  [180, 302, 56],
  [124, 300, 40],
];

export const Sheep: React.FC<SheepProps> = (props) => {
  const frame = useCurrentFrame();
  const { walk = 0, run, graze, hop = 0, eyes = "open", ping, seed = 0 } = props;
  const f = frame + seed * 11;
  const legs = run ? 1 : walk;
  const ph = f / (run ? 2.4 : 5);
  const step = legs * Math.sin(ph) * (run ? 16 : 10);
  const bob = legs * Math.abs(Math.sin(ph)) * (run ? -16 : -5) + hop * Math.abs(Math.sin(f / 5)) * -30;
  const headDown = graze ? 34 + Math.sin(f / 8) * 8 : 0;
  const blinking = eyes === "open" && (f + 19) % 90 < 4;
  const breathe = 1 + Math.sin(f / 14) * 0.02;
  const pingOn = ping ? Math.floor((f + 4) / 10) % 3 === 0 : false;
  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${bob}px` }}>
          {[150, 176, 238, 262].map((x, i) => (
            <rect key={x} x={x - 9} y={318} width={18} height={70} rx={9} fill={BC.sheepDark} style={{ rotate: `${(i % 2 ? 1 : -1) * step}deg`, transformOrigin: `${x}px 320px` }} />
          ))}
          <g style={{ scale: `1 ${breathe}`, transformOrigin: "200px 340px" }}>
            {WOOL.map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 1 ? BC.woolShade : BC.wool} />
            ))}
            <ellipse cx={200} cy={270} rx={110} ry={62} fill={BC.wool} />
          </g>
          {/* head */}
          <g style={{ translate: `0px ${headDown}px`, rotate: `${graze ? 18 : 0}deg`, transformOrigin: "290px 240px" }}>
            <ellipse cx={296} cy={232} rx={30} ry={14} fill={BC.sheepDark} style={{ rotate: "-20deg", transformOrigin: "296px 232px" }} />
            <ellipse cx={322} cy={238} rx={44} ry={50} fill={BC.sheepFace} />
            <circle cx={318} cy={194} r={26} fill={BC.wool} />
            <circle cx={340} cy={200} r={18} fill={BC.wool} />
            {eyes === "happy" || blinking ? (
              <>
                <path d="M 300 232 Q 308 224 316 232" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
                <path d="M 334 230 Q 342 222 350 230" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx={308} cy={230} r={eyes === "wide" ? 9 : 7} fill={C.ink} />
                <circle cx={342} cy={228} r={eyes === "wide" ? 9 : 7} fill={C.ink} />
                <circle cx={310} cy={227} r={2.5} fill="#fff" />
                <circle cx={344} cy={225} r={2.5} fill="#fff" />
              </>
            )}
            <circle cx={312} cy={252} r={8} fill={C.pinkDark} opacity={0.4} />
            {eyes === "wide" ? <ellipse cx={330} cy={268} rx={7} ry={9} fill={C.ink} /> : <path d="M 320 262 Q 330 270 340 262" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />}
          </g>
          {/* tracker collar */}
          <path d="M 276 270 Q 296 290 318 286" stroke={BC.collar} strokeWidth={12} fill="none" strokeLinecap="round" style={{ translate: `0px ${headDown * 0.6}px` }} />
          <circle cx={298} cy={288 + headDown * 0.6} r={8} fill={pingOn ? C.butterDark : C.cream} />
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Villagers ───────────────────────────── */

export type VillagerKind = "dog" | "rabbit" | "goat" | "duck";

const VILLAGER: Record<VillagerKind, { fur: string; dark: string; top: string; topDark: string }> = {
  dog: { fur: "#EBCB9F", dark: "#D7AE7C", top: "#AFC9EE", topDark: "#8FB1E4" },
  rabbit: { fur: "#F3EDF7", dark: "#DCD0E8", top: "#F8C8DC", topDark: "#EFA3C0" },
  goat: { fur: "#EDE5D6", dark: "#D3C6AE", top: "#C8F0E4", topDark: "#9FDCC9" },
  duck: { fur: "#FFF1B8", dark: "#FBDD7E", top: "#D9CCF2", topDark: "#BFAEE6" },
};

export type VillagerProps = Placed & {
  kind: VillagerKind;
  walk?: number;
  run?: boolean;
  /** Legs hidden and bent: sitting on a bike or scooter. */
  ride?: boolean;
  wave?: boolean;
  /** Holding a phone up; `beep` flashes its screen. */
  phone?: boolean;
  beep?: boolean;
  map?: boolean;
  frown?: boolean;
  /** Puffing: sweat drops, mouth open. */
  puff?: boolean;
  /** Shaking head side to side. */
  shake?: boolean;
  /** Waving a hand dismissively ("oh, it's just Toby"). */
  shrug?: boolean;
  eyes?: "open" | "happy" | "wide" | "tired";
  mouthOpen?: number;
  /** Looking around (head turns). */
  look?: boolean;
  seed?: number;
};

export const Villager: React.FC<VillagerProps> = (props) => {
  const frame = useCurrentFrame();
  const { kind, walk = 0, run, ride, wave, phone, beep, map, frown, puff, shake, shrug, eyes = "open", mouthOpen = 0, look, seed = 0 } = props;
  const col = VILLAGER[kind];
  const f = frame + seed * 9;
  const legs = ride ? 0 : run ? 1 : walk;
  const ph = f / (run ? 2.6 : 5.5);
  const step = legs * Math.sin(ph) * (run ? 20 : 12);
  const lift = legs * Math.abs(Math.sin(ph)) * (run ? -12 : -5);
  const breathe = 1 + Math.sin(f / 15) * 0.02 + (puff ? Math.abs(Math.sin(f / 4)) * 0.04 : 0);
  const blinking = eyes === "open" && (f + 23) % 105 < 4;
  const headTurn = shake ? Math.sin(f / 3) * 10 : look ? Math.sin(f / 14) * 12 : 0;

  let near = { x: 262, y: 322 };
  let far = { x: 146, y: 322 };
  if (ride) {
    near = { x: 300, y: 270 };
    far = { x: 270, y: 276 };
  } else if (phone) {
    near = { x: 276, y: 300 };
  } else if (wave) {
    near = { x: 300 + Math.sin(f / 3.2) * 20, y: 176 };
  } else if (shrug) {
    near = { x: 300 + Math.sin(f / 5) * 14, y: 232 + Math.sin(f / 5) * 8 };
  } else if (run) {
    near = { x: 268 + Math.sin(ph) * 28, y: 300 };
    far = { x: 150 - Math.sin(ph) * 28, y: 300 };
  } else if (frown) {
    near = { x: 236, y: 300 };
    far = { x: 172, y: 300 };
  }

  const eye = (cx: number) => {
    const cy = 150;
    if (eyes === "happy" || blinking)
      return <path d={`M ${cx - 11} ${cy + 3} Q ${cx} ${cy - 9} ${cx + 11} ${cy + 3}`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
    if (eyes === "tired")
      return (
        <g>
          <circle cx={cx} cy={cy + 2} r={9} fill={C.ink} />
          <rect x={cx - 14} y={cy - 14} width={28} height={14} rx={4} fill={col.fur} />
          <line x1={cx - 13} y1={cy} x2={cx + 13} y2={cy} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    const r = eyes === "wide" ? 13 : 10;
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={C.ink} />
        <circle cx={cx + 3} cy={cy - 3} r={3.5} fill="#fff" />
        {frown ? <path d={`M ${cx - 13} ${cy - (cx < 210 ? 22 : 16)} L ${cx + 13} ${cy - (cx < 210 ? 16 : 22)}`} stroke={col.dark} strokeWidth={6} strokeLinecap="round" /> : null}
      </g>
    );
  };

  const open = puff ? 0.5 : mouthOpen;
  const isDuck = kind === "duck";
  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${lift}px` }}>
          {/* legs */}
          {ride ? (
            <>
              {limb(186, 330, 226, 370, col.dark, 28)}
              {limb(222, 330, 262, 372, col.fur, 28)}
            </>
          ) : (
            <>
              {limb(178, 340, 178 - step, 388, isDuck ? "#F6B97A" : col.dark, isDuck ? 14 : 28)}
              {limb(228, 340, 228 + step, 388, isDuck ? "#F6B97A" : col.fur, isDuck ? 14 : 28)}
              <ellipse cx={184 - step} cy={392} rx={22} ry={9} fill={isDuck ? "#F6B97A" : C.ink} opacity={isDuck ? 1 : 0.5} />
              <ellipse cx={234 + step} cy={392} rx={22} ry={9} fill={isDuck ? "#F6B97A" : C.ink} opacity={isDuck ? 1 : 0.5} />
            </>
          )}
          {/* far arm */}
          {limb(152, 260, far.x, far.y, col.dark, 22)}
          {/* body + top */}
          <g style={{ scale: `1 ${breathe}`, transformOrigin: "200px 370px" }}>
            <ellipse cx={202} cy={286} rx={78} ry={78} fill={col.fur} />
            <path d="M 132 250 Q 202 226 272 250 L 282 336 Q 202 366 122 336 Z" fill={col.top} />
            <path d="M 126 330 Q 202 356 278 330" stroke={col.topDark} strokeWidth={8} fill="none" />
          </g>
          {/* head */}
          <g style={{ rotate: `${headTurn}deg`, transformOrigin: "205px 220px" }}>
            {kind === "rabbit" ? (
              <>
                <ellipse cx={168} cy={44} rx={22} ry={64} fill={col.dark} style={{ rotate: "-10deg", transformOrigin: "168px 100px" }} />
                <ellipse cx={240} cy={40} rx={22} ry={66} fill={col.fur} style={{ rotate: "8deg", transformOrigin: "240px 100px" }} />
                <ellipse cx={240} cy={44} rx={10} ry={44} fill={C.pink} style={{ rotate: "8deg", transformOrigin: "240px 100px" }} />
              </>
            ) : null}
            {kind === "goat" ? (
              <>
                <path d="M 160 90 Q 140 40 170 30" stroke={col.dark} strokeWidth={16} fill="none" strokeLinecap="round" />
                <path d="M 246 86 Q 262 36 236 26" stroke={col.dark} strokeWidth={16} fill="none" strokeLinecap="round" />
              </>
            ) : null}
            <circle cx={206} cy={156} r={86} fill={col.fur} />
            {kind === "dog" ? (
              <>
                <ellipse cx={128} cy={150} rx={28} ry={60} fill={col.dark} style={{ rotate: "14deg", transformOrigin: "128px 100px" }} />
                <ellipse cx={284} cy={150} rx={28} ry={60} fill={col.dark} style={{ rotate: "-14deg", transformOrigin: "284px 100px" }} />
              </>
            ) : null}
            {isDuck ? <path d="M 196 72 Q 206 40 222 58 Q 230 40 236 70" stroke={col.dark} strokeWidth={10} fill="none" strokeLinecap="round" /> : null}
            {eye(178)}
            {eye(238)}
            <circle cx={150} cy={190} r={13} fill={C.pinkDark} opacity={0.4} />
            <circle cx={272} cy={186} r={12} fill={C.pinkDark} opacity={0.4} />
            {isDuck ? (
              <>
                <ellipse cx={228} cy={192} rx={42} ry={16} fill="#F6B97A" />
                {open > 0.15 ? <ellipse cx={228} cy={206} rx={30} ry={6 + open * 8} fill="#E9A060" /> : null}
              </>
            ) : (
              <>
                <ellipse cx={220} cy={190} rx={34} ry={24} fill={C.cream} opacity={0.8} />
                <ellipse cx={224} cy={180} rx={12} ry={9} fill={kind === "rabbit" ? C.pinkDark : C.ink} />
                {open > 0.15 ? (
                  <ellipse cx={222} cy={206} rx={11} ry={3 + open * 10} fill={C.ink} />
                ) : (
                  <path d={frown ? "M 206 212 Q 222 202 238 212" : "M 206 204 Q 222 216 238 204"} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
                )}
              </>
            )}
            {kind === "goat" ? <path d="M 214 222 Q 222 252 230 222" fill={col.dark} /> : null}
            {puff
              ? [0, 1].map((i) => {
                  const t = ((f + i * 14) % 28) / 28;
                  return <ellipse key={i} cx={i ? 290 : 120} cy={110 + t * 30} rx={7} ry={10} fill={BC.tear} opacity={1 - t} />;
                })
              : null}
          </g>
          {phone ? (
            <g style={{ translate: `${near.x + 6}px ${near.y - 26}px`, rotate: "-8deg" }}>
              <PhoneShape beep={beep} map={map} />
            </g>
          ) : null}
          {/* near arm */}
          {limb(258, 256, near.x, near.y, col.fur, 24)}
          <circle cx={near.x} cy={near.y} r={13} fill={col.dark} />
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Bikes and scooters ───────────────────────────── */

/** A villager riding a bike or a kick scooter. Feet (wheels) at (x, y). */
export const Rider: React.FC<
  Omit<VillagerProps, "ride"> & { vehicle: "bike" | "scooter" }
> = ({ vehicle, ...v }) => {
  const frame = useCurrentFrame();
  const size = v.size ?? 300;
  const spin = frame * 12 + (v.seed ?? 0) * 40;
  const wheel = (cx: number, r: number) => (
    <g>
      <circle cx={cx} cy={400 - r} r={r} fill="none" stroke={C.ink} strokeWidth={10} opacity={0.75} />
      <g style={{ rotate: `${spin}deg`, transformOrigin: `${cx}px ${400 - r}px` }}>
        <line x1={cx - r + 8} y1={400 - r} x2={cx + r - 8} y2={400 - r} stroke={C.ink} strokeWidth={4} opacity={0.4} />
        <line x1={cx} y1={400 - 2 * r + 8} x2={cx} y2={392} stroke={C.ink} strokeWidth={4} opacity={0.4} />
      </g>
      <circle cx={cx} cy={400 - r} r={8} fill={C.ink} opacity={0.6} />
    </g>
  );
  const frameColor = vehicle === "bike" ? C.pinkDark : C.leafDark;
  const bounce = Math.abs(Math.sin(frame / 3 + (v.seed ?? 0))) * -4;
  return (
    <>
      <div style={{ ...place({ ...v, size }), translate: `0px ${bounce}px` }}>
        <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
          {vehicle === "bike" ? (
            <>
              {wheel(110, 62)}
              {wheel(300, 62)}
              <path d="M 110 338 L 190 338 L 250 260 L 150 260 Z" stroke={frameColor} strokeWidth={12} fill="none" strokeLinejoin="round" />
              <line x1={250} y1={260} x2={300} y2={338} stroke={frameColor} strokeWidth={12} strokeLinecap="round" />
              <line x1={250} y1={260} x2={262} y2={228} stroke={frameColor} strokeWidth={10} strokeLinecap="round" />
              <rect x={250} y={216} width={46} height={12} rx={6} fill={C.ink} opacity={0.7} />
              <rect x={128} y={244} width={56} height={14} rx={7} fill={C.ink} opacity={0.7} />
              <rect x={286} y={268} width={36} height={22} rx={6} fill={C.butter} />
            </>
          ) : (
            <>
              {wheel(110, 30)}
              {wheel(300, 30)}
              <rect x={100} y={352} width={210} height={16} rx={8} fill={frameColor} />
              <line x1={300} y1={360} x2={290} y2={200} stroke={frameColor} strokeWidth={12} strokeLinecap="round" />
              <rect x={262} y={192} width={58} height={12} rx={6} fill={C.ink} opacity={0.7} />
            </>
          )}
        </svg>
      </div>
      <div style={{ translate: `0px ${bounce}px`, position: "absolute", inset: 0 }}>
        {vehicle === "bike" ? (
          <Villager {...v} ride size={size * 0.82} x={v.x + (v.flip ? 1 : -1) * size * 0.1} y={v.y - size * 0.26} />
        ) : (
          <Villager {...v} size={size * 0.82} x={v.x - (v.flip ? -1 : 1) * size * 0.02} y={v.y - size * 0.09} />
        )}
      </div>
    </>
  );
};
