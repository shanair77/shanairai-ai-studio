/** Street, houses and wind for The Three Little Pigs. 1920×1080 space; houses stand on GROUND_Y. */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, Flower, Sky, clamp } from "../../kit";
import { PC, type PigKind } from "./Characters";

export const GROUND_Y = 860;

/* ───────────────────────────── Street ───────────────────────────── */

const RoundTree: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin((frame + x) / 24) * 1.4;
  return (
    <g style={{ translate: `${x}px ${GROUND_Y - 20}px`, scale: `${s}` }}>
      <path d="M -20 20 Q -14 -120 -10 -230 L 10 -230 Q 14 -120 20 20 Z" fill={C.trunk} />
      <g style={{ rotate: `${sway}deg`, transformOrigin: "0px -230px" }}>
        <circle cx={-80} cy={-260} r={90} fill={C.leafDark} />
        <circle cx={80} cy={-270} r={95} fill={C.leafDark} />
        <circle cx={0} cy={-340} r={125} fill={C.leaf} />
        <circle cx={-40} cy={-330} r={12} fill={C.pink} />
        <circle cx={50} cy={-290} r={12} fill={C.pink} />
        <circle cx={20} cy={-400} r={12} fill={C.pink} />
      </g>
    </g>
  );
};

const Fence: React.FC<{ from: number; to: number }> = ({ from, to }) => (
  <g>
    <rect x={from} y={GROUND_Y - 92} width={to - from} height={12} rx={6} fill={C.cream} />
    <rect x={from} y={GROUND_Y - 52} width={to - from} height={12} rx={6} fill={C.cream} />
    {Array.from({ length: Math.floor((to - from) / 46) + 1 }).map((_, i) => (
      <path key={i} d={`M ${from + i * 46 - 9} ${GROUND_Y} L ${from + i * 46 - 9} ${GROUND_Y - 110} L ${from + i * 46} ${GROUND_Y - 124} L ${from + i * 46 + 9} ${GROUND_Y - 110} L ${from + i * 46 + 9} ${GROUND_Y} Z`} fill={C.cream} />
    ))}
  </g>
);

const FLOWERS: [number, number, string][] = [
  [90, 900, C.pink],
  [420, 930, C.lavender],
  [760, 905, C.butter],
  [1180, 935, C.pink],
  [1520, 900, C.lavender],
  [1840, 925, C.butter],
];

export type StreetProps = {
  time?: "day" | "dusk";
  trees?: number[];
  fence?: [number, number][];
  children?: React.ReactNode;
};

/** A sunny countryside cul-de-sac: hills, fences, grass verge and a little lane. */
export const Street: React.FC<StreetProps> = ({ time = "day", trees = [], fence = [], children }) => {
  const dusk = time === "dusk";
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
        <Sky color={dusk ? "#FFDCCB" : "#D5EEF8"} sunColor={dusk ? "#FFC7A0" : C.sun} sunX={dusk ? 1500 : 1650} sunY={dusk ? 520 : 180} />
        <ellipse cx={300} cy={GROUND_Y + 40} rx={760} ry={250} fill={dusk ? "#F5D9C6" : C.hill} />
        <ellipse cx={1500} cy={GROUND_Y + 60} rx={900} ry={260} fill={dusk ? "#EFCDB8" : "#C6E9C0"} />
        {/* far fields with little haystacks */}
        {[220, 640, 1380, 1760].map((x, i) => (
          <g key={x} style={{ translate: `${x}px ${GROUND_Y - 150 + (i % 2) * 24}px` }}>
            <path d="M -34 0 Q -30 -46 0 -50 Q 30 -46 34 0 Z" fill={PC.straw} opacity={0.8} />
          </g>
        ))}
        {trees.map((x) => (
          <RoundTree key={x} x={x} s={0.9} />
        ))}
        {fence.map(([a, b]) => (
          <Fence key={a} from={a} to={b} />
        ))}
        <rect x={0} y={GROUND_Y} width={1920} height={220} fill={dusk ? "#E6E0B8" : C.grass} />
        <rect x={0} y={GROUND_Y + 120} width={1920} height={100} fill={dusk ? "#DCD3E2" : "#E4DEEE"} />
        <rect x={0} y={GROUND_Y + 112} width={1920} height={14} fill={C.cream} />
        {[160, 560, 960, 1360, 1760].map((x) => (
          <rect key={x} x={x - 60} y={GROUND_Y + 166} width={120} height={10} rx={5} fill="#fff" opacity={0.8} />
        ))}
        {FLOWERS.map(([x, y, c], i) => (
          <Flower key={i} x={x} y={y} color={c} />
        ))}
      </svg>
      {children}
    </AbsoluteFill>
  );
};

/* ───────────────────────────── Peeking faces ───────────────────────────── */

/** A little pig face for windows and doorways, centred at (0, 0), r ≈ 40. */
export const PigFace: React.FC<{ kind: PigKind; x: number; y: number; s?: number; happy?: boolean; mouth?: number }> = ({
  kind,
  x,
  y,
  s = 1,
  happy,
  mouth = 0,
}) => {
  const frame = useCurrentFrame();
  const blink = (frame + x) % 90 < 4;
  return (
    <g style={{ translate: `${x}px ${y}px`, scale: `${s}` }}>
      <path d="M -34 -26 L -42 -58 L -12 -40 Z" fill={PC.pigDark} />
      <path d="M 34 -26 L 42 -58 L 12 -40 Z" fill={PC.pig} />
      <circle r={40} fill={PC.pig} />
      {happy || blink ? (
        <>
          <path d="M -22 -8 Q -14 -16 -6 -8" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M 6 -8 Q 14 -16 22 -8" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={-14} cy={-8} r={6} fill={C.ink} />
          <circle cx={14} cy={-8} r={6} fill={C.ink} />
        </>
      )}
      <ellipse cx={0} cy={12} rx={17} ry={12} fill={PC.snout} />
      <ellipse cx={-6} cy={12} rx={3} ry={5} fill={PC.pigDark} />
      <ellipse cx={6} cy={12} rx={3} ry={5} fill={PC.pigDark} />
      {mouth > 0.15 ? <ellipse cx={0} cy={31} rx={7} ry={2 + mouth * 5} fill={C.ink} /> : null}
      {kind === "straw" ? <path d="M -38 -24 Q -30 -54 0 -56 Q 30 -54 38 -24 Z" fill={PC.cap} /> : null}
      {kind === "sticks" ? (
        <g style={{ translate: "0px -44px" }}>
          <path d="M 0 0 L -16 -9 L -16 9 Z" fill={PC.dressDark} />
          <path d="M 0 0 L 16 -9 L 16 9 Z" fill={PC.dressDark} />
          <circle r={5} fill={PC.dress} />
        </g>
      ) : null}
      {kind === "brick" ? (
        <g>
          <path d="M -40 -22 Q -38 -58 0 -60 Q 38 -58 40 -22 Z" fill={PC.hardHat} />
          <rect x={-46} y={-26} width={92} height={8} rx={4} fill={C.butterDark} />
        </g>
      ) : null}
    </g>
  );
};

/* ───────────────────────────── Houses ───────────────────────────── */

type HouseProps = {
  /** Centre x; the house stands on GROUND_Y. */
  x: number;
  /** 0..1 building progress (pieces appear bottom-up, roof last). */
  build?: number;
  /** 0..1 blown away to the right. */
  blown?: number;
  /** Pig faces in the window. */
  peek?: PigKind[];
  s?: number;
};

const HOUSE = 500;

const HouseBox: React.FC<{ x: number; s: number; children: React.ReactNode }> = ({ x, s, children }) => (
  <svg
    viewBox={`0 0 ${HOUSE} ${HOUSE}`}
    width={HOUSE * s}
    height={HOUSE * s}
    style={{ position: "absolute", left: x - (HOUSE * s) / 2, top: GROUND_Y - HOUSE * s, overflow: "visible" }}
  >
    {children}
  </svg>
);

/** Where piece i goes when the house is blown away (to the right). */
const flyAway = (i: number, blown: number, n: number): React.CSSProperties => {
  if (blown <= 0) return {};
  const k = (i * 37) % n;
  const dx = blown * (520 + k * 70);
  const dy = -blown * (180 + ((k * 53) % 5) * 70) + blown * blown * 160;
  return {
    translate: `${dx}px ${dy}px`,
    rotate: `${blown * (60 + k * 35)}deg`,
    transformBox: "fill-box",
    transformOrigin: "center",
    opacity: interpolate(blown, [0.55, 1], [1, 0], clamp),
  };
};

const shown = (i: number, n: number, build: number) => interpolate(build * n, [i, i + 0.6], [0, 1], clamp);

export const StrawHouse: React.FC<HouseProps> = ({ x, build = 1, blown = 0, peek = [], s = 1 }) => {
  const frame = useCurrentFrame();
  const rows = 5;
  const pieces = rows * 3 + 3;
  let idx = 0;
  const wobble = Math.sin(frame / 7) * 1.2;
  return (
    <HouseBox x={x} s={s}>
      <g style={{ rotate: `${build >= 1 && blown === 0 ? wobble * 0.3 : 0}deg`, transformOrigin: "250px 500px" }}>
        {/* window glow + faces behind the walls' window hole */}
        {Array.from({ length: rows }).map((_, r) =>
          [0, 1, 2].map((c) => {
            const i = idx++;
            const w = 120;
            const bx = 70 + c * w;
            const by = 500 - (r + 1) * 56;
            const isDoor = c === 1 && r < 2;
            if (isDoor) return null;
            return (
              <g key={`${r}-${c}`} style={{ ...flyAway(i, blown, pieces), opacity: shown(i, pieces, build) * (blown > 0 ? interpolate(blown, [0.55, 1], [1, 0], clamp) : 1) }}>
                <rect x={bx} y={by} width={w} height={56} rx={22} fill={(r + c) % 2 ? PC.straw : PC.strawDark} />
                {[0.2, 0.45, 0.7].map((t) => (
                  <line key={t} x1={bx + w * t} y1={by + 10} x2={bx + w * t + 10} y2={by + 46} stroke={C.butterDark} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
                ))}
              </g>
            );
          }),
        )}
        {/* door */}
        <g style={{ ...flyAway(idx++, blown, pieces), opacity: shown(4, pieces, build) * (blown > 0 ? interpolate(blown, [0.55, 1], [1, 0], clamp) : 1) }}>
          <path d="M 196 500 L 196 420 Q 196 388 250 388 Q 304 388 304 420 L 304 500 Z" fill={C.pinkDark} />
          <circle cx={284} cy={450} r={7} fill={C.butter} />
        </g>
        {/* window with faces */}
        {build >= 0.85 && blown < 0.2 ? (
          <g>
            <circle cx={370} cy={302} r={38} fill={C.cream} />
            {peek.map((k, i) => (
              <PigFace key={k} kind={k} x={370 + (i - (peek.length - 1) / 2) * 30} y={306} s={0.62} />
            ))}
            <circle cx={370} cy={302} r={38} fill="none" stroke={PC.strawDark} strokeWidth={10} />
          </g>
        ) : null}
        {/* roof */}
        {[0, 1, 2].map((k) => {
          const i = idx++;
          const paths = [
            "M 40 226 L 160 116 L 200 226 Z",
            "M 150 226 L 250 50 L 350 226 Z",
            "M 300 226 L 340 116 L 460 226 Z",
          ];
          return (
            <g key={k} style={{ ...flyAway(i, blown, pieces), opacity: shown(pieces - 3 + k, pieces, build) * (blown > 0 ? interpolate(blown, [0.55, 1], [1, 0], clamp) : 1) }}>
              <path d={paths[k]} fill={k === 1 ? PC.strawDark : PC.straw} strokeLinejoin="round" stroke={k === 1 ? PC.strawDark : PC.straw} strokeWidth={14} />
              {[0, 1, 2].map((j) => (
                <line key={j} x1={140 + k * 100 + j * 20} y1={200} x2={150 + k * 100 + j * 16} y2={150} stroke={C.butterDark} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
              ))}
            </g>
          );
        })}
      </g>
    </HouseBox>
  );
};

export const StickHouse: React.FC<HouseProps> = ({ x, build = 1, blown = 0, peek = [], s = 1 }) => {
  const sticks = 11;
  const roofSticks = 8;
  const pieces = sticks + roofSticks + 1;
  const fade = (i: number) => shown(i, pieces, build) * (blown > 0 ? interpolate(blown, [0.55, 1], [1, 0], clamp) : 1);
  return (
    <HouseBox x={x} s={s}>
      {/* window with faces (behind the stick frame) */}
      {build >= 0.7 && blown < 0.2 ? (
        <g>
          <rect x={300} y={290} width={92} height={78} rx={10} fill={C.cream} />
          {peek.map((k, i) => (
            <PigFace key={k} kind={k} x={346 + (i - (peek.length - 1) / 2) * 34} y={334} s={0.6} />
          ))}
        </g>
      ) : null}
      {Array.from({ length: sticks }).map((_, i) => {
        const sx = 84 + i * 33;
        const inDoor = sx > 196 && sx < 300;
        const inWin = sx > 296 && sx < 396;
        return (
          <g key={i} style={{ ...flyAway(i, blown, pieces), opacity: fade(i) }}>
            {inDoor ? (
              <rect x={sx - 10} y={236} width={20} height={150} rx={9} fill={i % 2 ? PC.stick : PC.stickDark} />
            ) : inWin ? (
              <>
                <rect x={sx - 10} y={236} width={20} height={50} rx={9} fill={i % 2 ? PC.stick : PC.stickDark} />
                <rect x={sx - 10} y={372} width={20} height={128} rx={9} fill={i % 2 ? PC.stick : PC.stickDark} />
              </>
            ) : (
              <rect x={sx - 10} y={236} width={20} height={264} rx={9} fill={i % 2 ? PC.stick : PC.stickDark} />
            )}
            <circle cx={sx} cy={300} r={4} fill={C.pinkDark} opacity={0.8} />
          </g>
        );
      })}
      {/* string ties */}
      <g style={{ opacity: fade(sticks - 1) * (blown > 0.05 ? 0 : 1) }}>
        <line x1={70} y1={300} x2={430} y2={300} stroke={C.pinkDark} strokeWidth={4} opacity={0.7} />
        <line x1={70} y1={440} x2={196} y2={440} stroke={C.pinkDark} strokeWidth={4} opacity={0.7} />
        <line x1={300} y1={440} x2={430} y2={440} stroke={C.pinkDark} strokeWidth={4} opacity={0.7} />
      </g>
      {/* door */}
      <g style={{ ...flyAway(sticks, blown, pieces), opacity: fade(3) }}>
        <rect x={198} y={386} width={100} height={114} rx={14} fill={C.mint} />
        <circle cx={280} cy={446} r={7} fill={C.butterDark} />
      </g>
      {/* roof: a fan of sticks over a soft triangle */}
      <path d="M 46 246 L 250 70 L 454 246 Z" fill={PC.stick} opacity={fade(sticks + 1) * 0.45} style={flyAway(sticks + 1, blown, pieces)} />
      {Array.from({ length: roofSticks }).map((_, k) => {
        const i = sticks + 1 + k;
        const left = k < roofSticks / 2;
        const j = left ? k : k - roofSticks / 2;
        const x1 = left ? 40 + j * 46 : 460 - j * 46;
        return (
          <g key={k} style={{ ...flyAway(i, blown, pieces), opacity: fade(i) }}>
            <line x1={x1} y1={250} x2={250} y2={66 + j * 10} stroke={k % 2 ? PC.stickDark : PC.stick} strokeWidth={18} strokeLinecap="round" />
          </g>
        );
      })}
    </HouseBox>
  );
};

export const BrickHouse: React.FC<
  HouseProps & {
    /** 0..1 solar panels pop in. */
    solar?: number;
    /** 0..1 video doorbell pops in. */
    bell?: number;
    /** Ringing: the doorbell glows and sends rings out. */
    ringing?: boolean;
    /** Faces in the window are smiling. */
    happy?: boolean;
    /** Faces in the window are talking. */
    talk?: number;
    /** Windows glow warm (evening). */
    glow?: boolean;
  }
> = ({ x, build = 1, peek = [], s = 1, solar = 1, bell = 1, ringing, happy, talk = 0, glow }) => {
  const frame = useCurrentFrame();
  const rows = 9;
  const rowH = 30;
  const pop = (v: number) => interpolate(v, [0, 0.7, 1], [0, 1.15, 1], clamp);
  const glowOn = ringing ? 0.5 + Math.abs(Math.sin(frame / 4)) * 0.5 : 0.35;
  return (
    <HouseBox x={x} s={s}>
      {/* chimney */}
      <g style={{ opacity: interpolate(build, [0.9, 1], [0, 1], clamp) }}>
        <rect x={330} y={80} width={50} height={110} fill={PC.brickDark} />
        <rect x={322} y={72} width={66} height={18} rx={6} fill={PC.mortar} />
      </g>
      {/* roof */}
      <g style={{ opacity: interpolate(build, [0.86, 1], [0, 1], clamp), translate: `0px ${interpolate(build, [0.86, 1], [-40, 0], clamp)}px` }}>
        <path d="M 46 236 L 250 64 L 454 236 Z" fill={PC.roof} stroke={PC.roof} strokeWidth={16} strokeLinejoin="round" />
        <path d="M 96 214 L 250 90 L 404 214" stroke={PC.roofDark} strokeWidth={6} fill="none" opacity={0.5} />
      </g>
      {/* solar panels */}
      {solar > 0
        ? [0, 1].map((i) => (
            <g key={i} style={{ scale: `${pop(solar)}`, transformOrigin: `${136 + i * 70}px ${190 - i * 58}px` }}>
              <path
                d={`M ${104 + i * 70} ${214 - i * 58} L ${150 + i * 70} ${176 - i * 58} L ${176 + i * 70} ${198 - i * 58} L ${130 + i * 70} ${236 - i * 58} Z`}
                fill={PC.solar}
                stroke={PC.solarDark}
                strokeWidth={5}
                strokeLinejoin="round"
              />
              <line x1={127 + i * 70} y1={195 - i * 58} x2={153 + i * 70} y2={217 - i * 58} stroke={PC.solarDark} strokeWidth={3} />
              <path d={`M ${120 + i * 70} ${206 - i * 58} L ${136 + i * 70} ${193 - i * 58}`} stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
            </g>
          ))
        : null}
      {/* walls: rows of bricks, bottom-up */}
      {Array.from({ length: rows }).map((_, r) => {
        const o = interpolate(build * rows * 1.12, [r, r + 0.7], [0, 1], clamp);
        const y = 500 - (r + 1) * rowH;
        const off = r % 2 ? 0 : 34;
        return (
          <g key={r} style={{ opacity: o, translate: `0px ${(1 - o) * -24}px` }}>
            <rect x={70} y={y} width={360} height={rowH} fill={PC.mortar} />
            {Array.from({ length: 6 }).map((__, k) => {
              const bx = 70 - off + k * 68 + 3;
              const x1 = Math.max(73, bx);
              const x2 = Math.min(427, bx + 62);
              return x2 > x1 ? <rect key={k} x={x1} y={y + 3} width={x2 - x1} height={rowH - 6} rx={5} fill={(r * 3 + k) % 4 === 0 ? PC.brickDark : PC.brick} /> : null;
            })}
          </g>
        );
      })}
      {/* door and window once the walls are up */}
      <g style={{ opacity: interpolate(build, [0.55, 0.7], [0, 1], clamp) }}>
        <path d="M 200 500 L 200 404 Q 200 368 246 368 Q 292 368 292 404 L 292 500 Z" fill={C.lavenderDark} />
        <circle cx={276} cy={442} r={7} fill={C.butter} />
        <rect x={110} y={300} width={86} height={80} rx={12} fill={glow ? C.butter : C.cream} stroke={PC.mortar} strokeWidth={8} />
        <line x1={153} y1={300} x2={153} y2={380} stroke={PC.mortar} strokeWidth={6} />
      </g>
      {/* big front window with faces */}
      <g style={{ opacity: interpolate(build, [0.7, 0.85], [0, 1], clamp) }}>
        <rect x={304} y={272} width={120} height={108} rx={14} fill={glow ? C.butter : C.cream} />
        {peek.map((k, i) => (
          <PigFace key={k} kind={k} x={364 + (i - (peek.length - 1) / 2) * 36} y={338} s={0.56} happy={happy} mouth={talk} />
        ))}
        <rect x={304} y={272} width={120} height={108} rx={14} fill="none" stroke={PC.mortar} strokeWidth={8} />
      </g>
      {/* video doorbell */}
      <g style={{ scale: `${pop(bell)}`, transformOrigin: "176px 426px" }}>
        {ringing
          ? [0, 1, 2].map((i) => {
              const t = ((frame + i * 10) % 30) / 30;
              return <circle key={i} cx={176} cy={426} r={18 + t * 50} fill="none" stroke={C.butterDark} strokeWidth={5} opacity={1 - t} />;
            })
          : null}
        <rect x={162} y={400} width={28} height={52} rx={10} fill={C.ink} opacity={0.85} />
        <circle cx={176} cy={414} r={7} fill={C.blue} />
        <circle cx={176} cy={438} r={8} fill={C.butter} opacity={glowOn} />
        <circle cx={176} cy={438} r={5} fill="#fff" opacity={0.8} />
      </g>
    </HouseBox>
  );
};

/** Mama Pig's flowery cottage (centre x, on GROUND_Y). */
export const Cottage: React.FC<{ x: number }> = ({ x }) => (
  <HouseBox x={x} s={1}>
    <rect x={70} y={230} width={360} height={270} rx={20} fill={C.peach} />
    <path d="M 40 246 L 250 70 L 460 246 Z" fill={C.pinkDark} stroke={C.pinkDark} strokeWidth={16} strokeLinejoin="round" />
    <circle cx={250} cy={170} r={30} fill={C.cream} />
    <path d="M 196 500 L 196 400 Q 196 362 250 362 Q 304 362 304 400 L 304 500 Z" fill={C.lavender} />
    <path d="M 196 500 L 196 400 Q 196 362 230 362 L 230 500 Z" fill={C.lavenderDark} />
    <rect x={104} y={300} width={66} height={60} rx={10} fill={C.cream} />
    <rect x={330} y={300} width={66} height={60} rx={10} fill={C.cream} />
    {[96, 136, 176, 324, 364, 404].map((fx, i) => (
      <circle key={fx} cx={fx} cy={368} r={12} fill={i % 2 ? C.butter : C.pink} />
    ))}
  </HouseBox>
);

/* ───────────────────────────── Wind ───────────────────────────── */

/** Whooshing wind lines blowing right from (x, y), `amount` 0..1. */
export const Gust: React.FC<{ x: number; y: number; length?: number; amount: number }> = ({ x, y, length = 640, amount }) => {
  const frame = useCurrentFrame();
  if (amount <= 0) return null;
  const lines = [-70, -20, 30, 80, 130];
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: amount }}>
      {lines.map((dy, i) => {
        const yy = y + dy;
        const L = length * (0.7 + (i % 3) * 0.15);
        return (
          <path
            key={i}
            d={`M ${x} ${yy} q ${L / 4} ${-24 - i * 4} ${L / 2} 0 t ${L / 2} 0`}
            stroke={PC.wind}
            strokeWidth={14 - i}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${L * 0.3} ${L * 0.22}`}
            strokeDashoffset={-frame * 26 - i * 40}
            opacity={0.9}
          />
        );
      })}
      {[0, 1, 2].map((i) => {
        const t = ((frame * 1.4 + i * 30) % 60) / 60;
        return (
          <g key={`c${i}`} style={{ translate: `${x + 80 + t * length}px ${y - 40 + i * 70 + Math.sin(t * 8) * 20}px`, rotate: `${t * 300}deg` }}>
            <path d="M -16 0 A 16 16 0 1 1 0 16" stroke={PC.wind} strokeWidth={6} fill="none" strokeLinecap="round" opacity={1 - t} />
          </g>
        );
      })}
    </svg>
  );
};

/** Leftover bits drifting down after a house blows away (straw or sticks). */
export const Drifting: React.FC<{ x: number; kind: "straw" | "sticks"; amount: number }> = ({ x, kind, amount }) => {
  const frame = useCurrentFrame();
  if (amount <= 0) return null;
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: amount }}>
      {Array.from({ length: 9 }).map((_, i) => {
        const t = ((frame * 0.8 + i * 23) % 120) / 120;
        const px = x - 200 + ((i * 131) % 520) + Math.sin(t * 6 + i) * 40;
        const py = 320 + t * (GROUND_Y - 300);
        return (
          <g key={i} style={{ translate: `${px}px ${py}px`, rotate: `${t * 200 + i * 40}deg` }}>
            {kind === "straw" ? (
              <line x1={-18} y1={0} x2={18} y2={0} stroke={i % 2 ? PC.straw : PC.strawDark} strokeWidth={6} strokeLinecap="round" />
            ) : (
              <rect x={-26} y={-6} width={52} height={12} rx={6} fill={i % 2 ? PC.stick : PC.stickDark} />
            )}
          </g>
        );
      })}
    </svg>
  );
};
