/**
 * config/fonts — deterministic, provider-based font loading.
 *
 * Selecting a provider is the ONLY place a font source is named. This module is PURE on
 * import: it defines the loading capability but never activates it, so any layer may import
 * `loadFonts` without performing I/O. The activation lives in `./bootstrap`, which the
 * application entry imports for its side effect (invariant #9).
 *
 * To swap sources — e.g. self-hosted brand fonts — implement a `FontProvider` and assign it
 * to `provider` below. Nothing else changes.
 */

import { GoogleFontProvider } from "./GoogleFontProvider";
import { type FontFace, type FontProvider } from "./types";

/** The active font provider. */
const provider: FontProvider = GoogleFontProvider;

// Faces already requested (base + any brand manifest), so repeat requests are no-ops.
const requested = new Set<string>();
const faceKey = (f: FontFace): string => `${f.family}|${[...f.weights].sort().join(",")}|${[...f.styles].sort().join(",")}`;

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
