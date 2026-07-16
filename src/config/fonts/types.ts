/**
 * fonts/types — the provider-agnostic font-loading contract.
 *
 * The framework depends on these types, never on a concrete font source. A `FontProvider`
 * knows HOW to load a set of faces (from Google Fonts, from local files, …); the manifest
 * declares WHAT faces are needed. Swapping providers never touches consumers.
 */

export type FontStyle = "normal" | "italic";

/** One family and the exact weights/styles/subsets to load for it. */
export type FontFace = {
  family: string;
  weights: number[];
  styles: FontStyle[];
  subsets: string[];
};

/** A fully-expanded, single (family, weight, style) tuple. */
export type LoadedFace = { family: string; weight: number; style: FontStyle };

/** A source that can load a manifest's faces and resolve when they are ready. */
export type FontProvider = {
  readonly name: string;
  /** Load every face; resolves once all are registered and ready to render. */
  load(faces: FontFace[]): Promise<void>;
};
