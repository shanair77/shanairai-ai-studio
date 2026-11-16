/**
 * Flat pastel characters and props, drawn as inline SVG. Every motion is driven by
 * `useCurrentFrame()` — nothing here uses CSS animation.
 */

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C } from "./story";

type Placed = {
  /** Feet position in composition pixels. */
  x: number;
  y: number;
  /** Rendered height in pixels. */
  size?: number;
  flip?: boolean;
  /** Extra rotation in degrees, around the feet. */
  rotate?: number;
  opacity?: number;
};

const place = ({ x, y, size = 200, flip, rotate = 0, opacity = 1 }: Placed): React.CSSProperties => ({
  position: "absolute",
  left: x - size / 2,
  top: y - size,
  width: size,
  height: size,
  transformOrigin: "50% 100%",
  rotate: `${rotate}deg`,
  scale: flip ? "-1 1" : "1 1",
  opacity,
});

/* ───────────────────────────── Mouse ───────────────────────────── */

export type MouseProps = Placed & {
  kind: "country" | "city";
  /** 0 = still, 1 = full walking bounce. */
  walk?: number;
  /** Head tilt in degrees (negative = nose up). */
  headTilt?: number;
  /** Shiver amplitude in px. */
  shake?: number;
  /** 0..1 — opens a little smile into a happy "o". */
  mouthOpen?: number;
  /** Nibbling: head nods quickly. */
  nibble?: boolean;
  /** Raise the front paw in a wave. */
  wave?: boolean;
};

export const Mouse: React.FC<MouseProps> = (props) => {
  const frame = useCurrentFrame();
  const { kind, walk = 0, headTilt = 0, shake = 0, mouthOpen = 0, nibble, wave } = props;
  const fur = kind === "country" ? C.countryFur : C.cityFur;
  const belly = kind === "country" ? C.countryBelly : C.cityBelly;
  const seed = kind === "country" ? 0 : 17;

  const bob = walk * Math.abs(Math.sin((frame + seed) / 3.2)) * -14;
  const breathe = 1 + Math.sin((frame + seed) / 14) * 0.015;
  const shiver = shake ? Math.sin(frame * 2.7) * shake : 0;
  const tailSwing = Math.sin((frame + seed) / 9) * 10;
  const nod = nibble ? Math.sin(frame / 2.2) * 5 : 0;
  // blink every ~3.5s for 4 frames
  const blinking = (frame + seed * 7) % 105 < 4;
  const waveAngle = wave ? -40 + Math.sin(frame / 3) * 25 : 0;
  const stepA = walk * Math.sin((frame + seed) / 3.2) * 6;

  return (
    <div style={place(props)}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `${shiver}px ${bob}px` }}>
          {/* tail */}
          <path
            d={`M 52 160 C 20 165, 8 ${130 + tailSwing}, 18 ${108 + tailSwing}`}
            stroke={C.pinkDark}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
          />
          {/* feet */}
          <ellipse cx={78 + stepA} cy={190} rx={17} ry={7} fill={C.pinkDark} />
          <ellipse cx={122 - stepA} cy={190} rx={17} ry={7} fill={C.pinkDark} />
          {/* body */}
          <g style={{ scale: `1 ${breathe}`, transformOrigin: "100px 190px" }}>
            <ellipse cx={98} cy={146} rx={54} ry={46} fill={fur} />
            <ellipse cx={110} cy={156} rx={30} ry={28} fill={belly} />
            {kind === "city" ? (
              /* bow tie */
              <g>
                <path d="M 118 112 L 100 102 L 100 124 Z" fill={C.pinkDark} />
                <path d="M 118 112 L 136 102 L 136 124 Z" fill={C.pinkDark} />
                <circle cx={118} cy={113} r={5} fill={C.pink} />
              </g>
            ) : (
              /* little scarf */
              <path d="M 92 112 Q 120 124 146 108 L 140 120 Q 118 134 96 124 Z" fill={C.mint} />
            )}
            {/* arm */}
            <g style={{ rotate: `${waveAngle}deg`, transformOrigin: "118px 136px" }}>
              <ellipse cx={130} cy={144} rx={9} ry={16} fill={fur} style={{ rotate: "-25deg", transformOrigin: "130px 144px" }} />
            </g>
          </g>
          {/* head */}
          <g style={{ rotate: `${headTilt + nod}deg`, transformOrigin: "120px 110px" }}>
            <circle cx={106} cy={56} r={25} fill={fur} />
            <circle cx={106} cy={56} r={15} fill={C.pink} />
            <circle cx={156} cy={52} r={25} fill={fur} />
            <circle cx={156} cy={52} r={15} fill={C.pink} />
            <circle cx={132} cy={92} r={40} fill={fur} />
            <ellipse cx={166} cy={100} rx={22} ry={16} fill={fur} />
            <circle cx={186} cy={97} r={7} fill={C.pinkDark} />
            {/* eye */}
            {blinking ? (
              <path d="M 141 84 Q 148 88 155 84" stroke={C.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
            ) : (
              <>
                <circle cx={148} cy={83} r={6.5} fill={C.ink} />
                <circle cx={150} cy={80.5} r={2.2} fill="#fff" />
              </>
            )}
            {/* cheek */}
            <circle cx={146} cy={106} r={9} fill={C.pink} opacity={0.75} />
            {/* mouth */}
            {mouthOpen > 0.2 ? (
              <ellipse cx={170} cy={114} rx={5} ry={4 + mouthOpen * 4} fill={C.ink} />
            ) : (
              <path d="M 164 112 Q 170 117 176 112" stroke={C.ink} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            )}
            {/* whiskers */}
            <g stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" opacity={0.5}>
              <line x1={178} y1={104} x2={198} y2={100} />
              <line x1={178} y1={108} x2={198} y2={112} />
            </g>
            {/* hats */}
            {kind === "country" ? (
              <g style={{ rotate: "-12deg", transformOrigin: "128px 56px" }}>
                <ellipse cx={128} cy={62} rx={46} ry={9} fill={C.butterDark} />
                <path d="M 104 62 Q 106 30 128 30 Q 150 30 152 62 Z" fill={C.butter} />
                <rect x={104} y={52} width={48} height={7} fill={C.pinkDark} />
                <circle cx={146} cy={50} r={6} fill={C.pink} />
                <circle cx={146} cy={50} r={2.5} fill={C.butterDark} />
              </g>
            ) : (
              <g style={{ rotate: "10deg", transformOrigin: "132px 54px" }}>
                <ellipse cx={132} cy={56} rx={30} ry={6} fill={C.ink} />
                <rect x={116} y={16} width={32} height={40} rx={4} fill={C.ink} />
                <rect x={116} y={42} width={32} height={7} fill={C.pinkDark} />
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Cat ───────────────────────────── */

export const Cat: React.FC<Placed & { creep?: number; pounce?: number }> = (props) => {
  const frame = useCurrentFrame();
  const { creep = 0, pounce = 0 } = props;
  const sway = Math.sin(frame / 10) * 12;
  const step = creep * Math.sin(frame / 5) * 8;
  return (
    <div style={place(props)}>
      <svg viewBox="0 -100 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${-pounce * 30}px` }}>
          <path
            d={`M 70 210 C 20 200, 10 ${120 + sway}, 40 ${80 + sway}`}
            stroke={C.catFur}
            strokeWidth={22}
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx={180} cy={205} rx={120} ry={62} fill={C.catFur} />
          <ellipse cx={200} cy={225} rx={70} ry={34} fill={C.cityBelly} />
          {/* legs */}
          <rect x={100 + step} y={235} width={26} height={60} rx={13} fill={C.catFur} />
          <rect x={150 - step} y={235} width={26} height={60} rx={13} fill={C.catFur} />
          <rect x={230 + step} y={235} width={26} height={60} rx={13} fill={C.catFur} />
          <rect x={270 - step} y={235} width={26} height={60} rx={13} fill={C.catFur} />
          {/* head */}
          <path d="M 268 108 L 282 48 L 318 92 Z" fill={C.catFur} />
          <path d="M 336 92 L 362 46 L 372 106 Z" fill={C.catFur} />
          <path d="M 280 96 L 286 66 L 304 90 Z" fill={C.pink} />
          <path d="M 344 92 L 360 64 L 364 100 Z" fill={C.pink} />
          <circle cx={322} cy={140} r={62} fill={C.catFur} />
          {/* sly eyes */}
          <ellipse cx={300} cy={130} rx={14} ry={9} fill={C.butter} />
          <ellipse cx={348} cy={130} rx={14} ry={9} fill={C.butter} />
          <ellipse cx={302} cy={130} rx={3.5} ry={8} fill={C.ink} />
          <ellipse cx={350} cy={130} rx={3.5} ry={8} fill={C.ink} />
          <path d="M 284 118 L 316 124" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
          <path d="M 364 118 L 332 124" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
          <path d="M 318 152 L 330 152 L 324 160 Z" fill={C.pinkDark} />
          <path d="M 310 166 Q 324 176 338 166" stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
          <g stroke={C.ink} strokeWidth={2} opacity={0.45} strokeLinecap="round">
            <line x1={280} y1={158} x2={240} y2={150} />
            <line x1={280} y1={166} x2={240} y2={170} />
            <line x1={368} y1={158} x2={398} y2={150} />
            <line x1={368} y1={166} x2={398} y2={170} />
          </g>
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Dog ───────────────────────────── */

export const Dog: React.FC<Placed & { bound?: number; bark?: boolean }> = (props) => {
  const frame = useCurrentFrame();
  const { bound = 0, bark } = props;
  const hop = bound * Math.abs(Math.sin(frame / 4)) * -40;
  const wag = Math.sin(frame / 2) * 18;
  const jaw = bark ? Math.max(0, Math.sin(frame / 3)) * 18 : 4;
  return (
    <div style={place(props)}>
      <svg viewBox="0 -80 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${hop}px` }}>
          <g style={{ rotate: `${wag}deg`, transformOrigin: "70px 190px" }}>
            <path d="M 70 190 Q 30 150 40 110" stroke={C.dogFur} strokeWidth={22} fill="none" strokeLinecap="round" />
          </g>
          <ellipse cx={170} cy={205} rx={110} ry={68} fill={C.dogFur} />
          <ellipse cx={200} cy={228} rx={60} ry={34} fill={C.cream} />
          <rect x={95} y={240} width={34} height={66} rx={16} fill={C.dogFur} />
          <rect x={150} y={240} width={34} height={66} rx={16} fill={C.dogFur} />
          <rect x={215} y={240} width={34} height={66} rx={16} fill={C.dogFur} />
          <rect x={255} y={240} width={34} height={66} rx={16} fill={C.dogFur} />
          {/* collar */}
          <path d="M 250 160 Q 280 200 320 190" stroke={C.blue} strokeWidth={16} fill="none" strokeLinecap="round" />
          <circle cx={292} cy={202} r={10} fill={C.butterDark} />
          {/* head */}
          <circle cx={300} cy={122} r={66} fill={C.dogFur} />
          <ellipse cx={356} cy={150} rx={44} ry={30} fill={C.cream} />
          <ellipse cx={392} cy={138} rx={14} ry={11} fill={C.ink} />
          <path d={`M 340 170 Q 368 ${176 + jaw} 396 168`} stroke={C.ink} strokeWidth={4} fill={jaw > 8 ? C.pinkDark : "none"} strokeLinecap="round" />
          <circle cx={318} cy={104} r={8} fill={C.ink} />
          <circle cx={321} cy={101} r={2.6} fill="#fff" />
          {/* floppy ear */}
          <path d="M 262 70 Q 220 80 232 160 Q 262 150 280 92 Z" fill={C.trunkDark} />
          <circle cx={330} cy={132} r={10} fill={C.pink} opacity={0.7} />
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Food & props ───────────────────────────── */

type PropProps = { x: number; y: number; size?: number; pop?: number };

/** Wrap a prop so `pop` (0→1) scales it in with a little overshoot. */
const Pop: React.FC<PropProps & { children: React.ReactNode; wobble?: number }> = ({
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
  text: string;
  pop: number;
  width?: number;
  fontSize?: number;
  color?: string;
  tail?: "left" | "right";
}> = ({ x, y, text, pop, width = 520, fontSize = 52, color = C.cream, tail = "left" }) => {
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
        {text}
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
