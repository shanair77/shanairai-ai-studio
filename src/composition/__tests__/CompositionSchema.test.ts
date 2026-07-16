import { describe, expect, it, vi } from "vitest";

// CompositionSchema imports `staticFile` from remotion for local asset paths. It is the only
// remotion surface this module touches, so we mock just that with a predictable transform.
vi.mock("remotion", () => ({
  staticFile: (path: string) => `/static/${path}`,
}));

import {
  resolveAssetRef,
  resolveNamedAsset,
  validateComposition,
  type CompositionSchema,
} from "../CompositionSchema";

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

describe("resolveAssetRef", () => {
  it("passes an http(s) URL through unchanged (no staticFile)", () => {
    expect(resolveAssetRef("https://cdn.example.com/track.mp3")).toBe("https://cdn.example.com/track.mp3");
  });

  it("routes a local path through staticFile", () => {
    expect(resolveAssetRef("audio/bg.mp3")).toBe("/static/audio/bg.mp3");
  });
});

describe("resolveNamedAsset", () => {
  it("resolves a catalog key to its ref", () => {
    expect(resolveNamedAsset({ music: "audio/bg.mp3" }, "music")).toBe("/static/audio/bg.mp3");
  });

  it("resolves a catalog key whose value is a URL", () => {
    expect(resolveNamedAsset({ music: "https://cdn/x.mp3" }, "music")).toBe("https://cdn/x.mp3");
  });

  it("treats a non-key as a direct ref", () => {
    expect(resolveNamedAsset({ music: "audio/bg.mp3" }, "https://cdn/y.mp3")).toBe("https://cdn/y.mp3");
  });

  it("handles an undefined catalog by resolving the ref directly", () => {
    expect(resolveNamedAsset(undefined, "https://cdn/z.mp3")).toBe("https://cdn/z.mp3");
  });
});
