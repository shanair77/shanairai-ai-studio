/**
 * The community garden on a hot summer day: rooftops far away, a picket fence, raised beds,
 * bean poles, sunflowers, a shed with a science-fair poster and pop-up sprinklers on a sunset
 * timer. 1920×1080; feet line at GROUND_Y.
 */

import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { C, Sky, clamp, useT } from "../../kit";
import { PC, PebbleShape } from "./Characters";

export const GROUND_Y = 870;

const G = {
  sky: "#FFEBD6",
  skySunset: "#FBC6C0",
  sun: "#FFE38A",
  sunSunset: "#FFB58A",
  roof: "#F3D2C4",
  roof2: "#E6D3EE",
  roof3: "#D6E7F2",
  window: "#FFF7EA",
  fence: "#F4ECF8",
  fenceDark: "#E2D6EC",
  ground: "#D3EDB9",
  groundDark: "#C1E3A4",
  path: "#F6E5C8",
  pathEdge: "#EAD2AE",
  wood: "#E2BC8E",
  woodDark: "#C99D6E",
  soil: "#C9A588",
  leaf: "#A8DDB5",
  leafDark: "#8FCFA0",
  petal: "#FFD86B",
  petalDark: "#F2BE4E",
  seed: "#C39E7E",
  shed: "#BFE3D0",
  shedDark: "#A3D3BB",
  shedRoof: "#F6B3A9",
  door: "#F9D9C4",
  sprinkler: "#9CCFF0",
  sprinklerDark: "#79B6E3",
};

/** A sunflower, base at (x, y). `droop` 0..1 bends the head down in the heat. */
export const Sunflower: React.FC<{ x: number; y?: number; h?: number; droop?: number; seed?: number }> = ({ x, y = GROUND_Y - 30, h = 330, droop = 0, seed = 0 }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin((frame + seed * 30) / 22) * 2;
  const bend = droop * 75;
  return (
    <g style={{ translate: `${x}px ${y}px` }}>
      <path d={`M 0 0 Q ${8 - droop * 10} ${-h * 0.9} ${droop * 80} ${-h + droop * 110}`} stroke={G.leafDark} strokeWidth={14} fill="none" strokeLinecap="round" />
      <ellipse cx={-34} cy={-h * 0.42} rx={36} ry={16} fill={G.leaf} style={{ rotate: `${20 + droop * 25}deg`, transformOrigin: `0px ${-h * 0.42}px` }} />
      <ellipse cx={34} cy={-h * 0.6} rx={36} ry={16} fill={G.leaf} style={{ rotate: `${-20 - droop * 25}deg`, transformOrigin: `0px ${-h * 0.6}px` }} />
      <g style={{ translate: `${droop * 80}px ${-h + droop * 110}px`, rotate: `${bend + sway}deg` }}>
        <g style={{ scale: `${1 - droop * 0.12} ${1 - droop * 0.3}` }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse key={i} cx={0} cy={-52} rx={17} ry={34} fill={i % 2 ? G.petal : G.petalDark} style={{ rotate: `${i * 30}deg`, transformOrigin: "0px 0px" }} />
          ))}
          <circle r={38} fill={G.seed} />
          <circle cx={-10} cy={-10} r={5} fill={G.woodDark} />
          <circle cx={10} cy={-4} r={5} fill={G.woodDark} />
          <circle cx={0} cy={12} r={5} fill={G.woodDark} />
        </g>
      </g>
    </g>
  );
};

/** A raised wooden bed of leafy veg, left edge at x. */
export const RaisedBed: React.FC<{ x: number; w?: number; y?: number; droop?: number }> = ({ x, w = 360, y = GROUND_Y - 20, droop = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <g style={{ translate: `${x}px ${y}px` }}>
      {Array.from({ length: Math.floor(w / 70) }).map((_, i) => {
        const sway = Math.sin((frame + i * 17 + x) / 20) * 3;
        return (
          <g key={i} style={{ translate: `${40 + i * 70}px -70px`, rotate: `${sway + (i % 2 ? 1 : -1) * droop * 20}deg` }}>
            <ellipse cx={-16} cy={-20} rx={18} ry={34} fill={G.leafDark} style={{ rotate: "-25deg" }} />
            <ellipse cx={16} cy={-20} rx={18} ry={34} fill={G.leaf} style={{ rotate: "25deg" }} />
            <ellipse cx={0} cy={-34} rx={16} ry={36} fill={G.leaf} />
          </g>
        );
      })}
      <rect x={0} y={-90} width={w} height={24} rx={8} fill={G.soil} />
      <rect x={-10} y={-76} width={w + 20} height={84} rx={14} fill={G.wood} />
      <path d={`M 4 -36 L ${w - 4} -36`} stroke={G.woodDark} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
    </g>
  );
};

/** Bean-pole teepee with twisting vines, base centre at x. */
export const BeanPoles: React.FC<{ x: number; y?: number; h?: number }> = ({ x, y = GROUND_Y - 10, h = 520 }) => {
  const frame = useCurrentFrame();
  return (
    <g style={{ translate: `${x}px ${y}px` }}>
      {[-110, 0, 110].map((dx, i) => (
        <g key={i}>
          <line x1={dx} y1={0} x2={0} y2={-h} stroke={G.woodDark} strokeWidth={12} strokeLinecap="round" />
          {Array.from({ length: 6 }).map((_, j) => {
            const t = (j + 0.5) / 6;
            const px = dx * (1 - t);
            const py = -h * t;
            const sway = Math.sin((frame + j * 13 + i * 7) / 18) * 6;
            return (
              <g key={j} style={{ translate: `${px + (j % 2 ? 14 : -14)}px ${py}px`, rotate: `${sway + (j % 2 ? 30 : -30)}deg` }}>
                <ellipse cx={0} cy={0} rx={22} ry={13} fill={j % 2 ? G.leaf : G.leafDark} />
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
};

/** The sprinkler's little timer screen (sun → moon icon = "on at sunset"). */
const TimerIcon: React.FC<{ on: boolean }> = ({ on }) =>
  on ? (
    <g>
      <circle cx={0} cy={4} r={9} fill={G.sunSunset} />
      <rect x={-14} y={4} width={28} height={10} fill={PC.robotFace} />
      <path d="M -12 6 L 12 6" stroke={G.sunSunset} strokeWidth={3} strokeLinecap="round" />
    </g>
  ) : (
    <path d="M 4 -10 A 12 12 0 1 0 10 8 A 9 9 0 1 1 4 -10 Z" fill={PC.led} />
  );

/** A pop-up sprinkler on a timer post. `spray` 0..1 turns the water on; `zzz` shows it asleep. */
export const Sprinkler: React.FC<{ x: number; y?: number; spray?: number; zzz?: boolean; s?: number }> = ({ x, y = GROUND_Y + 10, spray = 0, zzz, s = 1.5 }) => {
  const frame = useCurrentFrame();
  return (
    <g style={{ translate: `${x}px ${y}px`, scale: `${s}` }}>
      {spray > 0
        ? Array.from({ length: 9 }).map((_, i) => {
            const a = -150 + i * 15 + Math.sin(frame / 6) * 10;
            const r = 160 + (i % 3) * 50;
            return Array.from({ length: 6 }).map((__, j) => {
              const t = ((frame * 0.05 + j / 6 + i * 0.07) % 1) * spray;
              const px = Math.cos((a * Math.PI) / 180) * r * t;
              const py = Math.sin((a * Math.PI) / 180) * r * t * 1.4 + r * t * t * 0.9 - 60;
              return <circle key={`${i}-${j}`} cx={px} cy={py} r={7} fill={PC.water} opacity={(1 - t) * 0.9} />;
            });
          })
        : null}
      <rect x={-22} y={-60} width={44} height={60} rx={12} fill={G.sprinklerDark} />
      <rect x={-34} y={-74} width={68} height={22} rx={11} fill={G.sprinkler} />
      <circle cx={0} cy={-80} r={10} fill={G.sprinklerDark} />
      {/* timer box on a little post */}
      <rect x={60} y={-110} width={10} height={110} fill={G.woodDark} />
      <rect x={34} y={-160} width={62} height={56} rx={14} fill={G.sprinkler} />
      <rect x={42} y={-152} width={46} height={40} rx={9} fill={PC.robotFace} />
      <g style={{ translate: "65px -132px" }}>
        <TimerIcon on={spray > 0} />
      </g>
      {zzz
        ? [0, 1, 2].map((i) => {
            const t = ((frame + i * 20) % 60) / 60;
            return (
              <text key={i} x={-10 + t * 40} y={-110 - t * 90} fontSize={34 + i * 8} fontWeight={700} fill={C.lavenderDark} opacity={1 - t} fontFamily="Fredoka">
                z
              </text>
            );
          })
        : null}
    </g>
  );
};

/** A recycling bin (generic), base centre at x. */
export const RecycleBin: React.FC<{ x: number; y?: number }> = ({ x, y = GROUND_Y }) => (
  <g style={{ translate: `${x}px ${y}px` }}>
    <path d="M -60 -170 L 60 -170 L 50 0 L -50 0 Z" fill={C.blue} />
    <rect x={-70} y={-190} width={140} height={28} rx={12} fill={C.lavenderDark} />
    {[0, 120, 240].map((a) => (
      <path key={a} d="M 0 -118 L 18 -88 L -18 -88 Z" fill="#fff" opacity={0.8} style={{ rotate: `${a}deg`, transformOrigin: "0px -84px" }} />
    ))}
  </g>
);

/** The science-fair poster's picture: two glasses, stones drop in, the water goes up. `t` 0..1 animates it. */
export const PosterArt: React.FC<{ t: number }> = ({ t }) => {
  const frame = useCurrentFrame();
  const drops = [0.15, 0.35, 0.55].map((d) => interpolate(t, [d, d + 0.18], [0, 1], clamp));
  const landed = drops.filter((d) => d >= 1).length;
  const level = 70 - landed * 12;
  const arrow = Math.sin(frame / 5) * 4;
  return (
    <svg viewBox="0 0 320 170" width={320} height={170}>
      {/* before */}
      <path d="M 20 40 L 30 160 L 100 160 L 110 40" fill={PC.glass} stroke={PC.glassEdge} strokeWidth={4} />
      <rect x={26} y={110} width={78} height={48} fill={PC.water} opacity={0.9} />
      <text x={64} y={30} textAnchor="middle" fontSize={22} fontWeight={700} fill={C.ink} fontFamily="Fredoka">
        1
      </text>
      {/* after */}
      <path d="M 190 40 L 200 160 L 270 160 L 280 40" fill={PC.glass} stroke={PC.glassEdge} strokeWidth={4} />
      <rect x={196} y={110 + (level - 70)} width={78} height={160 - (110 + (level - 70)) - 2} fill={PC.water} opacity={0.9} />
      {[0, 1, 2].map((i) =>
        drops[i] > 0 ? <PebbleShape key={i} cx={215 + i * 20} cy={interpolate(drops[i], [0, 1], [10, 146 - (i === 1 ? 8 : 0)])} r={9} tone={i} /> : null,
      )}
      <text x={235} y={30} textAnchor="middle" fontSize={22} fontWeight={700} fill={C.ink} fontFamily="Fredoka">
        2
      </text>
      {/* arrow up */}
      <g style={{ translate: `300px ${110 + arrow}px` }}>
        <path d="M 0 -40 L 14 -18 L 5 -18 L 5 20 L -5 20 L -5 -18 L -14 -18 Z" fill={C.pinkDark} />
      </g>
      <path d="M 122 100 L 172 100 M 160 88 L 174 100 L 160 112" stroke={C.lavenderDark} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/** The shed with the science-fair poster on its wall; left edge at x. `posterT` animates the poster. */
export const Shed: React.FC<{ x: number; posterT?: number; w?: number }> = ({ x, posterT = 0, w = 620 }) => {
  const t = useT();
  const h = 470;
  return (
    <div style={{ position: "absolute", left: x, top: GROUND_Y - h, width: w, height: h }}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <path d={`M -30 120 L ${w / 2} 0 L ${w + 30} 120 Z`} fill={G.shedRoof} />
        <rect x={0} y={110} width={w} height={h - 110} fill={G.shed} />
        {Array.from({ length: Math.floor(w / 60) }).map((_, i) => (
          <line key={i} x1={30 + i * 60} y1={120} x2={30 + i * 60} y2={h} stroke={G.shedDark} strokeWidth={5} />
        ))}
        <rect x={w - 170} y={230} width={130} height={h - 230} rx={16} fill={G.door} />
        <circle cx={w - 62} cy={h - 110} r={9} fill={G.woodDark} />
      </svg>
      {/* poster */}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 150,
          width: 380,
          background: "#FFFDF6",
          borderRadius: 18,
          padding: "14px 20px 12px",
          boxShadow: "0 8px 0 rgba(94,75,110,0.14)",
          rotate: "-2deg",
          textAlign: "center",
          color: C.ink,
        }}
      >
        <div style={{ position: "absolute", left: 170, top: -12, width: 40, height: 22, background: C.butterDark, borderRadius: 6, opacity: 0.9 }} />
        <div style={{ fontSize: 34, fontWeight: 700, color: C.pinkDark, lineHeight: 1.05 }}>{t({ en: "Science Fair!", es: "¡Feria de ciencias!" })}</div>
        <PosterArt t={posterT} />
        <div style={{ fontSize: 27, fontWeight: 600, lineHeight: 1.1 }}>{t({ en: "Stones in = water UP!", es: "¡Piedras adentro = agua ARRIBA!" })}</div>
        {/* blue ribbon */}
        <svg viewBox="0 0 60 80" width={56} height={74} style={{ position: "absolute", right: -18, top: -16 }}>
          <path d="M 18 40 L 10 78 L 24 68 L 30 80 L 34 42 Z M 42 40 L 50 78 L 36 68 L 30 80 L 26 42 Z" fill="#8FB8EC" />
          <circle cx={30} cy={28} r={24} fill="#A9CBF3" />
          <circle cx={30} cy={28} r={14} fill="#FFFDF6" />
        </svg>
      </div>
    </div>
  );
};

/** Far-away rooftops of the town around the garden. */
const Rooftops: React.FC = () => (
  <g>
    {[
      [0, 250, G.roof],
      [230, 330, G.roof3],
      [520, 220, G.roof2],
      [760, 360, G.roof],
      [1060, 260, G.roof3],
      [1300, 300, G.roof2],
      [1560, 240, G.roof],
      [1760, 340, G.roof3],
    ].map(([x, h, col], i) => (
      <g key={i}>
        <rect x={x as number} y={GROUND_Y - 160 - (h as number)} width={220} height={(h as number) + 40} rx={18} fill={col as string} />
        {Array.from({ length: Math.floor((h as number) / 90) }).map((_, r) =>
          [0, 1, 2].map((c) => (
            <rect key={`${r}-${c}`} x={(x as number) + 30 + c * 62} y={GROUND_Y - 130 - (h as number) + r * 90} width={36} height={44} rx={8} fill={G.window} opacity={0.85} />
          )),
        )}
      </g>
    ))}
  </g>
);

const Fence: React.FC = () => (
  <g>
    <rect x={0} y={GROUND_Y - 190} width={1920} height={18} fill={G.fenceDark} />
    <rect x={0} y={GROUND_Y - 110} width={1920} height={18} fill={G.fenceDark} />
    {Array.from({ length: 33 }).map((_, i) => (
      <path key={i} d={`M ${i * 60} ${GROUND_Y - 60} L ${i * 60} ${GROUND_Y - 220} L ${i * 60 + 20} ${GROUND_Y - 246} L ${i * 60 + 40} ${GROUND_Y - 220} L ${i * 60 + 40} ${GROUND_Y - 60} Z`} fill={G.fence} />
    ))}
  </g>
);

export type GardenProps = {
  children?: React.ReactNode;
  /** 0 = hot afternoon, 1 = pink sunset. */
  sunset?: number;
  /** Heat shimmer over the ground. */
  heat?: boolean;
  /** Draw the far rooftops and fence. */
  backdrop?: boolean;
  /** Back-layer SVG content (beds, poles, sunflowers…) drawn behind the characters. */
  scenery?: React.ReactNode;
};

/** The garden backdrop: sky, rooftops, fence, ground and a path; scenery and characters on top. */
export const Garden: React.FC<GardenProps> = ({ children, sunset = 0, heat, backdrop = true, scenery }) => {
  const frame = useCurrentFrame();
  const sky = interpolateColors(sunset, [0, 1], [G.sky, G.skySunset]);
  const sun = interpolateColors(sunset, [0, 1], [G.sun, G.sunSunset]);
  return (
    <AbsoluteFill style={{ backgroundColor: G.sky, overflow: "hidden" }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <Sky color={sky} sunColor={sun} sunX={1580} sunY={170 + sunset * 330} />
        {backdrop ? (
          <>
            <Rooftops />
            <Fence />
          </>
        ) : null}
        <rect x={0} y={GROUND_Y - 60} width={1920} height={1080 - GROUND_Y + 60} fill={G.ground} />
        <path d={`M 0 ${GROUND_Y + 40} Q 960 ${GROUND_Y - 10} 1920 ${GROUND_Y + 40} L 1920 1080 L 0 1080 Z`} fill={G.groundDark} opacity={0.6} />
        <path d={`M -40 1080 Q 700 ${GROUND_Y - 30} 1960 ${GROUND_Y - 10} L 1960 ${GROUND_Y + 60} Q 900 ${GROUND_Y + 80} 400 1080 Z`} fill={G.path} />
        <path d={`M -40 1080 Q 700 ${GROUND_Y - 30} 1960 ${GROUND_Y - 10}`} stroke={G.pathEdge} strokeWidth={8} fill="none" />
        {heat
          ? [0, 1, 2, 3, 4].map((i) => {
              const y = GROUND_Y - 120 - ((frame * 1.2 + i * 60) % 300);
              return (
                <path
                  key={i}
                  d={`M ${200 + i * 360} ${y} q 20 -20 40 0 t 40 0 t 40 0`}
                  stroke="#fff"
                  strokeWidth={6}
                  fill="none"
                  strokeLinecap="round"
                  opacity={0.5 * Math.sin(((frame * 1.2 + i * 60) % 300) / 300 * Math.PI)}
                />
              );
            })
          : null}
        {scenery}
      </svg>
      {children}
      {sunset > 0 ? <AbsoluteFill style={{ backgroundColor: "#F7A9B8", opacity: sunset * 0.08, pointerEvents: "none" }} /> : null}
    </AbsoluteFill>
  );
};
