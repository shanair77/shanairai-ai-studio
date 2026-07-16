/**
 * fonts/manifest — the provider-agnostic declaration of which faces to load.
 *
 * The single source of truth for the framework's font needs, expressed only in terms of
 * family names, weights, styles, and subsets — no provider knowledge. Any `FontProvider`
 * consumes this same manifest. It lists ONLY the weights/styles the components actually
 * use (see the coverage tests, which prove the manifest matches the typography tokens
 * exactly — nothing missing, nothing unused).
 */

import { type FontFace, type LoadedFace } from "./types";

export const fontManifest: FontFace[] = [
  // Playfair Display — display / h1 / h2 (Headline, Subheadline).
  { family: "Playfair Display", weights: [500, 600, 700], styles: ["normal"], subsets: ["latin"] },
  // Cormorant Garamond — h3 (Quote), which renders italic by default.
  { family: "Cormorant Garamond", weights: [500], styles: ["normal", "italic"], subsets: ["latin"] },
  // Poppins — body / caption (Paragraph, Caption) + CTA (semibold).
  { family: "Poppins", weights: [400, 600], styles: ["normal"], subsets: ["latin"] },
  // Jost — overline (Eyebrow, Kicker).
  { family: "Jost", weights: [600], styles: ["normal"], subsets: ["latin"] },
];

/** Expand the manifest into individual (family, weight, style) tuples. */
export const expandManifest = (faces: FontFace[] = fontManifest): LoadedFace[] =>
  faces.flatMap((face) =>
    face.styles.flatMap((style) => face.weights.map((weight) => ({ family: face.family, weight, style }))),
  );
