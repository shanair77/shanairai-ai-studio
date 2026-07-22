import { describe, expect, it } from "vitest";
import { DomainError } from "../../errors";
import { assertCategory, resolveAsset, validateMetadata } from "../resolve";
import type { AssetDefinition, AssetSourceResolver } from "../types";

/** Run `fn`, return whatever it throws (fails loudly if it doesn't throw). */
const caught = (fn: () => unknown): unknown => {
  try {
    fn();
  } catch (e) {
    return e;
  }
  throw new Error("expected the function to throw, but it did not");
};

const okResolver: AssetSourceResolver = {
  name: "ok",
  supports: () => true,
  resolve: (_s, category, metadata) => ({ kind: "file", category, src: "RESOLVED", metadata }),
};
const noResolver: AssetSourceResolver = { name: "no", supports: () => false, resolve: () => ({ kind: "gradient", value: "x" }) };

describe("validateMetadata", () => {
  it("accepts undefined and positive values", () => {
    expect(() => validateMetadata("a")).not.toThrow();
    expect(() => validateMetadata("a", { width: 100, height: 50, durationInSeconds: 3 })).not.toThrow();
  });
  it("rejects non-positive dimensions/duration", () => {
    expect(() => validateMetadata("a", { width: 0 })).toThrow(/width/);
    expect(() => validateMetadata("a", { durationInSeconds: -1 })).toThrow(/durationInSeconds/);
  });
  it("classifies bad metadata as a DomainError `invalid-asset-metadata` (path + actual)", () => {
    const err = caught(() => validateMetadata("a", { width: 0 }));
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toMatchObject({ code: "invalid-asset-metadata", path: "metadata.width", actual: 0 });
  });
});

describe("assertCategory", () => {
  const def: AssetDefinition = { category: "image", source: "x" };
  it("passes when the category is allowed", () => {
    expect(() => assertCategory("a", def, ["image", "svg"])).not.toThrow();
  });
  it("throws on a category mismatch", () => {
    expect(() => assertCategory("a", def, ["audio"])).toThrow(/is a "image" asset but was requested as "audio"/);
  });
  it("classifies a mismatch as a DomainError `asset-category` (expected + actual)", () => {
    const err = caught(() => assertCategory("a", def, ["audio"]));
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toMatchObject({ code: "asset-category", expected: ["audio"], actual: "image" });
  });
});

describe("resolveAsset", () => {
  it("resolves via the first supporting resolver", () => {
    const def: AssetDefinition = { category: "video", source: "x", metadata: { width: 10, height: 10 } };
    expect(resolveAsset("a", def, [okResolver])).toEqual({
      kind: "file",
      category: "video",
      src: "RESOLVED",
      metadata: { width: 10, height: 10 },
    });
  });
  it("throws when no resolver supports the source", () => {
    expect(() => resolveAsset("a", { category: "image", source: "x" }, [noResolver])).toThrow(/no resolver supports/);
  });
  it("classifies a missing resolver as a DomainError `unresolvable-source`", () => {
    const err = caught(() => resolveAsset("a", { category: "image", source: "x" }, [noResolver]));
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toMatchObject({ code: "unresolvable-source" });
  });
  it("throws on invalid metadata before resolving", () => {
    expect(() => resolveAsset("a", { category: "image", source: "x", metadata: { width: -5 } }, [okResolver])).toThrow(/width/);
  });
});
