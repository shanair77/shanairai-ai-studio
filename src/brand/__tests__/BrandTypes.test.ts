import { describe, expect, expectTypeOf, it } from "vitest";
import { defineAsset, defineAssetKit } from "../../assets";
import { createRegistry } from "../../registry";
import { defineBrand } from "../definition";

const kit = defineAssetKit({
  logo: defineAsset({ category: "svg", source: "https://cdn/l.svg" }),
  photo: defineAsset({ category: "image", source: "https://cdn/p.png" }),
  bed: defineAsset({ category: "audio", source: "https://cdn/b.mp3" }),
});

describe("defineBrand — type inference (category-safe brand asset names)", () => {
  it("constrains logo names to image|svg and audio to audio", () => {
    const brand = defineBrand({
      name: "Acme",
      assets: kit,
      logos: { primary: "logo", alternate: "photo", watermark: "logo" },
      audio: { music: "bed" },
    });
    expectTypeOf<NonNullable<typeof brand.logos>["primary"]>().toEqualTypeOf<"logo" | "photo" | undefined>();
    expectTypeOf<NonNullable<typeof brand.audio>["music"]>().toEqualTypeOf<"bed" | undefined>();
    void brand;

    // @ts-expect-error "bed" is an audio asset, not a logo (image|svg)
    defineBrand({ name: "B", assets: kit, logos: { primary: "bed" } });
    // @ts-expect-error music must be an audio asset
    defineBrand({ name: "C", assets: kit, audio: { music: "logo" } });
    // @ts-expect-error "nope" is not a registered asset
    defineBrand({ name: "D", assets: kit, logos: { primary: "nope" } });
  });

  it("registers and extends brand packs immutably", () => {
    const acme = defineBrand({ name: "Acme", assets: kit, logos: { primary: "logo" } });
    const brands = createRegistry({ acme });
    const extended = brands.extend({ beta: defineBrand({ name: "Beta" }) });
    expect(extended.has("beta")).toBe(true);
    expect(extended.has("acme")).toBe(true);
    expect(brands.has("beta")).toBe(false);
  });
});
