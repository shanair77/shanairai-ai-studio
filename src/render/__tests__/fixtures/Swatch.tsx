/**
 * render/__tests__/fixtures/Swatch — a frame whose colour proves Tailwind ran.
 *
 * The class is an ARBITRARY VALUE (`bg-[rgb(0,128,255)]`) rather than a palette
 * name, and that is the whole design. `bg-blue-600` would resolve through Tailwind
 * v4's OKLCH palette to an sRGB triple that depends on the colour-conversion maths
 * of the version installed — a number the test would have to hardcode and that a
 * minor upgrade could legitimately move. An arbitrary value compiles to exactly the
 * channels written here, so the assertion is exact and stable, and any deviation is
 * a real defect rather than a rounding difference.
 *
 * If Tailwind is not wired into the render bundle, this class matches no rule, no
 * declaration is emitted, and the element paints nothing. The pixel test then sees
 * the empty frame instead of the colour — which is precisely the failure that a
 * "did the render succeed?" check cannot see, because the render does succeed.
 *
 * Deliberately no inline styles: an inline background would paint with or without
 * Tailwind and quietly turn the proof into a tautology.
 */

import { AbsoluteFill } from "remotion";

export type SwatchSceneProps = {
  /** Rendered as large text, so a frame grab also shows the params arrived. */
  label?: string;
};

export const SwatchScene: React.FC<SwatchSceneProps> = ({ label }) => (
  <AbsoluteFill className="bg-[rgb(0,128,255)] flex items-center justify-center">
    <span className="text-[rgb(255,255,0)] text-8xl font-bold">{label ?? ""}</span>
  </AbsoluteFill>
);
