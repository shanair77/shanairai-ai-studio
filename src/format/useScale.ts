/**
 * useScale() — Responsive scaling from composition dimensions.
 *
 * All design tokens (font sizes, spacing, radii) are authored at BASE_WIDTH (1080),
 * which is the SHORT side of every standard format (portrait 1080×1920, square
 * 1080×1080, landscape 1920×1080). Scaling by the short side therefore yields a
 * factor of 1 across all three standard formats, and scales cleanly to higher
 * resolutions (e.g. 2160-wide → factor 2).
 *
 * Using the short side (not the width) keeps typography PROPORTIONAL and identically
 * sized whether the video is portrait, landscape, or square — text never balloons in
 * landscape just because the frame is wider.
 *
 *   const { scale } = useScale();
 *   style={{ fontSize: scale(theme.typography.fontSizes.h1) }}
 */

import { useVideoConfig } from "remotion";
import { BASE_WIDTH } from "../config/Layout";

export type ScaleInfo = {
  /** Raw multiplier: shortSide / baseDimension. */
  factor: number;
  /** Multiply a base-authored token by the factor. */
  scale: (value: number) => number;
  /** Same as `scale`, rounded to a whole pixel — for crisp borders/positions. */
  scaleRounded: (value: number) => number;
};

/**
 * @param baseDimension Reference short-side the tokens were authored against.
 *                      Defaults to BASE_WIDTH (1080); override only for special cases.
 */
export const useScale = (baseDimension: number = BASE_WIDTH): ScaleInfo => {
  const { width, height } = useVideoConfig();
  const shortSide = Math.min(width, height);
  const factor = shortSide / baseDimension;

  return {
    factor,
    scale: (value: number) => value * factor,
    scaleRounded: (value: number) => Math.round(value * factor),
  };
};
