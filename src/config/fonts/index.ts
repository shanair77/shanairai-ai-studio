/**
 * config/fonts — deterministic, provider-based font loading (runs once, at the entry).
 *
 * Selecting a provider is the ONLY place a font source is named. Importing this module
 * kicks off loading of every manifest face exactly once; @remotion/google-fonts (via the
 * provider) opens delayRender handles so the renderer blocks until the faces are ready —
 * making rendering deterministic and offline (the fonts are vendored, not fetched at
 * render). The application entry imports this module for its side effect; no visual layer
 * (components / scenes / composition) imports it.
 *
 * To swap sources — e.g. self-hosted brand fonts — implement a `FontProvider` and assign it
 * to `provider` below. Nothing else changes.
 */

import { GoogleFontProvider } from "./GoogleFontProvider";
import { fontManifest } from "./manifest";
import { type FontFace, type FontProvider } from "./types";

/** The active font provider. */
const provider: FontProvider = GoogleFontProvider;

/** Loading of every base manifest face, started once on import. */
export const fontsReady: Promise<void> = provider.load(fontManifest);

/** Await all manifest fonts (for consumers/tests that must block on readiness). */
export const waitForFonts = (): Promise<void> => fontsReady;

// Faces already requested (base + any brand manifest), so repeat requests are no-ops.
const requested = new Set<string>();
const faceKey = (f: FontFace): string => `${f.family}|${[...f.weights].sort().join(",")}|${[...f.styles].sort().join(",")}`;
fontManifest.forEach((f) => requested.add(faceKey(f)));

/**
 * Load additional font faces on demand (e.g. a brand's manifest), deduplicated against
 * everything already requested — so a brand can be loaded lazily when its composition renders
 * without re-loading base faces or loading the same face twice.
 */
export const loadFonts = (faces: FontFace[]): Promise<void> => {
  const fresh = faces.filter((f) => {
    const key = faceKey(f);
    if (requested.has(key)) return false;
    requested.add(key);
    return true;
  });
  return fresh.length === 0 ? Promise.resolve() : provider.load(fresh);
};

export { fontManifest, expandManifest } from "./manifest";
export type { FontFace, FontProvider, FontStyle, LoadedFace } from "./types";
