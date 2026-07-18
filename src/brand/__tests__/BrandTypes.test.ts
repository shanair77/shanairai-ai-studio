import { describe, expect, expectTypeOf, it } from "vitest";
import { createAssetDefinition, createAssetKit } from "../../assets";
import { createRegistry } from "../../registry";
import { createBrandDefinition } from "../definition";

const kit = createAssetKit({
  logo: createAssetDefinition({ category: "svg", source: "https://cdn/l.svg" }),
  photo: createAssetDefinition({ category: "image", source: "https://cdn/p.png" }),
  bed: createAssetDefinition({ category: "audio", source: "https://cdn/b.mp3" }),
});

describe("createBrandDefinition — type inference (category-safe brand asset names)", () => {
  it("constrains logo names to image|svg and audio to audio", () => {
    const brand = createBrandDefinition({
      name: "Acme",
      assets: kit,
      logos: { primary: "logo", alternate: "photo", watermark: "logo" },
      audio: { music: "bed" },
    });
    expectTypeOf<NonNullable<typeof brand.logos>["primary"]>().toEqualTypeOf<"logo" | "photo" | undefined>();
    expectTypeOf<NonNullable<typeof brand.audio>["music"]>().toEqualTypeOf<"bed" | undefined>();
    void brand;

    // @ts-expect-error "bed" is an audio asset, not a logo (image|svg)
    createBrandDefinition({ name: "B", assets: kit, logos: { primary: "bed" } });
    // @ts-expect-error music must be an audio asset
    createBrandDefinition({ name: "C", assets: kit, audio: { music: "logo" } });
    // @ts-expect-error "nope" is not a registered asset
    createBrandDefinition({ name: "D", assets: kit, logos: { primary: "nope" } });
  });

  it("registers and extends brand packs immutably", () => {
    const acme = createBrandDefinition({ name: "Acme", assets: kit, logos: { primary: "logo" } });
    const brands = createRegistry({ acme });
    const extended = brands.extend({ beta: createBrandDefinition({ name: "Beta" }) });
    expect(extended.has("beta")).toBe(true);
    expect(extended.has("acme")).toBe(true);
    expect(brands.has("beta")).toBe(false);
  });
});
