/**
 * Layout.ts — Shared spacing, format, and safe-area system.
 *
 * `BASE_WIDTH` is the reference width every size token is authored against. A format's
 * scale factor = its width / BASE_WIDTH, applied at render time so one scene definition
 * works across vertical, horizontal, and square outputs.
 *
 * Safe-area insets are FRACTIONAL (0–1 of width/height) so they translate cleanly
 * between formats — multiply by the composition's width/height to get pixels.
 */

/** Reference composition width; all px tokens are authored at this scale. */
export const BASE_WIDTH = 1080;

/** Spacing scale in px at BASE_WIDTH. Use for padding, gaps, and stack spacing. */
export const spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 64,
  "2xl": 96,
  "3xl": 128,
  "4xl": 192,
} as const;

/** Corner radii in px at BASE_WIDTH. */
export const radii = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 32,
  xl: 48,
  pill: 9999,
} as const;

export const borderWidths = {
  hairline: 1,
  thin: 2,
  thick: 4,
} as const;

/** Stacking order for layered scene content. */
export const zIndex = {
  background: 0,
  decoration: 10,
  content: 20,
  overlay: 30,
  foreground: 40,
} as const;

/** Named output formats. Vertical + horizontal are primary; square is optional. */
export const formats = {
  vertical: { name: "vertical", width: 1080, height: 1920, fps: 30, orientation: "portrait" },
  horizontal: { name: "horizontal", width: 1920, height: 1080, fps: 30, orientation: "landscape" },
  square: { name: "square", width: 1080, height: 1080, fps: 30, orientation: "square" },
} as const;

/**
 * Safe-area inset presets as fractions of width/height.
 *   default — light margins for general framing.
 *   social  — reserves extra bottom room for captions/CTAs and top room for handles.
 *   minimal — near-edge, for full-bleed hero moments.
 */
export const safeAreas = {
  default: { top: 0.06, right: 0.05, bottom: 0.06, left: 0.05 },
  social: { top: 0.12, right: 0.06, bottom: 0.18, left: 0.06 },
  minimal: { top: 0.03, right: 0.03, bottom: 0.03, left: 0.03 },
} as const;

export const layout = {
  baseWidth: BASE_WIDTH,
  spacing,
  radii,
  borderWidths,
  zIndex,
  formats,
  safeAreas,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radii;
export type FormatName = keyof typeof formats;
export type Format = (typeof formats)[FormatName];
export type SafeAreaToken = keyof typeof safeAreas;
export type Layout = typeof layout;
