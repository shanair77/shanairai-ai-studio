/**
 * Series identity shared by every video: name, intro sting and outro card.
 * Change the series name here and every story, Short and compilation follows.
 */

import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, getStaticFiles, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useT, type Localized } from "./lang";
import { clamp, easeOut } from "./motion";
import { C } from "./palette";
import { Sparkle } from "./Props";

export const SERIES: { name: Localized; tagline: Localized; badge: Localized } = {
  name: { en: "Once Upon a 2026", es: "Érase una vez 2026" },
  tagline: { en: "See you next time for another story!", es: "¡Nos vemos en el próximo cuento!" },
  badge: { en: "Bedtime Story", es: "Cuento para dormir" },
};

export const INTRO_SECONDS = 2.5;
export const OUTRO_SECONDS = 4;
export const STING = "kids/sting.mp3";

/** The series logo: a storybook ribbon with the name, gently bobbing. */
export const SeriesLogo: React.FC<{ size?: number; enter?: number }> = ({ size = 1, enter = 1 }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const words = t(SERIES.name).split(" ");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", scale: `${size}` }}>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", maxWidth: 1500 }}>
        {words.map((w, i) => {
          const p = interpolate(enter * 30 - i * 4, [0, 14], [0, 1], { ...clamp, easing: easeOut });
          return (
            <span
              key={i}
              style={{
                fontSize: 150,
                fontWeight: 700,
                color: [C.pinkDark, C.lavenderDark, C.leafDark, C.butterDark][i % 4],
                WebkitTextStroke: `16px ${C.cream}`,
                paintOrder: "stroke fill",
                textShadow: "0 10px 0 rgba(94,75,110,0.2)",
                display: "inline-block",
                opacity: p,
                translate: `0px ${(1 - p) * 60 + Math.sin((frame + i * 9) / 10) * 6}px`,
                rotate: `${Math.sin((frame + i * 13) / 14) * 3}deg`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const StarField: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => (
        <Sparkle
          key={i}
          x={(i * 263 + 120) % 1920}
          y={((i * 197 + 90) % 900) + 60}
          size={40 + (i % 3) * 20}
          t={(frame - i * 3) / 7}
          color={[C.butterDark, C.pink, C.mint, C.lavender][i % 4]}
        />
      ))}
    </>
  );
};

/** 2.5 s opener: sky-blue page, the series name pops in word by word over a chime. */
export const SeriesIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const available = new Set(getStaticFiles().map((f) => f.name));
  return (
    <AbsoluteFill style={{ backgroundColor: C.sky, alignItems: "center", justifyContent: "center" }}>
      <StarField />
      <SeriesLogo enter={frame / 30} />
      <AbsoluteFill
        style={{
          backgroundColor: C.cream,
          opacity: interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], clamp),
        }}
      />
      {available.has(STING) ? (
        <Sequence name="Sting" layout="none">
          <Audio src={staticFile(STING)} volume={0.7} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

/** 4 s closer: logo + "see you next time" on lavender, fading to cream. */
export const SeriesOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = useT();
  return (
    <AbsoluteFill style={{ backgroundColor: C.lavender, alignItems: "center", justifyContent: "center", gap: 40 }}>
      <StarField />
      <SeriesLogo size={0.8} enter={frame / 30} />
      <div
        style={{
          fontSize: 64,
          fontWeight: 600,
          color: C.ink,
          background: C.cream,
          padding: "18px 48px",
          borderRadius: 50,
          boxShadow: "0 10px 0 rgba(94,75,110,0.14)",
          opacity: interpolate(frame, [20, 34], [0, 1], clamp),
          translate: `0px ${interpolate(frame, [20, 34], [24, 0], { ...clamp, easing: easeOut })}px`,
        }}
      >
        {t(SERIES.tagline)}
      </div>
      <AbsoluteFill
        style={{
          backgroundColor: C.cream,
          opacity: interpolate(frame, [0, 8, durationInFrames - 18, durationInFrames], [1, 0, 0, 1], clamp),
        }}
      />
    </AbsoluteFill>
  );
};
