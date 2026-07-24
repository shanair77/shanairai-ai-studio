import { describe, expect, expectTypeOf, it } from "vitest";
import { DomainError } from "../../errors";
import { defineAsset } from "../definition";
import { defineAssetKit } from "../AssetKit";

// Remote sources avoid staticFile so runtime resolution needs no render context.
const kit = defineAssetKit({
  heroBg: defineAsset({ category: "image", source: "https://cdn/hero.jpg" }),
  badge: defineAsset({ category: "svg", source: "https://cdn/badge.svg" }),
  bed: defineAsset({ category: "audio", source: "https://cdn/bed.mp3" }),
  clip: defineAsset({ category: "video", source: "https://cdn/clip.mp4" }),
});

describe("defineAssetKit — type inference (category-filtered names)", () => {
  it("constrains component names by category", () => {
    // Image accepts image | svg names.
    expectTypeOf<Parameters<typeof kit.Image>[0]["name"]>().toEqualTypeOf<"heroBg" | "badge">();
    // Audio accepts audio names.
    expectTypeOf<Parameters<typeof kit.Audio>[0]["name"]>().toEqualTypeOf<"bed">();
    // Video accepts video names.
    expectTypeOf<Parameters<typeof kit.Video>[0]["name"]>().toEqualTypeOf<"clip">();

    const okImage: Parameters<typeof kit.Image>[0] = { name: "heroBg" };
    const okAudio: Parameters<typeof kit.Audio>[0] = { name: "bed" };
    // @ts-expect-error "bed" is an audio asset, not image/svg
    const badImage: Parameters<typeof kit.Image>[0] = { name: "bed" };
    // @ts-expect-error "nope" is not a registered asset
    const unknownImage: Parameters<typeof kit.Image>[0] = { name: "nope" };
    void okImage;
    void okAudio;
    void badImage;
    void unknownImage;
  });
});

describe("defineAssetKit — runtime", () => {
  it("resolves a registered (remote) asset", () => {
    expect(kit.resolve("heroBg")).toEqual({
      kind: "file",
      category: "image",
      src: "https://cdn/hero.jpg",
      metadata: undefined,
    });
  });

  it("throws for a missing asset name", () => {
    const resolveDynamic = kit.resolve as (name: string) => unknown;
    expect(() => resolveDynamic("missing")).toThrow(/Asset "missing" is not registered/);
  });

  it("classifies a missing asset name as a DomainError `unknown-asset` (actual)", () => {
    const resolveDynamic = kit.resolve as (name: string) => unknown;
    let err: unknown;
    try {
      resolveDynamic("missing");
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toMatchObject({ code: "unknown-asset", actual: "missing" });
  });

  it("extends the registry immutably", () => {
    const extended = kit.registry.extend({
      extra: defineAsset({ category: "image", source: "https://cdn/extra.png" }),
    });
    expect(extended.has("extra")).toBe(true);
    expect(extended.has("heroBg")).toBe(true); // built-ins carried over
    expect(kit.registry.has("extra")).toBe(false); // original untouched
  });
});
