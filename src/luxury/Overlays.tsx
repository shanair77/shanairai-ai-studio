/**
 * Overlays — the layers that sit on top of every cut and make sixteen unrelated clips feel
 * like one film: a colour grade, a vignette, film grain, the persistent caption, and the
 * handle end-card. Each is a full-bleed layer with `pointerEvents: none`.
 */

import { AbsoluteFill, Interactive, interpolate, useCurrentFrame } from "remotion";
import { easings } from "../config/Animation";
import { fontFamilies } from "../config/Typography";

/** Warm gold used for the end-card rule and tint. */
const GOLD = "#d9b46a";

/**
 * Grade — a warm tint plus darkened top/bottom bands (which also keep text clear of the
 * Instagram UI) and a radial vignette that pulls the eye to centre.
 */
export const Grade: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundColor: GOLD,
        mixBlendMode: "soft-light",
        opacity: 0.22,
      }}
    />
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.65) 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.6) 100%)",
      }}
    />
  </>
);

/**
 * Grain — per-frame film grain. The turbulence seed is the frame number, so the noise
 * "boils" like real stock instead of sitting still like a texture.
 */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}>
      <svg width="100%" height="100%">
        <filter id="luxury-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="1" seed={frame} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#luxury-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export type CaptionProps = {
  text: string;
  /** Frame the caption starts fading in. */
  inAt: number;
  /** Frame the caption starts fading out (for the end-card handover). */
  outAt: number;
};

/**
 * Caption — the one line that stays on screen the whole reel ("High class."). Set in a
 * light serif with a soft shadow, sat slightly above centre so it never fights the IG
 * caption block at the bottom.
 */
export const Caption: React.FC<CaptionProps> = ({ text, inAt, outAt }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", justifyContent: "center", alignItems: "center" }}>
      <Interactive.Div
        name="Caption"
        style={{
          fontFamily: fontFamilies.serif,
          fontWeight: 500,
          fontSize: 78,
          letterSpacing: "0.02em",
          color: "#f7f3ea",
          textShadow: "0 2px 28px rgba(0,0,0,0.65), 0 0 2px rgba(0,0,0,0.5)",
          translate: interpolate(frame, [inAt, inAt + 24], ["0px 14px", "0px -40px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: easings.luxe,
          }),
          opacity: interpolate(frame, [inAt, inAt + 24, outAt, outAt + 18], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {text}
      </Interactive.Div>
    </AbsoluteFill>
  );
};

export type EndCardProps = {
  handle: string;
  tagline?: string;
  /** Frame the end-card begins. */
  startAt: number;
};

/**
 * EndCard — the handle, a hairline gold rule that draws itself, and an optional tagline.
 * This is the one addition over the reference: it turns a mood clip into a page promo.
 */
export const EndCard: React.FC<EndCardProps> = ({ handle, tagline, startAt }) => {
  const frame = useCurrentFrame();
  const fadeIn = (from: number, len = 20) =>
    interpolate(frame, [from, from + len], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easings.luxe,
    });

  return (
    <AbsoluteFill
      style={{ pointerEvents: "none", justifyContent: "center", alignItems: "center", gap: 26 }}
    >
      <Interactive.Div
        name="End card · rule"
        style={{
          height: 1,
          backgroundColor: GOLD,
          width: interpolate(frame, [startAt, startAt + 30], [0, 220], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: easings.luxe,
          }),
          opacity: fadeIn(startAt),
        }}
      />
      <Interactive.Div
        name="End card · handle"
        style={{
          fontFamily: fontFamilies.display,
          fontWeight: 500,
          fontSize: 60,
          letterSpacing: "0.04em",
          color: "#f7f3ea",
          textShadow: "0 2px 28px rgba(0,0,0,0.65)",
          opacity: fadeIn(startAt + 8),
          translate: interpolate(frame, [startAt + 8, startAt + 32], ["0px 16px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: easings.luxe,
          }),
        }}
      >
        {handle}
      </Interactive.Div>
      {tagline ? (
        <Interactive.Div
          name="End card · tagline"
          style={{
            fontFamily: fontFamilies.accent,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: GOLD,
            opacity: fadeIn(startAt + 20),
          }}
        >
          {tagline}
        </Interactive.Div>
      ) : null}
    </AbsoluteFill>
  );
};
