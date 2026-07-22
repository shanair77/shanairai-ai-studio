import { describe, expect, it } from "vitest";
import { validateComposition, type CompositionSchema } from "../CompositionSchema";

const valid: CompositionSchema = {
  id: "Demo",
  scenes: [{ scene: "hero" }, { scene: "outro" }],
};

describe("validateComposition", () => {
  describe("normal", () => {
    it("accepts a well-formed config", () => {
      expect(() => validateComposition(valid)).not.toThrow();
    });
  });

  describe("expected failures", () => {
    it("throws when id is missing", () => {
      expect(() => validateComposition({ scenes: [{ scene: "hero" }] } as unknown as CompositionSchema)).toThrow(/id/);
    });

    it("throws when id is empty", () => {
      expect(() => validateComposition({ id: "", scenes: [{ scene: "hero" }] })).toThrow(/id/);
    });

    it("throws when scenes is not an array", () => {
      expect(() => validateComposition({ id: "X", scenes: undefined } as unknown as CompositionSchema)).toThrow(
        /at least one scene/,
      );
    });

    it("throws when scenes is empty", () => {
      expect(() => validateComposition({ id: "X", scenes: [] })).toThrow(/at least one scene/);
    });

    it("throws with the offending index when a scene is missing its name", () => {
      const cfg = { id: "X", scenes: [{ scene: "hero" }, {}] } as unknown as CompositionSchema;
      expect(() => validateComposition(cfg)).toThrow(/scenes\[1\]/);
    });
  });
});
