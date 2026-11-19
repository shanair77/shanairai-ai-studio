/**
 * The code-drawn scenes of a Postcards from Africa episode: the hook map, the title page,
 * the traveler's notes and the next-stop map. Everything animates from the local frame.
 */

import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AFRICA_PATH, HAND, MARKER, MoroccoFlag, proj } from "../styletest/shared";
import type { Episode } from "./types";

export const PAPER = "#efe6d2";
export const INK = "#2a2a3a";
export const RED = "#b0302a";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Paper with a soft vignette and faint grain. */
export const Paper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: PAPER }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.35) 0%, rgba(120,90,40,0.18) 100%)" }} />
    <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.25 }}>
      <filter id="paper-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} />
        <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0.35 0" />
      </filter>
      <rect width={1080} height={1920} filter="url(#paper-grain)" />
    </svg>
    {children}
  </AbsoluteFill>
);

/** 0→1 draw-on progress for a stroke with pathLength={1}. */
const draw = (f: number, start: number, end: number) => interpolate(f, [start, end], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });

/* ------------------------------------------------------------------ hook: the Strait */
export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const europe = "M -20 -20 L 1100 -20 L 1100 700 C 900 720, 720 790, 600 860 C 560 885, 520 900, 470 880 C 330 820, 160 760, -20 780 Z";
  const africa = "M -20 1940 L -20 1190 C 200 1160, 380 1100, 500 1030 C 530 1010, 560 1005, 600 1030 C 720 1110, 880 1150, 1100 1150 L 1100 1940 Z";
  const plane = interpolate(f, [40, 120], [-0.1, 1.1], clamp);
  const px = interpolate(plane, [0, 1], [-60, 1140]);
  const py = 950 + Math.sin(plane * Math.PI * 2) * 18;
  return (
    <Paper>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <rect x={0} y={600} width={1080} height={650} fill="#9cc3d8" opacity={interpolate(f, [10, 40], [0, 0.45], clamp)} />
        <path d={europe} fill="#b9c79a" opacity={interpolate(f, [15, 45], [0, 0.75], clamp)} />
        <path d={africa} fill="#e2b874" opacity={interpolate(f, [15, 45], [0, 0.8], clamp)} />
        <path d={europe} fill="none" stroke={INK} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(f, 0, 35)} strokeLinejoin="round" />
        <path d={africa} fill="none" stroke={INK} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(f, 8, 43)} strokeLinejoin="round" />
        <g opacity={interpolate(f, [45, 60], [0, 1], clamp)}>
          <line x1={545} y1={898} x2={548} y2={1010} stroke={RED} strokeWidth={6} strokeLinecap="round" />
          <path d="M 530 915 L 545 893 L 560 915 M 533 993 L 548 1015 L 563 993" fill="none" stroke={RED} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          <text x={590} y={975} fontFamily={MARKER} fontSize={92} fill={RED}>14 km</text>
        </g>
        <text x={90} y={480} fontFamily={HAND} fontSize={84} fill={INK} opacity={interpolate(f, [25, 40], [0, 1], clamp)}>EUROPE</text>
        <text x={92} y={545} fontFamily={HAND} fontSize={48} fill={INK} opacity={interpolate(f, [30, 45], [0, 0.8], clamp)}>Spain</text>
        <text x={90} y={1420} fontFamily={HAND} fontSize={84} fill={INK} opacity={interpolate(f, [30, 45], [0, 1], clamp)}>AFRICA</text>
        <text x={92} y={1485} fontFamily={HAND} fontSize={48} fill={INK} opacity={interpolate(f, [35, 50], [0, 0.8], clamp)}>Morocco</text>
        <text x={640} y={780} fontFamily={HAND} fontSize={38} fill={INK} opacity={interpolate(f, [50, 65], [0, 0.7], clamp)}>Strait of Gibraltar</text>
        {plane > 0 && plane < 1 ? (
          <g>
            <path d={`M -60 950 Q ${px / 2} ${py + 30} ${px} ${py}`} fill="none" stroke={INK} strokeWidth={3} strokeDasharray="10 12" opacity={0.5} />
            <path transform={`translate(${px} ${py}) rotate(${Math.cos(plane * Math.PI * 2) * 12})`} d="M 40 0 L -30 -22 L -14 0 L -30 22 Z M -14 0 L 40 0" fill="#fffbea" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          </g>
        ) : null}
      </svg>
    </Paper>
  );
};

/* ------------------------------------------------------------------ Africa map helpers */
const MapAfrica: React.FC<{ x: number; y: number; scale: number; drawStart?: number; children?: React.ReactNode }> = ({
  x,
  y,
  scale,
  drawStart = 0,
  children,
}) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={AFRICA_PATH} fill="#e2b874" opacity={interpolate(f, [drawStart + 20, drawStart + 45], [0, 0.65], clamp)} />
      <path
        d={AFRICA_PATH}
        fill="none"
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={draw(f, drawStart, drawStart + 40)}
      />
      {children}
    </g>
  );
};

const Pin: React.FC<{ lonLat: [number, number]; appear: number; color?: string }> = ({ lonLat, appear, color = RED }) => {
  const f = useCurrentFrame();
  const p = proj(lonLat[0], lonLat[1]);
  const pulse = ((f - appear) % 40) / 40;
  const o = interpolate(f, [appear, appear + 8], [0, 1], clamp);
  return (
    <g opacity={o}>
      <circle cx={p.x} cy={p.y} r={4 + pulse * 10} fill="none" stroke={color} strokeWidth={1.4} opacity={f > appear ? 1 - pulse : 0} />
      <circle cx={p.x} cy={p.y} r={4.5} fill={color} stroke={INK} strokeWidth={1.2} />
    </g>
  );
};

/** The passport stamp, slamming down at `at` frames. */
export const Stamp: React.FC<{ at: number; line1: string; line2: string; line3: string; x: number; y: number; rotate?: number }> = ({
  at,
  line1,
  line2,
  line3,
  x,
  y,
  rotate = -12,
}) => {
  const f = useCurrentFrame();
  const slam = interpolate(f, [at, at + 8], [2.3, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const o = interpolate(f, [at, at + 5], [0, 0.92], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 300,
        height: 300,
        borderRadius: "50%",
        border: `10px double ${RED}`,
        color: RED,
        fontFamily: MARKER,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        lineHeight: 1,
        rotate: `${rotate}deg`,
        scale: `${slam}`,
        opacity: o,
      }}
    >
      <div style={{ fontSize: 28, letterSpacing: 3 }}>{line1}</div>
      <div style={{ fontSize: 56, margin: "12px 0" }}>{line2}</div>
      <div style={{ fontSize: 26, letterSpacing: 2 }}>{line3}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ title */
export const TitleScene: React.FC<{ ep: Episode }> = ({ ep }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = interpolate(f, [35, 55], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const stop = String(ep.number).padStart(2, "0");
  return (
    <Paper>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <MapAfrica x={190} y={560} scale={3.5}>
          <Pin lonLat={ep.pin} appear={45} />
        </MapAfrica>
      </svg>
      <div style={{ position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", opacity: titleIn, translate: `0 ${(1 - titleIn) * 30}px` }}>
        <div style={{ fontFamily: MARKER, fontSize: 92, color: INK, lineHeight: 1.05 }}>Postcards</div>
        <div style={{ fontFamily: HAND, fontSize: 64, color: RED }}>from Africa</div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1400,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          opacity: interpolate(f, [55, 70], [0, 1], clamp),
        }}
      >
        <MoroccoFlag w={96} border={INK} />
        <div style={{ fontFamily: HAND, fontSize: 76, color: INK }}>
          Stop {stop} · {ep.country}
        </div>
      </div>
      <Stamp at={Math.round(4.4 * fps)} line1="★ STAMPED ★" line2={ep.country.toUpperCase()} line3={`STOP ${stop} · AFRICA`} x={700} y={1540} />
    </Paper>
  );
};

/* ------------------------------------------------------------------ traveler's notes */
export const NotesScene: React.FC<{ ep: Episode }> = ({ ep }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lineGap = 64;
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "190px 70px 120px" }}>
        <div
          style={{
            position: "relative",
            height: "100%",
            background: `repeating-linear-gradient(#fbf6ea 0px, #fbf6ea ${lineGap - 2}px, #c9d6e8 ${lineGap - 2}px, #c9d6e8 ${lineGap}px)`,
            boxShadow: "6px 10px 26px rgba(0,0,0,0.22)",
            padding: "70px 60px 60px 110px",
            rotate: "-0.8deg",
          }}
        >
          <div style={{ position: "absolute", left: 80, top: 0, bottom: 0, width: 3, background: "#e3a6a6" }} />
          <div style={{ fontFamily: MARKER, fontSize: 54, color: RED, marginBottom: 40 }}>{ep.notes.title}</div>
          {ep.notes.items.map(([k, v], i) => {
            const at = Math.round((0.8 + i * 1.15) * fps);
            const o = interpolate(f, [at, at + 10], [0, 1], clamp);
            const tick = draw(f, at, at + 8);
            return (
              <div key={k} style={{ display: "flex", gap: 22, marginBottom: 46, opacity: o, translate: `${(1 - o) * -20}px 0` }}>
                <svg width={56} height={56} viewBox="0 0 56 56" style={{ flexShrink: 0, marginTop: 4 }}>
                  <path d="M 8 30 L 22 44 L 48 10" fill="none" stroke={RED} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={tick} />
                </svg>
                <div style={{ fontFamily: HAND, fontSize: 52, color: INK, lineHeight: 1.18 }}>
                  <span style={{ color: RED }}>{k}:</span> {v}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

/* ------------------------------------------------------------------ next stop */
export const NextScene: React.FC<{ ep: Episode }> = ({ ep }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = proj(ep.pin[0], ep.pin[1]);
  const b = proj(ep.next.pin[0], ep.next.pin[1]);
  const route = `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 26} ${b.x} ${b.y}`;
  const routeDraw = draw(f, 10, 55);
  const next = String(ep.number + 1).padStart(2, "0");
  return (
    <Paper>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <MapAfrica x={190} y={560} scale={3.5} drawStart={-60}>
          <path d={route} fill="none" stroke={RED} strokeWidth={1.6} strokeDasharray="4 3" opacity={0.9} />
          <path d={route} fill="none" stroke={PAPER} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={routeDraw - 1} />
          <Pin lonLat={ep.pin} appear={0} color="#7a7a7a" />
          <Pin lonLat={ep.next.pin} appear={52} />
          <g transform={`translate(${b.x + 4} ${b.y - 22})`} opacity={interpolate(f, [55, 70], [0, 1], clamp)}>
            <path d="M 0 14 L 9 0 L 18 14 Z M 12 14 L 19 4 L 26 14 Z" fill="#e2b874" stroke={INK} strokeWidth={0.9} strokeLinejoin="round" />
          </g>
        </MapAfrica>
      </svg>
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, textAlign: "center", opacity: interpolate(f, [5, 20], [0, 1], clamp) }}>
        <div style={{ fontFamily: HAND, fontSize: 64, color: INK }}>Next stop</div>
        <div style={{ fontFamily: MARKER, fontSize: 120, color: RED, lineHeight: 1.05 }}>{ep.next.country}</div>
      </div>
      <div style={{ position: "absolute", top: 1400, left: 0, right: 0, textAlign: "center", fontFamily: HAND, fontSize: 56, color: INK, opacity: interpolate(f, [60, 75], [0, 1], clamp) }}>
        {ep.series} · Stop {next}
      </div>
      <Stamp at={Math.round(3.2 * fps)} line1="★ VISITED ★" line2={ep.country.toUpperCase()} line3={`STOP ${String(ep.number).padStart(2, "0")} · AFRICA`} x={390} y={1530} rotate={10} />
    </Paper>
  );
};
