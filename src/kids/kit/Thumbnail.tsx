/**
 * ThumbnailFrame — the shared YouTube thumbnail layout (1280×720) for kids' stories.
 *
 * A story supplies its art (drawn in the usual 1920×1080 scene space, scaled down)
 * and 1–3 short title lines. Thumbnails are read at phone size, so keep each line to
 * two or three words and the art to two characters and one clear prop.
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "./palette";
import { STORY_FONT, useStoryFont } from "./StoryShell";

export const THUMB_WIDTH = 1280;
export const THUMB_HEIGHT = 720;

export type ThumbnailFrameProps = {
  /** Big title, one entry per line. Short. */
  lines: string[];
  /** Colours for each line (cycled). */
  colors?: string[];
  /** Small ribbon above the title. */
  badge?: string;
  /** Which side the title sits on; the art should leave that side fairly open. */
  side?: "left" | "right" | "top";
  /** Scene art in 1920×1080 space. */
  children: React.ReactNode;
};

export const ThumbnailFrame: React.FC<ThumbnailFrameProps> = ({
  lines,
  colors = [C.ink],
  badge = "Bedtime Story",
  side = "top",
  children,
}) => {
  useStoryFont();
  const align = side === "top" ? "center" : side === "left" ? "flex-start" : "flex-end";
  return (
    <AbsoluteFill style={{ backgroundColor: C.sky, fontFamily: STORY_FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 1920, height: 1080, scale: `${THUMB_WIDTH / 1920}`, transformOrigin: "0 0" }}>
        {children}
      </div>
      <AbsoluteFill
        style={{
          padding: side === "top" ? "34px 40px" : "48px 56px",
          alignItems: align,
          justifyContent: "flex-start",
        }}
      >
        <div
          style={{
            background: C.pinkDark,
            color: "#fff",
            fontSize: 34,
            fontWeight: 700,
            padding: "8px 26px",
            borderRadius: 40,
            marginBottom: 10,
            boxShadow: "0 5px 0 rgba(94,75,110,0.18)",
            rotate: "-2deg",
          }}
        >
          {badge}
        </div>
        {lines.map((line, i) => (
          <div
            key={line}
            style={{
              fontSize: lines.length > 2 ? 88 : 104,
              fontWeight: 700,
              lineHeight: 1.0,
              color: colors[i % colors.length],
              WebkitTextStroke: `14px ${C.cream}`,
              paintOrder: "stroke fill",
              textShadow: "0 8px 0 rgba(94,75,110,0.22)",
              textAlign: side === "top" ? "center" : side,
              rotate: `${i % 2 ? 1.5 : -1.5}deg`,
              marginTop: i ? -4 : 0,
            }}
          >
            {line}
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
