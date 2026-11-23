/** Hillside pasture, village street and long grass for The Boy Who Cried Wolf. 1920×1080; ground at GROUND_Y. */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, Flower, Sky } from "../../kit";
import { BC } from "./Characters";

export const GROUND_Y = 860;

export type TimeOfDay = "day" | "evening";

const SKY: Record<TimeOfDay, { sky: string; sun: string; sunX: number; sunY: number; hillFar: string; hillMid: string; ground: string }> = {
  day: { sky: "#D2ECF7", sun: C.sun, sunX: 1640, sunY: 180, hillFar: "#CDEBC6", hillMid: "#BDE3BE", ground: C.grass },
  evening: { sky: "#E6D6F2", sun: "#FFC9A8", sunX: 1520, sunY: 560, hillFar: "#D3D9C8", hillMid: "#C3D8BE", ground: "#B5D8B7" },
};

/** A tiny village house for the distance, base-centred at (x, y). */
const TinyHouse: React.FC<{ x: number; y: number; s: number; roof: string; wall: string; lit?: boolean }> = ({ x, y, s, roof, wall, lit }) => (
  <g style={{ translate: `${x}px ${y}px`, scale: `${s}` }}>
    <rect x={-40} y={-60} width={80} height={60} rx={6} fill={wall} />
    <path d="M -52 -56 L 0 -100 L 52 -56 Z" fill={roof} strokeLinejoin="round" stroke={roof} strokeWidth={8} />
    <rect x={-26} y={-44} width={18} height={18} rx={4} fill={lit ? C.butterDark : C.cream} />
    <rect x={8} y={-44} width={18} height={18} rx={4} fill={lit ? C.butterDark : C.cream} />
    <rect x={-9} y={-26} width={18} height={26} rx={5} fill={C.lavenderDark} />
  </g>
);

const FAR_HOUSES: [number, number, number, string, string][] = [
  [1300, 640, 0.9, BC.roofRed, C.cream],
  [1400, 628, 1.0, BC.roofBlue, C.peach],
  [1510, 646, 0.85, BC.roofLilac, C.butter],
  [1610, 632, 1.05, BC.roofRed, C.mint],
  [1720, 648, 0.9, BC.roofBlue, C.pink],
  [1830, 636, 1.0, BC.roofLilac, C.cream],
];

const PastureTree: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin((frame + x) / 24) * 1.4;
  return (
    <g style={{ translate: `${x}px ${GROUND_Y - 10}px`, scale: `${s}` }}>
      <path d="M -24 20 Q -16 -140 -12 -250 L 12 -250 Q 16 -140 24 20 Z" fill={C.trunk} />
      <g style={{ rotate: `${sway}deg`, transformOrigin: "0px -250px" }}>
        <circle cx={-90} cy={-290} r={100} fill={C.leafDark} />
        <circle cx={90} cy={-300} r={104} fill={C.leafDark} />
        <circle cx={0} cy={-380} r={136} fill={C.leaf} />
        <circle cx={-50} cy={-360} r={12} fill={C.pink} />
        <circle cx={60} cy={-320} r={12} fill={C.pink} />
        <circle cx={20} cy={-440} r={12} fill={C.pink} />
      </g>
    </g>
  );
};

const FLOWERS: [number, number, string][] = [
  [80, 920, C.pink],
  [380, 960, C.lavender],
  [700, 925, C.butter],
  [1100, 965, C.pink],
  [1460, 930, C.lavender],
  [1800, 955, C.butter],
];

export type HillsProps = {
  time?: TimeOfDay;
  /** Show the little village down the hill on the right. */
  village?: boolean;
  trees?: number[];
  /** Fence from..to along the back of the pasture. */
  fence?: [number, number][];
  children?: React.ReactNode;
};

/** The green pasture above the village. */
export const Hills: React.FC<HillsProps> = ({ time = "day", village = true, trees = [], fence = [], children }) => {
  const s = SKY[time];
  const evening = time === "evening";
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
        <Sky color={s.sky} sunColor={s.sun} sunX={s.sunX} sunY={s.sunY} />
        {evening ? (
          <g>
            <circle cx={380} cy={170} r={56} fill={C.cream} />
            <circle cx={404} cy={156} r={50} fill={s.sky} />
            {[[620, 120], [900, 210], [1180, 100], [240, 300], [1760, 140]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={6} fill={C.cream} opacity={0.9} />
            ))}
          </g>
        ) : null}
        <ellipse cx={1560} cy={GROUND_Y - 120} rx={620} ry={200} fill={s.hillFar} />
        {village ? FAR_HOUSES.map(([x, y, sc, roof, wall], i) => <TinyHouse key={i} x={x} y={y} s={sc} roof={roof} wall={wall} lit={evening} />) : null}
        <ellipse cx={420} cy={GROUND_Y + 30} rx={900} ry={300} fill={s.hillMid} />
        {/* winding path down to the village */}
        <path d={`M 1180 ${GROUND_Y + 220} Q 1260 ${GROUND_Y + 40} 1380 ${GROUND_Y - 40} Q 1480 ${GROUND_Y - 110} 1560 ${GROUND_Y - 190}`} stroke={C.cream} strokeWidth={70} fill="none" strokeLinecap="round" opacity={0.85} />
        {trees.map((x) => (
          <PastureTree key={x} x={x} s={0.9} />
        ))}
        {fence.map(([a, b]) => (
          <g key={a}>
            <rect x={a} y={GROUND_Y - 84} width={b - a} height={12} rx={6} fill={C.trunk} />
            <rect x={a} y={GROUND_Y - 46} width={b - a} height={12} rx={6} fill={C.trunk} />
            {Array.from({ length: Math.floor((b - a) / 90) + 1 }).map((_, i) => (
              <rect key={i} x={a + i * 90 - 8} y={GROUND_Y - 104} width={16} height={104} rx={6} fill={C.trunkDark} />
            ))}
          </g>
        ))}
        <rect x={0} y={GROUND_Y} width={1920} height={220} fill={s.ground} />
        <path d={`M 1180 ${GROUND_Y + 220} Q 1230 ${GROUND_Y + 80} 1300 ${GROUND_Y}`} stroke={C.cream} strokeWidth={90} fill="none" opacity={0.6} />
        {FLOWERS.map(([x, y, c], i) => (
          <Flower key={i} x={x} y={y} color={c} />
        ))}
      </svg>
      {children}
    </AbsoluteFill>
  );
};

/* ───────────────────────────── Village street ───────────────────────────── */

const HOUSES: { x: number; w: number; h: number; wall: string; roof: string }[] = [
  { x: 40, w: 300, h: 330, wall: C.peach, roof: BC.roofRed },
  { x: 400, w: 280, h: 380, wall: C.mint, roof: BC.roofLilac },
  { x: 740, w: 320, h: 320, wall: C.butter, roof: BC.roofBlue },
  { x: 1120, w: 290, h: 370, wall: C.pink, roof: BC.roofRed },
  { x: 1470, w: 300, h: 340, wall: C.lavender, roof: BC.roofBlue },
  { x: 1830, w: 280, h: 360, wall: C.cream, roof: BC.roofLilac },
];

/** A cosy village street: little houses, lamps and a bench. */
export const Village: React.FC<{ time?: TimeOfDay; children?: React.ReactNode }> = ({ time = "day", children }) => {
  const frame = useCurrentFrame();
  const evening = time === "evening";
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
        <Sky color={evening ? "#E6D6F2" : "#D2ECF7"} sunColor={evening ? "#FFC9A8" : C.sun} sunX={evening ? 1700 : 1700} sunY={evening ? 420 : 150} />
        <ellipse cx={960} cy={GROUND_Y - 180} rx={1200} ry={200} fill={evening ? "#D3D9C8" : "#CDEBC6"} />
        {HOUSES.map((h, i) => {
          const top = GROUND_Y - h.h;
          return (
            <g key={i}>
              <rect x={h.x} y={top} width={h.w} height={h.h} rx={12} fill={h.wall} />
              <path d={`M ${h.x - 26} ${top + 10} L ${h.x + h.w / 2} ${top - 120} L ${h.x + h.w + 26} ${top + 10} Z`} fill={h.roof} strokeLinejoin="round" stroke={h.roof} strokeWidth={14} />
              {[0, 1].map((k) => {
                const lit = evening ? (i + k + Math.floor(frame / 40)) % 5 !== 0 : false;
                return <rect key={k} x={h.x + 34 + k * (h.w - 128)} y={top + 50} width={60} height={64} rx={10} fill={lit ? C.butterDark : C.cream} />;
              })}
              <path d={`M ${h.x + h.w / 2 - 40} ${GROUND_Y} L ${h.x + h.w / 2 - 40} ${GROUND_Y - 120} Q ${h.x + h.w / 2} ${GROUND_Y - 160} ${h.x + h.w / 2 + 40} ${GROUND_Y - 120} L ${h.x + h.w / 2 + 40} ${GROUND_Y} Z`} fill={C.lavenderDark} />
              <circle cx={h.x + h.w / 2 + 22} cy={GROUND_Y - 60} r={6} fill={C.butterDark} />
            </g>
          );
        })}
        {[370, 1090, 1800].map((x) => (
          <g key={x}>
            <rect x={x - 7} y={GROUND_Y - 260} width={14} height={260} rx={6} fill={C.ink} opacity={0.6} />
            <circle cx={x} cy={GROUND_Y - 270} r={24} fill={evening ? C.butterDark : C.butter} />
          </g>
        ))}
        <rect x={0} y={GROUND_Y} width={1920} height={220} fill={evening ? "#D8D0E2" : "#E4DEEE"} />
        <rect x={0} y={GROUND_Y} width={1920} height={16} fill={C.cream} />
        {[160, 560, 960, 1360, 1760].map((x) => (
          <rect key={x} x={x - 60} y={GROUND_Y + 110} width={120} height={10} rx={5} fill="#fff" opacity={0.8} />
        ))}
      </svg>
      {children}
    </AbsoluteFill>
  );
};

/* ───────────────────────────── Long grass ───────────────────────────── */

/** Swaying tufts of tall grass in the foreground, from x `from` to `to`, base at `y`. */
export const LongGrass: React.FC<{ from: number; to: number; y?: number; h?: number; rustle?: number; color?: string; dark?: string }> = ({
  from,
  to,
  y = GROUND_Y + 40,
  h = 240,
  rustle = 0,
  color = "#A9D9AE",
  dark = "#8FCB98",
}) => {
  const frame = useCurrentFrame();
  const n = Math.floor((to - from) / 34);
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      {Array.from({ length: n }).map((_, i) => {
        const x = from + i * 34;
        const hh = h * (0.75 + ((i * 37) % 10) / 30);
        const sway = Math.sin((frame + i * 9) / 16) * 10 + rustle * Math.sin((frame + i * 3) / 2.5) * 16;
        return (
          <path
            key={i}
            d={`M ${x - 16} ${y} Q ${x + sway * 0.4} ${y - hh * 0.5} ${x + sway} ${y - hh} Q ${x + 4 + sway * 0.4} ${y - hh * 0.5} ${x + 16} ${y} Z`}
            fill={i % 2 ? color : dark}
          />
        );
      })}
    </svg>
  );
};
