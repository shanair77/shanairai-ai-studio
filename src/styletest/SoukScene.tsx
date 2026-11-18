/**
 * A Marrakech souk alley drawn entirely in SVG, in two skins:
 *  - "flat":  bold flat-vector shapes, no outlines, one slow camera push-in.
 *  - "paper": the same geometry as layered cut paper — drop shadows, ragged edges,
 *             paper grain, layers drifting at different speeds, brass split-pin joints.
 *
 * One-point perspective: everything is placed by depth t (0 = near, 1 = far opening).
 */

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

type Variant = "flat" | "paper";

const VP = { x: 540, y: 780 };
const FAR = { l: 400, r: 680, t: 560, b: 1000 };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const depthScale = (t: number) => 1 - 0.78 * t;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PALETTE = {
  flat: {
    sky: "#ffe2a0",
    archFrame: "#b8532f",
    wallL: "#d9774b",
    wallR: "#c96840",
    floor: "#e8b27a",
    floorLine: "#d89a5f",
    ceiling: "#6b3f24",
    beam: "#fff1c4",
    rugs: ["#b8322a", "#2f6f8f", "#e3a72f", "#5b8c5a", "#7b3f6e"],
    rugTrim: "#f7e7c6",
    spices: ["#e8a317", "#c8401f", "#a5562b", "#6f8f3a", "#d96c2c"],
    basket: "#8a5a32",
    brass: "#d9a441",
    glow: "#ffcf5a",
    glass: ["#e0402f", "#2e9a7a", "#3a6fd1", "#f2b01e"],
    shirt: "#2f8f8a",
    pants: "#3d3a55",
    skin: "#7a4b30",
    hair: "#2b1d16",
    hat: "#d8b47a",
    hatBand: "#7a4b2a",
    pack: "#e3a72f",
    packDark: "#b98420",
  },
  paper: {
    sky: "#f6dca2",
    archFrame: "#a95a3c",
    wallL: "#cf8a63",
    wallR: "#bd7a55",
    floor: "#e2bd8e",
    floorLine: "#cfa676",
    ceiling: "#6e4a33",
    beam: "#fbeccb",
    rugs: ["#a8443a", "#3f7088", "#d6a443", "#62845e", "#7d4a6c"],
    rugTrim: "#f1e2c2",
    spices: ["#d9a23a", "#b9503a", "#9a6340", "#748a4a", "#cf7a3e"],
    basket: "#86603d",
    brass: "#c99c4e",
    glow: "#f7d27a",
    glass: ["#c9503f", "#3d8f78", "#4a6fb5", "#e0ac3a"],
    shirt: "#3f8580",
    pants: "#46435a",
    skin: "#7d5038",
    hair: "#33241b",
    hat: "#d4b585",
    hatBand: "#7a5235",
    pack: "#d9a443",
    packDark: "#b48632",
  },
};

/** A quad on a side wall between depths t1..t2 and vertical fractions v1..v2 (0 = top). */
const wallQuad = (side: "l" | "r", t1: number, t2: number, v1: number, v2: number) => {
  const nearX = side === "l" ? -10 : 1090;
  const farX = side === "l" ? FAR.l : FAR.r;
  const pt = (t: number, v: number) => {
    const x = lerp(nearX, farX, t);
    const top = lerp(-60, FAR.t, t);
    const bot = lerp(1760, FAR.b, t);
    return `${x.toFixed(1)},${lerp(top, bot, v).toFixed(1)}`;
  };
  return [pt(t1, v1), pt(t2, v1), pt(t2, v2), pt(t1, v2)].join(" ");
};

const floorPoint = (side: "l" | "r", t: number, inset: number) => {
  const nearX = side === "l" ? -10 : 1090;
  const farX = side === "l" ? FAR.l : FAR.r;
  const s = depthScale(t);
  return { x: lerp(nearX, farX, t) + (side === "l" ? inset : -inset) * s, y: lerp(1760, FAR.b, t), s };
};

const Lantern: React.FC<{ x: number; y: number; s: number; f: number; i: number; v: Variant }> = ({ x, y, s, f, i, v }) => {
  const P = PALETTE[v];
  const swing = Math.sin(f * 0.05 + i * 1.7) * 5;
  const flicker = 0.75 + Math.sin(f * 0.31 + i * 2.3) * 0.12 + Math.sin(f * 0.17 + i) * 0.08;
  const glass = P.glass[i % P.glass.length];
  const string = 120 + (i % 3) * 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${s})`}>
      <line x1={0} y1={0} x2={0} y2={string} stroke={P.ceiling} strokeWidth={4} />
      <circle cx={0} cy={string + 70} r={120} fill={`url(#glow-${v})`} opacity={flicker} />
      <g transform={`translate(0 ${string})`}>
        <path d="M -10 0 L 10 0 L 16 18 L -16 18 Z" fill={P.brass} />
        <path d="M -16 18 Q -52 50 -40 95 Q -28 125 0 135 Q 28 125 40 95 Q 52 50 16 18 Z" fill={glass} />
        <path d="M -16 18 Q -52 50 -40 95 Q -28 125 0 135 Q 28 125 40 95 Q 52 50 16 18 Z" fill={P.glow} opacity={0.35 * flicker} />
        {[-22, 0, 22].map((dx) => (
          <line key={dx} x1={dx * 0.6} y1={22} x2={dx} y2={128} stroke={P.brass} strokeWidth={5} />
        ))}
        <path d="M -24 135 L 24 135 L 8 158 L -8 158 Z" fill={P.brass} />
        <circle cx={0} cy={168} r={8} fill={P.brass} />
        {v === "paper" ? (
          <>
            {[30, 55, 80, 105].map((py) => (
              <circle key={py} cx={(py % 20) - 10} cy={py} r={4} fill={P.glow} opacity={0.9} />
            ))}
          </>
        ) : null}
      </g>
    </g>
  );
};

const SpiceBasket: React.FC<{ x: number; y: number; s: number; v: Variant; seed: number }> = ({ x, y, s, v, seed }) => {
  const P = PALETTE[v];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-70, 0, 70].map((dx, k) => {
        const c = P.spices[(seed + k) % P.spices.length];
        return (
          <g key={dx} transform={`translate(${dx} 0)`}>
            <path d="M -38 0 Q 0 -112 38 0 Z" fill={c} />
            <ellipse cx={0} cy={2} rx={44} ry={14} fill={P.basket} />
          </g>
        );
      })}
    </g>
  );
};

/** The traveler, from behind: wide-brim hat, mustard backpack, no face. Origin = feet. */
const Traveler: React.FC<{ x: number; y: number; s: number; f: number; v: Variant }> = ({ x, y, s, f, v }) => {
  const P = PALETTE[v];
  const step = Math.sin(f * 0.22);
  const bob = Math.abs(Math.cos(f * 0.22)) * 6;
  const pin = (cx: number, cy: number) =>
    v === "paper" ? <circle cx={cx} cy={cy} r={7} fill="#c9a04a" stroke="#7d6128" strokeWidth={2} /> : null;
  return (
    <g transform={`translate(${x} ${y - bob * s}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={90} ry={16} fill="#000" opacity={0.15} />
      {/* legs: the stepping leg lifts and shortens (it's moving away from us) */}
      <rect x={-46} y={-190 + Math.max(0, step) * 22} width={40} height={190 - Math.max(0, step) * 30} rx={18} fill={P.pants} />
      <rect x={6} y={-190 + Math.max(0, -step) * 22} width={40} height={190 - Math.max(0, -step) * 30} rx={18} fill={P.pants} />
      {/* arms */}
      <g transform={`rotate(${step * 10} -62 -330)`}>
        <rect x={-84} y={-335} width={34} height={150} rx={17} fill={P.shirt} />
        <circle cx={-67} cy={-182} r={17} fill={P.skin} />
      </g>
      <g transform={`rotate(${-step * 10} 62 -330)`}>
        <rect x={50} y={-335} width={34} height={150} rx={17} fill={P.shirt} />
        <circle cx={67} cy={-182} r={17} fill={P.skin} />
      </g>
      {/* torso */}
      <rect x={-62} y={-350} width={124} height={180} rx={34} fill={P.shirt} />
      {/* backpack */}
      <rect x={-56} y={-338} width={112} height={150} rx={30} fill={P.pack} />
      <rect x={-56} y={-338} width={112} height={56} rx={26} fill={P.packDark} />
      <rect x={-34} y={-250} width={68} height={44} rx={12} fill={P.packDark} />
      <circle cx={0} cy={-284} r={7} fill={P.pants} />
      {/* head from behind: hair, then the hat */}
      <circle cx={0} cy={-392} r={44} fill={P.hair} />
      <ellipse cx={0} cy={-416} rx={96} ry={24} fill={P.hat} />
      <path d="M -50 -418 Q -48 -476 0 -478 Q 48 -476 50 -418 Z" fill={P.hat} />
      <rect x={-50} y={-436} width={100} height={14} fill={P.hatBand} />
      {pin(-62, -330)}
      {pin(62, -330)}
      {pin(-26, -186)}
      {pin(26, -186)}
    </g>
  );
};

export const SoukScene: React.FC<{ variant: Variant; durationInFrames: number }> = ({ variant: v, durationInFrames }) => {
  const f = useCurrentFrame();
  const P = PALETTE[v];
  const t = interpolate(f, [0, durationInFrames], [0, 1], clamp);
  // Camera push. Paper layers drift at different rates for a parallax feel.
  const push = (amount: number) => `translate(${VP.x} ${VP.y}) scale(${1 + amount * t}) translate(${-VP.x} ${-VP.y})`;
  const layer = (amount: number) => (v === "paper" ? push(amount) : push(0.06));
  const paperFx = v === "paper" ? "url(#paper-fx)" : undefined;

  const walk = interpolate(f, [0, durationInFrames], [0, 0.42], clamp);
  const trav = { x: 540 + Math.sin(f * 0.02) * 10, y: lerp(1780, FAR.b, walk), s: 1.05 * depthScale(walk) };

  const lanterns = [
    { x: 300, t: 0.15 }, { x: 760, t: 0.1 }, { x: 520, t: 0.3 }, { x: 410, t: 0.5 }, { x: 650, t: 0.45 },
    { x: 560, t: 0.65 }, { x: 470, t: 0.8 }, { x: 610, t: 0.85 }, { x: 180, t: 0.05 }, { x: 900, t: 0.25 },
  ];

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
      <defs>
        <radialGradient id={`glow-${v}`}>
          <stop offset="0%" stopColor={P.glow} stopOpacity={0.9} />
          <stop offset="100%" stopColor={P.glow} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`sky-${v}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff6d8" />
          <stop offset="100%" stopColor={P.sky} />
        </linearGradient>
        <filter id="paper-fx" x="-5%" y="-5%" width="110%" height="115%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={3} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={11} result="rough" />
          <feDropShadow in="rough" dx={9} dy={14} stdDeviation={6} floodColor="#2e1a08" floodOpacity={0.55} />
        </filter>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
          <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0.42 0" />
        </filter>
      </defs>

      {/* far opening + arch */}
      <g transform={layer(0.02)}>
        <rect x={FAR.l} y={FAR.t} width={FAR.r - FAR.l} height={FAR.b - FAR.t} fill={`url(#sky-${v})`} />
        <g filter={paperFx}>
          <path
            d={`M ${FAR.l} ${FAR.t} L ${FAR.r} ${FAR.t} L ${FAR.r} ${FAR.b} L 610 ${FAR.b} L 610 760 Q 640 680 540 650 Q 440 680 470 760 L 470 ${FAR.b} L ${FAR.l} ${FAR.b} Z`}
            fill={P.archFrame}
          />
        </g>
        <rect x={FAR.l} y={980} width={FAR.r - FAR.l} height={20} fill={P.floorLine} />
      </g>

      {/* floor and ceiling */}
      <g transform={layer(0.05)}>
        <polygon points={`-10,1960 -10,1760 ${FAR.l},${FAR.b} ${FAR.r},${FAR.b} 1090,1760 1090,1960`} fill={P.floor} />
        {[0.15, 0.35, 0.55, 0.75].map((d) => (
          <line key={d} x1={lerp(-10, FAR.l, d)} y1={lerp(1760, FAR.b, d)} x2={lerp(1090, FAR.r, d)} y2={lerp(1760, FAR.b, d)} stroke={P.floorLine} strokeWidth={6 * depthScale(d)} />
        ))}
        <polygon points={`-10,-60 1090,-60 ${FAR.r},${FAR.t} ${FAR.l},${FAR.t}`} fill={P.ceiling} filter={paperFx} />
        {/* light slits in the lattice roof, and the beams they throw */}
        {[0.1, 0.3, 0.5, 0.7].map((d, i) => {
          const y = lerp(-60, FAR.t, d);
          const xl = lerp(-10, FAR.l, d);
          const xr = lerp(1090, FAR.r, d);
          return (
            <g key={d}>
              <line x1={xl + 30} y1={y} x2={xr - 30} y2={y} stroke={P.beam} strokeWidth={10 * depthScale(d)} />
              <polygon
                points={`${xl + 60},${y} ${xr - 60},${y} ${xr - 260 + i * 40},${lerp(1760, FAR.b, d + 0.18)} ${xl + 160 + i * 40},${lerp(1760, FAR.b, d + 0.18)}`}
                fill={P.beam}
                opacity={0.12 + Math.sin(f * 0.04 + i) * 0.03}
              />
            </g>
          );
        })}
      </g>

      {/* walls with rugs */}
      <g transform={layer(0.07)}>
        <polygon points={wallQuad("l", 0, 1, 0, 1)} fill={P.wallL} filter={paperFx} />
        <polygon points={wallQuad("r", 0, 1, 0, 1)} fill={P.wallR} filter={paperFx} />
        <g filter={paperFx}>
          {[
            ["l", 0.02, 0.2, 0], ["l", 0.28, 0.42, 1], ["l", 0.5, 0.62, 2], ["l", 0.7, 0.8, 3],
            ["r", 0.05, 0.22, 2], ["r", 0.3, 0.45, 4], ["r", 0.52, 0.64, 0], ["r", 0.72, 0.82, 1],
          ].map(([side, t1, t2, c], i) => {
            const sd = side as "l" | "r";
            const col = P.rugs[c as number];
            return (
              <g key={i}>
                <polygon points={wallQuad(sd, t1 as number, t2 as number, 0.22, 0.66)} fill={col} />
                <polygon points={wallQuad(sd, t1 as number, t2 as number, 0.3, 0.34)} fill={P.rugTrim} />
                <polygon points={wallQuad(sd, t1 as number, t2 as number, 0.54, 0.58)} fill={P.rugTrim} />
                <polygon
                  points={wallQuad(sd, (t1 as number) + ((t2 as number) - (t1 as number)) * 0.35, (t2 as number) - ((t2 as number) - (t1 as number)) * 0.35, 0.38, 0.5)}
                  fill={P.rugTrim}
                  opacity={0.8}
                />
              </g>
            );
          })}
        </g>
      </g>

      {/* spice baskets along both walls, far first */}
      <g transform={layer(0.09)} filter={paperFx}>
        {[0.78, 0.6, 0.4, 0.2].flatMap((d, i) => {
          const L = floorPoint("l", d, 150);
          const R = floorPoint("r", d, 150);
          return [
            <SpiceBasket key={`l${d}`} x={L.x} y={L.y} s={L.s} v={v} seed={i} />,
            <SpiceBasket key={`r${d}`} x={R.x} y={R.y} s={R.s} v={v} seed={i + 2} />,
          ];
        })}
      </g>

      {/* lanterns overhead, far first */}
      <g transform={layer(0.12)} filter={paperFx}>
        {[...lanterns]
          .sort((a, b) => b.t - a.t)
          .map((l, i) => (
            <Lantern key={i} x={lerp(l.x, VP.x + (l.x - VP.x) * 0.5, l.t)} y={lerp(-60, FAR.t, l.t)} s={depthScale(l.t) * 1.1} f={f} i={i} v={v} />
          ))}
      </g>

      {/* the traveler */}
      <g filter={paperFx}>
        <Traveler x={trav.x} y={trav.y} s={trav.s} f={f} v={v} />
      </g>

      {v === "paper" ? <rect x={0} y={0} width={1080} height={1920} filter="url(#grain)" /> : null}
    </svg>
  );
};
