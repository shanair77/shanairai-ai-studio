/**
 * Typography.ts — Shared typography system.
 *
 * Luxury / feminine pairing: a high-contrast display serif (Playfair Display) over
 * a clean modern sans (Poppins), with a delicate serif (Cormorant) for accents.
 *
 * Sizes are expressed in px at the base composition width (1080). At render time,
 * multiply by the format's scale factor (see `useScale`) so type reads correctly in
 * vertical, horizontal, and square formats alike.
 *
 * Fonts are loaded once at the application entry by the provider-based loader in
 * `config/fonts` (a provider-agnostic manifest + a FontProvider). These are the family
 * stacks components reference through `textStyles`; the loader registers the actual faces.
 */

export const fontFamilies = {
  /** Hero headlines — elegant, high-contrast serif. */
  display: `"Playfair Display", "Georgia", serif`,
  /** Editorial accents, pull quotes — light and refined. */
  serif: `"Cormorant Garamond", "Playfair Display", serif`,
  /** Body copy and UI — clean, geometric, feminine. */
  body: `"Poppins", "Helvetica Neue", Arial, sans-serif`,
  /** Overlines, labels, kickers — spaced-out sans. */
  accent: `"Jost", "Poppins", sans-serif`,
} as const;

export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const letterSpacing = {
  tighter: "-0.03em",
  tight: "-0.01em",
  normal: "0em",
  wide: "0.04em",
  wider: "0.12em",
  widest: "0.24em",
} as const;

export const lineHeights = {
  tight: 1.05,
  snug: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;

/** Type scale in px at BASE_WIDTH (1080). Scale with the format's factor. */
export const fontSizes = {
  display: 120,
  h1: 84,
  h2: 60,
  h3: 44,
  body: 36,
  caption: 28,
  overline: 22,
} as const;

/** Ready-made role presets — spread onto a `style` object, then scale sizes. */
export const textStyles = {
  display: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.display,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  h1: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.h1,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacing.normal,
  },
  h3: {
    fontFamily: fontFamilies.serif,
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wide,
  },
  overline: {
    fontFamily: fontFamilies.accent,
    fontSize: fontSizes.overline,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.widest,
  },
} as const;

export const typography = {
  fontFamilies,
  fontWeights,
  fontSizes,
  letterSpacing,
  lineHeights,
  textStyles,
} as const;

export type FontSizeToken = keyof typeof fontSizes;
export type TextStyleToken = keyof typeof textStyles;
export type Typography = typeof typography;
