/**
 * The Lion and the Mouse — flat pastel characters and props (inline SVG, frame-driven).
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { C, place, type Placed } from "../../kit";

/** Story-specific pastel colours. */
export const LC = {
  lionFur: "#F7DDA4",
  lionBelly: "#FCEFD2",
  tail: "#EFC97F",
  mane: "#F2B98E",
  maneDark: "#E9A57A",
  mouseFur: "#C9D4E2",
  mouseBelly: "#EEF2F8",
  scooter: "#F4A3A8",
  scooterDark: "#E58C93",
  rope: "#C9A27E",
  ground: "#F6E3A9",
  groundDark: "#EBCF85",
  grassTuft: "#E3C873",
  grassGreen: "#C9E2A0",
  binBlue: "#A9CDEF",
  binMint: "#A7E0CC",
  binButter: "#F7D97C",
};

/* ───────────────────────────── Lion ───────────────────────────── */

export type LionProps = Placed & {
  pose?: "lie" | "stand";
  /** "closed" (asleep), "open", or "one" (one eye peeking). */
  eyes?: "closed" | "open" | "one";
  /** 0..1 opens the mouth. */
  mouthOpen?: number;
  /** Laughing: head bobs and mane wobbles. */
  laugh?: boolean;
  /** Wriggle amplitude (px in the lion's 400-unit space). */
  wriggle?: number;
  /** 0..1 raises the front paw (lying pose): used to hold the Mouse. */
  pawUp?: number;
  /** Walking bounce 0..1 (standing pose). */
  walk?: number;
  /** Net over the front half: 0 = none, 1 = fully tangled; `netCut` 0..1 removes strands. */
  net?: number;
  netCut?: number;
  /** Worried brows. */
  worried?: boolean;
  /** Nose twitch (tickled). */
  twitch?: boolean;
};

const ARM_SHOULDER = { x: 290, y: 345 };
const ARM_VEC = { x: 110, y: 40 };
const ARM_RAISE_DEG = 42;

/** Top of the raised paw, in the lion's 400×400 space (lying pose). */
export const lionPawTop = (pawUp: number) => {
  const a = (-ARM_RAISE_DEG * pawUp * Math.PI) / 180;
  const x = ARM_SHOULDER.x + ARM_VEC.x * Math.cos(a) - ARM_VEC.y * Math.sin(a);
  const y = ARM_SHOULDER.y + ARM_VEC.x * Math.sin(a) + ARM_VEC.y * Math.cos(a);
  return { x, y: y - 22 };
};

/** Convert a point in the lion's 400×400 space to composition pixels. */
export const lionToScene = (p: Placed, v: { x: number; y: number }) => {
  const size = p.size ?? 200;
  const vx = p.flip ? 400 - v.x : v.x;
  return { x: p.x - size / 2 + (vx * size) / 400, y: p.y - size + (v.y * size) / 400 };
};

export const Lion: React.FC<LionProps> = (props) => {
  const frame = useCurrentFrame();
  const {
    pose = "lie",
    eyes = "open",
    mouthOpen = 0,
    laugh,
    wriggle = 0,
    pawUp = 0,
    walk = 0,
    net = 0,
    netCut = 0,
    worried,
    twitch,
  } = props;
  const lie = pose === "lie";
  const breathe = 1 + Math.sin(frame / (eyes === "closed" ? 22 : 14)) * (eyes === "closed" ? 0.035 : 0.015);
  const shake = wriggle ? Math.sin(frame * 1.9) * wriggle : 0;
  const laughBob = laugh ? Math.abs(Math.sin(frame / 3.5)) * -10 : 0;
  const maneWobble = laugh ? Math.sin(frame / 2.5) * 5 : wriggle ? Math.sin(frame / 2) * 3 : 0;
  const headY = lie ? 70 : 0;
  const bob = walk * Math.abs(Math.sin(frame / 4)) * -12;
  const step = walk * Math.sin(frame / 4) * 10;
  const tailSwing = Math.sin(frame / 11) * (lie ? 6 : 14);
  // blink every ~4s (offset so frame 0 is eyes-open)
  const blinking = eyes !== "closed" && (frame + 50) % 120 < 4;
  const noseTwitch = twitch ? Math.sin(frame / 1.6) * 4 : 0;
  const armAngle = -ARM_RAISE_DEG * pawUp;

  const eye = (cx: number, cy: number, closed: boolean) =>
    closed ? (
      <path d={`M ${cx - 9} ${cy} Q ${cx} ${cy + 8} ${cx + 9} ${cy}`} stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
    ) : (
      <>
        <circle cx={cx} cy={cy} r={8} fill={C.ink} />
        <circle cx={cx + 2.5} cy={cy - 3} r={2.8} fill="#fff" />
      </>
    );

  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <defs>
          <clipPath id="lion-net-clip">
            <ellipse cx={lie ? 340 : 285} cy={lie ? 360 : 330} rx={lie ? 80 : 95} ry={lie ? 50 : 82} />
          </clipPath>
        </defs>
        <g style={{ translate: `${shake}px ${bob}px` }}>
          {/* tail */}
          {lie ? (
            <g>
              <path d={`M 80 345 Q 40 380 14 ${384 - tailSwing}`} stroke={LC.tail} strokeWidth={16} fill="none" strokeLinecap="round" />
              <circle cx={10} cy={382 - tailSwing} r={15} fill={LC.maneDark} />
            </g>
          ) : (
            <g>
              <path d={`M 80 255 Q 30 240 36 ${170 + tailSwing}`} stroke={LC.tail} strokeWidth={16} fill="none" strokeLinecap="round" />
              <circle cx={36} cy={164 + tailSwing} r={16} fill={LC.maneDark} />
            </g>
          )}
          {/* legs (standing) */}
          {!lie ? (
            <g>
              <rect x={100 + step} y={290} width={34} height={102} rx={17} fill={LC.lionFur} />
              <rect x={150 - step} y={290} width={34} height={102} rx={17} fill={LC.lionFur} />
              <rect x={228 + step} y={290} width={34} height={102} rx={17} fill={LC.lionFur} />
              <rect x={268 - step} y={290} width={34} height={102} rx={17} fill={LC.lionFur} />
              {[117 + step, 167 - step, 245 + step, 285 - step].map((x, i) => (
                <ellipse key={i} cx={x + 4} cy={392} rx={22} ry={9} fill={LC.lionBelly} />
              ))}
            </g>
          ) : null}
          {/* body */}
          <g style={{ scale: `1 ${breathe}`, transformOrigin: `190px ${lie ? 392 : 330}px` }}>
            {lie ? (
              <>
                <ellipse cx={190} cy={335} rx={128} ry={58} fill={LC.lionFur} />
                <ellipse cx={210} cy={360} rx={80} ry={28} fill={LC.lionBelly} />
                {/* back leg tucked */}
                <ellipse cx={110} cy={365} rx={52} ry={32} fill={LC.lionFur} />
                <ellipse cx={128} cy={390} rx={34} ry={10} fill={LC.lionBelly} />
              </>
            ) : (
              <>
                <ellipse cx={190} cy={262} rx={118} ry={62} fill={LC.lionFur} />
                <ellipse cx={205} cy={285} rx={74} ry={30} fill={LC.lionBelly} />
              </>
            )}
          </g>
          {/* resting front paw (lying) */}
          {lie ? <ellipse cx={350} cy={390} rx={36} ry={12} fill={LC.lionBelly} /> : null}
          {/* head */}
          <g style={{ translate: `0px ${headY + laughBob}px`, rotate: `${laugh ? -6 : 0}deg`, transformOrigin: "300px 260px" }}>
            {/* mane */}
            <g style={{ rotate: `${maneWobble}deg`, transformOrigin: "300px 190px" }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i / 12) * Math.PI * 2;
                return <circle key={i} cx={300 + Math.cos(a) * 74} cy={190 + Math.sin(a) * 74} r={34} fill={i % 2 ? LC.mane : LC.maneDark} />;
              })}
              <circle cx={300} cy={190} r={82} fill={LC.mane} />
            </g>
            {/* ears */}
            <circle cx={262} cy={140} r={20} fill={LC.lionFur} />
            <circle cx={262} cy={140} r={10} fill={C.pink} />
            <circle cx={336} cy={136} r={20} fill={LC.lionFur} />
            <circle cx={336} cy={136} r={10} fill={C.pink} />
            {/* face */}
            <circle cx={306} cy={196} r={60} fill={LC.lionFur} />
            <ellipse cx={336} cy={222} rx={34} ry={24} fill={LC.lionBelly} />
            {/* brows */}
            {worried ? (
              <g stroke={C.ink} strokeWidth={4} strokeLinecap="round">
                <line x1={282} y1={166} x2={300} y2={160} />
                <line x1={324} y1={158} x2={342} y2={164} />
              </g>
            ) : null}
            {/* eyes */}
            {eye(292, 184, eyes === "closed" || blinking)}
            {eye(334, 182, eyes !== "open" || blinking)}
            {/* cheeks */}
            <circle cx={274} cy={214} r={11} fill={C.pink} opacity={0.75} />
            <circle cx={360} cy={206} r={9} fill={C.pink} opacity={0.6} />
            {/* nose */}
            <g style={{ translate: `0px ${noseTwitch}px` }}>
              <path d="M 340 204 L 362 204 Q 362 214 351 218 Q 340 214 340 204 Z" fill={C.pinkDark} />
            </g>
            {/* mouth */}
            {mouthOpen > 0.15 ? (
              <ellipse cx={350} cy={236} rx={11 + mouthOpen * 3} ry={4 + mouthOpen * 9} fill={C.ink} />
            ) : (
              <path d="M 336 230 Q 343 238 351 230 Q 359 238 366 230" stroke={C.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
            )}
            {/* whisker dots */}
            {[
              [326, 226],
              [322, 236],
              [368, 222],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={2.5} fill={C.ink} opacity={0.4} />
            ))}
          </g>
          {/* raised front paw (lying) */}
          {lie ? (
            <g style={{ rotate: `${armAngle}deg`, transformOrigin: `${ARM_SHOULDER.x}px ${ARM_SHOULDER.y}px` }}>
              <line
                x1={ARM_SHOULDER.x}
                y1={ARM_SHOULDER.y}
                x2={ARM_SHOULDER.x + ARM_VEC.x}
                y2={ARM_SHOULDER.y + ARM_VEC.y}
                stroke={LC.lionFur}
                strokeWidth={36}
                strokeLinecap="round"
              />
              <circle cx={ARM_SHOULDER.x + ARM_VEC.x} cy={ARM_SHOULDER.y + ARM_VEC.y} r={22} fill={LC.lionBelly} />
            </g>
          ) : null}
          {/* tangled net over the front half */}
          {net > 0 ? (
            <g clipPath="url(#lion-net-clip)" opacity={net}>
              {Array.from({ length: 22 }).map((_, i) => {
                const gone = netCut > ((i * 7) % 22) / 22 + 0.001;
                if (gone) return null;
                const off = 170 + (i % 11) * 22;
                return i < 11 ? (
                  <line key={i} x1={off - 120} y1={120} x2={off + 120} y2={420} stroke={LC.rope} strokeWidth={6} strokeLinecap="round" />
                ) : (
                  <line key={i} x1={off + 120} y1={120} x2={off - 120} y2={420} stroke={LC.rope} strokeWidth={6} strokeLinecap="round" />
                );
              })}
            </g>
          ) : null}
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Mouse ───────────────────────────── */

export type MouseProps = Placed & {
  /** Riding her little scooter. */
  scooter?: boolean;
  /** 0..1 scooting wobble. */
  ride?: number;
  walk?: number;
  wave?: boolean;
  mouthOpen?: number;
  nibble?: boolean;
  shake?: number;
  /** Head tilt in degrees. */
  headTilt?: number;
};

export const Mouse: React.FC<MouseProps> = (props) => {
  const frame = useCurrentFrame();
  const { scooter, ride = 0, walk = 0, wave, mouthOpen = 0, nibble, shake = 0, headTilt = 0 } = props;
  const lift = scooter ? 22 : 0;
  const bob = walk * Math.abs(Math.sin(frame / 3)) * -12 + ride * Math.sin(frame / 2) * 2;
  const breathe = 1 + Math.sin(frame / 13) * 0.02;
  const shiver = shake ? Math.sin(frame * 2.5) * shake : 0;
  const tailSwing = Math.sin(frame / 8) * 10;
  const nod = nibble ? Math.sin(frame / 1.8) * 7 : 0;
  const blinking = (frame + 23) % 97 < 4;
  const waveAngle = wave ? -50 + Math.sin(frame / 3) * 28 : 0;
  const stepA = walk * Math.sin(frame / 3) * 6;
  const wheelSpin = ride * frame * 18;

  return (
    <div style={place(props)}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ overflow: "visible" }}>
        {scooter ? (
          <g>
            <rect x={30} y={176} width={130} height={10} rx={5} fill={LC.scooter} />
            <path d="M 150 180 L 166 80" stroke={LC.scooterDark} strokeWidth={8} strokeLinecap="round" />
            <path d="M 152 78 L 182 78" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
            {[44, 160].map((cx) => (
              <g key={cx} style={{ rotate: `${wheelSpin}deg`, transformOrigin: `${cx}px 190px` }}>
                <circle cx={cx} cy={190} r={11} fill={C.ink} />
                <circle cx={cx} cy={190} r={4} fill={C.cream} />
                <rect x={cx - 1.5} y={181} width={3} height={6} fill={C.cream} />
              </g>
            ))}
          </g>
        ) : null}
        <g style={{ translate: `${shiver}px ${bob - lift}px` }}>
          {/* tail */}
          <path d={`M 58 168 C 26 172, 12 ${140 + tailSwing}, 20 ${118 + tailSwing}`} stroke={C.pinkDark} strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* feet */}
          <ellipse cx={80 + stepA} cy={192} rx={15} ry={6} fill={C.pinkDark} />
          <ellipse cx={116 - stepA} cy={192} rx={15} ry={6} fill={C.pinkDark} />
          {/* body */}
          <g style={{ scale: `1 ${breathe}`, transformOrigin: "100px 192px" }}>
            <ellipse cx={96} cy={152} rx={46} ry={40} fill={LC.mouseFur} />
            <ellipse cx={108} cy={160} rx={26} ry={25} fill={LC.mouseBelly} />
            {/* arm: waves, or reaches for the handlebar */}
            <g style={{ rotate: `${scooter ? -55 : waveAngle}deg`, transformOrigin: "116px 138px" }}>
              <ellipse cx={128} cy={148} rx={8} ry={17} fill={LC.mouseFur} style={{ rotate: "-25deg", transformOrigin: "128px 148px" }} />
            </g>
          </g>
          {/* head */}
          <g style={{ rotate: `${headTilt + nod}deg`, transformOrigin: "118px 118px" }}>
            <circle cx={102} cy={62} r={25} fill={LC.mouseFur} />
            <circle cx={102} cy={62} r={15} fill={C.pink} />
            <circle cx={152} cy={56} r={23} fill={LC.mouseFur} />
            <circle cx={152} cy={56} r={13} fill={C.pink} />
            <circle cx={128} cy={96} r={37} fill={LC.mouseFur} />
            <ellipse cx={160} cy={104} rx={21} ry={15} fill={LC.mouseFur} />
            <circle cx={180} cy={101} r={6.5} fill={C.pinkDark} />
            {/* helmet */}
            <path d="M 94 84 Q 96 50 128 50 Q 160 50 162 82 Z" fill={C.mint} />
            <rect x={92} y={78} width={72} height={8} rx={4} fill={C.leafDark} />
            <circle cx={128} cy={62} r={5} fill={C.cream} />
            {/* eye */}
            {blinking ? (
              <path d="M 137 96 Q 144 101 151 96" stroke={C.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
            ) : (
              <>
                <circle cx={144} cy={96} r={6.5} fill={C.ink} />
                <circle cx={146} cy={93.5} r={2.2} fill="#fff" />
              </>
            )}
            <circle cx={140} cy={114} r={8} fill={C.pink} opacity={0.75} />
            {mouthOpen > 0.2 ? (
              <ellipse cx={166} cy={117} rx={5} ry={3 + mouthOpen * 4} fill={C.ink} />
            ) : (
              <path d="M 160 115 Q 166 120 172 115" stroke={C.ink} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            )}
            <g stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" opacity={0.5}>
              <line x1={174} y1={107} x2={196} y2={103} />
              <line x1={174} y1={111} x2={196} y2={115} />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Props ───────────────────────────── */

/** Parked scooter (no rider). */
export const Scooter: React.FC<{ x: number; y: number; size?: number; flip?: boolean }> = ({ x, y, size = 140, flip }) => (
  <div style={place({ x, y, size, flip })}>
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <rect x={30} y={176} width={130} height={10} rx={5} fill={LC.scooter} />
      <path d="M 150 180 L 166 80" stroke={LC.scooterDark} strokeWidth={8} strokeLinecap="round" />
      <path d="M 152 78 L 182 78" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      <circle cx={44} cy={190} r={11} fill={C.ink} />
      <circle cx={160} cy={190} r={11} fill={C.ink} />
      <circle cx={44} cy={190} r={4} fill={C.cream} />
      <circle cx={160} cy={190} r={4} fill={C.cream} />
    </svg>
  </div>
);

export type LitterKind = "can" | "bottle" | "paper" | "rope";

/** A bit of litter, drawn centred on (x, y). */
export const Litter: React.FC<{ kind: LitterKind; x: number; y: number; size?: number; rotate?: number; opacity?: number }> = ({
  kind,
  x,
  y,
  size = 70,
  rotate = 0,
  opacity = 1,
}) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    style={{ position: "absolute", left: x - size / 2, top: y - size / 2, rotate: `${rotate}deg`, opacity }}
  >
    {kind === "can" ? (
      <g>
        <rect x={30} y={18} width={40} height={66} rx={8} fill={C.blue} />
        <rect x={30} y={40} width={40} height={18} fill={C.cream} />
        <rect x={34} y={12} width={32} height={8} rx={3} fill={C.lavenderDark} />
      </g>
    ) : kind === "bottle" ? (
      <g>
        <rect x={40} y={8} width={20} height={14} rx={4} fill={C.leafDark} />
        <path d="M 40 22 L 60 22 Q 72 34 72 48 L 72 88 Q 72 94 66 94 L 34 94 Q 28 94 28 88 L 28 48 Q 28 34 40 22 Z" fill={C.mint} />
        <rect x={28} y={56} width={44} height={16} fill={C.cream} opacity={0.8} />
      </g>
    ) : kind === "paper" ? (
      <g>
        <circle cx={50} cy={54} r={32} fill={C.cream} />
        <path d="M 30 44 L 52 58 L 44 30 M 56 40 L 70 62" stroke={C.lavender} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    ) : (
      <g>
        <ellipse cx={50} cy={60} rx={40} ry={26} fill="none" stroke={LC.rope} strokeWidth={7} />
        <ellipse cx={50} cy={56} rx={26} ry={16} fill="none" stroke={LC.rope} strokeWidth={6} />
        <path d="M 20 60 Q 50 20 80 60" stroke={LC.rope} strokeWidth={5} fill="none" />
      </g>
    )}
  </svg>
);

/** A recycling bin, feet at (x, y). `bump` 0..1 squashes it when something lands in. */
export const RecyclingBin: React.FC<{ x: number; y: number; color: string; size?: number; bump?: number }> = ({
  x,
  y,
  color,
  size = 220,
  bump = 0,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size,
      width: size,
      height: size,
      transformOrigin: "50% 100%",
      scale: `${1 + bump * 0.08} ${1 - bump * 0.08}`,
    }}
  >
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path d="M 18 26 L 82 26 L 76 96 L 24 96 Z" fill={color} />
      <rect x={12} y={16} width={76} height={14} rx={7} fill={C.ink} opacity={0.75} />
      <rect x={40} y={8} width={20} height={10} rx={5} fill={C.ink} opacity={0.75} />
      {/* simple loop-of-arrows mark */}
      <g fill="none" stroke={C.cream} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M 40 72 L 50 54 L 60 72 Z" />
        <path d="M 46 52 L 50 54 L 48 59" />
      </g>
    </svg>
  </div>
);
