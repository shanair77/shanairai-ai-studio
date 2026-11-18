/**
 * The Tortoise and the Hare (2026 Edition) — flat pastel characters and props
 * (inline SVG, frame-driven).
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { C, place, type Placed } from "../../kit";

/** Story-specific pastel colours. */
export const TC = {
  shell: "#A9D9BF",
  shellLight: "#CBEBD8",
  shellDark: "#8CC7A8",
  rim: "#F3DDA0",
  skin: "#D9EAB4",
  skinDark: "#C2DA93",
  hareFur: "#EAD6C3",
  hareFurDark: "#DABFA6",
  hareBelly: "#FBF2E7",
  sneaker: "#9CC6F0",
  sneakerDark: "#7FB0E2",
  phone: "#BFAEE6",
  screen: "#F4F8FF",
  path: "#F5E4C8",
  pathEdge: "#E9D1AC",
  duck: "#FFF1B8",
  beak: "#FFC59E",
  squirrel: "#E8B99A",
  squirrelDark: "#D9A281",
  drone: "#C9D3E6",
  droneDark: "#A9B5CF",
  rec: "#F59AA8",
  gold: "#F7D46B",
};

/** Convert a point in a character's 400×400 space to composition pixels. */
export const toScene = (p: Placed, v: { x: number; y: number }) => {
  const size = p.size ?? 200;
  const vx = p.flip ? 400 - v.x : v.x;
  return { x: p.x - size / 2 + (vx * size) / 400, y: p.y - size + (v.y * size) / 400 };
};

/* ───────────────────────────── Tortoise ───────────────────────────── */

export type TortoiseProps = Placed & {
  /** 0..1 walking (legs step, shell bobs). */
  walk?: number;
  mouthOpen?: number;
  eyes?: "open" | "closed" | "happy";
  /** Degrees; positive looks up. */
  headTilt?: number;
  /** 0..1 watch glow (a beep). */
  beep?: number;
  /** Wearing the gold medal. */
  medal?: boolean;
  /** Front leg waves. */
  wave?: boolean;
};

export const Tortoise: React.FC<TortoiseProps> = (props) => {
  const frame = useCurrentFrame();
  const { walk = 0, mouthOpen = 0, eyes = "open", headTilt = 0, beep = 0, medal, wave } = props;
  const ph = frame / 7;
  const bob = walk * Math.abs(Math.sin(ph)) * -5;
  const stepA = walk * Math.sin(ph) * 9;
  const liftA = walk * Math.max(0, Math.sin(ph)) * -8;
  const liftB = walk * Math.max(0, -Math.sin(ph)) * -8;
  const breathe = 1 + Math.sin(frame / 16) * 0.015;
  const blinking = eyes === "open" && (frame + 40) % 110 < 4;
  const headBob = walk * Math.sin(ph * 2) * 2;
  const waveAngle = wave ? -55 + Math.sin(frame / 3) * 20 : 0;

  const leg = (x: number, dx: number, dy: number, key: string, rot = 0) => (
    <g key={key} style={{ translate: `${dx}px ${dy}px`, rotate: `${rot}deg`, transformOrigin: `${x + 23}px 330px` }}>
      <rect x={x} y={322} width={46} height={68} rx={22} fill={TC.skin} />
      <ellipse cx={x + 26} cy={388} rx={26} ry={9} fill={TC.skinDark} />
    </g>
  );

  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${bob}px` }}>
          {/* tail */}
          <path d="M 44 330 L 14 348 L 46 350 Z" fill={TC.skin} />
          {/* back legs */}
          {leg(70, -stepA, liftB, "bl")}
          {leg(130, stepA, liftA, "bl2")}
          {/* head and neck */}
          <g style={{ rotate: `${-headTilt}deg`, translate: `0px ${headBob}px`, transformOrigin: "318px 300px" }}>
            <ellipse cx={322} cy={296} rx={40} ry={32} fill={TC.skin} />
            <circle cx={352} cy={248} r={48} fill={TC.skin} />
            {/* sweatband */}
            <path d="M 308 232 Q 350 196 396 226" stroke={C.pinkDark} strokeWidth={13} fill="none" strokeLinecap="round" />
            {/* eye */}
            {eyes === "happy" || eyes === "closed" || blinking ? (
              <path
                d={eyes === "happy" ? "M 356 246 Q 366 236 376 246" : "M 356 244 Q 366 252 376 244"}
                stroke={C.ink}
                strokeWidth={4.5}
                fill="none"
                strokeLinecap="round"
              />
            ) : (
              <>
                <circle cx={366} cy={244} r={9} fill={C.ink} />
                <circle cx={369} cy={240} r={3} fill="#fff" />
              </>
            )}
            <circle cx={352} cy={272} r={10} fill={C.pink} opacity={0.75} />
            {mouthOpen > 0.15 ? (
              <ellipse cx={384} cy={272} rx={8} ry={3 + mouthOpen * 7} fill={C.ink} />
            ) : (
              <path d="M 372 268 Q 384 278 394 266" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
            )}
          </g>
          {/* shell */}
          <g style={{ scale: `1 ${breathe}`, transformOrigin: "185px 340px" }}>
            <path d="M 40 340 Q 44 160 185 158 Q 326 160 330 340 Z" fill={TC.shell} />
            <circle cx={185} cy={252} r={42} fill={TC.shellLight} />
            <circle cx={104} cy={298} r={26} fill={TC.shellLight} />
            <circle cx={266} cy={298} r={26} fill={TC.shellLight} />
            <circle cx={128} cy={214} r={21} fill={TC.shellLight} />
            <circle cx={242} cy={214} r={21} fill={TC.shellLight} />
            <path d="M 80 200 Q 120 170 160 166" stroke="#fff" strokeWidth={8} opacity={0.45} fill="none" strokeLinecap="round" />
            <rect x={30} y={322} width={310} height={30} rx={15} fill={TC.rim} />
          </g>
          {/* front legs (the front-most one wears the step-counter watch) */}
          {leg(214, -stepA, liftB, "fl")}
          <g style={{ translate: `${stepA}px ${liftA}px`, rotate: `${waveAngle}deg`, transformOrigin: "297px 330px" }}>
            <rect x={274} y={322} width={46} height={68} rx={22} fill={TC.skin} />
            <ellipse cx={300} cy={388} rx={26} ry={9} fill={TC.skinDark} />
            <circle cx={297} cy={356} r={10 + beep * 22} fill={C.butter} opacity={beep * 0.8} />
            <rect x={270} y={350} width={54} height={14} rx={7} fill={C.lavenderDark} />
            <rect x={284} y={343} width={26} height={27} rx={7} fill={TC.screen} stroke={C.ink} strokeWidth={2.5} />
            <rect x={289} y={353} width={16} height={6} rx={3} fill={beep > 0.2 ? C.leafDark : C.lavender} />
          </g>
          {/* medal */}
          {medal ? (
            <g>
              <path d="M 300 286 L 318 330 L 336 286" stroke={C.pinkDark} strokeWidth={9} fill="none" strokeLinejoin="round" />
              <circle cx={318} cy={338} r={20} fill={TC.gold} stroke={C.butterDark} strokeWidth={4} />
              <path d="M 318 326 L 322 335 L 331 336 L 324 342 L 326 351 L 318 346 L 310 351 L 312 342 L 305 336 L 314 335 Z" fill="#fff" opacity={0.8} />
            </g>
          ) : null}
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Hare ───────────────────────────── */

export type HareProps = Placed & {
  pose?: "stand" | "run" | "sit";
  eyes?: "open" | "closed" | "sleepy" | "wide";
  mouthOpen?: number;
  /** Hopping/bouncing on the spot, 0..1. */
  bounce?: number;
  /** Laughing: head bobs back. */
  laugh?: boolean;
  /** 0..1 raises the phone in front of the face. */
  phone?: number;
  /** What the phone screen shows. */
  screen?: "camera" | "video" | "off";
  /** 0..1 white camera flash at the phone. */
  flash?: number;
  /** Phone resting on the tummy (asleep). */
  phoneOnTummy?: boolean;
  /** Ears flop down (sleepy). */
  droop?: number;
  /** Arm waves. */
  wave?: boolean;
  /** Puffing (out of breath). */
  pant?: boolean;
  /** Head tilt in degrees. */
  headTilt?: number;
};

const SHOULDER = { x: 232, y: 216 };
const ARM = { x: 20, y: 76 };

const PhoneShape: React.FC<{ screen: "camera" | "video" | "off"; frame: number }> = ({ screen, frame }) => {
  const hue = [C.pink, C.butter, C.mint, C.blue][Math.floor(frame / 12) % 4];
  return (
    <g>
      <rect x={-22} y={-38} width={44} height={76} rx={10} fill={TC.phone} />
      <rect x={-17} y={-32} width={34} height={62} rx={6} fill={screen === "video" ? hue : TC.screen} />
      {screen === "video" ? <path d="M -6 -10 L 10 0 L -6 10 Z" fill="#fff" /> : null}
      {screen === "camera" ? <circle cx={0} cy={0} r={9} fill="none" stroke={C.lavenderDark} strokeWidth={4} /> : null}
    </g>
  );
};

export const Hare: React.FC<HareProps> = (props) => {
  const frame = useCurrentFrame();
  const {
    pose = "stand",
    eyes = "open",
    mouthOpen = 0,
    bounce = 0,
    laugh,
    phone = 0,
    screen = "camera",
    flash = 0,
    phoneOnTummy,
    droop = 0,
    wave,
    pant,
    headTilt = 0,
  } = props;
  const sit = pose === "sit";
  const run = pose === "run";
  const hop = bounce * Math.abs(Math.sin(frame / 5)) * -26;
  const breathe = 1 + Math.sin(frame / (pant ? 4 : eyes === "closed" ? 22 : 13)) * (pant ? 0.05 : 0.025);
  const blinking = eyes === "open" && (frame + 17) % 100 < 4;
  const laughBob = laugh ? Math.abs(Math.sin(frame / 3.5)) * -8 : 0;
  const legSwing = run ? Math.sin(frame / 2.2) * 38 : 0;
  const earBase = run ? -38 : -droop * 62;
  const earWiggle = Math.sin(frame / 9) * 3;
  const head = sit ? { dx: -8, dy: 64 } : { dx: 0, dy: 0 };
  // arm: 0 = down by the side, phone raises it in front of the face
  const armAngle = wave ? -150 + Math.sin(frame / 3) * 22 : run ? Math.sin(frame / 2.2) * 40 : -112 * phone;
  const sh = sit ? { x: SHOULDER.x - 6, y: SHOULDER.y + 64 } : SHOULDER;
  const a = (armAngle * Math.PI) / 180;
  const paw = {
    x: sh.x + ARM.x * Math.cos(a) - ARM.y * Math.sin(a),
    y: sh.y + ARM.x * Math.sin(a) + ARM.y * Math.cos(a),
  };

  const eye = () => {
    const cx = 252;
    const cy = 128;
    if (eyes === "closed" || blinking)
      return <path d={`M ${cx - 10} ${cy} Q ${cx} ${cy + 9} ${cx + 10} ${cy}`} stroke={C.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    if (eyes === "sleepy")
      return (
        <>
          <ellipse cx={cx} cy={cy + 3} rx={9} ry={5} fill={C.ink} />
          <path d={`M ${cx - 12} ${cy} L ${cx + 12} ${cy}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        </>
      );
    const r = eyes === "wide" ? 12 : 9;
    return (
      <>
        {eyes === "wide" ? <circle cx={cx} cy={cy} r={r + 6} fill="#fff" /> : null}
        <circle cx={cx} cy={cy} r={r} fill={C.ink} />
        <circle cx={cx + 3} cy={cy - 4} r={3.2} fill="#fff" />
      </>
    );
  };

  return (
    <div style={place(props)}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${hop}px`, rotate: `${run ? 10 : 0}deg`, transformOrigin: "200px 396px" }}>
          {/* tail */}
          <circle cx={sit ? 118 : 130} cy={sit ? 360 : 296} r={22} fill="#fff" />
          {/* legs */}
          {sit ? (
            <g>
              <ellipse cx={232} cy={364} rx={56} ry={26} fill={TC.hareFurDark} />
              <ellipse cx={292} cy={384} rx={32} ry={14} fill={TC.sneaker} />
              <rect x={262} y={392} width={60} height={6} rx={3} fill="#fff" />
            </g>
          ) : (
            [
              { x: 168, s: legSwing },
              { x: 214, s: -legSwing },
            ].map((l, i) => (
              <g key={i} style={{ rotate: `${l.s}deg`, transformOrigin: `${l.x + 15}px 318px` }}>
                <rect x={l.x} y={306} width={30} height={80} rx={15} fill={i ? TC.hareFur : TC.hareFurDark} />
                <ellipse cx={l.x + 24} cy={386} rx={30} ry={13} fill={i ? TC.sneaker : TC.sneakerDark} />
                <rect x={l.x - 4} y={393} width={58} height={6} rx={3} fill="#fff" />
              </g>
            ))
          )}
          {/* body */}
          <g style={{ scale: `1 ${breathe}`, transformOrigin: `200px ${sit ? 390 : 340}px` }}>
            {sit ? (
              <>
                <ellipse cx={192} cy={318} rx={74} ry={70} fill={TC.hareFur} />
                <ellipse cx={210} cy={330} rx={44} ry={46} fill={TC.hareBelly} />
              </>
            ) : (
              <>
                <ellipse cx={196} cy={254} rx={68} ry={84} fill={TC.hareFur} />
                <ellipse cx={212} cy={272} rx={40} ry={56} fill={TC.hareBelly} />
              </>
            )}
          </g>
          {phoneOnTummy ? (
            <g style={{ translate: "212px 322px", rotate: "-70deg" }}>
              <PhoneShape screen="off" frame={frame} />
            </g>
          ) : null}
          {/* head */}
          <g
            style={{
              translate: `${head.dx}px ${head.dy + laughBob}px`,
              rotate: `${headTilt + (laugh ? -8 : 0)}deg`,
              transformOrigin: "225px 190px",
            }}
          >
            {/* ears */}
            <g style={{ rotate: `${earBase - 6 + earWiggle}deg`, transformOrigin: "208px 98px" }}>
              <ellipse cx={200} cy={40} rx={21} ry={62} fill={TC.hareFur} />
              <ellipse cx={200} cy={46} rx={9} ry={44} fill={C.pink} />
            </g>
            <g style={{ rotate: `${earBase * 0.8 + 10 - earWiggle}deg`, transformOrigin: "240px 96px" }}>
              <ellipse cx={246} cy={36} rx={21} ry={62} fill={TC.hareFur} />
              <ellipse cx={246} cy={42} rx={9} ry={44} fill={C.pink} />
            </g>
            <circle cx={226} cy={142} r={58} fill={TC.hareFur} />
            <ellipse cx={266} cy={164} rx={32} ry={23} fill={TC.hareBelly} />
            {eye()}
            <circle cx={238} cy={168} r={11} fill={C.pink} opacity={0.75} />
            <ellipse cx={292} cy={154} rx={8} ry={6.5} fill={C.pinkDark} />
            {mouthOpen > 0.15 ? (
              <>
                <ellipse cx={282} cy={178} rx={9 + mouthOpen * 2} ry={4 + mouthOpen * 9} fill={C.ink} />
                <rect x={276} y={170} width={12} height={8} rx={2} fill="#fff" />
              </>
            ) : (
              <path d="M 270 174 Q 278 182 286 174 Q 292 180 298 172" stroke={C.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
            )}
            <g stroke={C.ink} strokeWidth={2} strokeLinecap="round" opacity={0.45}>
              <line x1={298} y1={160} x2={326} y2={152} />
              <line x1={298} y1={166} x2={326} y2={170} />
            </g>
            {pant ? (
              <path d="M 196 92 Q 188 108 196 116 Q 204 108 196 92 Z" fill={C.blue} opacity={0.5 + Math.abs(Math.sin(frame / 5)) * 0.5} />
            ) : null}
          </g>
          {/* arm (holds the phone) */}
          <line x1={sh.x} y1={sh.y} x2={paw.x} y2={paw.y} stroke={TC.hareFur} strokeWidth={28} strokeLinecap="round" />
          <circle cx={paw.x} cy={paw.y} r={17} fill={TC.hareBelly} />
          {phone > 0.05 ? (
            <g style={{ translate: `${paw.x + 14}px ${paw.y - 26}px`, rotate: "8deg" }}>
              <PhoneShape screen={screen} frame={frame} />
              {flash > 0 ? (
                <circle cx={0} cy={-10} r={20 + flash * 50} fill="#fff" opacity={flash * 0.9} />
              ) : null}
            </g>
          ) : null}
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Park friends ───────────────────────────── */

/** A duck spectator, feet at (x, y). `cheer` bounces and flaps. */
export const Duck: React.FC<Placed & { cheer?: boolean; seed?: number }> = (props) => {
  const frame = useCurrentFrame();
  const { cheer, seed = 0 } = props;
  const bob = cheer ? Math.abs(Math.sin((frame + seed * 7) / 4)) * -10 : Math.sin((frame + seed * 11) / 12) * 2;
  const flap = cheer ? Math.sin((frame + seed * 5) / 2.5) * 30 : 0;
  const blink = (frame + seed * 31) % 90 < 4;
  return (
    <div style={place(props)}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${bob}px` }}>
          <ellipse cx={34} cy={96} rx={8} ry={4} fill={TC.beak} />
          <ellipse cx={54} cy={96} rx={8} ry={4} fill={TC.beak} />
          <ellipse cx={46} cy={72} rx={32} ry={22} fill={TC.duck} />
          <g style={{ rotate: `${-flap}deg`, transformOrigin: "40px 70px" }}>
            <ellipse cx={34} cy={72} rx={16} ry={10} fill={C.butterDark} />
          </g>
          <circle cx={64} cy={42} r={18} fill={TC.duck} />
          <ellipse cx={84} cy={46} rx={12} ry={6} fill={TC.beak} />
          {blink ? (
            <path d="M 64 38 Q 68 41 72 38" stroke={C.ink} strokeWidth={2.5} fill="none" />
          ) : (
            <circle cx={68} cy={38} r={3.5} fill={C.ink} />
          )}
        </g>
      </svg>
    </div>
  );
};

/** A squirrel (the race starter), feet at (x, y). `flagUp` 0..1 raises the start flag. */
export const Squirrel: React.FC<Placed & { flagUp?: number; mouthOpen?: number; cheer?: boolean }> = (props) => {
  const frame = useCurrentFrame();
  const { flagUp = 0, mouthOpen = 0, cheer } = props;
  const bob = cheer ? Math.abs(Math.sin(frame / 4)) * -10 : 0;
  const tailSwing = Math.sin(frame / 10) * 5;
  const blink = (frame + 9) % 104 < 4;
  const arm = -20 - flagUp * 120 + (cheer ? Math.sin(frame / 3) * 20 : 0);
  return (
    <div style={place(props)}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${bob}px` }}>
          <g style={{ rotate: `${tailSwing}deg`, transformOrigin: "30px 88px" }}>
            <path d="M 34 92 Q 2 90 6 56 Q 8 28 30 30 Q 46 34 36 50 Q 24 54 28 70 Q 32 84 44 88 Z" fill={TC.squirrelDark} />
          </g>
          <ellipse cx={52} cy={74} rx={20} ry={24} fill={TC.squirrel} />
          <ellipse cx={58} cy={80} rx={11} ry={15} fill={C.cream} />
          <ellipse cx={46} cy={97} rx={9} ry={4} fill={TC.squirrelDark} />
          <ellipse cx={62} cy={97} rx={9} ry={4} fill={TC.squirrelDark} />
          <circle cx={58} cy={42} r={16} fill={TC.squirrel} />
          <ellipse cx={50} cy={26} rx={5} ry={8} fill={TC.squirrelDark} />
          <ellipse cx={66} cy={27} rx={5} ry={8} fill={TC.squirrelDark} />
          {blink ? (
            <path d="M 60 40 Q 64 43 68 40" stroke={C.ink} strokeWidth={2.5} fill="none" />
          ) : (
            <circle cx={64} cy={40} r={3.4} fill={C.ink} />
          )}
          <circle cx={73} cy={46} r={2.6} fill={C.pinkDark} />
          {mouthOpen > 0.2 ? <ellipse cx={70} cy={52} rx={3} ry={1.5 + mouthOpen * 3} fill={C.ink} /> : null}
          <g style={{ rotate: `${arm}deg`, transformOrigin: "62px 64px" }}>
            <line x1={62} y1={64} x2={62} y2={84} stroke={TC.squirrel} strokeWidth={8} strokeLinecap="round" />
            <line x1={62} y1={84} x2={62} y2={118} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
            <path d="M 62 118 L 90 112 L 88 126 L 62 130 Z" fill={C.pinkDark} />
          </g>
        </g>
      </svg>
    </div>
  );
};

/** The little camera drone, centred on (x, y). */
export const Drone: React.FC<{ x: number; y: number; size?: number; flip?: boolean }> = ({ x, y, size = 180, flip }) => {
  const frame = useCurrentFrame();
  const spin = Math.abs(Math.sin(frame / 1.3));
  const hover = Math.sin(frame / 10) * 8;
  const rec = Math.floor(frame / 15) % 2 === 0;
  return (
    <svg
      viewBox="-100 -60 200 120"
      width={size}
      height={size * 0.6}
      style={{ position: "absolute", left: x - size / 2, top: y - size * 0.3 + hover, scale: flip ? "-1 1" : "1 1", overflow: "visible" }}
    >
      <line x1={-70} y1={-22} x2={70} y2={-22} stroke={TC.droneDark} strokeWidth={8} strokeLinecap="round" />
      <line x1={-70} y1={-22} x2={-70} y2={-34} stroke={TC.droneDark} strokeWidth={6} />
      <line x1={70} y1={-22} x2={70} y2={-34} stroke={TC.droneDark} strokeWidth={6} />
      <ellipse cx={-70} cy={-38} rx={10 + spin * 26} ry={5} fill={C.lavender} opacity={0.85} />
      <ellipse cx={70} cy={-38} rx={36 - spin * 26} ry={5} fill={C.lavender} opacity={0.85} />
      <rect x={-40} y={-30} width={80} height={36} rx={16} fill={TC.drone} />
      <circle cx={24} cy={-14} r={5} fill={rec ? TC.rec : C.cream} />
      <rect x={-12} y={4} width={24} height={14} rx={5} fill={TC.droneDark} />
      <circle cx={0} cy={18} r={11} fill={C.ink} />
      <circle cx={3} cy={15} r={3.5} fill="#fff" opacity={0.8} />
    </svg>
  );
};
