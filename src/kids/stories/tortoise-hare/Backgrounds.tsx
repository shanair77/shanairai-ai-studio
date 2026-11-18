/** City-park set pieces for The Tortoise and the Hare. 1920×1080 composition space. */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, Flower, Sky, Skyline, clamp, useT } from "../../kit";
import { TC } from "./Characters";

export const GROUND_Y = 880;

/** Round park tree, roots at (x, GROUND_Y - 30). */
export const ParkTree: React.FC<{ x: number; s?: number; color?: string }> = ({ x, s = 1, color = C.leaf }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin((frame + x) / 22) * 1.2;
  return (
    <g style={{ translate: `${x}px ${GROUND_Y - 40}px`, scale: `${s}` }}>
      <path d="M -26 0 Q -18 -160 -14 -300 L 14 -300 Q 18 -160 26 0 Z" fill={C.trunk} />
      <path d="M 0 -200 Q 50 -230 80 -280" stroke={C.trunk} strokeWidth={14} fill="none" strokeLinecap="round" />
      <g style={{ rotate: `${sway}deg`, transformOrigin: "0px -300px" }}>
        <circle cx={-110} cy={-330} r={110} fill={C.leafDark} />
        <circle cx={110} cy={-340} r={115} fill={C.leafDark} />
        <circle cx={0} cy={-420} r={150} fill={color} />
        <circle cx={-80} cy={-470} r={80} fill={color} />
        <circle cx={90} cy={-460} r={90} fill={color} />
        <circle cx={-40} cy={-400} r={14} fill={C.pink} />
        <circle cx={70} cy={-360} r={14} fill={C.pink} />
        <circle cx={10} cy={-500} r={14} fill={C.pink} />
      </g>
    </g>
  );
};

const Bush: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g style={{ translate: `${x}px ${y}px`, scale: `${s}` }}>
    <circle cx={-50} cy={0} r={46} fill={C.leafDark} />
    <circle cx={40} cy={-4} r={52} fill={C.leafDark} />
    <circle cx={-4} cy={-30} r={56} fill={C.leaf} />
  </g>
);

const Bench: React.FC<{ x: number }> = ({ x }) => (
  <g style={{ translate: `${x}px ${GROUND_Y - 50}px` }}>
    <rect x={-90} y={-80} width={180} height={16} rx={8} fill={C.trunkDark} />
    <rect x={-90} y={-54} width={180} height={16} rx={8} fill={C.trunk} />
    <rect x={-74} y={-40} width={12} height={44} rx={5} fill={C.ink} opacity={0.55} />
    <rect x={62} y={-40} width={12} height={44} rx={5} fill={C.ink} opacity={0.55} />
  </g>
);

/** A string of pastel triangle flags from (x1, y1) to (x2, y2). */
export const Bunting: React.FC<{ x1: number; y1: number; x2: number; y2: number; sag?: number }> = ({ x1, y1, x2, y2, sag = 50 }) => {
  const frame = useCurrentFrame();
  const n = Math.max(3, Math.round(Math.hypot(x2 - x1, y2 - y1) / 70));
  const colors = [C.pinkDark, C.butterDark, C.mint, C.lavenderDark, C.blue];
  const pt = (t: number) => ({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * sag });
  return (
    <g>
      <path d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag * 2} ${x2} ${y2}`} stroke={C.ink} strokeWidth={3} fill="none" opacity={0.5} />
      {Array.from({ length: n }).map((_, i) => {
        const p = pt((i + 0.5) / n);
        const flutter = Math.sin((frame + i * 9) / 7) * 6;
        return <path key={i} d={`M ${p.x - 22} ${p.y} L ${p.x + 22} ${p.y} L ${p.x + flutter} ${p.y + 44} Z`} fill={colors[i % colors.length]} />;
      })}
    </g>
  );
};

/** The finish arch centred on x. `tape` 0 = whole, 1 = broken and swung down. */
export const FinishArch: React.FC<{ x: number; tape?: number }> = ({ x, tape = 0 }) => {
  const t = useT();
  const frame = useCurrentFrame();
  const half = 230;
  const tapeY = GROUND_Y - 150;
  const swing = interpolate(tape, [0, 1], [0, 72], clamp);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
        <rect x={x - half - 14} y={GROUND_Y - 470} width={28} height={470} rx={12} fill={C.lavenderDark} />
        <rect x={x + half - 14} y={GROUND_Y - 470} width={28} height={470} rx={12} fill={C.lavenderDark} />
        <Bunting x1={x - half} y1={GROUND_Y - 360} x2={x + half} y2={GROUND_Y - 360} sag={30} />
        {tape < 0.02 ? (
          <path d={`M ${x - half} ${tapeY} Q ${x} ${tapeY + 14 + Math.sin(frame / 8) * 4} ${x + half} ${tapeY}`} stroke={C.pinkDark} strokeWidth={10} fill="none" />
        ) : (
          <>
            <line
              x1={x - half}
              y1={tapeY}
              x2={x - half + 220 * Math.cos((swing * Math.PI) / 180)}
              y2={tapeY + 220 * Math.sin((swing * Math.PI) / 180)}
              stroke={C.pinkDark}
              strokeWidth={10}
              strokeLinecap="round"
            />
            <line
              x1={x + half}
              y1={tapeY}
              x2={x + half - 220 * Math.cos((swing * Math.PI) / 180)}
              y2={tapeY + 220 * Math.sin((swing * Math.PI) / 180)}
              stroke={C.pinkDark}
              strokeWidth={10}
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
      <div
        style={{
          position: "absolute",
          left: x - half - 40,
          top: GROUND_Y - 560,
          width: half * 2 + 80,
          padding: "16px 0",
          background: C.cream,
          border: `8px solid ${C.pinkDark}`,
          borderRadius: 34,
          textAlign: "center",
          fontSize: 66,
          fontWeight: 700,
          color: C.pinkDark,
          boxShadow: "0 10px 0 rgba(94,75,110,0.14)",
          rotate: `${Math.sin(frame / 16) * 1}deg`,
        }}
      >
        {t({ en: "FINISH", es: "META" })}
      </div>
    </AbsoluteFill>
  );
};

/** Little signpost on the path. */
export const Sign: React.FC<{ x: number; text: { en: string; es: string } }> = ({ x, text }) => {
  const t = useT();
  return (
    <>
      <div style={{ position: "absolute", left: x - 8, top: GROUND_Y - 220, width: 16, height: 200, borderRadius: 8, background: C.trunkDark }} />
      <div
        style={{
          position: "absolute",
          left: x - 150,
          top: GROUND_Y - 290,
          width: 300,
          padding: "14px 0",
          background: C.cream,
          borderRadius: 24,
          border: `6px solid ${C.trunkDark}`,
          fontSize: 44,
          fontWeight: 700,
          color: C.ink,
          textAlign: "center",
        }}
      >
        {t(text)}
      </div>
    </>
  );
};

const FLOWERS: [number, number, string][] = [
  [120, 990, C.pink],
  [420, 1020, C.lavender],
  [760, 1000, C.butter],
  [1120, 1030, C.pink],
  [1480, 995, C.lavender],
  [1800, 1020, C.butter],
];

export const Park: React.FC<{
  trees?: number[];
  bushes?: number[];
  bench?: number | null;
  evening?: boolean;
  children?: React.ReactNode;
  front?: React.ReactNode;
}> = ({ trees = [300, 1650], bushes = [900], bench = null, evening, children, front }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
      <Sky color={evening ? C.skyWarm : C.sky} sunColor={evening ? "#FFD2A8" : C.sun} sunY={evening ? 380 : 180} />
      {/* faraway city */}
      <g transform="translate(0 316) scale(0.55)" opacity={0.45}>
        <Skyline />
      </g>
      <g transform="translate(1056 316) scale(0.55)" opacity={0.45}>
        <Skyline />
      </g>
      <ellipse cx={420} cy={860} rx={900} ry={170} fill={C.hill} />
      <ellipse cx={1560} cy={870} rx={820} ry={150} fill={C.grassDark} opacity={0.75} />
      <rect x={0} y={800} width={1920} height={280} fill={C.grass} />
      {bushes.map((x, i) => (
        <Bush key={i} x={x} y={812} s={0.9} />
      ))}
      {trees.map((x, i) => (
        <ParkTree key={i} x={x} s={i % 2 ? 0.95 : 1} />
      ))}
      {bench !== null ? <Bench x={bench} /> : null}
      {/* running path */}
      <path d={`M 0 ${GROUND_Y - 46} L 1920 ${GROUND_Y - 46} L 1920 ${GROUND_Y + 40} L 0 ${GROUND_Y + 40} Z`} fill={TC.path} />
      <rect x={0} y={GROUND_Y + 34} width={1920} height={10} fill={TC.pathEdge} />
      <rect x={0} y={GROUND_Y - 50} width={1920} height={8} fill={TC.pathEdge} />
      {FLOWERS.map(([x, y, c], i) => (
        <Flower key={i} x={x} y={y} color={c} />
      ))}
    </svg>
    {children}
    {front}
  </AbsoluteFill>
);
