/**
 * Scenery and props for the Odyssey stickman cartoon. All plain SVG, all driven by the
 * current frame `f` passed in by the scene — nothing here uses CSS animation.
 */

import React from "react";
import { INK } from "./Stickman";

export const PAPER = "#f4ecd8";
export const SEA = "#9cbfdc";
export const SEA_DEEP = "#5f8fbf";
export const RED = "#b3261e";
export const WOOD = "#a8743c";
export const STONE = "#d9c9a3";
export const GRASS = "#b9c98a";

/** Wave height at an x position — reused so ships bob with the water. */
export const waveY = (x: number, f: number, amp = 12) => amp * Math.sin(x / 90 + f * 0.12);

export const Sea: React.FC<{ f: number; y: number; color?: string; amp?: number; speed?: number }> = ({
  f,
  y,
  color = SEA,
  amp = 12,
  speed = 1,
}) => {
  let d = `M -40 1960 L -40 ${y}`;
  for (let x = -40; x <= 1120; x += 12) d += ` L ${x} ${y + waveY(x, f * speed, amp)}`;
  d += " L 1120 1960 Z";
  let d2 = `M -40 1960 L -40 ${y + 70}`;
  for (let x = -40; x <= 1120; x += 12) d2 += ` L ${x} ${y + 70 + waveY(x + 200, f * speed * 1.3, amp * 0.7)}`;
  d2 += " L 1120 1960 Z";
  return (
    <g>
      <path d={d} fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={d2} fill={SEA_DEEP} opacity={0.35} />
    </g>
  );
};

export const Ground: React.FC<{ y: number; color?: string; from?: number; to?: number }> = ({
  y,
  color = GRASS,
  from = -40,
  to = 1120,
}) => (
  <path
    d={`M ${from} 1960 L ${from} ${y} Q ${(from + to) / 2} ${y - 30} ${to} ${y} L ${to} 1960 Z`}
    fill={color}
    stroke={INK}
    strokeWidth={6}
  />
);

export const Sun: React.FC<{ x: number; y: number; f: number; r?: number; color?: string }> = ({
  x,
  y,
  f,
  r = 70,
  color = "#f2c230",
}) => (
  <g transform={`translate(${x} ${y}) rotate(${f * 0.6})`}>
    {Array.from({ length: 12 }, (_, i) => (
      <line
        key={i}
        x1={0}
        y1={r + 14}
        x2={0}
        y2={r + 40}
        stroke={INK}
        strokeWidth={6}
        strokeLinecap="round"
        transform={`rotate(${i * 30})`}
      />
    ))}
    <circle r={r} fill={color} stroke={INK} strokeWidth={6} />
  </g>
);

export const Moon: React.FC<{ x: number; y: number; opacity?: number }> = ({ x, y, opacity = 1 }) => (
  <g opacity={opacity}>
    <circle cx={x} cy={y} r={60} fill="#fff6d0" stroke={INK} strokeWidth={5} />
    <circle cx={x + 28} cy={y - 14} r={52} fill="#1e2a4a" opacity={0.0} />
  </g>
);

export const Cloud: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({
  x,
  y,
  s = 1,
  color = "#ffffff",
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      d="M -110 20 Q -120 -30 -70 -30 Q -60 -80 0 -70 Q 50 -100 80 -40 Q 130 -40 120 20 Z"
      fill={color}
      stroke={INK}
      strokeWidth={5}
      strokeLinejoin="round"
    />
  </g>
);

export const Birds: React.FC<{ f: number; x: number; y: number; n?: number }> = ({ f, x, y, n = 3 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const flap = Math.sin(f * 0.4 + i) * 10;
      const bx = x + i * 60 + f * 1.5;
      const by = y + (i % 2) * 30 + Math.sin(f * 0.05 + i) * 10;
      return (
        <path
          key={i}
          d={`M ${bx - 22} ${by - flap} Q ${bx - 10} ${by - 8} ${bx} ${by} Q ${bx + 10} ${by - 8} ${bx + 22} ${by - flap}`}
          fill="none"
          stroke={INK}
          strokeWidth={4}
          strokeLinecap="round"
        />
      );
    })}
  </g>
);

/** A Greek ship. Children are drawn in ship-local coords (deck at y = -10). */
export const Ship: React.FC<{
  x: number;
  y: number;
  f: number;
  s?: number;
  face?: 1 | -1;
  tilt?: number;
  sail?: string;
  oars?: boolean;
  crew?: number;
  mast?: boolean;
  children?: React.ReactNode;
}> = ({ x, y, f, s = 1, face = 1, tilt = 0, sail = RED, oars = true, crew = 0, mast = true, children }) => {
  const bob = waveY(x, f) * 0.8;
  const rock = Math.sin(f * 0.12 + x / 90) * 3 + tilt;
  const sweep = Math.sin(f * 0.22) * 14;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${rock}) scale(${s * face} ${s})`}>
      {oars
        ? [-110, -60, -10, 40, 90].map((ox) => (
            <line
              key={ox}
              x1={ox}
              y1={20}
              x2={ox - 40 + sweep}
              y2={110}
              stroke={INK}
              strokeWidth={6}
              strokeLinecap="round"
            />
          ))
        : null}
      {mast ? (
        <>
          <line x1={0} y1={0} x2={0} y2={-270} stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <path
            d={`M -95 -240 Q ${8 + sweep * 0.3} -222 95 -240 L 100 -100 Q 10 -78 -100 -100 Z`}
            fill="#fffbe9"
            stroke={INK}
            strokeWidth={6}
            strokeLinejoin="round"
          />
          <path d="M -50 -236 L -52 -94 M 50 -236 L 52 -94" stroke={sail} strokeWidth={22} />
          <line x1={-105} y1={-242} x2={105} y2={-242} stroke={INK} strokeWidth={7} strokeLinecap="round" />
        </>
      ) : null}
      {Array.from({ length: crew }, (_, i) => (
        <circle key={i} cx={-120 + i * 55} cy={-28 + Math.sin(f * 0.22 + i) * 4} r={18} fill={INK} />
      ))}
      {children}
      <path
        d="M -190 -12 Q -170 62 -20 62 L 110 62 Q 180 56 205 -14 Z"
        fill={WOOD}
        stroke={INK}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <path d="M -170 18 L 175 18" stroke={INK} strokeWidth={4} opacity={0.6} />
      <path d="M 205 -14 Q 232 -70 196 -82" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d="M -190 -12 Q -218 -60 -182 -74" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
    </g>
  );
};

export const Raft: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y + waveY(x, f) * 0.8}) rotate(${Math.sin(f * 0.12) * 3})`}>
    {[-90, -45, 0, 45, 90].map((lx) => (
      <rect key={lx} x={lx - 22} y={-14} width={44} height={28} rx={10} fill={WOOD} stroke={INK} strokeWidth={4} />
    ))}
  </g>
);

/** Troy's walls. `left` is the wall's left edge, `top` its top, down to `ground`. */
export const Walls: React.FC<{
  left: number;
  top: number;
  ground: number;
  right?: number;
  gate?: number;
  gateOpen?: number;
  f: number;
}> = ({ left, top, ground, right = 1120, gate, gateOpen = 0, f }) => {
  const w = right - left;
  const merlons = Math.floor(w / 60);
  const flag = Math.sin(f * 0.2) * 10;
  return (
    <g>
      <rect x={left} y={top} width={w} height={ground - top} fill={STONE} stroke={INK} strokeWidth={6} />
      {Array.from({ length: merlons }, (_, i) => (
        <rect key={i} x={left + i * 60 + 6} y={top - 34} width={36} height={36} fill={STONE} stroke={INK} strokeWidth={5} />
      ))}
      {Array.from({ length: 6 }, (_, r) => (
        <line key={r} x1={left} y1={top + 60 + r * 80} x2={right} y2={top + 60 + r * 80} stroke={INK} strokeWidth={2.5} opacity={0.35} />
      ))}
      <rect x={left + 30} y={top - 140} width={110} height={140} fill={STONE} stroke={INK} strokeWidth={6} />
      <line x1={left + 85} y1={top - 140} x2={left + 85} y2={top - 230} stroke={INK} strokeWidth={5} />
      <path d={`M ${left + 85} ${top - 230} Q ${left + 120} ${top - 222 + flag} ${left + 150} ${top - 214} L ${left + 85} ${top - 190} Z`} fill={RED} stroke={INK} strokeWidth={3} />
      {gate !== undefined ? (
        <g>
          <path
            d={`M ${gate - 80} ${ground} L ${gate - 80} ${ground - 200} Q ${gate} ${ground - 290} ${gate + 80} ${ground - 200} L ${gate + 80} ${ground} Z`}
            fill="#3a2a1a"
            stroke={INK}
            strokeWidth={6}
          />
          <path
            d={`M ${gate - 80} ${ground} L ${gate - 80} ${ground - 200} Q ${gate} ${ground - 290} ${gate + 80} ${ground - 200} L ${gate + 80} ${ground} Z`}
            fill={WOOD}
            stroke={INK}
            strokeWidth={6}
            opacity={1 - gateOpen}
          />
        </g>
      ) : null}
    </g>
  );
};

export const Flames: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const a = Math.sin(f * 0.6 + x) * 8;
  const b = Math.cos(f * 0.5 + x) * 8;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -30 0 Q -40 -50 ${-5 + a} -95 Q 10 -50 20 -70 Q 40 -30 30 0 Z`} fill="#e0662a" stroke={INK} strokeWidth={4} />
      <path d={`M -14 0 Q -18 -30 ${b} -55 Q 12 -25 14 0 Z`} fill="#f2c230" />
    </g>
  );
};

export const Smoke: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const t = ((f * 0.8 + i * 40) % 160) / 160;
      return (
        <circle
          key={i}
          cx={x + Math.sin(t * 6 + i) * 20 + t * 40}
          cy={y - t * 260}
          r={20 + t * 40}
          fill="#8d8478"
          opacity={0.5 * (1 - t)}
        />
      );
    })}
  </g>
);

/** The wooden horse on its wheeled platform. Origin = ground centre. */
export const Horse: React.FC<{ x: number; y: number; f: number; rolling?: boolean; hatch?: number }> = ({
  x,
  y,
  f,
  rolling = false,
  hatch = 0,
}) => {
  const spin = rolling ? f * 6 : 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M -175 -250 Q -235 -210 -215 -120" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      {[-130, -70, 70, 130].map((lx) => (
        <rect key={lx} x={lx - 18} y={-150} width={36} height={115} fill={WOOD} stroke={INK} strokeWidth={5} />
      ))}
      <rect x={-180} y={-300} width={360} height={170} rx={70} fill={WOOD} stroke={INK} strokeWidth={6} />
      {[-110, -40, 30, 100].map((px) => (
        <line key={px} x1={px} y1={-296} x2={px} y2={-134} stroke={INK} strokeWidth={3} opacity={0.5} />
      ))}
      <path d="M 110 -270 L 170 -470 L 230 -450 L 180 -250 Z" fill={WOOD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 150 -500 L 290 -460 L 280 -400 L 160 -420 Z" fill={WOOD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 165 -500 L 175 -540 L 195 -496" fill={WOOD} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 160 -480 L 135 -450 L 155 -420 L 128 -390 L 148 -360 L 122 -330 L 140 -300" fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {/* belly hatch */}
      <g transform={`translate(-40 -132) rotate(${hatch * 80})`}>
        <rect x={0} y={-6} width={80} height={12} fill="#7a4a1d" stroke={INK} strokeWidth={4} />
      </g>
      <rect x={-215} y={-42} width={430} height={30} fill="#7a4a1d" stroke={INK} strokeWidth={5} />
      {[-160, -55, 55, 160].map((wx) => (
        <g key={wx} transform={`translate(${wx} -10) rotate(${spin})`}>
          <circle r={28} fill={STONE} stroke={INK} strokeWidth={5} />
          <line x1={-28} y1={0} x2={28} y2={0} stroke={INK} strokeWidth={4} />
          <line x1={0} y1={-28} x2={0} y2={28} stroke={INK} strokeWidth={4} />
        </g>
      ))}
    </g>
  );
};

export const Palace: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-200} y={-40} width={400} height={40} fill={STONE} stroke={INK} strokeWidth={6} />
    {[-160, -80, 0, 80, 160].map((cx) => (
      <g key={cx}>
        <rect x={cx - 16} y={-300} width={32} height={260} fill="#fffbe9" stroke={INK} strokeWidth={5} />
        <line x1={cx - 5} y1={-290} x2={cx - 5} y2={-50} stroke={INK} strokeWidth={2} opacity={0.4} />
      </g>
    ))}
    <rect x={-215} y={-330} width={430} height={34} fill={STONE} stroke={INK} strokeWidth={6} />
    <path d="M -230 -330 L 0 -440 L 230 -330 Z" fill={STONE} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

export const Island: React.FC<{ x: number; y: number; s?: number; f: number; palm?: boolean; color?: string }> = ({
  x,
  y,
  s = 1,
  f,
  palm = true,
  color = "#e8d39a",
}) => {
  const sway = Math.sin(f * 0.05) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -300 20 Q -240 -90 0 -100 Q 240 -90 300 20 Z" fill={color} stroke={INK} strokeWidth={6} />
      {palm ? (
        <g transform={`rotate(${sway} 40 -90)`}>
          <path d="M 40 -90 Q 20 -250 70 -380" fill="none" stroke="#7a4a1d" strokeWidth={22} strokeLinecap="round" />
          <path d="M 40 -90 Q 20 -250 70 -380" fill="none" stroke={INK} strokeWidth={4} strokeDasharray="4 26" />
          {[-150, -100, -40, 20, 80, 140].map((a) => (
            <path
              key={a}
              d="M 0 0 Q 70 -30 140 20"
              fill="none"
              stroke="#4f8a3c"
              strokeWidth={22}
              strokeLinecap="round"
              transform={`translate(70 -380) rotate(${a + 90})`}
            />
          ))}
        </g>
      ) : null}
    </g>
  );
};

export const Rock: React.FC<{ x: number; y: number; w?: number; h?: number; color?: string }> = ({
  x,
  y,
  w = 220,
  h = 140,
  color = "#a79c8c",
}) => (
  <path
    d={`M ${x - w / 2} ${y} Q ${x - w / 2 + 10} ${y - h} ${x} ${y - h} Q ${x + w / 2 - 10} ${y - h * 0.9} ${x + w / 2} ${y} Z`}
    fill={color}
    stroke={INK}
    strokeWidth={6}
  />
);

export const Pig: React.FC<{ x: number; y: number; f: number; s?: number; face?: 1 | -1 }> = ({
  x,
  y,
  f,
  s = 1,
  face = 1,
}) => {
  const hop = Math.abs(Math.sin(f * 0.3 + x)) * 18;
  return (
    <g transform={`translate(${x} ${y - hop}) scale(${s * face} ${s})`}>
      {[-40, -15, 20, 45].map((lx) => (
        <line key={lx} x1={lx} y1={-30} x2={lx} y2={0} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      ))}
      <path d="M -62 -66 Q -92 -86 -80 -100 Q -70 -110 -84 -112" fill="none" stroke={INK} strokeWidth={4} />
      <ellipse cx={0} cy={-62} rx={68} ry={44} fill="#f0a7b3" stroke={INK} strokeWidth={6} />
      <circle cx={58} cy={-80} r={30} fill="#f0a7b3" stroke={INK} strokeWidth={6} />
      <path d="M 50 -108 L 62 -128 L 72 -104" fill="#f0a7b3" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={86} cy={-76} rx={10} ry={13} fill="#e88a9a" stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** Smoke puff used for magic transformations. `t` is 0→1 over the puff's life. */
export const Puff: React.FC<{ x: number; y: number; t: number; color?: string }> = ({ x, y, t, color = "#d7c6ef" }) => {
  if (t <= 0 || t >= 1) return null;
  const r = 40 + t * 70;
  const o = t < 0.5 ? 1 : (1 - t) * 2;
  return (
    <g opacity={o}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle
          key={a}
          cx={x + Math.sin((a * Math.PI) / 180) * r * 0.6}
          cy={y + Math.cos((a * Math.PI) / 180) * r * 0.6}
          r={r * 0.6}
          fill={color}
          stroke={INK}
          strokeWidth={4}
        />
      ))}
    </g>
  );
};

export const Sparkle: React.FC<{ x: number; y: number; r?: number; rot?: number; color?: string }> = ({
  x,
  y,
  r = 22,
  rot = 0,
  color = "#f2c230",
}) => (
  <path
    transform={`translate(${x} ${y}) rotate(${rot})`}
    d={`M 0 ${-r} Q 4 -4 ${r} 0 Q 4 4 0 ${r} Q -4 4 ${-r} 0 Q -4 -4 0 ${-r} Z`}
    fill={color}
    stroke={INK}
    strokeWidth={3}
  />
);

export const Note: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = INK }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={14} ry={10} fill={color} transform="rotate(-20)" />
    <line x1={12} y1={-4} x2={12} y2={-52} stroke={color} strokeWidth={5} />
    <path d="M 12 -52 Q 30 -44 28 -26" fill="none" stroke={color} strokeWidth={5} />
  </g>
);

export const Whirlpool: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  let d = "";
  for (let i = 0; i <= 160; i++) {
    const a = i * 0.22;
    const r = 6 + i * 1.4;
    d += `${i === 0 ? "M" : "L"} ${Math.cos(a) * r} ${Math.sin(a) * r * 0.4} `;
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse rx={240} ry={96} fill={SEA_DEEP} stroke={INK} strokeWidth={6} />
      <g transform={`scale(1 1) rotate(0)`}>
        <path d={d} fill="none" stroke="#fffbe9" strokeWidth={6} transform={`rotate(${-f * 6}) scale(1 1)`} />
      </g>
    </g>
  );
};

/** Six snake-like necks of Scylla rising from a point. */
export const Scylla: React.FC<{ x: number; y: number; f: number; grab?: number }> = ({ x, y, f, grab = 0 }) => (
  <g>
    {Array.from({ length: 6 }, (_, i) => {
      const sway = Math.sin(f * 0.12 + i * 1.1) * 40;
      const reach = i === 2 ? grab * 260 : 0;
      const hx = x + 60 + i * 34 + sway + reach;
      const hy = y - 330 + i * 38 + Math.cos(f * 0.1 + i) * 25 + (i === 2 ? grab * 170 : 0);
      return (
        <g key={i}>
          <path
            d={`M ${x} ${y} Q ${x + 40 + i * 20} ${y - 150} ${hx} ${hy}`}
            fill="none"
            stroke={INK}
            strokeWidth={34}
            strokeLinecap="round"
          />
          <path
            d={`M ${x} ${y} Q ${x + 40 + i * 20} ${y - 150} ${hx} ${hy}`}
            fill="none"
            stroke="#6f9a5a"
            strokeWidth={24}
            strokeLinecap="round"
          />
          <path
            d={`M ${hx - 10} ${hy - 26} L ${hx + 56} ${hy - 6} L ${hx + 52} ${hy + 6} L ${hx + 20} ${hy + 4} L ${hx + 54} ${hy + 18} L ${hx - 10} ${hy + 24} Z`}
            fill="#6f9a5a"
            stroke={INK}
            strokeWidth={5}
            strokeLinejoin="round"
          />
        </g>
      );
    })}
  </g>
);

export const Bag: React.FC<{ x: number; y: number; open?: number }> = ({ x, y, open = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -50 0 Q -70 -70 -20 -90 L 20 -90 Q 70 -70 50 0 Z" fill="#c9a46a" stroke={INK} strokeWidth={5} />
    <path
      d={`M -22 -90 L ${-30 - open * 20} ${-118 - open * 20} M 22 -90 L ${30 + open * 20} ${-118 - open * 20}`}
      stroke={INK}
      strokeWidth={6}
      strokeLinecap="round"
    />
    {open < 0.5 ? <line x1={-26} y1={-96} x2={26} y2={-96} stroke={RED} strokeWidth={7} strokeLinecap="round" /> : null}
  </g>
);

/** Curling wind gusts streaming in a direction; `t` scrolls them. */
export const Gusts: React.FC<{ f: number; y: number; dir?: 1 | -1; opacity?: number }> = ({ f, y, dir = -1, opacity = 1 }) => (
  <g opacity={opacity}>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const span = 1400;
      const base = ((f * 22 + i * 260) % span) - 200;
      const gx = dir === -1 ? 1080 - base : base;
      const gy = y + (i % 3) * 140 + Math.sin(i * 2) * 40;
      return (
        <path
          key={i}
          d={`M ${gx} ${gy} q ${-dir * -120} -10 ${-dir * -200} 0 q ${-dir * -50} 10 ${-dir * -40} -40 q ${-dir * 10} -30 ${-dir * 40} -10`}
          fill="none"
          stroke={INK}
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.8}
        />
      );
    })}
  </g>
);

export const Rain: React.FC<{ f: number; opacity?: number }> = ({ f, opacity = 1 }) => (
  <g opacity={opacity}>
    {Array.from({ length: 40 }, (_, i) => {
      const rx = (i * 137) % 1180;
      const ry = ((i * 211 + f * 40) % 1500) + 100;
      return <line key={i} x1={rx} y1={ry} x2={rx - 25} y2={ry + 60} stroke={INK} strokeWidth={4} opacity={0.5} strokeLinecap="round" />;
    })}
  </g>
);

export const Heart: React.FC<{ x: number; y: number; s?: number; opacity?: number }> = ({ x, y, s = 1, opacity = 1 }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    opacity={opacity}
    d="M 0 30 C -60 -10 -40 -60 0 -30 C 40 -60 60 -10 0 30 Z"
    fill={RED}
    stroke={INK}
    strokeWidth={4}
  />
);

export const Zzz: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g fontFamily="Patrick Hand, sans-serif" fontWeight={700} fill={INK}>
    {[0, 1, 2].map((i) => {
      const t = ((f + i * 20) % 60) / 60;
      return (
        <text key={i} x={x + t * 60 + i * 10} y={y - t * 120} fontSize={36 + i * 10} opacity={1 - t}>
          z
        </text>
      );
    })}
  </g>
);

export const Axe: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <line x1={0} y1={0} x2={0} y2={-150} stroke="#7a4a1d" strokeWidth={9} strokeLinecap="round" />
    <path d="M 0 -190 Q 34 -175 34 -150 Q 34 -125 0 -110 Z" fill="#b8b8b8" stroke={INK} strokeWidth={4} />
    <path d="M 0 -190 Q -34 -175 -34 -150 Q -34 -125 0 -110 Z" fill="#b8b8b8" stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={-150} r={11} fill={PAPER} stroke={INK} strokeWidth={4} />
  </g>
);

export const Sheep: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.1 + x) * 2})`}>
    {[-26, -8, 12, 28].map((lx) => (
      <line key={lx} x1={lx} y1={-20} x2={lx} y2={0} stroke={INK} strokeWidth={7} strokeLinecap="round" />
    ))}
    <path d="M -45 -30 Q -55 -70 -20 -66 Q -5 -90 20 -70 Q 52 -76 46 -40 Q 50 -14 20 -20 Q 0 -8 -20 -20 Q -50 -12 -45 -30 Z" fill="#ffffff" stroke={INK} strokeWidth={4} />
    <circle cx={48} cy={-52} r={14} fill={INK} />
  </g>
);

export const Star: React.FC<{ x: number; y: number; f: number; i: number }> = ({ x, y, f, i }) => (
  <circle cx={x} cy={y} r={3 + (Math.sin(f * 0.2 + i) + 1) * 1.5} fill="#fff6d0" />
);
