/**
 * Theme.ts — The single source of truth for the design system.
 *
 * Composes Colors, Typography, Animation, Timing, and Layout into one `theme` object.
 * Components and scenes should import from here (or, later, read the active brand theme
 * from context) rather than pulling tokens from individual files — so a brand can swap
 * one slice (e.g. colors) while everything else stays consistent.
 *
 *   import { theme } from "@/config/Theme";   // or relative path
 *   style={{ color: theme.colors.textPrimary, ...theme.typography.textStyles.h1 }}
 */

import {
  palette,
  semanticColors,
  semanticColorsDark,
  gradients,
  withAlpha,
  type SemanticColors,
} from "./Colors";
import { typography } from "./Typography";
import { animation } from "./Animation";
import { timing } from "./Timing";
import { layout } from "./Layout";

/** Default luxury-feminine theme: cream canvas, plum ink, gold + rose accents. */
export const theme = {
  colors: semanticColors,
  palette,
  gradients,
  typography,
  animation,
  timing,
  layout,
} as const;

/** Inverted variant for hero / dramatic scenes: plum canvas, cream ink. */
export const darkTheme = {
  ...theme,
  colors: semanticColorsDark,
} as const;

/** Look up a theme by mode name. */
export const themes = {
  light: theme,
  dark: darkTheme,
} as const;

export { withAlpha };

export type ThemeMode = keyof typeof themes;

/**
 * The active theme. `colors` is exposed through the `SemanticColors` contract (role keys →
 * string) so a brand-merged theme — whose overridden colors are arbitrary strings — is a
 * valid `Theme`. All other slices keep their concrete token types.
 */
export type Theme = Omit<typeof theme, "colors"> & { colors: SemanticColors };

/**
 * A brand supplies overrides; this is the shape the brand system will produce
 * before injecting it through context. Kept here so the token contract lives in one place.
 */
export type ThemeOverrides = {
  colors?: Partial<SemanticColors>;
};
