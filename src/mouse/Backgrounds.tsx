/** Flat pastel set pieces. All drawn in 1920×1080 composition space. */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "./story";

const Cloud: React.FC<{ x: number; y: number; s: number; color?: string }> = ({ x, y, s, color = C.cloud }) => (
  <g style={{ translate: `${x}px ${y}px`, scale: `${s}` }}>
    <ellipse cx={0} cy={0} rx={90} ry={38} fill={color} />
    <circle cx={-34} cy={-22} r={38} fill={color} />
    <circle cx={26} cy={-34} r={48} fill={color} />
  </g>
);

const wrap = (v: number, w: number) => ((v % w) + w) % w;

export const Sky: React.FC<{ color?: string; sunColor?: string; sunX?: number; sunY?: number }> = ({
  color = C.sky,
  sunColor = C.sun,
  sunX = 1620,
  sunY = 190,
}) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect width={1920} height={1080} fill={color} />
      <g style={{ translate: `${sunX}px ${sunY}px`, rotate: `${frame * 0.3}deg` }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={-8} y={-170} width={16} height={46} rx={8} fill={sunColor} style={{ rotate: `${i * 30}deg`, transformOrigin: "0px 0px" }} />
        ))}
      </g>
      <circle cx={sunX} cy={sunY} r={95} fill={sunColor} />
      <Cloud x={wrap(260 + frame * 0.6, 2300) - 200} y={170} s={1.1} />
      <Cloud x={wrap(1100 + frame * 0.35, 2300) - 200} y={300} s={0.8} />
      <Cloud x={wrap(1900 + frame * 0.5, 2300) - 200} y={120} s={0.9} />
    </g>
  );
};

const Flower: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <g style={{ translate: `${x}px ${y}px` }}>
    <line x1={0} y1={0} x2={0} y2={34} stroke={C.leafDark} strokeWidth={5} strokeLinecap="round" />
    {[0, 72, 144, 216, 288].map((a) => (
      <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 11} cy={Math.sin((a * Math.PI) / 180) * 11} r={9} fill={color} />
    ))}
    <circle r={7} fill={C.butterDark} />
  </g>
);

const FLOWERS: [number, number, string][] = [
  [140, 960, C.pink],
  [330, 1010, C.lavender],
  [880, 980, C.butter],
  [1060, 1030, C.pink],
  [1290, 990, C.lavender],
  [1560, 1020, C.pink],
  [1780, 970, C.butter],
];

/** Oak tree with the Country Mouse's burrow door at its roots. */
export const OakTree: React.FC<{ x: number }> = ({ x }) => {
  const frame = useCurrentFrame();
  const rustle = Math.sin(frame / 18) * 1.2;
  return (
    <g style={{ translate: `${x}px 0px` }}>
      <path d="M -90 900 Q -70 600 -60 380 L 60 380 Q 70 600 90 900 Z" fill={C.trunk} />
      <path d="M -40 520 Q -120 470 -170 420" stroke={C.trunk} strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d="M 40 470 Q 120 420 160 360" stroke={C.trunk} strokeWidth={30} fill="none" strokeLinecap="round" />
      <g style={{ rotate: `${rustle}deg`, transformOrigin: "0px 400px" }}>
        <circle cx={-170} cy={330} r={150} fill={C.leafDark} />
        <circle cx={170} cy={300} r={160} fill={C.leafDark} />
        <circle cx={0} cy={210} r={200} fill={C.leaf} />
        <circle cx={-120} cy={170} r={110} fill={C.leaf} />
        <circle cx={140} cy={180} r={120} fill={C.leaf} />
        <circle cx={-60} cy={260} r={18} fill={C.pinkDark} />
        <circle cx={90} cy={140} r={18} fill={C.pinkDark} />
        <circle cx={200} cy={290} r={18} fill={C.pinkDark} />
        <circle cx={-190} cy={260} r={18} fill={C.pinkDark} />
      </g>
      {/* burrow */}
      <path d="M -62 905 L -62 820 Q -62 760 0 760 Q 62 760 62 820 L 62 905 Z" fill={C.trunkDark} />
      <path d="M -46 905 L -46 826 Q -46 776 0 776 Q 46 776 46 826 L 46 905 Z" fill={C.pinkDark} />
      <circle cx={28} cy={850} r={6} fill={C.butterDark} />
      <circle cx={0} cy={806} r={14} fill={C.butter} />
      <rect x={-70} y={895} width={140} height={14} rx={7} fill={C.trunkDark} />
    </g>
  );
};

export const Meadow: React.FC<{ treeX?: number | null; warm?: boolean; children?: React.ReactNode }> = ({
  treeX = 480,
  warm,
  children,
}) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
      <Sky color={warm ? C.skyWarm : C.sky} sunColor={warm ? "#FFD2A8" : C.sun} sunY={warm ? 420 : 190} />
      <ellipse cx={400} cy={900} rx={900} ry={260} fill={C.hill} />
      <ellipse cx={1600} cy={920} rx={800} ry={230} fill={C.grassDark} opacity={0.7} />
      <rect x={0} y={880} width={1920} height={200} fill={C.grass} />
      {treeX !== null ? <OakTree x={treeX} /> : null}
      {FLOWERS.map(([x, y, c], i) => (
        <Flower key={i} x={x} y={y} color={c} />
      ))}
    </svg>
    {children}
  </AbsoluteFill>
);

/* ───────────────────────── City ───────────────────────── */

const BUILDINGS: { x: number; w: number; h: number; c: string }[] = [
  { x: 0, w: 220, h: 520, c: C.lavender },
  { x: 230, w: 180, h: 700, c: C.peach },
  { x: 420, w: 260, h: 600, c: C.blue },
  { x: 690, w: 200, h: 780, c: C.pink },
  { x: 900, w: 240, h: 560, c: C.mint },
  { x: 1150, w: 190, h: 720, c: C.lavender },
  { x: 1350, w: 250, h: 640, c: C.butter },
  { x: 1610, w: 200, h: 760, c: C.peach },
  { x: 1820, w: 220, h: 540, c: C.blue },
];

export const Skyline: React.FC<{ offsetX?: number; groundY?: number }> = ({ offsetX = 0, groundY = 880 }) => {
  const frame = useCurrentFrame();
  return (
    <g style={{ translate: `${offsetX}px 0px` }}>
      {BUILDINGS.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={groundY - b.h} width={b.w} height={b.h} rx={10} fill={b.c} />
          {Array.from({ length: Math.floor((b.h - 80) / 90) }).map((_, r) =>
            Array.from({ length: Math.floor((b.w - 30) / 70) }).map((__, k) => {
              const lit = (i * 7 + r * 3 + k * 5 + Math.floor(frame / 20)) % 9 === 0;
              return (
                <rect
                  key={`${r}-${k}`}
                  x={b.x + 30 + k * 70}
                  y={groundY - b.h + 50 + r * 90}
                  width={40}
                  height={50}
                  rx={8}
                  fill={lit ? C.butter : C.cream}
                  opacity={lit ? 1 : 0.75}
                />
              );
            }),
          )}
        </g>
      ))}
    </g>
  );
};

export const CityStreet: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
      <Sky color={C.lavender} sunColor={C.peach} sunX={300} sunY={160} />
      <Skyline />
      <rect x={0} y={880} width={1920} height={200} fill="#CFC8DE" />
      <rect x={0} y={870} width={1920} height={22} fill={C.cream} />
      {[200, 760, 1320, 1880].map((x) => (
        <g key={x}>
          <rect x={x - 8} y={640} width={16} height={240} fill={C.ink} opacity={0.7} />
          <circle cx={x} cy={630} r={26} fill={C.butter} />
        </g>
      ))}
    </svg>
    {children}
  </AbsoluteFill>
);

/* ───────────────────────── Dining room ───────────────────────── */

export const HOLE_X = 1760;
export const FLOOR_Y = 1000;
export const TABLE_Y = 640;

export const DiningRoom: React.FC<{ doorOpen?: number; children?: React.ReactNode }> = ({ doorOpen = 0, children }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
      <rect width={1920} height={1080} fill={C.peach} />
      {Array.from({ length: 20 }).map((_, i) => (
        <rect key={i} x={i * 100} y={0} width={44} height={1000} fill="#FFE4D4" />
      ))}
      {/* window with curtains */}
      <rect x={760} y={110} width={400} height={300} rx={24} fill={C.sky} />
      <rect x={952} y={110} width={16} height={300} fill={C.cream} />
      <rect x={760} y={252} width={400} height={16} fill={C.cream} />
      <path d="M 720 90 L 840 90 Q 800 260 860 430 L 720 430 Z" fill={C.pink} />
      <path d="M 1200 90 L 1080 90 Q 1120 260 1060 430 L 1200 430 Z" fill={C.pink} />
      <rect x={700} y={76} width={520} height={20} rx={10} fill={C.pinkDark} />
      {/* picture frame */}
      <rect x={1380} y={170} width={220} height={170} rx={14} fill={C.butterDark} />
      <rect x={1398} y={188} width={184} height={134} rx={8} fill={C.mint} />
      <circle cx={1490} cy={262} r={34} fill={C.leaf} />
      {/* door (left) */}
      <rect x={60} y={360} width={300} height={640} rx={20} fill={C.ink} opacity={0.85} />
      <g style={{ scale: `${1 - doorOpen * 0.82} 1`, transformOrigin: "60px 0px" }}>
        <rect x={60} y={360} width={300} height={640} rx={20} fill={C.lavenderDark} />
        <rect x={100} y={410} width={220} height={240} rx={14} fill={C.lavender} />
        <rect x={100} y={700} width={220} height={240} rx={14} fill={C.lavender} />
        <circle cx={320} cy={690} r={14} fill={C.butterDark} />
      </g>
      {/* floor */}
      <rect x={0} y={FLOOR_Y} width={1920} height={80} fill={C.trunk} />
      <rect x={0} y={FLOOR_Y - 18} width={1920} height={22} fill={C.cream} />
      {/* mouse hole */}
      <path
        d={`M ${HOLE_X - 80} ${FLOOR_Y} L ${HOLE_X - 80} ${FLOOR_Y - 70} Q ${HOLE_X - 80} ${FLOOR_Y - 140} ${HOLE_X} ${FLOOR_Y - 140} Q ${HOLE_X + 80} ${FLOOR_Y - 140} ${HOLE_X + 80} ${FLOOR_Y - 70} L ${HOLE_X + 80} ${FLOOR_Y} Z`}
        fill={C.ink}
      />
      {/* table */}
      <rect x={560} y={TABLE_Y + 40} width={30} height={FLOOR_Y - TABLE_Y - 40} fill={C.trunkDark} />
      <rect x={1430} y={TABLE_Y + 40} width={30} height={FLOOR_Y - TABLE_Y - 40} fill={C.trunkDark} />
      <rect x={480} y={TABLE_Y} width={1060} height={30} rx={8} fill={C.cream} />
      <path
        d={`M 480 ${TABLE_Y + 20} L 1540 ${TABLE_Y + 20} L 1540 ${TABLE_Y + 120} ${Array.from({ length: 11 })
          .map((_, i) => `Q ${1540 - i * 96 - 48} ${TABLE_Y + 170} ${1540 - (i + 1) * 96} ${TABLE_Y + 120}`)
          .join(" ")} L 480 ${TABLE_Y + 20} Z`}
        fill={C.pink}
      />
    </svg>
    {children}
  </AbsoluteFill>
);

/** Two pairs of eyes blinking inside the mouse hole. */
export const EyesInHole: React.FC<{ shake?: number; opacity?: number }> = ({ shake = 0, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const dx = shake ? Math.sin(frame * 2.5) * shake : 0;
  const blink = frame % 70 < 4 ? 0.2 : 1;
  return (
    <svg
      viewBox="0 0 1920 1080"
      width={1920}
      height={1080}
      style={{ position: "absolute", opacity }}
    >
      <g style={{ translate: `${dx}px 0px` }}>
        {[HOLE_X - 40, HOLE_X - 16, HOLE_X + 18, HOLE_X + 42].map((x, i) => (
          <ellipse key={i} cx={x} cy={FLOOR_Y - 60 + (i > 1 ? 8 : 0)} rx={7} ry={9 * blink} fill="#fff" />
        ))}
      </g>
    </svg>
  );
};
