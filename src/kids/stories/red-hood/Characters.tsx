/**
 * Little Red Riding Hood — flat pastel characters and props (inline SVG, frame-driven).
 * Characters face right by default (`flip` faces them left); feet sit at the bottom of
 * their 400×400 box. The Wolf is the series' friendly-grumpy wolf from The Three Little Pigs;
 * `WolfDisguise` draws Grandma's nightcap and glasses (and the stolen basket) on top of it.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { C, place, type Placed } from "../../kit";

export { Wolf } from "../three-pigs/Characters";

/** Story-specific pastel colours. */
export const RC = {
  cape: "#F28C9C",
  capeDark: "#DE7286",
  redFur: "#F4E8DC",
  redFurDark: "#E2D0BE",
  mumFur: "#EAD3BF",
  mumFurDark: "#D8BDA5",
  grannyFur: "#E5DDEC",
  grannyFurDark: "#CEC3DC",
  belly: "#FFF7F0",
  earPink: "#F7C3D3",
  nose: "#E99AB2",
  apron: "#BFE8DA",
  shawl: "#CDBDEB",
  shawlDark: "#B6A2E2",
  glasses: "#8C7BA8",
  watch: "#9FD9C8",
  watchDark: "#79C3AE",
  screen: "#EFFFF9",
  alert: "#F48FA6",
  basket: "#E2BC8E",
  basketDark: "#C99D6E",
  cloth: "#F9B9C6",
  muffin: "#E7B48A",
  muffinTop: "#F6D1A5",
  beaver: "#D2A688",
  beaverDark: "#B88A6C",
  beaverBelly: "#F2DECB",
  tail: "#A98A7E",
  shirt: "#BCD8F5",
  shirtDark: "#97BEE9",
  beanie: "#FFE08A",
  log: "#D9B99B",
  logEnd: "#F1DEC6",
  nightcap: "#C9E6F7",
  nightcapDark: "#A9D2EE",
  scooter: "#9CCFF0",
  scooterDark: "#79B6E3",
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

/* ───────────────────────────── Props ───────────────────────────── */

/** A wicker basket of muffins with a checked cloth. Handle top at (0, 0). */
export const BasketShape: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <g style={{ scale: `${scale}` }}>
    <path d="M -46 40 Q -46 -14 0 -14 Q 46 -14 46 40" stroke={RC.basketDark} strokeWidth={9} fill="none" strokeLinecap="round" />
    <circle cx={-22} cy={34} r={18} fill={RC.muffinTop} />
    <circle cx={4} cy={30} r={20} fill={RC.muffin} />
    <circle cx={28} cy={36} r={16} fill={RC.muffinTop} />
    <path d="M -8 26 L 30 22 L 18 44 Z" fill={RC.cloth} />
    <path d="M -58 40 L 58 40 L 46 92 Q 0 100 -46 92 Z" fill={RC.basket} />
    <path d="M -54 56 L 54 56 M -50 74 L 50 74" stroke={RC.basketDark} strokeWidth={5} strokeLinecap="round" />
  </g>
);

/** The little step-counter watch face, centred at (0, 0). `beep` flashes it. */
export const WatchFace: React.FC<{ beep?: boolean; r?: number }> = ({ beep, r = 14 }) => {
  const frame = useCurrentFrame();
  const on = beep && Math.floor(frame / 5) % 2 === 0;
  return (
    <g>
      <rect x={-r * 0.6} y={-r * 1.6} width={r * 1.2} height={r * 3.2} rx={r * 0.5} fill={RC.watchDark} />
      <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={r * 0.55} fill={RC.watch} />
      <rect x={-r * 0.72} y={-r * 0.72} width={r * 1.44} height={r * 1.44} rx={r * 0.36} fill={on ? RC.alert : RC.screen} />
    </g>
  );
};

/** "Beep beep" rings around a point. */
export const BeepWaves: React.FC<{ x: number; y: number; on?: boolean; color?: string }> = ({ x, y, on = true, color = RC.alert }) => {
  const frame = useCurrentFrame();
  if (!on) return null;
  return (
    <svg viewBox="-100 -100 200 200" width={200} height={200} style={{ position: "absolute", left: x - 100, top: y - 100, overflow: "visible" }}>
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 6) % 18) / 18;
        return <circle key={i} r={20 + t * 70} fill="none" stroke={color} strokeWidth={8 - t * 5} opacity={1 - t} />;
      })}
    </svg>
  );
};

/** A muffin on its own (for sharing at the end). Centre-bottom at (x, y). */
export const Muffin: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 70 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", left: x - size / 2, top: y - size, overflow: "visible" }}>
    <path d="M 18 52 L 82 52 L 74 98 L 26 98 Z" fill={RC.cloth} />
    <path d="M 30 52 L 34 98 M 50 52 L 50 98 M 70 52 L 66 98" stroke={RC.capeDark} strokeWidth={3} opacity={0.4} />
    <ellipse cx={50} cy={48} rx={40} ry={26} fill={RC.muffin} />
    <circle cx={40} cy={40} r={4} fill={RC.basketDark} />
    <circle cx={60} cy={44} r={4} fill={RC.basketDark} />
  </svg>
);

/* ───────────────────────────── Bunnies (Red, Mum, Grandma) ───────────────────────────── */

export type BunnyKind = "red" | "mum" | "granny";
export type BunnyPose = "stand" | "wave" | "gasp" | "pick" | "hug" | "press" | "give" | "point";

export type BunnyProps = Placed & {
  kind?: BunnyKind;
  pose?: BunnyPose;
  walk?: number;
  /** Skipping: bouncy hops. */
  skip?: boolean;
  mouthOpen?: number;
  eyes?: "open" | "happy" | "wide" | "worried";
  basket?: boolean;
  /** Watch screen flashing. */
  beep?: boolean;
  headTilt?: number;
  /** Shakes a little (nervous). */
  shiver?: boolean;
  seed?: number;
};

const FUR: Record<BunnyKind, [string, string]> = {
  red: [RC.redFur, RC.redFurDark],
  mum: [RC.mumFur, RC.mumFurDark],
  granny: [RC.grannyFur, RC.grannyFurDark],
};

export const Bunny: React.FC<BunnyProps> = (props) => {
  const frame = useCurrentFrame();
  const { kind = "red", pose = "stand", walk = 0, skip, mouthOpen = 0, eyes = "open", basket, beep, headTilt = 0, shiver, seed = 0 } = props;
  const [fur, furDark] = FUR[kind];
  const f = frame + seed * 7;
  const legs = skip ? 1 : walk;
  const ph = f / (skip ? 3.4 : 5);
  const step = legs * Math.sin(ph) * 14;
  const lift = skip ? -Math.abs(Math.sin(ph)) * 34 : legs * Math.abs(Math.sin(ph)) * -6;
  const breathe = 1 + Math.sin(f / 15) * 0.02;
  const blinking = (eyes === "open" || eyes === "wide") && (f + 41) % 96 < 4;
  const shake = shiver ? Math.sin(f * 1.7) * 3 : 0;
  const earWiggle = Math.sin(f / 11) * 4;

  let near = { x: 262, y: 330 };
  let far = { x: 140, y: 330 };
  if (pose === "wave") near = { x: 306 + Math.sin(f / 3.2) * 18, y: 176 };
  else if (pose === "gasp") {
    near = { x: 252, y: 206 };
    far = { x: 160, y: 210 };
  } else if (pose === "pick") near = { x: 312, y: 384 };
  else if (pose === "hug") {
    near = { x: 336, y: 262 };
    far = { x: 312, y: 278 };
  } else if (pose === "press") {
    near = { x: 286, y: 244 };
    far = { x: 262, y: 236 };
  } else if (pose === "give") near = { x: 336, y: 286 };
  else if (pose === "point") near = { x: 350, y: 236 };
  else if (walk || skip) {
    near = { x: 262 + Math.sin(ph) * 22, y: 324 };
    far = { x: 140 - Math.sin(ph) * 22, y: 324 };
  }
  if (basket && (pose === "stand" || pose === "gasp")) near = { x: 276, y: 316 };

  // watch on Red's near wrist (a little up the arm from the hand)
  const wrist = { x: near.x + (256 - near.x) * 0.22, y: near.y + (252 - near.y) * 0.22 };

  const eye = (cx: number) => {
    const cy = 148;
    if (eyes === "happy" || blinking)
      return <path d={`M ${cx - 11} ${cy + 3} Q ${cx} ${cy - 9} ${cx + 11} ${cy + 3}`} stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />;
    const r = eyes === "wide" ? 13 : 10;
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={C.ink} />
        <circle cx={cx + 4} cy={cy - 4} r={3.6} fill="#fff" />
        {eyes === "worried" ? (
          <path d={`M ${cx - 12} ${cy - 20} L ${cx + 10} ${cy - 24}`} stroke={furDark} strokeWidth={5} strokeLinecap="round" style={{ rotate: cx < 208 ? "14deg" : "-14deg", transformOrigin: `${cx}px ${cy - 22}px` }} />
        ) : null}
      </g>
    );
  };

  const open = mouthOpen;
  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `${shake}px ${lift}px` }}>
          {/* cape behind (Red) / shawl (Grandma) */}
          {kind === "red" ? <path d="M 146 214 Q 206 196 266 214 L 300 372 Q 206 396 112 372 Z" fill={RC.capeDark} /> : null}
          {/* fluffy tail */}
          <circle cx={128} cy={318} r={26} fill={RC.belly} />
          {/* legs */}
          {limb(178, 340, 178 - step, 384, furDark, 30)}
          {limb(226, 340, 226 + step, 384, fur, 30)}
          <ellipse cx={174 - step} cy={390} rx={26} ry={11} fill={furDark} />
          <ellipse cx={232 + step} cy={390} rx={26} ry={11} fill={furDark} />
          {/* far arm */}
          {limb(156, 252, far.x, far.y, furDark, 24)}
          <circle cx={far.x} cy={far.y} r={13} fill={furDark} />
          {/* body */}
          <g style={{ scale: `1 ${breathe}`, transformOrigin: "200px 370px" }}>
            <ellipse cx={204} cy={290} rx={70} ry={74} fill={fur} />
            <ellipse cx={214} cy={302} rx={42} ry={48} fill={RC.belly} />
            {kind === "mum" ? <path d="M 168 262 L 252 262 L 262 350 Q 214 364 160 350 Z" fill={RC.apron} /> : null}
            {kind === "granny" ? (
              <g>
                <path d="M 136 232 Q 206 270 274 232 L 262 296 Q 206 320 148 296 Z" fill={RC.shawl} />
                <path d="M 194 286 L 206 330 L 222 286 Z" fill={RC.shawlDark} />
              </g>
            ) : null}
          </g>
          {/* head */}
          <g style={{ rotate: `${headTilt}deg`, transformOrigin: "206px 220px" }}>
            {kind === "red" ? <circle cx={206} cy={150} r={100} fill={RC.cape} /> : null}
            {/* ears */}
            <g style={{ rotate: `${-6 + earWiggle}deg`, transformOrigin: "176px 90px" }}>
              <ellipse cx={172} cy={34} rx={24} ry={66} fill={fur} />
              <ellipse cx={172} cy={40} rx={12} ry={48} fill={RC.earPink} />
            </g>
            <g style={{ rotate: `${8 - earWiggle}deg`, transformOrigin: "238px 90px" }}>
              <ellipse cx={242} cy={30} rx={24} ry={66} fill={fur} />
              <ellipse cx={242} cy={36} rx={12} ry={48} fill={RC.earPink} />
            </g>
            {kind === "red" ? (
              <>
                {/* hood rim over the ear bases */}
                <path d="M 112 132 Q 120 40 206 44 Q 292 40 300 132 Q 270 76 206 76 Q 142 76 112 132 Z" fill={RC.cape} />
              </>
            ) : null}
            <circle cx={208} cy={156} r={78} fill={fur} />
            {eye(180)}
            {eye(236)}
            {kind === "granny" ? (
              <g fill="none" stroke={RC.glasses} strokeWidth={5}>
                <circle cx={180} cy={148} r={20} />
                <circle cx={236} cy={148} r={20} />
                <path d="M 200 146 L 216 146" />
              </g>
            ) : null}
            <circle cx={156} cy={186} r={13} fill={C.pinkDark} opacity={0.35} />
            <circle cx={262} cy={186} r={13} fill={C.pinkDark} opacity={0.35} />
            <path d="M 200 174 Q 208 168 216 174 Q 208 184 200 174 Z" fill={RC.nose} />
            {open > 0.15 ? (
              <ellipse cx={208} cy={198} rx={10 + open * 4} ry={4 + open * 12} fill={C.ink} />
            ) : (
              <path d={eyes === "worried" ? "M 194 200 Q 208 192 222 200" : "M 192 192 Q 200 202 208 194 Q 216 202 224 192"} stroke={C.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />
            )}
            {kind === "red" ? (
              <g>
                <path d="M 206 232 L 178 218 L 180 248 Z" fill={RC.capeDark} />
                <path d="M 206 232 L 234 218 L 232 248 Z" fill={RC.capeDark} />
                <circle cx={206} cy={232} r={9} fill={RC.cape} />
              </g>
            ) : null}
          </g>
          {/* basket in the near hand */}
          {basket ? (
            <g style={{ translate: `${near.x}px ${near.y - 6}px` }}>
              <BasketShape scale={0.95} />
            </g>
          ) : null}
          {/* near arm */}
          {limb(254, 252, near.x, near.y, fur, 26)}
          <circle cx={near.x} cy={near.y} r={14} fill={furDark} />
          {kind === "red" ? (
            <g style={{ translate: `${wrist.x}px ${wrist.y}px`, rotate: "20deg" }}>
              <WatchFace beep={beep} r={pose === "press" ? 18 : 13} />
            </g>
          ) : null}
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Beaver woodcutter ───────────────────────────── */

export type BeaverProps = Placed & {
  walk?: number;
  /** Stomping walk (bigger, slower steps). */
  stomp?: boolean;
  pose?: "stand" | "shoo" | "wave";
  logs?: boolean;
  mouthOpen?: number;
  eyes?: "open" | "happy" | "firm";
  seed?: number;
};

export const Beaver: React.FC<BeaverProps> = (props) => {
  const frame = useCurrentFrame();
  const { walk = 0, stomp, pose = "stand", logs, mouthOpen = 0, eyes = "open", seed = 0 } = props;
  const f = frame + seed * 9;
  const legs = stomp ? 1 : walk;
  const ph = f / (stomp ? 4 : 5);
  const step = legs * Math.sin(ph) * (stomp ? 18 : 12);
  const lift = legs * Math.abs(Math.sin(ph)) * (stomp ? -12 : -5);
  const breathe = 1 + Math.sin(f / 16) * 0.02;
  const blinking = eyes === "open" && (f + 23) % 104 < 4;
  const tailFlap = Math.sin(f / 9) * 5;

  let near = { x: 264, y: 334 };
  let far = { x: 140, y: 334 };
  if (pose === "shoo") near = { x: 352 + Math.sin(f / 2.4) * 16, y: 200 + Math.cos(f / 2.4) * 14 };
  else if (pose === "wave") near = { x: 306 + Math.sin(f / 3.2) * 18, y: 172 };
  if (logs) far = { x: 150, y: 196 };

  const eye = (cx: number) => {
    const cy = 136;
    if (eyes === "happy" || blinking)
      return <path d={`M ${cx - 11} ${cy + 3} Q ${cx} ${cy - 9} ${cx + 11} ${cy + 3}`} stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />;
    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill={C.ink} />
        <circle cx={cx + 4} cy={cy - 4} r={3.5} fill="#fff" />
        {eyes === "firm" ? <path d={`M ${cx - 14} ${cy - 16} L ${cx + 12} ${cy - 12}`} stroke={RC.beaverDark} strokeWidth={6} strokeLinecap="round" style={{ rotate: cx < 210 ? "8deg" : "-8deg", transformOrigin: `${cx}px ${cy - 14}px` }} /> : null}
      </g>
    );
  };

  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${lift}px` }}>
          {/* flat tail */}
          <g style={{ rotate: `${tailFlap}deg`, transformOrigin: "140px 360px" }}>
            <ellipse cx={86} cy={372} rx={70} ry={26} fill={RC.tail} style={{ rotate: "-12deg", transformOrigin: "86px 372px" }} />
            <path d="M 40 372 L 130 360 M 56 386 L 126 374 M 60 356 L 110 350" stroke={RC.beaverDark} strokeWidth={4} opacity={0.6} />
          </g>
          {/* logs on the shoulder, behind the head */}
          {logs ? (
            <g style={{ translate: "150px 180px", rotate: "-14deg" }}>
              {[-24, 0, 24].map((dy, i) => (
                <g key={i}>
                  <rect x={-120} y={dy - 12} width={210} height={26} rx={13} fill={RC.log} />
                  <circle cx={90} cy={dy + 1} r={13} fill={RC.logEnd} />
                </g>
              ))}
            </g>
          ) : null}
          {limb(178, 336, 178 - step, 386, RC.beaverDark, 32)}
          {limb(228, 336, 228 + step, 386, RC.beaver, 32)}
          <ellipse cx={180 - step} cy={392} rx={26} ry={10} fill={RC.beaverDark} />
          <ellipse cx={234 + step} cy={392} rx={26} ry={10} fill={RC.beaverDark} />
          {limb(154, 252, far.x, far.y, RC.beaverDark, 26)}
          <circle cx={far.x} cy={far.y} r={14} fill={RC.beaverDark} />
          <g style={{ scale: `1 ${breathe}`, transformOrigin: "200px 370px" }}>
            <ellipse cx={204} cy={286} rx={84} ry={82} fill={RC.shirt} />
            {[170, 204, 238].map((x) => (
              <rect key={x} x={x - 4} y={214} width={8} height={148} fill={RC.shirtDark} opacity={0.55} />
            ))}
            {[250, 290, 330].map((y) => (
              <rect key={y} x={126} y={y - 4} width={156} height={8} fill={RC.shirtDark} opacity={0.55} />
            ))}
            <ellipse cx={216} cy={300} rx={34} ry={44} fill={RC.beaverBelly} />
          </g>
          <g>
            <circle cx={150} cy={78} r={20} fill={RC.beaverDark} />
            <circle cx={262} cy={74} r={20} fill={RC.beaverDark} />
            <circle cx={206} cy={140} r={80} fill={RC.beaver} />
            {/* beanie */}
            <path d="M 132 104 Q 136 30 206 28 Q 276 30 282 100 Z" fill={RC.beanie} />
            <rect x={124} y={92} width={164} height={24} rx={12} fill={C.butterDark} />
            <circle cx={206} cy={26} r={16} fill={C.butterDark} />
            {eye(178)}
            {eye(236)}
            <ellipse cx={222} cy={176} rx={44} ry={30} fill={RC.beaverBelly} />
            <ellipse cx={224} cy={160} rx={14} ry={10} fill={C.ink} />
            {mouthOpen > 0.15 ? (
              <ellipse cx={224} cy={186} rx={14} ry={6 + mouthOpen * 8} fill={C.ink} />
            ) : (
              <path d="M 204 182 Q 224 192 244 182" stroke={C.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />
            )}
            <rect x={212} y={186 + mouthOpen * 6} width={11} height={18} rx={3} fill="#fff" />
            <rect x={225} y={186 + mouthOpen * 6} width={11} height={18} rx={3} fill="#fff" />
            <circle cx={150} cy={168} r={13} fill={C.pinkDark} opacity={0.3} />
            <circle cx={274} cy={164} r={12} fill={C.pinkDark} opacity={0.3} />
          </g>
          {limb(256, 250, near.x, near.y, RC.beaver, 28)}
          <circle cx={near.x} cy={near.y} r={15} fill={RC.beaverDark} />
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Wolf extras ───────────────────────────── */

/**
 * Grandma's nightcap and glasses (and optionally the muffin basket) drawn over the series Wolf.
 * Pass exactly the same placement (x, y, size, flip) and `walk`/`seed` as the Wolf so it lines up.
 */
export const WolfDisguise: React.FC<Placed & { cap?: boolean; glasses?: boolean; basket?: boolean; walk?: number; seed?: number; earWiggle?: number }> = (props) => {
  const frame = useCurrentFrame();
  const { cap = true, glasses = true, basket, walk = 0, seed = 0, earWiggle = 0 } = props;
  const f = frame + seed * 5;
  const ph = f / 6;
  const lift = walk * Math.abs(Math.sin(ph)) * -6;
  const hand = { x: 258 + walk * Math.sin(ph) * 14, y: 336 };
  const flop = Math.sin(f / 12) * 4;
  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${lift}px` }}>
          {earWiggle > 0
            ? [0, 1].map((i) => (
                <path
                  key={i}
                  d={i ? "M 268 14 Q 290 4 300 24" : "M 136 22 Q 118 10 108 30"}
                  stroke={C.ink}
                  strokeWidth={5}
                  fill="none"
                  strokeLinecap="round"
                  opacity={earWiggle * (0.5 + 0.5 * Math.sin(f / 2 + i))}
                />
              ))
            : null}
          {cap ? (
            <g style={{ rotate: `${flop}deg`, transformOrigin: "206px 70px" }}>
              <path d="M 160 74 Q 170 20 214 18 Q 250 20 252 66 Q 220 0 150 -6 Q 118 -8 104 20 Q 140 6 160 74 Z" fill={RC.nightcap} />
              <circle cx={104} cy={22} r={16} fill="#fff" />
              <rect x={156} y={62} width={102} height={22} rx={11} fill={RC.nightcapDark} />
              {[[188, 40], [226, 46], [150, 20]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={5} fill="#fff" opacity={0.8} />
              ))}
            </g>
          ) : null}
          {glasses ? (
            <g fill="none" stroke={RC.glasses} strokeWidth={6}>
              <circle cx={197} cy={117} r={23} />
              <circle cx={250} cy={113} r={23} />
              <path d="M 220 114 L 228 113" />
            </g>
          ) : null}
          {basket ? (
            <g style={{ translate: `${hand.x + 6}px ${hand.y - 10}px` }}>
              <BasketShape scale={1} />
            </g>
          ) : null}
        </g>
      </svg>
    </div>
  );
};

/** A kick e-scooter. Deck centre at (x, y); handlebar on the right unless `flip`. */
export const EScooter: React.FC<{ x: number; y: number; size?: number; flip?: boolean; zoom?: boolean }> = ({ x, y, size = 300, flip, zoom }) => {
  const frame = useCurrentFrame();
  const spin = zoom ? frame * 30 : 0;
  return (
    <svg viewBox="-150 -260 300 300" width={size} height={size} style={{ position: "absolute", left: x - size / 2, top: y - (size * 260) / 300, overflow: "visible", scale: flip ? "-1 1" : "1 1" }}>
      <rect x={-120} y={-14} width={210} height={16} rx={8} fill={RC.scooterDark} />
      <path d="M 86 -6 L 116 -230" stroke={RC.scooter} strokeWidth={14} strokeLinecap="round" />
      <path d="M 96 -228 L 140 -232" stroke={RC.scooterDark} strokeWidth={14} strokeLinecap="round" />
      <circle cx={112} cy={-170} r={7} fill={C.butterDark} />
      {[-104, 104].map((cx) => (
        <g key={cx} style={{ translate: `${cx}px 14px`, rotate: `${spin}deg` }}>
          <circle r={24} fill={C.ink} opacity={0.8} />
          <circle r={9} fill={RC.scooter} />
          <rect x={-2} y={-22} width={4} height={14} fill={RC.scooter} />
        </g>
      ))}
    </svg>
  );
};
