/**
 * Colors.ts — Brand color system.
 *
 * Luxury / modern / feminine palette built around four brand anchors:
 *   Deep Plum      #4B2142
 *   Soft Cream     #F7F3EC
 *   Dusty Rose     #C98C9E
 *   Champagne Gold #D4AF37
 *
 * `palette` holds raw tints/shades (50 = lightest, 900 = darkest, `base` = brand anchor).
 * `semanticColors` maps those to meaning (background, text, accent…) so components
 * never reference a raw hex. Brand themes later override `semanticColors`.
 */

/** Convert a 6-digit hex to an rgba() string with the given alpha (0–1). */
export const withAlpha = (hex: string, alpha: number): string => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const plum = {
  50: "#F5ECF2",
  100: "#E6D2E0",
  200: "#C79EBE",
  300: "#A9709D",
  400: "#8E4E80",
  500: "#743667",
  600: "#5E2A53",
  700: "#4B2142", // ← Deep Plum (brand)
  800: "#3A1934",
  900: "#2E1428",
  base: "#4B2142",
} as const;

const cream = {
  50: "#FDFBF7",
  100: "#F7F3EC", // ← Soft Cream (brand)
  200: "#EFE9DD",
  300: "#E5DCCB",
  400: "#D8CCB4",
  base: "#F7F3EC",
} as const;

const rose = {
  50: "#FBF4F6",
  100: "#F4E6EB",
  200: "#EACFD7",
  300: "#DFB8C4",
  400: "#D4A2B1",
  500: "#C98C9E", // ← Dusty Rose (brand)
  600: "#B4788A",
  700: "#9E6072",
  base: "#C98C9E",
} as const;

const gold = {
  50: "#FCF8EC",
  100: "#F7EDD1",
  200: "#F0DFAA",
  300: "#E7CF83",
  400: "#DEBF5C",
  500: "#D4AF37", // ← Champagne Gold (brand)
  600: "#BF9B31",
  700: "#A8862A",
  base: "#D4AF37",
} as const;

/** Raw color scales. Prefer `semanticColors` in components; reach here for bespoke work. */
export const palette = {
  plum,
  cream,
  rose,
  gold,
  white: "#FFFFFF",
  black: "#000000",
  ink: "#2E1428",
} as const;

/** Reusable brand gradients (luxe plum, rose-gold, champagne sheen). */
export const gradients = {
  plum: `linear-gradient(135deg, ${plum[800]} 0%, ${plum[600]} 100%)`,
  plumRose: `linear-gradient(135deg, ${plum[700]} 0%, ${rose[500]} 100%)`,
  roseGold: `linear-gradient(135deg, ${rose[500]} 0%, ${gold[500]} 100%)`,
  champagne: `linear-gradient(135deg, ${gold[400]} 0%, ${gold[600]} 100%)`,
  cream: `linear-gradient(180deg, ${cream[50]} 0%, ${cream[100]} 100%)`,
  goldSheen: `linear-gradient(100deg, ${withAlpha(gold[300], 0)} 0%, ${withAlpha(gold[200], 0.85)} 50%, ${withAlpha(gold[300], 0)} 100%)`,
} as const;

/** Default luxury-feminine surface: cream canvas, plum ink, gold + rose accents. */
export const semanticColors = {
  background: cream[50],
  surface: cream[100],
  surfaceAlt: plum[50],
  overlay: withAlpha(plum[900], 0.6),

  textPrimary: plum[700],
  textSecondary: plum[400],
  textMuted: withAlpha(plum[700], 0.6),
  textInverse: cream[50],

  primary: plum[700],
  onPrimary: cream[50],
  accent: gold[500],
  onAccent: plum[900],
  secondary: rose[500],
  onSecondary: cream[50],

  border: withAlpha(plum[700], 0.12),
  divider: withAlpha(plum[700], 0.08),
  highlight: gold[300],
  shadow: withAlpha(plum[900], 0.25),
} as const;

/** Inverted surface: plum canvas, cream ink — for dramatic / hero moments. */
export const semanticColorsDark = {
  background: plum[900],
  surface: plum[800],
  surfaceAlt: plum[700],
  overlay: withAlpha(plum[900], 0.7),

  textPrimary: cream[50],
  textSecondary: rose[200],
  textMuted: withAlpha(cream[50], 0.6),
  textInverse: plum[900],

  primary: cream[100],
  onPrimary: plum[900],
  accent: gold[500],
  onAccent: plum[900],
  secondary: rose[400],
  onSecondary: plum[900],

  border: withAlpha(cream[50], 0.16),
  divider: withAlpha(cream[50], 0.1),
  highlight: gold[400],
  shadow: withAlpha(plum[900], 0.5),
} as const;

export type ColorScale = typeof plum;
export type Palette = typeof palette;
export type SemanticColors = typeof semanticColors;
