/**
 * Woodland path, cottages and Grandma's bedroom for Little Red Riding Hood.
 * 1920×1080; ground (feet line) at GROUND_Y.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, Sky, clamp } from "../../kit";
import { RC } from "./Characters";

export const GROUND_Y = 860;

const G = {
  sky: "#DDF1EC",
  far: "#C6E6CF",
  farDark: "#B4DCC2",
  mid: "#A9D7B6",
  ground: "#C9EAC4",
  groundDark: "#B6DFB4",
  path: "#F6E7CC",
  pathEdge: "#EAD5B2",
  fern: "#9FD3AE",
  mushroom: "#F6B3BF",
};

/** Round woodland tree with a gentle sway. Base at (x, y). */
export const WoodTree: React.FC<{ x: number; y?: number; s?: number; tone?: number }> = ({ x, y = GROUND_Y - 20, s = 1, tone = 0 }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin((frame + x) / 26) * 1.4;
  const leaf = tone ? "#B9E2C4" : C.leaf;
  const leafDark = tone ? "#A2D6B1" : C.leafDark;
  return (
    <g style={{ translate: `${x}px ${y}px`, scale: `${s}` }}>
      <path d="M -30 20 Q -20 -160 -16 -280 L 16 -280 Q 20 -160 30 20 Z" fill={C.trunk} />
      <path d="M -6 -120 Q 12 -140 30 -170" stroke={C.trunkDark} strokeWidth={10} fill="none" strokeLinecap="round" />
      <g style={{ rotate: `${sway}deg`, transformOrigin: "0px -280px" }}>
        <circle cx={-100} cy={-320} r={110} fill={leafDark} />
        <circle cx={100} cy={-330} r={112} fill={leafDark} />
        <circle cx={0} cy={-420} r={146} fill={leaf} />
        <circle cx={-60} cy={-380} r={11} fill={C.pink} />
        <circle cx={70} cy={-350} r={11} fill={C.butter} />
        <circle cx={10} cy={-480} r={11} fill={C.pink} />
      </g>
    </g>
  );
};

/** A big front tree trunk a wolf can hide behind. Base at x. */
export const BigTrunk: React.FC<{ x: number }> = ({ x }) => (
  <g style={{ translate: `${x}px ${GROUND_Y + 30}px` }}>
    <path d="M -90 0 Q -70 -400 -80 -1100 L 80 -1100 Q 70 -400 90 0 Z" fill={C.trunk} />
    <path d="M -110 0 Q -80 -30 -60 -10 M 110 0 Q 80 -30 60 -10" stroke={C.trunkDark} strokeWidth={24} fill="none" strokeLinecap="round" />
    <path d="M -30 -300 Q -10 -340 -30 -400 M 30 -600 Q 50 -640 30 -700" stroke={C.trunkDark} strokeWidth={10} fill="none" strokeLinecap="round" />
    <circle cx={-300} cy={-1060} r={220} fill={C.leafDark} />
    <circle cx={200} cy={-1080} r={240} fill={C.leaf} />
  </g>
);

const Fern: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin((frame + x) / 18) * 3;
  return (
    <g style={{ translate: `${x}px ${y}px`, scale: `${s}`, rotate: `${sway}deg` }}>
      {[-50, -25, 0, 25, 50].map((a) => (
        <ellipse key={a} cx={0} cy={-46} rx={14} ry={50} fill={G.fern} style={{ rotate: `${a}deg`, transformOrigin: "0px 0px" }} />
      ))}
    </g>
  );
};

const Buttercup: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g style={{ translate: `${x}px ${y}px` }}>
    <line x1={0} y1={0} x2={0} y2={30} stroke={C.leafDark} strokeWidth={5} strokeLinecap="round" />
    {[0, 72, 144, 216, 288].map((a) => (
      <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 10} cy={Math.sin((a * Math.PI) / 180) * 10} r={9} fill={C.butterDark} />
    ))}
    <circle r={6} fill={C.cream} />
  </g>
);

const Mushroom: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g style={{ translate: `${x}px ${y}px` }}>
    <rect x={-10} y={-30} width={20} height={30} rx={8} fill={C.cream} />
    <path d="M -34 -26 Q 0 -70 34 -26 Z" fill={G.mushroom} />
    <circle cx={-10} cy={-40} r={5} fill="#fff" />
    <circle cx={12} cy={-36} r={4} fill="#fff" />
  </g>
);

export type WoodsProps = {
  /** Background trees (x positions). */
  trees?: number[];
  /** Foreground big trunk x (for hiding), or null. */
  trunk?: number | null;
  /** Show the winding path. */
  path?: boolean;
  /** Scrolls the background (parallax), px. */
  scroll?: number;
  children?: React.ReactNode;
};

const FAR: [number, number][] = [
  [80, 600],
  [300, 570],
  [520, 610],
  [760, 560],
  [980, 600],
  [1210, 570],
  [1440, 610],
  [1660, 560],
  [1880, 600],
];

/** The leafy green wood with its winding path. */
export const Woods: React.FC<WoodsProps> = ({ trees = [], trunk = null, path = true, scroll = 0, children }) => {
  const sx = (x: number, k: number) => ((((x - scroll * k) % 2200) + 2200) % 2200) - 140;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
        <Sky color={G.sky} sunColor={C.sun} sunX={1680} sunY={160} />
        {FAR.map(([x, y], i) => (
          <g key={i}>
            <rect x={sx(x, 0.2) - 10} y={y} width={20} height={200} fill={C.trunkDark} opacity={0.5} />
            <circle cx={sx(x, 0.2)} cy={y} r={110 + (i % 3) * 16} fill={i % 2 ? G.far : G.farDark} />
          </g>
        ))}
        <rect x={0} y={680} width={1920} height={400} fill={G.ground} />
        <ellipse cx={960} cy={690} rx={1300} ry={60} fill={G.ground} />
        {path ? (
          <g>
            <path d={`M -100 1080 Q 400 900 900 820 Q 1400 740 2020 700`} stroke={G.pathEdge} strokeWidth={190} fill="none" />
            <path d={`M -100 1080 Q 400 900 900 820 Q 1400 740 2020 700`} stroke={G.path} strokeWidth={160} fill="none" />
          </g>
        ) : null}
        {trees.map((x) => (
          <WoodTree key={x} x={sx(x, 0.6)} y={690} s={0.8} tone={1} />
        ))}
        {[160, 640, 1260, 1760].map((x, i) => (
          <Fern key={x} x={sx(x, 1)} y={i % 2 ? 1000 : 720} s={i % 2 ? 1.2 : 0.8} />
        ))}
        {[[420, 720], [1100, 1010], [1500, 700]].map(([x, y]) => (
          <Mushroom key={x} x={sx(x, 1)} y={y} />
        ))}
        {[[60, 760], [980, 700], [1360, 1000], [1840, 760], [520, 1030]].map(([x, y]) => (
          <Buttercup key={x} x={sx(x, 1)} y={y} />
        ))}
        {trunk !== null ? <BigTrunk x={trunk} /> : null}
      </svg>
      {children}
    </AbsoluteFill>
  );
};

/** A patch of wildflowers to pick; `picked` 0..1 removes them one by one. Centred at (x, y). */
export const FlowerPatch: React.FC<{ x: number; y: number; picked?: number }> = ({ x, y, picked = 0 }) => {
  const frame = useCurrentFrame();
  const cols = [C.pink, C.lavender, C.butterDark, C.pinkDark, C.blue, C.lavenderDark];
  return (
    <svg viewBox="-200 -100 400 140" width={400} height={140} style={{ position: "absolute", left: x - 200, top: y - 100, overflow: "visible" }}>
      {cols.map((c, i) => {
        const gone = picked * cols.length > i + 0.5;
        if (gone) return null;
        const fx = -160 + i * 64;
        const fy = -30 - (i % 2) * 24 + Math.sin((frame + i * 10) / 14) * 3;
        return (
          <g key={i} style={{ translate: `${fx}px ${fy}px` }}>
            <line x1={0} y1={0} x2={0} y2={60} stroke={C.leafDark} strokeWidth={6} strokeLinecap="round" />
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 14} cy={Math.sin((a * Math.PI) / 180) * 14} r={12} fill={c} />
            ))}
            <circle r={9} fill={C.butter} />
          </g>
        );
      })}
    </svg>
  );
};

/** A little posy held in a paw (for Red). Centre at (x, y). */
export const Posy: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 110 }) => (
  <svg viewBox="-50 -60 100 110" width={size} height={size * 1.1} style={{ position: "absolute", left: x - size / 2, top: y - size * 0.6, overflow: "visible" }}>
    {[[-18, -30, C.pink], [12, -36, C.lavender], [-2, -16, C.butterDark], [22, -12, C.pinkDark]].map(([fx, fy, c], i) => (
      <g key={i}>
        <line x1={fx as number} y1={fy as number} x2={0} y2={40} stroke={C.leafDark} strokeWidth={4} />
        <circle cx={fx as number} cy={fy as number} r={13} fill={c as string} />
        <circle cx={fx as number} cy={fy as number} r={5} fill={C.butter} />
      </g>
    ))}
  </svg>
);

/* ───────────────────────────── Cottages ───────────────────────────── */

export type CottageProps = {
  /** Left edge and bottom (ground) of the cottage. */
  x: number;
  y?: number;
  w?: number;
  h?: number;
  wall?: string;
  roof?: string;
  /** Grandma's face in the window: 0 hidden … 1 fully up. */
  peek?: number;
  peekEyes?: "open" | "wide";
  smoke?: boolean;
};

/** A thatched woodland cottage with a round door and a window. */
export const Cottage: React.FC<CottageProps> = ({ x, y = GROUND_Y, w = 560, h = 380, wall = C.cream, roof = C.lavenderDark, peek = 0, peekEyes = "open", smoke = true }) => {
  const frame = useCurrentFrame();
  const top = y - h;
  const doorX = x + w * 0.22;
  const winX = x + w * 0.58;
  const winY = top + 90;
  const winW = 160;
  const winH = 140;
  const faceY = winY + winH + 150 - peek * 220;
  const blink = (frame + 17) % 90 < 4 && peekEyes === "open";
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <clipPath id={`win-${x}`}>
          <rect x={winX} y={winY} width={winW} height={winH} rx={18} />
        </clipPath>
      </defs>
      {smoke
        ? [0, 1, 2].map((i) => {
            const t = ((frame + i * 30) % 90) / 90;
            return <circle key={i} cx={x + w * 0.78 + Math.sin(t * 6) * 14} cy={top - 140 - t * 180} r={22 + t * 26} fill="#fff" opacity={0.8 * (1 - t)} />;
          })
        : null}
      <rect x={x + w * 0.72} y={top - 150} width={50} height={120} rx={8} fill={C.trunkDark} />
      <rect x={x} y={top} width={w} height={h} rx={20} fill={wall} />
      <path d={`M ${x - 50} ${top + 30} Q ${x + w / 2} ${top - 260} ${x + w + 50} ${top + 30} Z`} fill={roof} />
      <path d={`M ${x - 40} ${top + 30} Q ${x + w / 2} ${top - 10} ${x + w + 40} ${top + 30}`} stroke={C.lavender} strokeWidth={16} fill="none" strokeLinecap="round" />
      {/* door */}
      <path d={`M ${doorX} ${y} L ${doorX} ${y - 170} Q ${doorX + 70} ${y - 250} ${doorX + 140} ${y - 170} L ${doorX + 140} ${y} Z`} fill={C.trunk} />
      <circle cx={doorX + 116} cy={y - 90} r={9} fill={C.butterDark} />
      {/* window with Grandma peeking */}
      <rect x={winX} y={winY} width={winW} height={winH} rx={18} fill="#FFF3D9" />
      <g clipPath={`url(#win-${x})`}>
        <g style={{ translate: `${winX + winW / 2}px ${faceY}px` }}>
          <ellipse cx={-26} cy={-92} rx={16} ry={44} fill={RC.grannyFur} />
          <ellipse cx={26} cy={-92} rx={16} ry={44} fill={RC.grannyFur} />
          <circle r={58} fill={RC.grannyFur} />
          {[-20, 20].map((ex) =>
            blink ? (
              <path key={ex} d={`M ${ex - 9} -6 Q ${ex} -14 ${ex + 9} -6`} stroke={C.ink} strokeWidth={5} fill="none" />
            ) : (
              <circle key={ex} cx={ex} cy={-8} r={peekEyes === "wide" ? 11 : 8} fill={C.ink} />
            ),
          )}
          <g fill="none" stroke={RC.glasses} strokeWidth={4}>
            <circle cx={-20} cy={-8} r={16} />
            <circle cx={20} cy={-8} r={16} />
          </g>
          <path d="M -6 14 Q 0 10 6 14 Q 0 22 -6 14 Z" fill={RC.nose} />
          {peekEyes === "wide" ? <ellipse cx={0} cy={34} rx={8} ry={10} fill={C.ink} /> : null}
        </g>
      </g>
      <rect x={winX + winW / 2 - 5} y={winY} width={10} height={winH} fill={wall} />
      <rect x={winX} y={winY + winH / 2 - 5} width={winW} height={10} fill={wall} />
      <rect x={winX - 14} y={winY + winH - 4} width={winW + 28} height={18} rx={8} fill={C.trunk} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={winX + 30 + i * 50} cy={winY + winH + 26} r={14} fill={i === 1 ? C.pink : C.pinkDark} />
      ))}
    </svg>
  );
};

/* ───────────────────────────── Grandma's bedroom ───────────────────────────── */

export const BED = { x: 760, w: 660, top: 700 };
export const WARDROBE = { x: 1520, w: 320, top: 360 };

/** Back of Grandma's room: wall, window, front door, bed head, wardrobe. Draw `BedFront` after the wolf. */
export const Bedroom: React.FC<{
  /** Wardrobe door opening 0..1. */
  wardrobe?: number;
  /** Peeking eyes in the wardrobe crack. */
  peek?: boolean;
  /** Front door (left) opening 0..1. */
  door?: number;
  children?: React.ReactNode;
}> = ({ wardrobe = 0, peek = false, door = 0, children }) => {
  const frame = useCurrentFrame();
  const crack = (peek ? 70 : 14) + wardrobe * 120;
  const blink = (frame + 9) % 80 < 4;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
        <rect width={1920} height={1080} fill="#FCE9DE" />
        {Array.from({ length: 40 }).map((_, i) => (
          <circle key={i} cx={(i % 10) * 200 + ((Math.floor(i / 10) % 2) * 100) + 40} cy={Math.floor(i / 10) * 170 + 70} r={10} fill={C.pink} opacity={0.5} />
        ))}
        <rect x={0} y={GROUND_Y - 30} width={1920} height={250} fill="#E9CFB4" />
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={i * 220} y={GROUND_Y - 30} width={6} height={250} fill="#DDBE9F" />
        ))}
        <rect x={0} y={GROUND_Y - 40} width={1920} height={14} fill="#E0BFA0" />
        {/* window with the wood outside */}
        <rect x={400} y={260} width={300} height={280} rx={30} fill={G.sky} />
        <circle cx={500} cy={470} r={80} fill={G.far} />
        <circle cx={640} cy={450} r={90} fill={G.farDark} />
        <rect x={545} y={260} width={10} height={280} fill={C.cream} />
        <rect x={400} y={395} width={300} height={10} fill={C.cream} />
        <rect x={386} y={250} width={328} height={300} rx={34} fill="none" stroke={C.cream} strokeWidth={22} />
        <path d={`M 380 250 Q 420 ${400 + Math.sin(frame / 20) * 6} 400 560 L 360 560 L 360 250 Z`} fill={C.lavender} />
        <path d={`M 720 250 Q 680 ${400 + Math.sin(frame / 20 + 1) * 6} 700 560 L 740 560 L 740 250 Z`} fill={C.lavender} />
        {/* front door, left */}
        <rect x={40} y={GROUND_Y - 470} width={260} height={440} rx={24} fill="#BFE3C8" />
        <g style={{ transformOrigin: `40px ${GROUND_Y - 250}px`, scale: `${1 - door * 0.85} 1` }}>
          <rect x={40} y={GROUND_Y - 470} width={260} height={440} rx={24} fill={C.trunk} />
          <circle cx={260} cy={GROUND_Y - 240} r={12} fill={C.butterDark} />
          <rect x={80} y={GROUND_Y - 430} width={180} height={140} rx={16} fill={C.trunkDark} opacity={0.4} />
        </g>
        {/* picture frame */}
        <rect x={1000} y={260} width={180} height={140} rx={16} fill={C.cream} />
        <rect x={1016} y={276} width={148} height={108} rx={10} fill={C.mint} />
        <circle cx={1090} cy={334} r={30} fill={C.pink} />
        {/* bed head */}
        <rect x={BED.x + BED.w - 60} y={BED.top - 200} width={70} height={360} rx={30} fill="#D7B5E8" />
        <circle cx={BED.x + BED.w - 25} cy={BED.top - 210} r={34} fill="#D7B5E8" />
        <ellipse cx={BED.x + BED.w - 120} cy={BED.top - 30} rx={110} ry={56} fill="#fff" />
        <rect x={BED.x} y={BED.top - 20} width={BED.w - 40} height={60} rx={20} fill="#fff" />
        {/* wardrobe */}
        <rect x={WARDROBE.x} y={WARDROBE.top} width={WARDROBE.w} height={GROUND_Y - 20 - WARDROBE.top} rx={22} fill="#C8E3F2" />
        <rect x={WARDROBE.x + 20} y={WARDROBE.top + 20} width={WARDROBE.w - 40} height={GROUND_Y - 60 - WARDROBE.top} rx={14} fill="#8E7EA8" />
        {/* the two doors: left door fixed, right door swings open from the crack */}
        <rect x={WARDROBE.x + 10} y={WARDROBE.top + 10} width={WARDROBE.w / 2 - 10 - crack / 2 + 4} height={GROUND_Y - 40 - WARDROBE.top} rx={14} fill="#D9EEF8" />
        <rect
          x={WARDROBE.x + WARDROBE.w / 2 + crack / 2 + interpolate(wardrobe, [0, 1], [0, 30], clamp)}
          y={WARDROBE.top + 10}
          width={Math.max(10, WARDROBE.w / 2 - 10 - crack / 2 + 4 - wardrobe * 30)}
          height={GROUND_Y - 40 - WARDROBE.top}
          rx={14}
          fill="#D9EEF8"
        />
        {peek ? (
          <g>
            {[0, 1].map((i) =>
              blink ? (
                <path key={i} d={`M ${WARDROBE.x + 134 + i * 34} ${WARDROBE.top + 230} q 9 -8 18 0`} stroke="#fff" strokeWidth={5} fill="none" />
              ) : (
                <g key={i}>
                  <circle cx={WARDROBE.x + 141 + i * 34} cy={WARDROBE.top + 228} r={11} fill="#fff" />
                  <circle cx={WARDROBE.x + 139 + i * 34} cy={WARDROBE.top + 229} r={6} fill={C.ink} />
                </g>
              ),
            )}
          </g>
        ) : null}
        <circle cx={WARDROBE.x + WARDROBE.w / 2 - crack / 2 - 16} cy={WARDROBE.top + 260} r={9} fill={C.butterDark} />
        <rect x={WARDROBE.x + 40} y={WARDROBE.top - 30} width={WARDROBE.w - 80} height={36} rx={14} fill="#C8E3F2" />
        {/* rug */}
        <ellipse cx={560} cy={GROUND_Y + 60} rx={300} ry={50} fill={C.mint} />
        <ellipse cx={560} cy={GROUND_Y + 60} rx={220} ry={32} fill="#fff" opacity={0.5} />
      </svg>
      {children}
    </AbsoluteFill>
  );
};

/** The quilt and foot of the bed, drawn over whoever is in it. */
export const BedFront: React.FC<{ flat?: boolean }> = ({ flat }) => {
  const frame = useCurrentFrame();
  const puff = flat ? 0 : Math.sin(frame / 15) * 4;
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      <path
        d={`M ${BED.x - 20} ${GROUND_Y - 10} L ${BED.x - 10} ${BED.top + 10 - puff} Q ${BED.x + 300} ${BED.top - 30 - puff} ${BED.x + BED.w - 70} ${BED.top - 6} L ${BED.x + BED.w - 60} ${GROUND_Y - 10} Z`}
        fill={C.pink}
      />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={BED.x + 80 + i * 150} cy={BED.top + 80} r={18} fill="#fff" opacity={0.6} />
      ))}
      <path d={`M ${BED.x - 10} ${BED.top + 40} Q ${BED.x + 300} ${BED.top + 10} ${BED.x + BED.w - 70} ${BED.top + 34}`} stroke="#fff" strokeWidth={14} fill="none" opacity={0.7} />
      <rect x={BED.x - 50} y={BED.top - 40} width={60} height={GROUND_Y - BED.top + 30} rx={26} fill="#D7B5E8" />
      <rect x={BED.x - 30} y={GROUND_Y - 30} width={30} height={50} rx={10} fill="#C29FD8" />
      <rect x={BED.x + BED.w - 70} y={GROUND_Y - 30} width={30} height={50} rx={10} fill="#C29FD8" />
    </svg>
  );
};

/* ───────────────────────────── Red's home (edge of the wood) ───────────────────────────── */

export const HOME_COLORS = { wall: C.peach, roof: "#F6B3A9" };

export { G as WOODS };
