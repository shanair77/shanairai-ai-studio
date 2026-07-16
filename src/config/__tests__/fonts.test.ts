import { describe, expect, it } from "vitest";
import { typography } from "../Typography";
import { expandManifest, fontManifest } from "../fonts/manifest";
import type { LoadedFace } from "../fonts/types";

// These tests are provider-agnostic: they import only the manifest (pure data) and the
// typography tokens — never a FontProvider — so no font source is pulled into node.

/** Extract the primary (first) family from a CSS font stack. */
const primaryFamily = (stack: string): string => stack.match(/"([^"]+)"/)?.[1] ?? stack.split(",")[0].trim();

const key = (f: LoadedFace): string => `${f.family}::${f.weight}::${f.style}`;

/**
 * The faces the components actually require:
 *  - every typography token (textStyles variant → its family + weight, normal), plus
 *  - the two component-level overrides Text cannot express on its own:
 *      CTA composes `body` but bumps to semibold; Quote composes `h3` but is italic.
 */
const requiredFaces = (): LoadedFace[] => {
  const fromTokens: LoadedFace[] = Object.values(typography.textStyles).map((t) => ({
    family: primaryFamily(t.fontFamily),
    weight: t.fontWeight,
    style: "normal",
  }));
  const overrides: LoadedFace[] = [
    { family: primaryFamily(typography.fontFamilies.body), weight: typography.fontWeights.semibold, style: "normal" },
    { family: primaryFamily(typography.fontFamilies.serif), weight: typography.textStyles.h3.fontWeight, style: "italic" },
  ];
  const seen = new Map<string, LoadedFace>();
  for (const f of [...fromTokens, ...overrides]) seen.set(key(f), f);
  return [...seen.values()];
};

describe("font manifest coverage", () => {
  const loaded = new Set(expandManifest().map(key));
  const required = requiredFaces();
  const requiredKeys = new Set(required.map(key));

  it("backs every typography token with a loaded face (nothing missing)", () => {
    const missing = required.filter((f) => !loaded.has(key(f)));
    expect(missing, `missing faces: ${missing.map(key).join(", ")}`).toEqual([]);
  });

  it("loads no unused faces (nothing extra)", () => {
    const extra = expandManifest().filter((f) => !requiredKeys.has(key(f)));
    expect(extra, `unused faces: ${extra.map(key).join(", ")}`).toEqual([]);
  });

  it("matches the required set exactly", () => {
    expect(loaded).toEqual(requiredKeys);
  });

  it("declares a subset for every manifest face", () => {
    for (const face of fontManifest) {
      expect(face.subsets.length).toBeGreaterThan(0);
    }
  });
});
