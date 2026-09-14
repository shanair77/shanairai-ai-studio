/**
 * shanairai/brand — the Shanair.AI brand pack.
 *
 * Not a framework feature — this is brand CONTENT authored against the existing Brand System
 * (`defineBrand`) and registered into the existing brand registry via its immutable `extend`.
 * The framework ships no brands by design, so a brand pack is exactly where identity belongs:
 * the theme override recolors every primitive through `ThemeProvider`, and `transition`
 * supplies the house scene-to-scene move the CompositionBuilder falls back to when a
 * composition declares none.
 *
 * The look is "luxury-tech": the framework's dark plum surface pushed to a near-black ink,
 * champagne gold kept as the single accent, and the feminine rose swapped for a cool
 * platinum so the palette reads engineered rather than decorative. Every value is a semantic
 * role from `SemanticColors` — no primitive ever sees a hex.
 */

import { defineBrand, brandRegistry } from "../brand";
import { palette, withAlpha } from "../config/Colors";

/** Near-black plum — the house canvas. Deeper than the framework's dark surface. */
const ink = "#140B12";
/** First lift off the canvas, for panels and quiet tonal shifts between scenes. */
const surface = "#1D1119";
/** Second lift, for the emphasis beat (the CTA). */
const surfaceAlt = "#281620";
/** Cool platinum — the luxury-tech counterweight to gold (replaces the default rose). */
const platinum = "#CFC7BA";

/** The Shanair.AI brand pack: theme, house transition, and identity metadata. */
export const shanairAI = defineBrand({
  name: "Shanair.AI",
  mode: "dark",
  theme: {
    colors: {
      background: ink,
      surface,
      surfaceAlt,
      overlay: withAlpha(ink, 0.72),

      textPrimary: palette.cream[50],
      textSecondary: platinum,
      textMuted: withAlpha(palette.cream[50], 0.55),
      textInverse: ink,

      primary: palette.cream[100],
      onPrimary: ink,
      accent: palette.gold[500],
      onAccent: ink,
      secondary: platinum,
      onSecondary: ink,

      border: withAlpha(palette.gold[500], 0.24),
      divider: withAlpha(palette.gold[500], 0.14),
      highlight: palette.gold[300],
      shadow: withAlpha(palette.black, 0.6),
    },
  },
  // The house move: the transparency-safe cross-dissolve, slow enough to read as luxe.
  // eslint-disable-next-line @remotion/non-pure-animation -- config key, not a CSS animation
  transition: { type: "dissolve", duration: 0.5 },
  meta: { url: "https://shanair.ai", handles: { site: "shanair.ai" } },
});

/** The framework's brand registry extended with Shanair.AI (immutable — the default is untouched). */
export const brands = brandRegistry.extend({ "shanair-ai": shanairAI });

/** The registered name compositions select this brand by. */
export const SHANAIR_AI = "shanair-ai";
