/**
 * Postcards from Africa — the YouTube thumbnail for a season video (1280×720 still).
 * Four taped paintings from the season on the left, the season route on the right, and a
 * title big enough to read at phone size.
 */

import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { AFRICA_PATH, HAND, MARKER, proj } from "../styletest/shared";
import { INK, PAPER, RED } from "./scenes";
import type { Episode } from "./types";

export type ThumbnailProps = {
  episodes: Episode[];
  /** Big title line, e.g. "AFRICA". */
  title: string;
  /** Hand-written line under the title, e.g. "in 12 minutes". */
  subtitle: string;
  /** public/-relative paintings for the photo collage (up to four). */
  photos: string[];
};

const PHOTO_SPOTS = [
  { left: 40, top: 46, rotate: -7 },
  { left: 300, top: 30, rotate: 5 },
  { left: 60, top: 352, rotate: 4 },
  { left: 318, top: 340, rotate: -5 },
];

export const PostcardsThumbnail: React.FC<ThumbnailProps> = ({ episodes, title, subtitle, photos }) => {
  const last = episodes[episodes.length - 1];
  const pts = [...last.route, last.pin].map(([lo, la]) => proj(lo, la));
  const d = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `Q ${(pts[i - 1].x + p.x) / 2} ${Math.min(pts[i - 1].y, p.y) - 26} ${p.x} ${p.y}`)).join(" ");
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 60% 45%, rgba(255,255,255,0.4) 0%, rgba(120,90,40,0.22) 100%)" }} />
      {photos.slice(0, 4).map((src, i) => (
        <div
          key={src}
          style={{
            position: "absolute",
            ...PHOTO_SPOTS[i],
            rotate: `${PHOTO_SPOTS[i].rotate}deg`,
            width: 270,
            height: 330,
            border: "10px solid #fbf6ea",
            boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
            overflow: "hidden",
            background: "#fbf6ea",
          }}
        >
          <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 26%" }} />
        </div>
      ))}
      <svg width={420} height={460} viewBox="-10 -10 220 240" style={{ position: "absolute", left: 640, top: 210 }}>
        <path d={AFRICA_PATH} fill="#e2b874" opacity={0.75} />
        <path d={AFRICA_PATH} fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        <path d={d} fill="none" stroke={RED} strokeWidth={2.4} strokeDasharray="5 3" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={5.5} fill={RED} stroke={INK} strokeWidth={1.4} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 640, right: 30, top: 34, textAlign: "center", lineHeight: 1 }}>
        <div style={{ fontFamily: MARKER, fontSize: 132, color: RED, textShadow: "3px 4px 0 rgba(0,0,0,0.15)" }}>{title}</div>
        <div style={{ fontFamily: HAND, fontSize: 64, color: INK, marginTop: 4 }}>{subtitle}</div>
      </div>
      <div style={{ position: "absolute", right: 40, bottom: 34, fontFamily: HAND, fontSize: 34, color: INK, textAlign: "right", lineHeight: 1.1 }}>
        {last.series}
        <br />
        <span style={{ color: RED }}>Season 1</span>
      </div>
    </AbsoluteFill>
  );
};
