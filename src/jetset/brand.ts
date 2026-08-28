/**
 * jetset/brand — the Jet Set Adventures brand pack.
 *
 * CAMPAIGN EXPRESSION, NOT REDESIGN. Every value here was extracted from the live site at
 * thejetsetadventures.com — computed styles for the colour roles, the `@font-face` declarations
 * for the type, and a pixel decode of `/brand/logo.png` for the mark. Nothing is invented.
 *
 * Two findings from that audit shaped this file:
 *   1. The site LOADS Fraunces and Instrument Sans and then applies neither — all rendered type
 *      falls back to a system stack. This pack finally uses them, so the commercial realises the
 *      identity the site intended rather than inventing a new one.
 *   2. The logo navy (#17254E) and the site navy (#0E2740) differ, as do the logo orange
 *      (#FFA048) and the site gold (#E7A63F). The SITE values are treated as authoritative for
 *      surfaces and type; the badge keeps its own colours and is simply placed on the navy field.
 *
 * Proposed additions still awaiting sign-off are marked PROPOSED below.
 */

import { defineBrand } from "../brand";
import { withAlpha } from "../config/Colors";
import { jetSetKit } from "./assets";

// --- Extracted site colours (computed styles, thejetsetadventures.com) ---
/** Primary navy surface — the site's dominant dark ground. */
const NAVY = "#0E2740";
/** Deepest navy — footer and darkest bands. */
const NAVY_DEEP = "#071A2C";
/** Body-copy navy, used here as the lifted panel surface. */
const NAVY_LIFT = "#143352";
/** Scrim navy — the site's own photo-overlay colour, used at 0–80% alpha. */
const SCRIM = "#04121E";
/** Gold — the CTA fill. The action colour. */
const GOLD = "#E7A63F";
/** Soft gold — accent text, eyebrows, headline emphasis on navy. */
const GOLD_SOFT = "#F3C57E";
/** Cream — page ground on light sections; the text colour over navy and footage. */
const CREAM = "#F7F1E6";
/** Warm sand tint. */
const SAND = "#EEE4D4";

export const jetSetAdventures = defineBrand({
  name: "Jet Set Adventures",
  mode: "dark",
  theme: {
    colors: {
      background: NAVY,
      surface: NAVY_LIFT,
      surfaceAlt: NAVY_DEEP,
      overlay: withAlpha(SCRIM, 0.72),

      textPrimary: CREAM,
      textSecondary: SAND,
      textMuted: withAlpha(CREAM, 0.62),
      textInverse: NAVY,

      // Gold fill with navy text, exactly as the site's "Plan My Trip" button renders.
      primary: GOLD,
      onPrimary: NAVY,
      // Eyebrows and accent type take the SOFT gold — the site never sets body-scale type in
      // the button gold, which is reserved for fills.
      accent: GOLD_SOFT,
      onAccent: NAVY,
      secondary: GOLD,
      onSecondary: NAVY,

      border: withAlpha(GOLD, 0.28),
      divider: withAlpha(CREAM, 0.12),
      highlight: GOLD_SOFT,
      shadow: withAlpha(SCRIM, 0.6),
    },
    typography: {
      fontFamilies: {
        display: `"Fraunces", Georgia, "Times New Roman", serif`,
        serif: `"Fraunces", Georgia, serif`,
        body: `"Instrument Sans", -apple-system, "Segoe UI", Arial, sans-serif`,
        accent: `"Instrument Sans", -apple-system, "Segoe UI", Arial, sans-serif`,
      },
    },
  },
  // Loaded lazily when a Jet Set composition renders; deduplicated against the base manifest.
  fonts: [
    { family: "Fraunces", weights: [500, 600, 700], styles: ["normal"], subsets: ["latin"] },
    { family: "Fraunces", weights: [500], styles: ["italic"], subsets: ["latin"] },
    { family: "Instrument Sans", weights: [400, 600, 700], styles: ["normal"], subsets: ["latin"] },
  ],
  assets: jetSetKit,
  logos: { primary: "badge" },
  // PROPOSED: the site declares no motion language. A 0.4s cross-dissolve is the campaign's
  // house move between destination shots; hard cuts are declared per-scene in the fast section.
  // eslint-disable-next-line @remotion/non-pure-animation -- config key, not a CSS animation
  transition: { type: "dissolve", duration: 0.4 },
  meta: {
    url: "https://www.thejetsetadventures.com",
    handles: { site: "www.thejetsetadventures.com" },
  },
});

/** Palette re-exported for campaign graphics that need a raw value (scrims, rules). */
export const jetSetPalette = { NAVY, NAVY_DEEP, NAVY_LIFT, SCRIM, GOLD, GOLD_SOFT, CREAM, SAND } as const;

/** The registered name compositions select this brand by. */
export const JET_SET = "jet-set-adventures";
