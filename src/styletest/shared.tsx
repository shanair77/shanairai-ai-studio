/**
 * Shared pieces for the travel style test: embedded fonts, a simplified Africa outline,
 * Morocco's flag, and the teaching overlays (location card, caption, passport stamp)
 * in four skins — one per candidate style.
 */

import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { PATRICKHAND_WOFF2, PERMANENTMARKER_WOFF2 } from "../odyssey/fonts.generated";
import { FREDOKA_WOFF2 } from "./fonts.generated";

export const ROUND = "Fredoka";
export const HAND = "Patrick Hand";
export const MARKER = "Permanent Marker";

const FONT_CSS = (
  [
    [ROUND, FREDOKA_WOFF2],
    [HAND, PATRICKHAND_WOFF2],
    [MARKER, PERMANENTMARKER_WOFF2],
  ] as const
)
  .map(([family, b64]) => `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${b64}) format("woff2");font-display:block;}`)
  .join("");
if (typeof document !== "undefined" && !document.getElementById("styletest-fonts")) {
  const style = document.createElement("style");
  style.id = "styletest-fonts";
  style.textContent = FONT_CSS;
  document.head.appendChild(style);
}

export type Skin = "flat" | "paper" | "journal" | "diorama";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ------------------------------------------------------------------ Africa */
// Simplified coastline as [longitude, latitude] pairs.
const COAST: [number, number][] = [
  [-5.8, 35.8], [10.2, 37], [11, 36.8], [10, 34], [15, 32.3], [19, 30.3], [20, 32], [25, 31.6],
  [30, 31.2], [32.3, 31.3], [32.5, 30], [35, 24], [37, 20], [39, 15.5], [43, 12.5], [51.3, 11.8],
  [51, 10.4], [49, 6], [46, 2], [42, -1.5], [40, -5], [39.5, -10], [40.5, -15], [36, -19],
  [35.5, -24], [33, -26], [32.5, -28.5], [30, -31], [27, -33.8], [20, -34.8], [18.4, -34],
  [17, -30], [15, -27], [14.5, -23], [12, -17], [13.5, -12], [12, -5], [9.5, -1], [9.5, 4],
  [8.5, 4.5], [6, 4.3], [3, 6.4], [-2, 4.8], [-7.5, 4.4], [-11, 7], [-13.3, 9], [-15.5, 11],
  [-17.5, 14.7], [-16.5, 19.5], [-17, 21], [-14.5, 26], [-12, 28], [-9.8, 29.5], [-9.6, 32],
  [-8, 33.5],
];
const MAP_W = 200;
const proj = (lon: number, lat: number) => ({ x: ((lon + 18) / 70) * MAP_W, y: ((37 - lat) / 72) * 220 });
export const AFRICA_PATH = COAST.map(([lo, la], i) => {
  const p = proj(lo, la);
  return `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
}).join(" ") + " Z";
export const MARRAKECH = proj(-8, 31.6);

export const AfricaMap: React.FC<{ fill: string; stroke: string; dot: string; strokeWidth?: number }> = ({
  fill,
  stroke,
  dot,
  strokeWidth = 4,
}) => {
  const f = useCurrentFrame();
  const pulse = (f % 40) / 40;
  return (
    <svg width={MAP_W + 20} height={240} viewBox="-10 -10 220 240">
      <path d={AFRICA_PATH} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <circle cx={MARRAKECH.x} cy={MARRAKECH.y} r={8 + pulse * 22} fill="none" stroke={dot} strokeWidth={4} opacity={1 - pulse} />
      <circle cx={MARRAKECH.x} cy={MARRAKECH.y} r={9} fill={dot} stroke={stroke} strokeWidth={3} />
    </svg>
  );
};

export const MoroccoFlag: React.FC<{ w?: number; border?: string }> = ({ w = 72, border = "transparent" }) => {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
    return `${30 + Math.cos(a) * 11},${20 + Math.sin(a) * 11}`;
  }).join(" ");
  return (
    <svg width={w} height={(w * 2) / 3} viewBox="0 0 60 40" style={{ borderRadius: 4, outline: `3px solid ${border}` }}>
      <rect width={60} height={40} fill="#c1272d" />
      <polygon points={pts} fill="none" stroke="#006233" strokeWidth={2.4} strokeLinejoin="round" />
    </svg>
  );
};

/* ------------------------------------------------------------------ skins */
type SkinDef = {
  font: string;
  titleFont: string;
  ink: string;
  accent: string;
  card: React.CSSProperties;
  mapFill: string;
  mapStroke: string;
};

const SKINS: Record<Skin, SkinDef> = {
  flat: {
    font: ROUND,
    titleFont: ROUND,
    ink: "#2b2340",
    accent: "#e4572e",
    card: { background: "#ffffff", borderRadius: 36, boxShadow: "0 14px 0 rgba(43,35,64,0.18)" },
    mapFill: "#f4b942",
    mapStroke: "#2b2340",
  },
  paper: {
    font: HAND,
    titleFont: MARKER,
    ink: "#3b2a20",
    accent: "#b5452b",
    card: {
      background: "#f6ead2",
      borderRadius: 6,
      boxShadow: "6px 9px 10px rgba(60,35,15,0.35)",
      clipPath:
        "polygon(0% 3%, 6% 0%, 14% 2%, 25% 0%, 38% 2%, 52% 0%, 66% 2%, 79% 0%, 92% 2%, 100% 0%, 99% 30%, 100% 62%, 99% 97%, 90% 100%, 76% 98%, 61% 100%, 45% 98%, 30% 100%, 16% 98%, 4% 100%, 1% 70%, 0% 36%)",
    },
    mapFill: "#d9a35b",
    mapStroke: "#3b2a20",
  },
  journal: {
    font: HAND,
    titleFont: HAND,
    ink: "#2a2a3a",
    accent: "#b0302a",
    card: { background: "rgba(251,246,234,0.94)", borderRadius: 4, boxShadow: "3px 5px 14px rgba(0,0,0,0.25)" },
    mapFill: "rgba(216,151,74,0.55)",
    mapStroke: "#2a2a3a",
  },
  diorama: {
    font: ROUND,
    titleFont: ROUND,
    ink: "#3a2618",
    accent: "#d0482c",
    card: {
      background: "linear-gradient(#fff7ea, #f3dfc0)",
      borderRadius: 44,
      border: "6px solid #8a5a35",
      boxShadow: "0 18px 28px rgba(40,20,5,0.45), inset 0 -8px 0 rgba(138,90,53,0.25)",
    },
    mapFill: "#e6a94f",
    mapStroke: "#5a3a22",
  },
};

/** The "STYLE n · NAME" tag — only for the comparison, not part of a real episode. */
export const StyleTag: React.FC<{ n: string; name: string; note: string }> = ({ n, name, note }) => (
  <div
    style={{
      position: "absolute",
      top: 54,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        background: "rgba(20,16,30,0.82)",
        color: "#fff",
        fontFamily: ROUND,
        fontSize: 38,
        padding: "14px 34px",
        borderRadius: 999,
        letterSpacing: 1,
        textAlign: "center",
      }}
    >
      STYLE {n} · {name.toUpperCase()}
      <div style={{ fontSize: 26, opacity: 0.75, letterSpacing: 0 }}>{note}</div>
    </div>
  </div>
);

export const LocationCard: React.FC<{ skin: Skin }> = ({ skin }) => {
  const f = useCurrentFrame();
  const s = SKINS[skin];
  const pop = interpolate(f, [18, 34], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.7)) });
  return (
    <div
      style={{
        position: "absolute",
        top: 210,
        left: 60,
        width: 600,
        padding: "26px 30px",
        display: "flex",
        alignItems: "center",
        gap: 22,
        scale: `${pop}`,
        rotate: skin === "paper" ? "-2deg" : skin === "journal" ? "-1.5deg" : "0deg",
        transformOrigin: "left center",
        ...s.card,
      }}
    >
      <AfricaMap fill={s.mapFill} stroke={s.mapStroke} dot={s.accent} strokeWidth={skin === "flat" || skin === "diorama" ? 0 : 3} />
      <div style={{ color: s.ink }}>
        <MoroccoFlag border={s.ink} />
        <div style={{ fontFamily: s.titleFont, fontSize: 62, lineHeight: 1.05, marginTop: 12 }}>Marrakech</div>
        <div style={{ fontFamily: s.font, fontSize: 36, opacity: 0.8 }}>Morocco · North Africa</div>
      </div>
      {skin === "journal" || skin === "paper" ? (
        <div
          style={{
            position: "absolute",
            top: -18,
            left: 230,
            width: 140,
            height: 40,
            background: "rgba(232,214,160,0.75)",
            rotate: "3deg",
          }}
        />
      ) : null}
    </div>
  );
};

export const Caption: React.FC<{ skin: Skin; text: string }> = ({ skin, text }) => {
  const f = useCurrentFrame();
  const s = SKINS[skin];
  const words = text.split(" ");
  const shown = interpolate(f, [40, 135], [0, words.length], clamp);
  const rise = interpolate(f, [30, 44], [60, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: 50, right: 50, bottom: 140, translate: `0 ${rise}px`, opacity: interpolate(f, [30, 40], [0, 1], clamp) }}>
      <div style={{ padding: "30px 40px", ...s.card }}>
        <div style={{ fontFamily: s.font, fontSize: skin === "flat" || skin === "diorama" ? 54 : 62, lineHeight: 1.2, color: s.ink }}>
          {words.map((w, i) => {
            const o = interpolate(shown - i, [0, 1], [0.15, 1], clamp);
            const current = shown - i > 0 && shown - i < 1.5;
            return (
              <span key={i} style={{ opacity: o, color: current ? s.accent : s.ink }}>
                {w}{" "}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Stamp: React.FC<{ skin: Skin }> = ({ skin }) => {
  const f = useCurrentFrame();
  const s = SKINS[skin];
  const slam = interpolate(f, [128, 138], [2.4, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const o = interpolate(f, [128, 134], [0, 0.92], clamp);
  return (
    <div
      style={{
        position: "absolute",
        right: 70,
        top: 250,
        width: 270,
        height: 270,
        borderRadius: "50%",
        border: `9px double ${s.accent}`,
        color: s.accent,
        fontFamily: skin === "flat" || skin === "diorama" ? ROUND : MARKER,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        rotate: "-14deg",
        scale: `${slam}`,
        opacity: o,
        textAlign: "center",
        lineHeight: 1,
        background: skin === "diorama" ? "rgba(255,247,234,0.85)" : "transparent",
      }}
    >
      <div style={{ fontSize: 30, letterSpacing: 3 }}>★ STAMPED ★</div>
      <div style={{ fontSize: 50, margin: "10px 0" }}>MOROCCO</div>
      <div style={{ fontSize: 26, letterSpacing: 2 }}>STOP 01 · AFRICA</div>
    </div>
  );
};
