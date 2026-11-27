/**
 * Goldilocks and the Three Bears — backgrounds: the forest with the Bears' log cabin
 * (outside), the cosy kitchen / sitting room, and the bedroom upstairs. 1920×1080;
 * feet line at GROUND_Y (outside) and FLOOR_Y (inside).
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, Sky, clamp } from "../../kit";
import { GC } from "./Characters";

export const GROUND_Y = 890;
export const FLOOR_Y = 880;
/** The cabin door's centre x (outside) and its bottom. */
export const DOOR_X = 1330;
export const DOOR_W = 150;
export const DOOR_H = 250;
/** Where the outdoor speaker / doorbell sit beside the door. */
export const SPEAKER_OUT = { x: DOOR_X, y: 612 };
export const BELL = { x: DOOR_X + 112, y: 700 };
/** Kitchen wall shelf (the smart speaker sits on it). */
export const SHELF = { x: 1640, y: 430 };

const F = {
  sky: "#D9EFF3",
  hill: "#CDE9D2",
  hill2: "#BCE0C4",
  tree: "#A9D9B4",
  tree2: "#93CDA2",
  tree3: "#B9E2C0",
  trunk: "#C9A27E",
  ground: "#CDEBC0",
  groundDark: "#B9E0AA",
  path: "#F4E2C6",
  log: "#E2BC8E",
  logDark: "#CDA274",
  roof: "#F2A99F",
  roofDark: "#E28F86",
  window: "#FFF6DC",
  door: "#B7DDF0",
  doorDark: "#93C8E2",
  mushroom: "#F6A9B6",
};

const RoundTree: React.FC<{ x: number; y: number; s: number; color: string; seed: number }> = ({ x, y, s, color, seed }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin((frame + seed * 40) / 30) * 1.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sway} 0 0)`}>
      <rect x={-16} y={-120} width={32} height={130} rx={12} fill={F.trunk} />
      <circle cx={0} cy={-190} r={96} fill={color} />
      <circle cx={-60} cy={-140} r={64} fill={color} />
      <circle cx={62} cy={-146} r={68} fill={color} />
      <circle cx={-30} cy={-216} r={26} fill="#fff" opacity={0.18} />
    </g>
  );
};

const Pine: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-12} y={-40} width={24} height={50} rx={8} fill={F.trunk} />
    <path d="M 0 -330 Q 30 -250 80 -200 Q 40 -200 30 -196 Q 80 -130 120 -40 L -120 -40 Q -80 -130 -30 -196 Q -40 -200 -80 -200 Q -30 -250 0 -330 Z" fill={color} />
  </g>
);

const Mushroom: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-10} y={-34} width={20} height={36} rx={8} fill={C.cream} />
    <path d="M -36 -30 Q 0 -78 36 -30 Z" fill={F.mushroom} />
    <circle cx={-12} cy={-46} r={6} fill="#fff" />
    <circle cx={12} cy={-40} r={5} fill="#fff" />
  </g>
);

/** The Bears' log cabin, ground line at GROUND_Y. `doorOpen` 0..1 swings the door. */
const Cabin: React.FC<{ doorOpen: number; bellGlow: number }> = ({ doorOpen, bellGlow }) => {
  const frame = useCurrentFrame();
  const left = 1000;
  const right = 1660;
  const wallTop = 520;
  const base = GROUND_Y;
  const doorTop = base - DOOR_H;
  return (
    <g>
      {/* chimney + smoke */}
      <rect x={1500} y={300} width={70} height={160} rx={10} fill="#E9C9B4" />
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 26) % 78) / 78;
        return <circle key={i} cx={1535 + Math.sin(t * 6 + i) * 18} cy={290 - t * 200} r={22 + t * 24} fill="#fff" opacity={0.7 * (1 - t)} />;
      })}
      {/* walls of logs */}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={left} y={wallTop + i * 46} width={right - left} height={44} rx={22} fill={i % 2 ? F.log : F.logDark} />
      ))}
      {/* roof */}
      <path d={`M ${left - 70} ${wallTop + 10} L ${(left + right) / 2} 290 L ${right + 70} ${wallTop + 10} Q ${(left + right) / 2} ${wallTop - 20} ${left - 70} ${wallTop + 10} Z`} fill={F.roof} />
      <path d={`M ${left - 70} ${wallTop + 10} L ${(left + right) / 2} 290 L ${right + 70} ${wallTop + 10}`} stroke={F.roofDark} strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* round attic window */}
      <circle cx={(left + right) / 2} cy={420} r={44} fill={F.window} stroke={F.logDark} strokeWidth={10} />
      <line x1={(left + right) / 2} y1={378} x2={(left + right) / 2} y2={462} stroke={F.logDark} strokeWidth={6} />
      {/* front windows with flower boxes */}
      {[1080, 1520].map((wx) => (
        <g key={wx}>
          <rect x={wx} y={590} width={120} height={110} rx={18} fill={F.window} stroke={F.logDark} strokeWidth={10} />
          <line x1={wx + 60} y1={590} x2={wx + 60} y2={700} stroke={F.logDark} strokeWidth={6} />
          <rect x={wx - 10} y={700} width={140} height={30} rx={10} fill={C.pinkDark} />
          {[0, 1, 2, 3].map((k) => (
            <circle key={k} cx={wx + 12 + k * 32} cy={694} r={13} fill={k % 2 ? C.butterDark : C.lavenderDark} />
          ))}
        </g>
      ))}
      {/* door frame + doorway */}
      <rect x={DOOR_X - DOOR_W / 2 - 16} y={doorTop - 16} width={DOOR_W + 32} height={DOOR_H + 16} rx={30} fill={F.logDark} />
      <rect x={DOOR_X - DOOR_W / 2} y={doorTop} width={DOOR_W} height={DOOR_H} rx={22} fill="#FFE9C6" />
      {/* the door swings inwards: squash towards its hinge on the left */}
      <g transform={`translate(${DOOR_X - DOOR_W / 2} 0) scale(${1 - doorOpen * 0.78} 1) translate(${-(DOOR_X - DOOR_W / 2)} 0)`}>
        <rect x={DOOR_X - DOOR_W / 2} y={doorTop} width={DOOR_W} height={DOOR_H} rx={22} fill={F.door} />
        <rect x={DOOR_X - DOOR_W / 2 + 20} y={doorTop + 24} width={DOOR_W - 40} height={80} rx={14} fill={F.doorDark} />
        <rect x={DOOR_X - DOOR_W / 2 + 20} y={doorTop + 124} width={DOOR_W - 40} height={100} rx={14} fill={F.doorDark} />
        <circle cx={DOOR_X + DOOR_W / 2 - 24} cy={doorTop + 130} r={10} fill={C.butterDark} />
      </g>
      {/* doorbell */}
      <circle cx={BELL.x} cy={BELL.y} r={30 + bellGlow * 10} fill={C.butter} opacity={bellGlow * 0.6} />
      <rect x={BELL.x - 16} y={BELL.y - 22} width={32} height={44} rx={10} fill={GC.speaker} />
      <circle cx={BELL.x} cy={BELL.y} r={9} fill={bellGlow > 0 ? C.butterDark : C.pinkDark} />
      {/* shelf for the outdoor speaker */}
      <rect x={SPEAKER_OUT.x - 60} y={SPEAKER_OUT.y} width={120} height={16} rx={8} fill={F.logDark} />
      {/* doorstep + welcome mat */}
      <rect x={DOOR_X - 110} y={base - 8} width={220} height={22} rx={10} fill="#E6D3EE" />
      <rect x={DOOR_X - 80} y={base - 2} width={160} height={14} rx={6} fill={C.pinkDark} opacity={0.6} />
    </g>
  );
};

/** The forest clearing; with `cabin`, the Bears' log cabin stands on the right. */
export const Forest: React.FC<{ cabin?: boolean; doorOpen?: number; bellGlow?: number; children?: React.ReactNode; backdrop?: boolean }> = ({
  cabin = true,
  doorOpen = 0,
  bellGlow = 0,
  children,
  backdrop = true,
}) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {backdrop ? <Sky color={F.sky} sunX={330} sunY={170} /> : <rect width={1920} height={1080} fill={F.sky} />}
      <path d="M 0 640 Q 300 520 640 600 Q 980 680 1300 560 Q 1620 460 1920 580 L 1920 1080 L 0 1080 Z" fill={F.hill} />
      <path d="M 0 720 Q 420 620 860 700 Q 1300 780 1920 660 L 1920 1080 L 0 1080 Z" fill={F.hill2} />
      {[
        [80, 760, 0.9, F.tree2, 0],
        [330, 740, 0.7, F.tree, 1],
        [1780, 760, 0.95, F.tree2, 2],
        [560, 750, 0.6, F.tree3, 3],
      ].map(([x, y, s, c, k]) => (
        <RoundTree key={k as number} x={x as number} y={y as number} s={s as number} color={c as string} seed={k as number} />
      ))}
      <Pine x={200} y={790} s={0.9} color={F.tree} />
      <Pine x={820} y={770} s={0.75} color={F.tree2} />
      <Pine x={1880} y={800} s={0.8} color={F.tree} />
      <rect x={0} y={GROUND_Y - 60} width={1920} height={1080 - GROUND_Y + 60} fill={F.ground} />
      <path d={`M 0 ${GROUND_Y - 60} Q 480 ${GROUND_Y - 84} 960 ${GROUND_Y - 62} Q 1440 ${GROUND_Y - 40} 1920 ${GROUND_Y - 66} L 1920 ${GROUND_Y - 40} L 0 ${GROUND_Y - 40} Z`} fill={F.groundDark} />
      {/* path to the door */}
      <path d={`M -40 ${GROUND_Y + 40} Q 500 ${GROUND_Y - 10} 900 ${GROUND_Y + 10} Q 1150 ${GROUND_Y + 20} ${DOOR_X} ${GROUND_Y + 4} L ${DOOR_X + 90} ${GROUND_Y + 30} Q 1100 ${GROUND_Y + 70} 900 ${GROUND_Y + 60} Q 500 ${GROUND_Y + 50} -40 ${GROUND_Y + 110} Z`} fill={F.path} />
      {cabin ? <Cabin doorOpen={doorOpen} bellGlow={bellGlow} /> : null}
      <Mushroom x={700} y={GROUND_Y - 30} />
      <Mushroom x={760} y={GROUND_Y - 24} s={0.7} />
      <Mushroom x={1760} y={GROUND_Y + 10} s={0.9} />
      {[120, 420, 980, 1580, 1840].map((x, i) => (
        <g key={x} transform={`translate(${x} ${GROUND_Y - 44 + (i % 2) * 20})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={0} cy={-11} rx={7} ry={11} fill={i % 2 ? C.pink : C.butter} transform={`rotate(${a})`} />
          ))}
          <circle r={6} fill={C.butterDark} />
        </g>
      ))}
    </svg>
    {children}
  </AbsoluteFill>
);

const I = {
  wall: "#FCEBDA",
  wallDot: "#F7DCC4",
  wainscot: "#F3D5BA",
  floor: "#E9CBA6",
  floorLine: "#DDBA92",
  rug: "#C8E8F0",
  rugEdge: "#A8D7E4",
  curtain: "#F7C3D3",
  bedWall: "#E7DEF6",
  bedWallDot: "#DACFF0",
  bedFloor: "#E9D3B6",
  fire: "#FFC88A",
  fireHot: "#FFE38A",
  stone: "#D9D1E3",
  stoneDark: "#C6BCD6",
};

/** A window looking out at the forest. */
const ForestWindow: React.FC<{ x: number; y: number; w: number; h: number; curtain: string }> = ({ x, y, w, h, curtain }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={26} fill={F.sky} stroke={GC.woodDark} strokeWidth={14} />
      <circle cx={x + w * 0.75} cy={y + h * 0.3} r={34} fill={C.sun} />
      <path d={`M ${x + 8} ${y + h * 0.75} Q ${x + w * 0.4} ${y + h * 0.55} ${x + w - 8} ${y + h * 0.7} L ${x + w - 8} ${y + h - 8} L ${x + 8} ${y + h - 8} Z`} fill={F.hill2} />
      <circle cx={x + w * 0.25} cy={y + h * 0.62} r={44} fill={F.tree2} />
      <circle cx={x + w * 0.55} cy={y + h * 0.68} r={36} fill={F.tree} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={GC.woodDark} strokeWidth={10} />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={GC.woodDark} strokeWidth={10} />
      {/* curtains, swaying a little */}
      <path d={`M ${x - 30} ${y - 20} Q ${x + 40 + Math.sin(frame / 25) * 6} ${y + h / 2} ${x - 10} ${y + h + 20} L ${x - 50} ${y + h + 20} L ${x - 50} ${y - 20} Z`} fill={curtain} />
      <path d={`M ${x + w + 30} ${y - 20} Q ${x + w - 40 - Math.sin(frame / 25) * 6} ${y + h / 2} ${x + w + 10} ${y + h + 20} L ${x + w + 50} ${y + h + 20} L ${x + w + 50} ${y - 20} Z`} fill={curtain} />
      <rect x={x - 70} y={y - 34} width={w + 140} height={18} rx={9} fill={GC.woodDark} />
    </g>
  );
};

/** The Bears' kitchen / sitting room. `fireplace` swaps the window for a cosy fire (sitting room). */
export const Kitchen: React.FC<{ children?: React.ReactNode; fireplace?: boolean; shelf?: boolean }> = ({ children, fireplace = false, shelf = true }) => {
  const frame = useCurrentFrame();
  const flick = Math.sin(frame / 3) * 0.08;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect width={1920} height={1080} fill={I.wall} />
        {Array.from({ length: 12 }).map((_, i) =>
          Array.from({ length: 6 }).map((__, j) => <circle key={`${i}-${j}`} cx={80 + i * 160 + (j % 2) * 80} cy={70 + j * 110} r={10} fill={I.wallDot} />),
        )}
        <rect x={0} y={FLOOR_Y - 220} width={1920} height={220} fill={I.wainscot} />
        <rect x={0} y={FLOOR_Y - 230} width={1920} height={18} fill={GC.wood} />
        <rect x={0} y={FLOOR_Y - 30} width={1920} height={1080 - FLOOR_Y + 30} fill={I.floor} />
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={i} x1={0} y1={FLOOR_Y + 20 + i * 34} x2={1920} y2={FLOOR_Y + 20 + i * 34} stroke={I.floorLine} strokeWidth={4} />
        ))}
        {fireplace ? (
          <g>
            <rect x={180} y={420} width={420} height={FLOOR_Y - 420} rx={30} fill={I.stone} />
            <rect x={150} y={396} width={480} height={40} rx={14} fill={GC.woodDark} />
            <path d={`M 270 ${FLOOR_Y} L 270 600 Q 390 520 510 600 L 510 ${FLOOR_Y} Z`} fill="#8C7B9C" />
            <g transform={`translate(390 ${FLOOR_Y - 10}) scale(${1 + flick} ${1 - flick})`}>
              <path d="M -80 0 Q -90 -90 -30 -140 Q -20 -90 0 -80 Q 10 -160 60 -180 Q 50 -100 80 -60 Q 100 -30 80 0 Z" fill={I.fire} />
              <path d="M -40 0 Q -40 -60 0 -90 Q 10 -50 40 -40 Q 50 -20 40 0 Z" fill={I.fireHot} />
            </g>
            <rect x={300} y={FLOOR_Y - 16} width={180} height={18} rx={9} fill={GC.woodDark} />
            {/* family photo frames on the mantel */}
            <rect x={210} y={330} width={70} height={66} rx={8} fill={C.cream} stroke={C.pinkDark} strokeWidth={6} />
            <circle cx={245} cy={364} r={18} fill={GC.papa} />
            <rect x={500} y={340} width={60} height={56} rx={8} fill={C.cream} stroke={GC.bowTie} strokeWidth={6} />
            <circle cx={530} cy={370} r={14} fill={GC.baby} />
          </g>
        ) : (
          <ForestWindow x={260} y={190} w={360} h={300} curtain={I.curtain} />
        )}
        {/* wall clock */}
        <g transform="translate(960 190)">
          <circle r={64} fill={C.cream} stroke={GC.woodDark} strokeWidth={12} />
          <line x1={0} y1={0} x2={0} y2={-40} stroke={C.ink} strokeWidth={7} strokeLinecap="round" transform={`rotate(${frame * 1.5})`} />
          <line x1={0} y1={0} x2={26} y2={0} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
          <circle r={7} fill={C.pinkDark} />
        </g>
        {shelf ? (
          <g>
            <rect x={SHELF.x - 170} y={SHELF.y} width={340} height={22} rx={10} fill={GC.woodDark} />
            <path d={`M ${SHELF.x - 130} ${SHELF.y + 22} L ${SHELF.x - 130} ${SHELF.y + 70} L ${SHELF.x - 90} ${SHELF.y + 22} Z`} fill={GC.woodDark} />
            <path d={`M ${SHELF.x + 130} ${SHELF.y + 22} L ${SHELF.x + 130} ${SHELF.y + 70} L ${SHELF.x + 90} ${SHELF.y + 22} Z`} fill={GC.woodDark} />
            {/* a honey jar and a little plant */}
            <rect x={SHELF.x + 70} y={SHELF.y - 80} width={70} height={80} rx={18} fill={C.butterDark} />
            <rect x={SHELF.x + 66} y={SHELF.y - 96} width={78} height={22} rx={8} fill={C.pinkDark} />
            <rect x={SHELF.x - 150} y={SHELF.y - 56} width={60} height={56} rx={12} fill={C.peach} />
            <circle cx={SHELF.x - 132} cy={SHELF.y - 76} r={22} fill={F.tree2} />
            <circle cx={SHELF.x - 106} cy={SHELF.y - 84} r={20} fill={F.tree} />
          </g>
        ) : null}
      </svg>
      {children}
    </AbsoluteFill>
  );
};

/** The kitchen table: tabletop at y = top, centred on x. */
export const Table: React.FC<{ x: number; w: number; top: number }> = ({ x, w, top }) => (
  <svg viewBox={`${-w / 2 - 20} ${top - 10} ${w + 40} ${FLOOR_Y - top + 20}`} width={w + 40} height={FLOOR_Y - top + 20} style={{ position: "absolute", left: x - w / 2 - 20, top: top - 10, overflow: "visible" }}>
    <rect x={-w / 2 + 30} y={top + 30} width={30} height={FLOOR_Y - top - 30} rx={12} fill={GC.woodDark} />
    <rect x={w / 2 - 60} y={top + 30} width={30} height={FLOOR_Y - top - 30} rx={12} fill={GC.woodDark} />
    <rect x={-w / 2} y={top} width={w} height={40} rx={16} fill={GC.wood} />
    {/* gingham cloth */}
    <path d={`M ${-w / 2 + 10} ${top} L ${w / 2 - 10} ${top} L ${w / 2 - 30} ${top + 90} Q 0 ${top + 110} ${-w / 2 + 30} ${top + 90} Z`} fill={C.mint} />
    {Array.from({ length: Math.floor(w / 60) }).map((_, i) => (
      <rect key={i} x={-w / 2 + 30 + i * 60} y={top} width={28} height={92} fill="#fff" opacity={0.45} />
    ))}
  </svg>
);

/** The bedroom upstairs. */
export const Bedroom: React.FC<{ children?: React.ReactNode; dim?: number }> = ({ children, dim = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect width={1920} height={1080} fill={I.bedWall} />
        {Array.from({ length: 10 }).map((_, i) =>
          Array.from({ length: 5 }).map((__, j) => (
            <path
              key={`${i}-${j}`}
              transform={`translate(${100 + i * 190 + (j % 2) * 95} ${80 + j * 130}) rotate(${(i * 17 + j * 31) % 40})`}
              d="M 0 -14 l 4 9 l 10 1 l -7 7 l 2 10 l -9 -5 l -9 5 l 2 -10 l -7 -7 l 10 -1 Z"
              fill={I.bedWallDot}
            />
          )),
        )}
        <ForestWindow x={790} y={150} w={340} h={260} curtain={C.lavenderDark} />
        <rect x={0} y={FLOOR_Y - 30} width={1920} height={1080 - FLOOR_Y + 30} fill={I.bedFloor} />
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={i} x1={0} y1={FLOOR_Y + 20 + i * 34} x2={1920} y2={FLOOR_Y + 20 + i * 34} stroke={I.floorLine} strokeWidth={4} />
        ))}
        <ellipse cx={960} cy={FLOOR_Y + 60} rx={520} ry={60} fill={I.rug} />
        <ellipse cx={960} cy={FLOOR_Y + 60} rx={460} ry={44} fill="none" stroke={I.rugEdge} strokeWidth={8} strokeDasharray="20 16" />
        {/* the top of the stairs on the left */}
        <rect x={0} y={420} width={70} height={FLOOR_Y - 420} fill={GC.woodLight} />
        <rect x={60} y={400} width={20} height={FLOOR_Y - 400} rx={8} fill={GC.woodDark} />
      </svg>
      {children}
      <AbsoluteFill style={{ backgroundColor: "#6A5A9C", opacity: dim * (0.22 + Math.sin(frame / 40) * 0.02), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

/** A floaty "z" for sleeping. */
export const Zzz: React.FC<{ x: number; y: number; on: number }> = ({ x, y, on }) => {
  const frame = useCurrentFrame();
  if (on <= 0) return null;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 20) % 60) / 60;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + t * 80 + i * 10,
              top: y - t * 140,
              fontSize: 50 + i * 14,
              fontWeight: 700,
              color: C.lavenderDark,
              opacity: on * interpolate(t, [0, 0.2, 0.8, 1], [0, 1, 1, 0], clamp),
            }}
          >
            z
          </div>
        );
      })}
    </>
  );
};
