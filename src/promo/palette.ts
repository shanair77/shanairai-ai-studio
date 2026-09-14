/**
 * promo/palette — promo-local color constants.
 *
 * The film renders under the Shanair.AI brand theme (via BrandProvider), so all TYPE color
 * comes from semantic theme roles through `<Text>` / `useTheme()`. These extra values are only
 * for the bespoke motion-graphics chrome (terminal surface, syntax tokens, timeline tracks)
 * that has no semantic role — every one is drawn from the brand anchors, never invented, and
 * deliberately warm (gold / rose / sand / platinum) to avoid the generic-tech neon look.
 */

import { palette, withAlpha } from "../config/Colors";

/** Brand anchors, surfaced for direct use in graphics. */
export const GOLD = palette.gold[500]; // #D4AF37 champagne gold
export const GOLD_SOFT = palette.gold[300];
export const CREAM = palette.cream[50];
export const CREAM_100 = palette.cream[100];
export const PLUM = palette.plum[700]; // #4B2142 deep plum
export const PLUM_DEEP = palette.plum[900];
export const ROSE = palette.rose[500]; // #C98C9E dusty rose
export const SAND = "#EEE4D4";
export const PLATINUM = "#CFC7BA";
export const INK = "#140B12"; // Shanair near-black plum canvas

/** Terminal / editor chrome. */
export const TERM = {
  bg: "#0E0910",
  bar: "#1A121B",
  border: withAlpha(GOLD, 0.22),
  dot1: "#E7A63F",
  dot2: withAlpha(CREAM, 0.35),
  dot3: withAlpha(ROSE, 0.7),
} as const;

/** Syntax token colors — warm, on-brand, no blue/green neon. */
export const SYNTAX = {
  plain: withAlpha(CREAM, 0.9),
  keyword: GOLD,
  tag: ROSE,
  attr: PLATINUM,
  string: SAND,
  number: GOLD_SOFT,
  comment: withAlpha(CREAM, 0.34),
  punct: withAlpha(CREAM, 0.55),
} as const;

export { withAlpha };
