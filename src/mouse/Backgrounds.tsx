/** Set pieces specific to the Country Mouse story. 1920×1080 composition space. */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "./story";

export { CityStreet, Meadow, OakTree, Sky, Skyline } from "../kids/kit/Scenery";

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
