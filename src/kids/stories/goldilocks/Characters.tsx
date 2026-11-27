/**
 * Goldilocks and the Three Bears — flat pastel characters and props (inline SVG, frame-driven).
 * Characters face the camera; feet sit at the bottom of their 400×400 box (`place()`).
 * Goldilocks is a little lamb with golden curls; the bears are Papa (big, bow tie), Mama
 * (middle-sized, flower and scarf) and Baby (little, striped tee).
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { C, place, type Placed } from "../../kit";

/** Story-specific pastel colours. */
export const GC = {
  papa: "#C9A27E",
  papaDark: "#B08763",
  papaBelly: "#EBD3B8",
  mama: "#DDB394",
  mamaDark: "#C69878",
  mamaBelly: "#F3DFCB",
  baby: "#E8C6A4",
  babyDark: "#D3AA85",
  babyBelly: "#F8E8D7",
  nose: "#6A5468",
  bowTie: "#8EC5E8",
  scarf: "#F6A9C2",
  tee: "#FFE6A0",
  teeStripe: "#F9C96A",
  wool: "#FFFDF8",
  woolShade: "#EFE8F3",
  face: "#F9E4D6",
  hoof: "#B7A7C6",
  curl: "#FFD76E",
  curlDark: "#F5BF45",
  lambScarf: "#9FDCC9",
  porridge: "#F6E7C8",
  porridgeDark: "#E8D2A6",
  wood: "#E2BC8E",
  woodDark: "#C99D6E",
  woodLight: "#F0D3AE",
  bowlPapa: "#A9CDEB",
  bowlMama: "#F5B9CF",
  bowlBaby: "#FFE08A",
  speaker: "#E9E4F2",
  speakerDark: "#CFC6E0",
  ring: "#9FE6D0",
  bike1: "#8EC5E8",
  bike2: "#F5A9C3",
  bike3: "#FFD36E",
  tire: "#7C6A8A",
  star: "#FFE38A",
  quiltBaby: "#FFE7A6",
  quiltMama: "#F8C8DC",
  quiltPapa: "#BCD8F5",
};

/** Convert a point in a character's 400×400 space to composition pixels. */
export const toScene = (p: Placed, v: { x: number; y: number }) => {
  const size = p.size ?? 200;
  const vx = p.flip ? 400 - v.x : v.x;
  return { x: p.x - size / 2 + (vx * size) / 400, y: p.y - size + (v.y * size) / 400 };
};

const blinkAt = (f: number, offset: number) => (f + offset) % 96 < 4;

/* ───────────────────────────── Bears ───────────────────────────── */

export type BearKind = "papa" | "mama" | "baby";
export type BearPose = "stand" | "walk" | "wave" | "point" | "shock" | "tiptoe" | "cry" | "ride" | "stir" | "glue" | "hug" | "cheer" | "fan";

export type BearProps = Placed & {
  kind: BearKind;
  pose?: BearPose;
  mouthOpen?: number;
  eyes?: "open" | "happy" | "wide" | "sad";
  headTilt?: number;
  /** Bike pedalling speed for pose "ride" (0 = parked). */
  pedal?: number;
  seed?: number;
};

const BEAR_COLORS: Record<BearKind, { fur: string; dark: string; belly: string; bike: string }> = {
  papa: { fur: GC.papa, dark: GC.papaDark, belly: GC.papaBelly, bike: GC.bike1 },
  mama: { fur: GC.mama, dark: GC.mamaDark, belly: GC.mamaBelly, bike: GC.bike2 },
  baby: { fur: GC.baby, dark: GC.babyDark, belly: GC.babyBelly, bike: GC.bike3 },
};

/** A side-view bicycle in a 400×400 box (wheels on the ground line y≈392). */
const BikeG: React.FC<{ color: string; spin: number }> = ({ color, spin }) => {
  const wheel = (cx: number) => (
    <g>
      <circle cx={cx} cy={334} r={58} fill="none" stroke={GC.tire} strokeWidth={14} />
      <circle cx={cx} cy={334} r={8} fill={GC.tire} />
      {[0, 60, 120].map((a) => (
        <line key={a} x1={cx} y1={290} x2={cx} y2={378} stroke={GC.tire} strokeWidth={3} opacity={0.5} transform={`rotate(${a + spin} ${cx} 334)`} />
      ))}
    </g>
  );
  return (
    <g>
      {wheel(82)}
      {wheel(318)}
      <path d="M 82 334 L 180 334 L 290 250 L 150 250 Z" fill="none" stroke={color} strokeWidth={14} strokeLinejoin="round" />
      <line x1={180} y1={334} x2={150} y2={226} stroke={color} strokeWidth={14} strokeLinecap="round" />
      <line x1={290} y1={250} x2={318} y2={334} stroke={color} strokeWidth={14} strokeLinecap="round" />
      <line x1={290} y1={250} x2={300} y2={200} stroke={color} strokeWidth={12} strokeLinecap="round" />
      <path d="M 280 196 L 326 192" stroke={GC.tire} strokeWidth={12} strokeLinecap="round" />
      <ellipse cx={150} cy={222} rx={34} ry={11} fill={GC.tire} />
      {/* basket */}
      <path d="M 296 214 L 356 214 L 348 252 L 304 252 Z" fill={GC.woodLight} stroke={GC.woodDark} strokeWidth={4} />
    </g>
  );
};

export const Bear: React.FC<BearProps> = (props) => {
  const frame = useCurrentFrame();
  const { kind, pose = "stand", mouthOpen = 0, eyes = "open", headTilt = 0, pedal = 1, seed = 0 } = props;
  const col = BEAR_COLORS[kind];
  const f = frame + seed * 11;
  const breathe = 1 + Math.sin(f / 15) * 0.018;
  const blinking = (eyes === "open" || eyes === "wide") && blinkAt(f, 23 + seed * 17);
  const ride = pose === "ride";
  const walkY = pose === "walk" ? -Math.abs(Math.sin(f / 5)) * 12 : 0;
  const tiptoeY = pose === "tiptoe" ? -10 - Math.abs(Math.sin(f / 7)) * 10 : 0;
  const cheerY = pose === "cheer" ? -Math.abs(Math.sin(f / 5)) * 26 : 0;
  const shockY = pose === "shock" ? -6 : 0;
  const swayX = pose === "walk" || pose === "tiptoe" ? Math.sin(f / 7) * 4 : 0;

  // arm lift (degrees outward from hanging): [viewer-left, viewer-right]
  let arms: [number, number] = [8, 8];
  if (pose === "wave") arms = [10, 150 + Math.sin(f / 4) * 18];
  else if (pose === "point") arms = [10, 95];
  else if (pose === "shock") arms = [140, 140];
  else if (pose === "tiptoe") arms = [70 + Math.sin(f / 7) * 6, 70 - Math.sin(f / 7) * 6];
  else if (pose === "cry") arms = [150, 150];
  else if (pose === "stir") arms = [20, 60 + Math.sin(f / 5) * 14];
  else if (pose === "glue") arms = [40, 70 + Math.sin(f / 6) * 8];
  else if (pose === "hug") arms = [115, 115];
  else if (pose === "cheer") arms = [155 + Math.sin(f / 5) * 10, 155 - Math.sin(f / 5) * 10];
  else if (pose === "fan") arms = [10, 120 + Math.sin(f / 2.5) * 22];
  else if (pose === "walk") arms = [14 + Math.sin(f / 5) * 10, 14 - Math.sin(f / 5) * 10];
  else if (ride) arms = [50, 60];
  const mouth = Math.max(mouthOpen, pose === "shock" ? 0.6 : 0, pose === "cry" ? 0.5 + Math.sin(f / 3) * 0.2 : 0);

  const eye = (cx: number, cy: number) => {
    if (eyes === "happy" || blinking)
      return <path d={`M ${cx - 13} ${cy + 3} Q ${cx} ${cy - 11} ${cx + 13} ${cy + 3}`} stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />;
    if (eyes === "sad")
      return (
        <g>
          <path d={`M ${cx - 13} ${cy - 2} Q ${cx} ${cy + 10} ${cx + 13} ${cy - 2}`} stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={`M ${cx - 4} ${cy + 14} Q ${cx + 4} ${cy + 26 + ((f % 30) / 30) * 20} ${cx - 2} ${cy + 34 + ((f % 30) / 30) * 20}`} stroke="#8FD0F0" strokeWidth={7} fill="none" strokeLinecap="round" opacity={1 - (f % 30) / 30} />
        </g>
      );
    const r = eyes === "wide" ? 14 : 11;
    return (
      <g>
        {eyes === "wide" ? <circle cx={cx} cy={cy} r={r + 6} fill="#fff" /> : null}
        <circle cx={cx} cy={cy} r={r} fill={C.ink} />
        <circle cx={cx + 4} cy={cy - 4} r={4} fill="#fff" />
      </g>
    );
  };

  const arm = (side: -1 | 1, lift: number) => {
    const sx = 200 + side * 86;
    const sy = 236;
    const a = side === -1 ? lift : -lift;
    return (
      <g transform={`rotate(${a} ${sx} ${sy})`}>
        <rect x={sx - 22} y={sy - 10} width={44} height={110} rx={22} fill={col.fur} />
        <ellipse cx={sx} cy={sy + 92} rx={20} ry={18} fill={col.dark} />
        {side === 1 && pose === "stir" ? <rect x={sx - 5} y={sy + 90} width={10} height={90} rx={5} fill={GC.woodDark} /> : null}
        {side === 1 && pose === "glue" ? (
          <g>
            <rect x={sx - 16} y={sy + 96} width={32} height={46} rx={8} fill="#fff" stroke={GC.speakerDark} strokeWidth={3} />
            <path d={`M ${sx - 6} ${sy + 96} L ${sx} ${sy + 80} L ${sx + 6} ${sy + 96} Z`} fill={C.pinkDark} />
          </g>
        ) : null}
        {side === 1 && pose === "fan" ? <ellipse cx={sx} cy={sy + 130} rx={34} ry={44} fill={C.mint} stroke={C.ink} strokeWidth={3} opacity={0.9} /> : null}
      </g>
    );
  };

  const spin = ride ? f * 9 * pedal : 0;
  const crank = ((f * 9 * pedal) / 180) * Math.PI;
  const leg = (side: -1 | 1) => {
    if (ride) {
      const px = 180 + Math.cos(crank + (side === 1 ? 0 : Math.PI)) * 30;
      const py = 334 + Math.sin(crank + (side === 1 ? 0 : Math.PI)) * 30;
      return (
        <g>
          <line x1={200 + side * 34} y1={340} x2={px} y2={py + 86} stroke={col.fur} strokeWidth={40} strokeLinecap="round" />
          <ellipse cx={px} cy={py + 90} rx={26} ry={16} fill={col.dark} />
        </g>
      );
    }
    const step = pose === "walk" ? Math.sin(f / 5 + (side === 1 ? Math.PI : 0)) * 10 : 0;
    return <ellipse cx={200 + side * 44} cy={366 + Math.min(0, step)} rx={38} ry={28} fill={col.fur} />;
  };

  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        {ride ? <BikeG color={col.bike} spin={spin} /> : null}
        <g transform={`translate(${swayX} ${walkY + tiptoeY + cheerY + shockY + (ride ? -86 : 0)})${ride ? " translate(200 330) scale(0.84) translate(-200 -330)" : ""}`}>
          {!ride ? leg(-1) : null}
          {!ride ? leg(1) : null}
          {arm(-1, arms[0])}
          {arm(1, arms[1])}
          {/* body */}
          <g transform={`translate(200 360) scale(1 ${breathe}) translate(-200 -360)`}>
            <ellipse cx={200} cy={282} rx={100} ry={94} fill={col.fur} />
            {kind === "baby" ? (
              <g>
                <path d="M 112 250 Q 200 196 288 250 L 296 320 Q 200 362 104 320 Z" fill={GC.tee} />
                <path d="M 108 276 Q 200 250 292 276" stroke={GC.teeStripe} strokeWidth={12} fill="none" />
                <path d="M 106 304 Q 200 286 294 304" stroke={GC.teeStripe} strokeWidth={12} fill="none" />
              </g>
            ) : (
              <ellipse cx={200} cy={300} rx={62} ry={62} fill={col.belly} />
            )}
          </g>
          {ride ? leg(-1) : null}
          {ride ? leg(1) : null}
          {/* head */}
          <g transform={`rotate(${headTilt + (pose === "cry" ? Math.sin(f / 3) * 3 : 0)} 200 210)`}>
            <circle cx={130} cy={74} r={32} fill={col.fur} />
            <circle cx={130} cy={74} r={17} fill={col.belly} />
            <circle cx={270} cy={74} r={32} fill={col.fur} />
            <circle cx={270} cy={74} r={17} fill={col.belly} />
            <circle cx={200} cy={140} r={86} fill={col.fur} />
            <ellipse cx={200} cy={176} rx={44} ry={32} fill={col.belly} />
            <ellipse cx={200} cy={160} rx={17} ry={12} fill={GC.nose} />
            {mouth > 0.05 ? (
              <ellipse cx={200} cy={190} rx={12 + mouth * 6} ry={4 + mouth * 14} fill={C.ink} />
            ) : (
              <path d="M 184 184 Q 192 194 200 186 Q 208 194 216 184" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
            )}
            {eye(164, 126)}
            {eye(236, 126)}
            <circle cx={140} cy={164} r={14} fill={C.pinkDark} opacity={0.3} />
            <circle cx={260} cy={164} r={14} fill={C.pinkDark} opacity={0.3} />
            {kind === "mama" ? (
              <g>
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx={268} cy={44} rx={11} ry={18} fill={C.pink} transform={`rotate(${a} 268 60)`} />
                ))}
                <circle cx={268} cy={60} r={10} fill={C.butterDark} />
              </g>
            ) : null}
          </g>
          {/* neckwear */}
          {kind === "papa" ? (
            <g>
              <path d="M 200 224 L 166 206 L 166 244 Z" fill={GC.bowTie} />
              <path d="M 200 224 L 234 206 L 234 244 Z" fill={GC.bowTie} />
              <circle cx={200} cy={224} r={10} fill="#73B1DC" />
            </g>
          ) : null}
          {kind === "mama" ? <path d="M 136 214 Q 200 246 264 214 L 260 232 Q 200 262 140 232 Z" fill={GC.scarf} /> : null}
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Goldilocks (a lamb) ───────────────────────────── */

export type LambEyes = "open" | "happy" | "wide" | "closed" | "worried";

/** The lamb's head, centred at (0, 0), ~170 px wide in head units. */
export const LambHead: React.FC<{ eyes: LambEyes; mouthOpen?: number; frame: number; seed?: number; yum?: boolean }> = ({ eyes, mouthOpen = 0, frame, seed = 0, yum }) => {
  const blinking = (eyes === "open" || eyes === "wide") && blinkAt(frame, 41 + seed * 13);
  const eye = (cx: number) => {
    if (eyes === "happy" || blinking) return <path d={`M ${cx - 11} 4 Q ${cx} -8 ${cx + 11} 4`} stroke={C.ink} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (eyes === "closed") return <path d={`M ${cx - 11} 0 Q ${cx} 10 ${cx + 11} 0`} stroke={C.ink} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    const r = eyes === "wide" ? 12 : 10;
    return (
      <g>
        {eyes === "wide" ? <circle cx={cx} cy={0} r={r + 6} fill="#fff" /> : null}
        <circle cx={cx} cy={0} r={r} fill={C.ink} />
        <circle cx={cx + 3.5} cy={-3.5} r={3.5} fill="#fff" />
        {eyes === "worried" ? <path d={`M ${cx - 12} -22 L ${cx + 10} ${cx < 0 ? -16 : -28}`} stroke={GC.curlDark} strokeWidth={5} strokeLinecap="round" /> : null}
      </g>
    );
  };
  const curls: [number, number, number][] = [
    [-62, -18, 22], [-50, -44, 24], [-26, -62, 25], [2, -68, 26], [30, -62, 25], [54, -44, 24], [64, -18, 22],
    [-72, 8, 20], [72, 8, 20], [-74, 34, 18], [74, 34, 18], [-68, 58, 16], [68, 58, 16],
  ];
  return (
    <g>
      {/* ears */}
      <ellipse cx={-76} cy={-4} rx={34} ry={15} fill={GC.face} transform="rotate(18 -76 -4)" />
      <ellipse cx={76} cy={-4} rx={34} ry={15} fill={GC.face} transform="rotate(-18 76 -4)" />
      <ellipse cx={-78} cy={-3} rx={20} ry={7} fill={C.pink} transform="rotate(18 -78 -3)" />
      <ellipse cx={78} cy={-3} rx={20} ry={7} fill={C.pink} transform="rotate(-18 78 -3)" />
      {/* curls behind */}
      {curls.slice(7).map(([x, y, r], i) => (
        <circle key={`b${i}`} cx={x} cy={y} r={r} fill={i % 2 ? GC.curlDark : GC.curl} />
      ))}
      <ellipse cx={0} cy={8} rx={58} ry={56} fill={GC.face} />
      {/* curly fringe */}
      {curls.slice(0, 7).map(([x, y, r], i) => (
        <circle key={`f${i}`} cx={x} cy={y} r={r} fill={i % 2 ? GC.curlDark : GC.curl} />
      ))}
      <circle cx={-16} cy={-40} r={16} fill={GC.curl} />
      <circle cx={14} cy={-42} r={16} fill={GC.curlDark} />
      <g transform="translate(0 10)">
        {eye(-22)}
        {eye(22)}
      </g>
      <circle cx={-36} cy={30} r={11} fill={C.pinkDark} opacity={0.35} />
      <circle cx={36} cy={30} r={11} fill={C.pinkDark} opacity={0.35} />
      <ellipse cx={0} cy={28} rx={8} ry={6} fill={C.pinkDark} />
      {mouthOpen > 0.05 ? (
        <ellipse cx={0} cy={44} rx={8 + mouthOpen * 4} ry={3 + mouthOpen * 10} fill={C.ink} />
      ) : yum ? (
        <g>
          <path d="M -12 40 Q 0 52 12 40" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          <ellipse cx={8} cy={48} rx={6} ry={5} fill={C.pinkDark} />
        </g>
      ) : (
        <path d="M -10 40 Q 0 49 10 40" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
};

export type LambPose = "stand" | "skip" | "tiptoe" | "knock" | "eat" | "sit" | "shiver" | "shock" | "sorry" | "wave" | "glue" | "bell" | "hug" | "cheer" | "stretch" | "wiggle" | "yawn";

export type LambProps = Placed & {
  pose?: LambPose;
  eyes?: LambEyes;
  mouthOpen?: number;
  headTilt?: number;
  yum?: boolean;
  seed?: number;
};

export const Lamb: React.FC<LambProps> = (props) => {
  const frame = useCurrentFrame();
  const { pose = "stand", eyes = "open", mouthOpen = 0, headTilt = 0, yum, seed = 0 } = props;
  const f = frame + seed * 9;
  const breathe = 1 + Math.sin(f / 13) * 0.02;
  const skipY = pose === "skip" ? -Math.abs(Math.sin(f / 4.5)) * 46 : 0;
  const tipY = pose === "tiptoe" ? -12 - Math.abs(Math.sin(f / 7)) * 8 : 0;
  const cheerY = pose === "cheer" ? -Math.abs(Math.sin(f / 5)) * 30 : 0;
  const shockY = pose === "shock" ? -10 : 0;
  const stretchY = pose === "stretch" ? -18 - Math.sin(f / 5) * 6 : 0;
  const shiverX = pose === "shiver" ? Math.sin(f * 2.2) * 4 : 0;
  const wiggle = pose === "wiggle" ? Math.sin(f / 3) * 7 : 0;
  const knock = pose === "knock" ? Math.max(0, Math.sin(f / 2.4)) * 18 : 0;

  let arms: [number, number] = [14, 14];
  if (pose === "skip") arms = [40 + Math.sin(f / 4.5) * 20, 40 - Math.sin(f / 4.5) * 20];
  else if (pose === "tiptoe") arms = [60, 60];
  else if (pose === "knock") arms = [14, 92 + knock];
  else if (pose === "eat") arms = [14, 150 + Math.sin(f / 3) * 6];
  else if (pose === "sit") arms = [30, 30];
  else if (pose === "shiver") arms = [150, 150];
  else if (pose === "shock") arms = [140, 140];
  else if (pose === "sorry") arms = [150, 150];
  else if (pose === "wave") arms = [14, 150 + Math.sin(f / 4) * 18];
  else if (pose === "glue") arms = [60, 75 + Math.sin(f / 5) * 8];
  else if (pose === "bell") arms = [14, 100];
  else if (pose === "hug") arms = [110, 110];
  else if (pose === "cheer") arms = [150 + Math.sin(f / 5) * 12, 150 - Math.sin(f / 5) * 12];
  else if (pose === "stretch") arms = [170, 170];
  else if (pose === "wiggle") arms = [80, 80];
  else if (pose === "yawn") arms = [165, 165];

  const arm = (side: -1 | 1, lift: number) => {
    const sx = 200 + side * 58;
    const sy = 250;
    // "sorry" and "shiver": arms crossed in front, folded inwards
    const a = pose === "sorry" || pose === "shiver" ? (side === -1 ? -lift + 20 : lift - 20) * -1 : side === -1 ? lift : -lift;
    return (
      <g transform={`rotate(${a} ${sx} ${sy})`}>
        <rect x={sx - 15} y={sy - 6} width={30} height={74} rx={15} fill={GC.woolShade} />
        <ellipse cx={sx} cy={sy + 70} rx={14} ry={11} fill={GC.hoof} />
        {side === 1 && pose === "eat" ? (
          <g>
            <rect x={sx - 4} y={sy + 64} width={8} height={40} rx={4} fill={GC.speakerDark} />
            <ellipse cx={sx} cy={sy + 108} rx={12} ry={9} fill={GC.speakerDark} />
          </g>
        ) : null}
      </g>
    );
  };

  const legs = () => {
    if (pose === "sit")
      return (
        <g>
          <rect x={160} y={330} width={30} height={62} rx={15} fill={GC.woolShade} transform={`rotate(${20 + Math.sin(f / 6) * 8} 175 334)`} />
          <rect x={210} y={330} width={30} height={62} rx={15} fill={GC.woolShade} transform={`rotate(${-20 - Math.sin(f / 6) * 8} 225 334)`} />
        </g>
      );
    const step = pose === "skip" ? Math.sin(f / 4.5) * 14 : pose === "tiptoe" ? Math.sin(f / 7) * 10 : 0;
    return (
      <g>
        <rect x={160} y={318 - Math.max(0, step)} width={28} height={74} rx={14} fill={GC.woolShade} />
        <rect x={212} y={318 - Math.max(0, -step)} width={28} height={74} rx={14} fill={GC.woolShade} />
        <ellipse cx={174} cy={388 - Math.max(0, step)} rx={17} ry={10} fill={GC.hoof} />
        <ellipse cx={226} cy={388 - Math.max(0, -step)} rx={17} ry={10} fill={GC.hoof} />
      </g>
    );
  };

  const wool: [number, number, number][] = [
    [200, 228, 46], [156, 248, 40], [244, 248, 40], [140, 290, 40], [260, 290, 40], [168, 326, 36], [232, 326, 36], [200, 282, 58],
  ];

  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g transform={`translate(${shiverX} ${skipY + tipY + cheerY + shockY + stretchY + (pose === "sit" ? 30 : 0)}) rotate(${wiggle} 200 392)`}>
          {legs()}
          {pose === "sorry" || pose === "shiver" || pose === "hug" ? null : arm(-1, arms[0])}
          {pose === "sorry" || pose === "shiver" || pose === "hug" ? null : arm(1, arms[1])}
          <g transform={`translate(200 360) scale(${breathe} ${breathe}) translate(-200 -360)`}>
            {wool.map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 1 ? GC.woolShade : GC.wool} />
            ))}
          </g>
          {pose === "sorry" || pose === "shiver" || pose === "hug" ? arm(-1, arms[0]) : null}
          {pose === "sorry" || pose === "shiver" || pose === "hug" ? arm(1, arms[1]) : null}
          {/* scarf */}
          <path d="M 150 206 Q 200 230 250 206 L 248 224 Q 200 248 152 224 Z" fill={GC.lambScarf} />
          <rect x={222} y={218} width={20} height={44} rx={8} fill={GC.lambScarf} transform="rotate(-12 232 220)" />
          <g transform={`translate(200 126) rotate(${headTilt + (pose === "yawn" ? -8 : 0)} 0 70)`}>
            <LambHead eyes={pose === "yawn" ? "closed" : eyes} mouthOpen={pose === "yawn" ? 0.9 : mouthOpen} frame={f} seed={seed} yum={yum} />
          </g>
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Props ───────────────────────────── */

export type BowlKind = "big" | "middle" | "little";
const BOWL_W: Record<BowlKind, number> = { big: 240, middle: 190, little: 140 };
const BOWL_COLOR: Record<BowlKind, string> = { big: GC.bowlPapa, middle: GC.bowlMama, little: GC.bowlBaby };

/** A porridge bowl standing on (x, y). `fill` 0..1, `steam` 0..1, `frost` 0..1 (too cold). */
export const Bowl: React.FC<{ x: number; y: number; kind: BowlKind; fill?: number; steam?: number; frost?: number }> = ({ x, y, kind, fill = 1, steam = 0, frost = 0 }) => {
  const frame = useCurrentFrame();
  const w = BOWL_W[kind];
  const h = w * 0.42;
  return (
    <svg viewBox={`${-w / 2 - 20} ${-h - 160} ${w + 40} ${h + 170}`} width={w + 40} height={h + 170} style={{ position: "absolute", left: x - w / 2 - 20, top: y - h - 160, overflow: "visible" }}>
      {steam > 0
        ? [-1, 0, 1].map((i) => {
            const t = ((frame + i * 14 + 60) % 42) / 42;
            return (
              <path
                key={i}
                d={`M ${i * w * 0.22} ${-h - 4 - t * 90} q 14 -16 0 -32 q -14 -16 0 -32`}
                stroke="#fff"
                strokeWidth={9}
                fill="none"
                strokeLinecap="round"
                opacity={steam * (1 - t) * 0.9}
              />
            );
          })
        : null}
      {fill > 0.02 ? <ellipse cx={0} cy={-h + 6 + (1 - fill) * h * 0.5} rx={(w / 2 - 8) * (0.7 + fill * 0.3)} ry={h * 0.18} fill={GC.porridge} /> : null}
      {fill > 0.02 ? <ellipse cx={-w * 0.08} cy={-h + 2 + (1 - fill) * h * 0.5} rx={w * 0.08} ry={h * 0.06} fill={GC.porridgeDark} /> : null}
      <path d={`M ${-w / 2} ${-h} Q ${-w / 2} 0 0 0 Q ${w / 2} 0 ${w / 2} ${-h} Z`} fill={BOWL_COLOR[kind]} />
      <path d={`M ${-w / 2 + 14} ${-h + 18} Q ${-w / 2 + 20} ${-h * 0.25} ${-w * 0.18} ${-h * 0.12}`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.5} strokeLinecap="round" />
      {frost > 0
        ? [-0.25, 0.1, 0.32].map((p, i) => (
            <g key={i} opacity={frost} transform={`translate(${p * w} ${-h - 36 - i * 10})`}>
              {[0, 60, 120].map((a) => (
                <line key={a} x1={-12} y1={0} x2={12} y2={0} stroke="#BFE6FA" strokeWidth={5} strokeLinecap="round" transform={`rotate(${a + frame})`} />
              ))}
            </g>
          ))
        : null}
    </svg>
  );
};

export type ChairKind = "big" | "middle" | "little";

/** Seat height above the floor, per chair. */
export const SEAT_H: Record<ChairKind, number> = { big: 250, middle: 170, little: 120 };

/** A chair standing on the floor at (x, floorY). `broken` 0..1 scatters the little chair; `squish` sinks the cushion. */
export const Chair: React.FC<{ x: number; floorY: number; kind: ChairKind; broken?: number; squish?: number; rock?: number }> = ({ x, floorY, kind, broken = 0, squish = 0, rock = 0 }) => {
  const seat = SEAT_H[kind];
  if (kind === "middle") {
    // a puffy pink armchair
    return (
      <svg viewBox="-180 -360 360 370" width={360} height={370} style={{ position: "absolute", left: x - 180, top: floorY - 360, overflow: "visible" }}>
        <rect x={-130} y={-340} width={260} height={220} rx={90} fill={C.pinkDark} />
        <rect x={-150} y={-seat - 30} width={300} height={seat - 10} rx={50} fill={C.pinkDark} />
        <ellipse cx={0} cy={-seat + 4 + squish * 30} rx={110} ry={34 - squish * 12} fill={C.pink} />
        <rect x={-170} y={-seat - 70} width={60} height={150} rx={30} fill={C.pink} />
        <rect x={110} y={-seat - 70} width={60} height={150} rx={30} fill={C.pink} />
        <rect x={-120} y={-30} width={22} height={30} rx={8} fill={GC.woodDark} />
        <rect x={98} y={-30} width={22} height={30} rx={8} fill={GC.woodDark} />
      </svg>
    );
  }
  const w = kind === "big" ? 220 : 130;
  const back = kind === "big" ? 300 : 150;
  const color = kind === "big" ? GC.woodDark : GC.bowlBaby;
  const light = kind === "big" ? GC.wood : GC.curl;
  const legW = kind === "big" ? 22 : 16;
  // each piece slides by (dx, dy) and turns about its own centre (cx, cy) so it comes to rest on the floor
  const piece = (dx: number, dy: number, rot: number, cx: number, cy: number) => `translate(${dx * broken} ${dy * broken}) rotate(${rot * broken} ${cx} ${cy})`;
  return (
    <svg viewBox={`${-w} ${-seat - back - 10} ${w * 2} ${seat + back + 20}`} width={w * 2} height={seat + back + 20} style={{ position: "absolute", left: x - w, top: floorY - seat - back - 10, overflow: "visible" }}>
      <g transform={`rotate(${rock} 0 0)`}>
        {/* back */}
        <g transform={piece(-120, seat + back / 2 - w / 2 - 4, -90, 0, -seat - back / 2)}>
          <rect x={-w / 2} y={-seat - back} width={legW} height={back + 10} rx={legW / 2} fill={color} />
          <rect x={w / 2 - legW} y={-seat - back} width={legW} height={back + 10} rx={legW / 2} fill={color} />
          <rect x={-w / 2} y={-seat - back} width={w} height={back * 0.28} rx={14} fill={light} />
          <rect x={-w / 2 + 10} y={-seat - back * 0.55} width={w - 20} height={back * 0.14} rx={8} fill={light} />
          {kind === "little" ? <path d={`M 0 ${-seat - back * 0.86 + 20} l 7 14 l 15 2 l -11 10 l 3 15 l -14 -7 l -14 7 l 3 -15 l -11 -10 l 15 -2 Z`} fill={C.pinkDark} /> : null}
        </g>
        {/* seat */}
        <g transform={piece(70, seat - 16, 8, 0, -seat + 11)}>
          <rect x={-w / 2 - 10} y={-seat} width={w + 20} height={kind === "big" ? 30 : 22} rx={10} fill={light} />
        </g>
        {/* legs */}
        <g transform={piece(-30, seat / 2 - 14, -84, -w / 2 + legW / 2, -seat / 2 + 5)}>
          <rect x={-w / 2} y={-seat + 10} width={legW} height={seat - 10} rx={legW / 2} fill={color} />
        </g>
        <g transform={piece(130, seat / 2 - 14, 80, w / 2 - legW / 2, -seat / 2 + 5)}>
          <rect x={w / 2 - legW} y={-seat + 10} width={legW} height={seat - 10} rx={legW / 2} fill={color} />
        </g>
      </g>
    </svg>
  );
};

export type BedKind = "big" | "middle" | "little";
/** Mattress top height above the floor, per bed. */
export const BED_TOP: Record<BedKind, number> = { big: 360, middle: 210, little: 150 };
const BED_W: Record<BedKind, number> = { big: 460, middle: 400, little: 320 };
const QUILT: Record<BedKind, string> = { big: GC.quiltPapa, middle: GC.quiltMama, little: GC.quiltBaby };

/** A bed standing on the floor at (x, floorY). `sleeper` tucks Goldilocks in (head on the pillow, left end). */
export const Bed: React.FC<{ x: number; floorY: number; kind: BedKind; squish?: number; sleeper?: boolean; sleeperEyes?: LambEyes }> = ({ x, floorY, kind, squish = 0, sleeper, sleeperEyes = "closed" }) => {
  const frame = useCurrentFrame();
  const top = BED_TOP[kind];
  const w = BED_W[kind];
  const breathe = Math.sin(frame / 18) * 4;
  return (
    <svg viewBox={`${-w / 2 - 40} ${-top - 220} ${w + 80} ${top + 230}`} width={w + 80} height={top + 230} style={{ position: "absolute", left: x - w / 2 - 40, top: floorY - top - 220, overflow: "visible" }}>
      {/* headboard (left) and footboard (right) */}
      <rect x={-w / 2 - 20} y={-top - 150} width={44} height={top + 150} rx={20} fill={GC.woodDark} />
      <rect x={w / 2 - 24} y={-top - 50} width={44} height={top + 50} rx={20} fill={GC.woodDark} />
      <circle cx={-w / 2 + 2} cy={-top - 156} r={20} fill={GC.wood} />
      <circle cx={w / 2 - 2} cy={-top - 56} r={20} fill={GC.wood} />
      {/* frame + mattress */}
      <rect x={-w / 2} y={-top + 20} width={w} height={40} rx={14} fill={GC.wood} />
      {kind === "big" ? <rect x={-w / 2 + 40} y={-top + 60} width={w - 80} height={top - 60} rx={10} fill={GC.woodLight} opacity={0.6} /> : null}
      <rect x={-w / 2 + 10} y={-top - 20 + squish * 26} width={w - 20} height={50 - squish * 16} rx={22} fill="#fff" />
      {kind === "middle" ? [0, 1, 2].map((i) => <ellipse key={i} cx={-w / 3 + i * (w / 3)} cy={-top - 26 + squish * 26} rx={w / 6 + 6} ry={22 - squish * 8} fill="#fff" />) : null}
      {/* pillow */}
      <ellipse cx={-w / 2 + 78} cy={-top - 34 + squish * 22} rx={62} ry={30} fill={C.cream} stroke={GC.speakerDark} strokeWidth={3} />
      {sleeper ? (
        <g transform={`translate(${-w / 2 + 90} ${-top - 76}) rotate(-14) scale(0.62)`}>
          <LambHead eyes={sleeperEyes} frame={frame} />
        </g>
      ) : null}
      {/* quilt */}
      <path
        d={`M ${-w / 2 + (sleeper ? 120 : 140)} ${-top - 24 + squish * 26 - (sleeper ? 20 + breathe : 0)} Q ${sleeper ? 40 : 60} ${-top - 40 + squish * 26 - (sleeper ? 30 + breathe : 0)} ${w / 2 - 20} ${-top - 20 + squish * 26} L ${w / 2 - 14} ${-top + 40} L ${-w / 2 + (sleeper ? 110 : 130)} ${-top + 40} Z`}
        fill={QUILT[kind]}
      />
      {kind === "little"
        ? [0.25, 0.55, 0.8].map((p, i) => (
            <path key={i} transform={`translate(${-w / 2 + 130 + p * (w - 160)} ${-top + 6})`} d="M 0 -14 l 4 9 l 10 1 l -7 7 l 2 10 l -9 -5 l -9 5 l 2 -10 l -7 -7 l 10 -1 Z" fill="#fff" opacity={0.85} />
          ))
        : null}
      {/* legs */}
      <rect x={-w / 2 + 6} y={-top + 50} width={20} height={top - 50} rx={8} fill={GC.woodDark} />
      <rect x={w / 2 - 26} y={-top + 50} width={20} height={top - 50} rx={8} fill={GC.woodDark} />
    </svg>
  );
};

/** A glowing star night-light, centre (x, y). */
export const NightLight: React.FC<{ x: number; y: number; size?: number; glow?: number }> = ({ x, y, size = 90, glow = 1 }) => {
  const frame = useCurrentFrame();
  const g = glow * (0.75 + Math.sin(frame / 10) * 0.25);
  return (
    <svg viewBox="-100 -100 200 200" width={size * 2.2} height={size * 2.2} style={{ position: "absolute", left: x - size * 1.1, top: y - size * 1.1, overflow: "visible" }}>
      <circle r={90} fill={GC.star} opacity={0.25 * g} />
      <circle r={62} fill={GC.star} opacity={0.3 * g} />
      <path d="M 0 -46 L 13 -15 L 46 -13 L 20 9 L 29 42 L 0 24 L -29 42 L -20 9 L -46 -13 L -13 -15 Z" fill={GC.star} stroke={C.butterDark} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -10 2 Q 0 10 10 2" stroke={C.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <circle cx={-9} cy={-6} r={3} fill={C.ink} />
      <circle cx={9} cy={-6} r={3} fill={C.ink} />
    </svg>
  );
};

/** The bears' friendly smart speaker: base at (x, y). `talk` 0..1 lights the ring and bounces it. */
export const SmartSpeaker: React.FC<{ x: number; y: number; size?: number; talk?: number }> = ({ x, y, size = 110, talk = 0 }) => {
  const frame = useCurrentFrame();
  const bounce = talk > 0 ? Math.abs(Math.sin(frame / 3)) * 6 * talk : 0;
  const w = size;
  const h = size * 1.15;
  return (
    <svg viewBox={`${-w} ${-h - 70} ${w * 2} ${h + 74}`} width={w * 2} height={h + 74} style={{ position: "absolute", left: x - w, top: y - h - 70, overflow: "visible" }}>
      {talk > 0
        ? [0, 1, 2].map((i) => {
            const t = ((frame + i * 10) % 30) / 30;
            return <path key={i} d={`M ${-w * 0.5 - t * 40} ${-h - 10 - t * 40} Q 0 ${-h - 50 - t * 60} ${w * 0.5 + t * 40} ${-h - 10 - t * 40}`} stroke={GC.ring} strokeWidth={6} fill="none" strokeLinecap="round" opacity={talk * (1 - t)} />;
          })
        : null}
      <g transform={`translate(0 ${-bounce})`}>
        <rect x={-w / 2} y={-h} width={w} height={h} rx={w * 0.3} fill={GC.speaker} />
        <rect x={-w / 2} y={-h} width={w} height={h * 0.2} rx={w * 0.12} fill={talk > 0 ? GC.ring : GC.speakerDark} />
        {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <circle key={`${r}${c}`} cx={-w * 0.24 + c * w * 0.16} cy={-h * 0.55 + r * h * 0.15} r={w * 0.035} fill={GC.speakerDark} />))}
        {/* friendly face on the light band */}
        <circle cx={-w * 0.12} cy={-h * 0.9} r={w * 0.035} fill={C.ink} />
        <circle cx={w * 0.12} cy={-h * 0.9} r={w * 0.035} fill={C.ink} />
      </g>
    </svg>
  );
};

/** A cooking pot with porridge on a little stove top: base at (x, y). */
export const Pot: React.FC<{ x: number; y: number; steam?: number }> = ({ x, y, steam = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <svg viewBox="-150 -330 300 340" width={300} height={340} style={{ position: "absolute", left: x - 150, top: y - 330, overflow: "visible" }}>
      {[-1, 0, 1].map((i) => {
        const t = ((frame + i * 15) % 45) / 45;
        return <path key={i} d={`M ${i * 40} ${-150 - t * 110} q 16 -18 0 -36 q -16 -18 0 -36`} stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={steam * (1 - t)} />;
      })}
      <ellipse cx={0} cy={-146} rx={104} ry={22} fill={GC.porridge} />
      <path d="M -110 -150 L 110 -150 L 98 -10 Q 0 6 -98 -10 Z" fill="#C8BEDD" />
      <rect x={-130} y={-140} width={34} height={18} rx={9} fill="#B3A7CF" />
      <rect x={96} y={-140} width={34} height={18} rx={9} fill="#B3A7CF" />
      <path d="M -80 -120 Q -84 -60 -60 -30" stroke="#fff" strokeWidth={8} fill="none" opacity={0.4} strokeLinecap="round" />
    </svg>
  );
};
