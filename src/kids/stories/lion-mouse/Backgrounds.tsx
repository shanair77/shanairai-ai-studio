/** Savanna set pieces for The Lion and the Mouse. 1920×1080 composition space. */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, Sky } from "../../kit";
import { LC } from "./Characters";

export const GROUND_Y = 880;

/** Flat-topped acacia tree, roots at (x, GROUND_Y). */
export const Acacia: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 20) * 1;
  return (
    <g style={{ translate: `${x}px ${GROUND_Y}px`, scale: `${s}` }}>
      <path d="M -22 0 Q -14 -200 -6 -380 L 14 -380 Q 20 -200 26 0 Z" fill={C.trunk} />
      <path d="M 0 -300 Q -90 -360 -170 -420" stroke={C.trunk} strokeWidth={18} fill="none" strokeLinecap="round" />
      <path d="M 6 -330 Q 100 -380 170 -440" stroke={C.trunk} strokeWidth={16} fill="none" strokeLinecap="round" />
      <g style={{ rotate: `${sway}deg`, transformOrigin: "0px -400px" }}>
        <ellipse cx={-170} cy={-440} rx={170} ry={44} fill={C.leafDark} />
        <ellipse cx={170} cy={-460} rx={180} ry={46} fill={C.leafDark} />
        <ellipse cx={0} cy={-480} rx={260} ry={56} fill={C.leaf} />
        <ellipse cx={-90} cy={-500} rx={120} ry={34} fill={C.leaf} />
        <ellipse cx={120} cy={-505} rx={130} ry={34} fill={C.leaf} />
      </g>
    </g>
  );
};

/** Swaying tuft of long grass, base at (x, y). */
export const Tuft: React.FC<{ x: number; y: number; s?: number; color?: string; seed?: number }> = ({ x, y, s = 1, color = LC.grassTuft, seed = 0 }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin((frame + seed * 13) / 16) * 8;
  return (
    <g style={{ translate: `${x}px ${y}px`, scale: `${s}` }}>
      {[-24, -8, 8, 24].map((dx, i) => (
        <path
          key={i}
          d={`M ${dx - 7} 0 Q ${dx + sway * 0.5} -60 ${dx + sway + (i - 1.5) * 10} -${110 + (i % 2) * 30} Q ${dx + 4 + sway * 0.4} -50 ${dx + 7} 0 Z`}
          fill={color}
        />
      ))}
    </g>
  );
};

const TUFTS: [number, number, number][] = [
  [90, 1000, 1],
  [380, 1050, 0.8],
  [640, 990, 0.9],
  [1180, 1040, 0.85],
  [1460, 1000, 1],
  [1760, 1050, 0.9],
];

export const Savanna: React.FC<{
  treeX?: number | null;
  evening?: boolean;
  /** Extra long grass in front (the net scene). */
  longGrass?: boolean;
  children?: React.ReactNode;
  front?: React.ReactNode;
}> = ({ treeX = 560, evening, longGrass, children, front }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
      <Sky color={evening ? C.skyWarm : C.sky} sunColor={evening ? "#FFD2A8" : C.sun} sunY={evening ? 360 : 180} />
      {/* distant flat hills */}
      <ellipse cx={1500} cy={GROUND_Y + 20} rx={720} ry={150} fill={C.peach} opacity={0.7} />
      <ellipse cx={300} cy={GROUND_Y + 30} rx={620} ry={120} fill={LC.groundDark} opacity={0.6} />
      <rect x={0} y={GROUND_Y - 40} width={1920} height={1120 - GROUND_Y} fill={LC.ground} />
      <path d={`M 0 ${GROUND_Y - 40} Q 480 ${GROUND_Y - 70} 960 ${GROUND_Y - 40} T 1920 ${GROUND_Y - 40} L 1920 ${GROUND_Y - 30} L 0 ${GROUND_Y - 30} Z`} fill={LC.ground} />
      {treeX !== null ? <Acacia x={treeX} /> : null}
      {/* little rocks */}
      <ellipse cx={1600} cy={GROUND_Y + 6} rx={40} ry={16} fill={C.lavender} />
      <ellipse cx={1640} cy={GROUND_Y + 10} rx={24} ry={10} fill={C.lavenderDark} opacity={0.6} />
      {TUFTS.map(([x, y, s], i) => (
        <Tuft key={i} x={x} y={y} s={s} seed={i} color={i % 2 ? LC.grassTuft : LC.grassGreen} />
      ))}
    </svg>
    {children}
    {longGrass ? (
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <Tuft key={i} x={60 + i * 125} y={1090} s={1.0 + (i % 3) * 0.15} seed={i * 3} color={i % 2 ? LC.grassTuft : LC.groundDark} />
        ))}
      </svg>
    ) : null}
    {front}
  </AbsoluteFill>
);
