/** Field, anthill and cosy-room set pieces for The Ant and the Grasshopper. 1920×1080 space. */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, Flower, Sky, clamp } from "../../kit";
import { AC } from "./Characters";

export const GROUND_Y = 880;

export type Season = "summer" | "autumn" | "winter";

const SKY: Record<Season, string> = { summer: C.sky, autumn: C.skyWarm, winter: "#DCE4F4" };
const HILL: Record<Season, string> = { summer: C.hill, autumn: "#F3E2B8", winter: AC.snowShade };
const HILL2: Record<Season, string> = { summer: C.grassDark, autumn: "#EBCB96", winter: "#D3DDF0" };
const GROUND: Record<Season, string> = { summer: C.grass, autumn: "#EED9A4", winter: AC.snow };

/** Round tree whose leaves follow the season (roots at GROUND_Y - 30). */
export const SeasonTree: React.FC<{ x: number; season: Season; s?: number }> = ({ x, season, s = 1 }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin((frame + x) / 22) * 1.2;
  const leaf = season === "summer" ? C.leaf : season === "autumn" ? AC.orange : AC.snow;
  const leafDark = season === "summer" ? C.leafDark : season === "autumn" ? AC.orangeDark : AC.snowShade;
  return (
    <g style={{ translate: `${x}px ${GROUND_Y - 30}px`, scale: `${s}` }}>
      <path d="M -26 0 Q -18 -160 -14 -300 L 14 -300 Q 18 -160 26 0 Z" fill={C.trunk} />
      <path d="M 0 -200 Q -50 -230 -80 -280" stroke={C.trunk} strokeWidth={14} fill="none" strokeLinecap="round" />
      <g style={{ rotate: `${sway}deg`, transformOrigin: "0px -300px" }}>
        <circle cx={-110} cy={-330} r={110} fill={leafDark} />
        <circle cx={110} cy={-340} r={115} fill={leafDark} />
        <circle cx={0} cy={-420} r={150} fill={leaf} />
        <circle cx={-80} cy={-470} r={80} fill={leaf} />
        <circle cx={90} cy={-460} r={90} fill={leaf} />
        {season !== "winter"
          ? [
              [-40, -400],
              [70, -360],
              [10, -500],
            ].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={14} fill={season === "summer" ? C.pink : C.butterDark} />)
          : null}
      </g>
    </g>
  );
};

const Sunflower: React.FC<{ x: number; h: number }> = ({ x, h }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin((frame + x) / 20) * 3;
  return (
    <g style={{ translate: `${x}px ${GROUND_Y + 10}px`, rotate: `${sway}deg` }}>
      <path d={`M 0 0 Q -6 ${-h / 2} 0 ${-h}`} stroke={C.leafDark} strokeWidth={9} fill="none" />
      <ellipse cx={-22} cy={-h * 0.45} rx={24} ry={10} fill={C.leafDark} style={{ rotate: "-25deg", transformOrigin: `-22px ${-h * 0.45}px` }} />
      {Array.from({ length: 10 }).map((_, i) => (
        <ellipse
          key={i}
          cx={0}
          cy={-h - 30}
          rx={11}
          ry={24}
          fill={C.butterDark}
          style={{ rotate: `${i * 36}deg`, transformOrigin: `0px ${-h}px` }}
        />
      ))}
      <circle cx={0} cy={-h} r={22} fill={C.trunkDark} />
    </g>
  );
};

const GrassTufts: React.FC<{ season: Season }> = ({ season }) => {
  if (season === "winter") return null;
  const c = season === "summer" ? C.grassDark : "#E2C68D";
  return (
    <g>
      {[90, 420, 760, 1120, 1460, 1840].map((x) => (
        <path key={x} d={`M ${x - 24} ${GROUND_Y + 30} L ${x - 12} ${GROUND_Y - 10} L ${x} ${GROUND_Y + 30} L ${x + 12} ${GROUND_Y - 18} L ${x + 24} ${GROUND_Y + 30} Z`} fill={c} />
      ))}
    </g>
  );
};

const FLOWERS: [number, number, string][] = [
  [160, 960, C.pink],
  [520, 1010, C.lavender],
  [940, 980, C.butter],
  [1300, 1030, C.pink],
  [1700, 990, C.lavender],
];

/** Falling snowflakes over the whole frame. */
export const Snowfall: React.FC<{ amount?: number }> = ({ amount = 1 }) => {
  const frame = useCurrentFrame();
  const n = Math.round(44 * amount);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const speed = 1.4 + (i % 4) * 0.5;
        const y = ((i * 137 + frame * speed) % 1180) - 60;
        const x = ((i * 271) % 1920) + Math.sin((frame + i * 20) / 30) * 26;
        const r = 7 + (i % 3) * 4;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: "#fff", opacity: 0.9 }} />;
      })}
    </AbsoluteFill>
  );
};

/** Orange leaves drifting down. */
export const FallingLeaves: React.FC<{ from?: number }> = ({ from = 0 }) => {
  const frame = useCurrentFrame();
  const colors = [AC.orange, AC.orangeDark, C.butterDark, C.pinkDark];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 22 }).map((_, i) => {
        const f = Math.max(0, frame - from);
        const y = ((i * 173 + f * (1.6 + (i % 3) * 0.6)) % 1150) - 60;
        const x = ((i * 311) % 1920) + Math.sin((f + i * 25) / 22) * 60;
        return (
          <svg key={i} viewBox="-30 -20 60 40" width={56} height={38} style={{ position: "absolute", left: x, top: y, rotate: `${Math.sin((f + i * 9) / 14) * 50}deg`, opacity: from > frame ? 0 : 1 }}>
            <path d="M -26 0 Q 0 -22 26 0 Q 0 22 -26 0 Z" fill={colors[i % colors.length]} />
            <line x1={-22} y1={0} x2={22} y2={0} stroke="#fff" strokeWidth={2} opacity={0.5} />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

/* ───────────────────────────── Anthill ───────────────────────────── */

export type AnthillProps = {
  x: number;
  season: Season;
  /** 0 closed, 1 wide open. */
  door?: number;
  /** 0..1: how full the pantry window looks (number of jars shown). */
  pantry?: number;
  /** Show the pantry window cut-away. */
  window?: boolean;
  /** 0..1 sparkle on the solar panels. */
  shine?: number;
  /** Warm light from inside (winter). */
  glow?: boolean;
};

const JAR_COLORS = [AC.orange, C.pinkDark, C.butterDark, C.lavenderDark, C.leafDark, AC.soup];

/** The Ants' mound home: round door, solar panels on top, an optional pantry window. */
export const Anthill: React.FC<AnthillProps> = ({ x, season, door = 0, pantry = 0, window: showWindow, shine = 0, glow }) => {
  const frame = useCurrentFrame();
  const mound = season === "winter" ? "#E6C9AE" : "#E3C29F";
  const moundDark = season === "winter" ? "#D7B597" : "#D2AD86";
  const jars = Math.round(pantry * 12);
  const smoke = glow
    ? [0, 1, 2].map((i) => {
        const t = ((frame + i * 30) % 90) / 90;
        return { y: -t * 160, o: interpolate(t, [0, 0.2, 1], [0, 0.8, 0]), r: 18 + t * 26, dx: Math.sin(t * 5) * 16 };
      })
    : [];
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
        <g style={{ translate: `${x}px ${GROUND_Y + 20}px` }}>
          {/* chimney + smoke */}
          <rect x={120} y={-440} width={44} height={110} rx={8} fill={C.trunkDark} />
          {smoke.map((s, i) => (
            <circle key={i} cx={142 + s.dx} cy={-450 + s.y} r={s.r} fill="#fff" opacity={s.o} />
          ))}
          <path d="M -330 0 Q -300 -400 0 -420 Q 300 -400 330 0 Z" fill={mound} />
          <path d="M -260 0 Q -230 -300 -60 -380" stroke={moundDark} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
          {[
            [-180, -120],
            [150, -200],
            [60, -60],
            [-80, -300],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={10} fill={moundDark} />
          ))}
          {season === "winter" ? <path d="M -150 -380 Q 0 -460 150 -380 Q 100 -350 60 -370 Q 0 -340 -60 -370 Q -100 -350 -150 -380 Z" fill={AC.snow} /> : null}
          {/* solar panels */}
          {[-150, 10].map((px, i) => (
            <g key={i} style={{ translate: `${px}px ${-420 + i * 8}px`, rotate: `${i ? 10 : -10}deg` }}>
              <rect x={-6} y={8} width={12} height={40} fill={C.ink} opacity={0.5} />
              <rect x={-70} y={-30} width={140} height={44} rx={6} fill={AC.solar} stroke={AC.solarDark} strokeWidth={5} />
              <line x1={-23} y1={-30} x2={-23} y2={14} stroke={AC.solarDark} strokeWidth={3} />
              <line x1={23} y1={-30} x2={23} y2={14} stroke={AC.solarDark} strokeWidth={3} />
              <line x1={-70} y1={-8} x2={70} y2={-8} stroke={AC.solarDark} strokeWidth={3} />
              <path d="M -50 -24 L -30 -24 L -46 8 L -66 8 Z" fill="#fff" opacity={0.35 + shine * 0.5} />
              {season === "winter" ? <rect x={-72} y={-38} width={144} height={14} rx={7} fill={AC.snow} /> : null}
            </g>
          ))}
          {/* pantry window */}
          {showWindow ? (
            <g>
              <rect x={-290} y={-290} width={250} height={190} rx={30} fill={C.cream} stroke={C.trunkDark} strokeWidth={10} />
              <rect x={-280} y={-205} width={230} height={8} fill={C.trunk} />
              <rect x={-280} y={-122} width={230} height={8} fill={C.trunk} />
              {Array.from({ length: jars }).map((_, i) => {
                const row = i < 6 ? 0 : 1;
                const col = i % 6;
                return (
                  <g key={i} style={{ translate: `${-262 + col * 38}px ${row ? -130 : -213}px` }}>
                    <rect x={-14} y={-44} width={28} height={44} rx={7} fill={JAR_COLORS[(i * 5) % JAR_COLORS.length]} />
                    <rect x={-16} y={-50} width={32} height={10} rx={4} fill={C.lavenderDark} />
                  </g>
                );
              })}
            </g>
          ) : (
            <g>
              <circle cx={-170} cy={-200} r={50} fill={glow ? C.butter : C.cream} stroke={C.trunkDark} strokeWidth={10} />
              <line x1={-170} y1={-250} x2={-170} y2={-150} stroke={C.trunkDark} strokeWidth={6} />
              <line x1={-220} y1={-200} x2={-120} y2={-200} stroke={C.trunkDark} strokeWidth={6} />
            </g>
          )}
          {/* door */}
          <path d="M -95 0 L -95 -150 Q -95 -230 0 -230 Q 95 -230 95 -150 L 95 0 Z" fill={glow ? C.butter : C.trunkDark} />
          <g style={{ scale: `${1 - door * 0.85} 1`, transformOrigin: "-80px 0px" }}>
            <path d="M -80 0 L -80 -150 Q -80 -214 0 -214 Q 80 -214 80 -150 L 80 0 Z" fill={C.pinkDark} />
            <circle cx={50} cy={-100} r={9} fill={C.butterDark} />
            <circle cx={0} cy={-170} r={20} fill={C.butter} />
          </g>
          {season === "winter" ? <ellipse cx={0} cy={4} rx={330} ry={22} fill={AC.snow} /> : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── Field ───────────────────────────── */

export const Field: React.FC<{
  season: Season;
  trees?: number[];
  sunflowers?: number[];
  children?: React.ReactNode;
}> = ({ season, trees = [], sunflowers = [], children }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
      <Sky
        color={SKY[season]}
        sunColor={season === "winter" ? "#FFF6D8" : season === "autumn" ? "#FFD2A8" : C.sun}
        sunY={season === "autumn" ? 300 : 190}
      />
      <ellipse cx={420} cy={900} rx={900} ry={260} fill={HILL[season]} />
      <ellipse cx={1600} cy={920} rx={800} ry={230} fill={HILL2[season]} opacity={0.8} />
      <rect x={0} y={GROUND_Y} width={1920} height={200} fill={GROUND[season]} />
      {trees.map((x) => (
        <SeasonTree key={x} x={x} season={season} />
      ))}
      {season === "summer" ? sunflowers.map((x, i) => <Sunflower key={x} x={x} h={260 + (i % 2) * 70} />) : null}
      <GrassTufts season={season} />
      {season === "summer" ? FLOWERS.map(([x, y, c], i) => <Flower key={i} x={x} y={y} color={c} />) : null}
      {season === "winter"
        ? [200, 760, 1380, 1800].map((x, i) => <ellipse key={x} cx={x} cy={GROUND_Y + 60 + (i % 2) * 40} rx={140} ry={26} fill={AC.snowShade} />)
        : null}
    </svg>
    {children}
  </AbsoluteFill>
);

/* ───────────────────────────── Cosy room ───────────────────────────── */

/** Inside the anthill: warm walls, a full pantry, a table with soup, string lights. */
export const CosyRoom: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const bulbs = [C.butter, C.pink, C.mint, C.lavender, C.peach];
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
        <rect width={1920} height={1080} fill="#FBE6D2" />
        <path d="M 0 0 L 1920 0 L 1920 120 Q 960 30 0 120 Z" fill="#F2D2B6" />
        <rect x={0} y={GROUND_Y} width={1920} height={200} fill="#E7C6A5" />
        <rect x={0} y={GROUND_Y} width={1920} height={16} fill="#D9B48F" />
        {/* round window with snow outside */}
        <circle cx={300} cy={380} r={140} fill="#DCE4F4" stroke={C.trunkDark} strokeWidth={16} />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const y = 260 + ((i * 47 + frame * 1.6) % 240);
          const x = 220 + ((i * 61) % 170);
          const inside = Math.hypot(x - 300, y - 380) < 125;
          return inside ? <circle key={i} cx={x} cy={y} r={8} fill="#fff" /> : null;
        })}
        <line x1={300} y1={240} x2={300} y2={520} stroke={C.trunkDark} strokeWidth={8} />
        <line x1={160} y1={380} x2={440} y2={380} stroke={C.trunkDark} strokeWidth={8} />
        {/* pantry shelves */}
        {[300, 440, 580].map((y, r) => (
          <g key={y}>
            <rect x={1440} y={y} width={400} height={16} rx={6} fill={C.trunkDark} />
            {Array.from({ length: 7 }).map((_, i) => (
              <g key={i} style={{ translate: `${1474 + i * 54}px ${y}px` }}>
                <rect x={-18} y={-58} width={36} height={58} rx={9} fill={JAR_COLORS[(i + r * 2) % JAR_COLORS.length]} />
                <rect x={-20} y={-66} width={40} height={12} rx={5} fill={C.lavenderDark} />
              </g>
            ))}
          </g>
        ))}
        {/* string lights */}
        <path d="M 0 130 Q 480 250 960 140 Q 1440 250 1920 130" stroke={C.ink} strokeWidth={3} fill="none" opacity={0.4} />
        {Array.from({ length: 16 }).map((_, i) => {
          const t = (i + 0.5) / 16;
          const half = t < 0.5 ? t * 2 : (t - 0.5) * 2;
          const x = t * 1920;
          const y = 130 + Math.sin(half * Math.PI) * 80 + 10;
          const on = (i + Math.floor(frame / 12)) % 3 !== 0;
          return <circle key={i} cx={x} cy={y + 14} r={16} fill={bulbs[i % bulbs.length]} opacity={on ? 1 : 0.55} />;
        })}
        {/* table */}
        <rect x={720} y={GROUND_Y - 150} width={480} height={26} rx={12} fill={C.trunk} />
        <rect x={750} y={GROUND_Y - 130} width={22} height={140} rx={8} fill={C.trunkDark} />
        <rect x={1148} y={GROUND_Y - 130} width={22} height={140} rx={8} fill={C.trunkDark} />
        {[800, 960, 1120].map((x, i) => (
          <g key={x}>
            <path d={`M ${x - 46} ${GROUND_Y - 190} Q ${x} ${GROUND_Y - 130} ${x + 46} ${GROUND_Y - 190} Z`} fill={[C.mint, C.lavender, C.pink][i]} />
            <ellipse cx={x} cy={GROUND_Y - 190} rx={46} ry={10} fill={AC.soup} />
            {[0, 1].map((k) => {
              const t = ((frame + k * 25 + i * 10) % 50) / 50;
              return (
                <path
                  key={k}
                  d={`M ${x - 10 + k * 20} ${GROUND_Y - 200 - t * 60} q 8 -12 0 -24`}
                  stroke="#fff"
                  strokeWidth={5}
                  fill="none"
                  strokeLinecap="round"
                  opacity={interpolate(t, [0, 0.3, 1], [0, 0.8, 0], clamp)}
                />
              );
            })}
          </g>
        ))}
      </svg>
      {children}
    </AbsoluteFill>
  );
};
