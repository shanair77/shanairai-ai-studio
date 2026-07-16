/**
 * GoogleFontProvider — a FontProvider backed by @remotion/google-fonts.
 *
 * This is the ONLY module that imports @remotion/google-fonts, so the framework depends on
 * the provider contract, not on Google Fonts. It maps manifest family names to the
 * per-family `loadFont` and loads each requested (style, weights) combination, aggregating
 * their `waitUntilDone` promises. A future LocalFontProvider implements the same interface
 * (e.g. via @remotion/fonts + staticFile) and drops in with no consumer changes.
 */

import { loadFont as loadCormorantGaramond } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadJost } from "@remotion/google-fonts/Jost";
import { loadFont as loadPlayfairDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { type FontFace, type FontProvider } from "./types";

/** Loose shape of a @remotion/google-fonts `loadFont` — the strict per-family generics are
 * erased here so the provider can drive them uniformly from manifest data. */
type GoogleLoadFont = (
  style?: string,
  options?: { weights?: string[]; subsets?: string[] },
) => { fontFamily: string; waitUntilDone: () => Promise<unknown> };

const LOADERS: Record<string, GoogleLoadFont> = {
  "Playfair Display": loadPlayfairDisplay as unknown as GoogleLoadFont,
  "Cormorant Garamond": loadCormorantGaramond as unknown as GoogleLoadFont,
  Poppins: loadPoppins as unknown as GoogleLoadFont,
  Jost: loadJost as unknown as GoogleLoadFont,
};

export const GoogleFontProvider: FontProvider = {
  name: "google",
  async load(faces: FontFace[]): Promise<void> {
    const pending: Array<Promise<unknown>> = [];
    for (const face of faces) {
      const loader = LOADERS[face.family];
      if (!loader) {
        throw new Error(`GoogleFontProvider: no Google Fonts mapping for "${face.family}".`);
      }
      const weights = face.weights.map(String);
      for (const style of face.styles) {
        const { waitUntilDone } = loader(style, { weights, subsets: face.subsets });
        pending.push(waitUntilDone());
      }
    }
    await Promise.all(pending);
  },
};
