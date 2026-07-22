import { isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { createRegistry } from "../../registry";
import { AssetRegistryProvider, assetRegistry, createAssetDefinition, createAssetKit } from "../../assets";
import { BrandProvider, createBrandDefinition, resolveBrand } from "../../brand";
import { transitionRegistry } from "../../transitions";
import { demoConfig } from "../../demo/DemoConfig";
import { buildComposition } from "../CompositionBuilder";
import { sceneRegistry } from "../SceneRegistry";
import type { CompositionSchemaBase } from "../CompositionSchema";

const brands = createRegistry({
  acme: createBrandDefinition({ name: "Acme", mode: "dark", transition: { type: "dissolve", duration: 0.5 } }),
});

// A kit-bearing brand: its asset registry should be installed inside BrandProvider.
const kittedBrand = createBrandDefinition({
  name: "Kitted",
  assets: createAssetKit({ mark: createAssetDefinition({ category: "svg", source: "https://cdn/m.svg" }) }),
  logos: { primary: "mark" },
});

const find = (node: unknown, type: unknown, acc: ReactElement[] = []): ReactElement[] => {
  if (Array.isArray(node)) return node.reduce((a, n) => find(n, type, a), acc);
  if (!isValidElement(node)) return acc;
  if (node.type === type) acc.push(node);
  return find((node.props as { children?: unknown }).children, type, acc);
};

const cfg = (partial: Partial<CompositionSchemaBase> & Pick<CompositionSchemaBase, "scenes">): CompositionSchemaBase => ({
  id: "B",
  width: 1920,
  height: 1080,
  fps: 30,
  ...partial,
});

const build = (config: CompositionSchemaBase) => buildComposition(config, sceneRegistry, transitionRegistry, assetRegistry, brands);

describe("brand integration", () => {
  it("selects a brand by name and merges its default transition", () => {
    // Two 1s scenes; brand default = dissolve 0.5s (15f overlap) → 60 − 15 = 45.
    const built = build(cfg({ brand: "acme", scenes: [{ scene: "hero", duration: 1 }, { scene: "outro", duration: 1 }] }));
    expect(built.durationInFrames).toBe(45);
    expect(find(built.component({}), BrandProvider)).toHaveLength(1);
  });

  it("lets a composition-level transition override the brand default", () => {
    const built = build(
      cfg({ brand: "acme", transitions: { type: "none" }, scenes: [{ scene: "hero", duration: 1 }, { scene: "outro", duration: 1 }] }),
    );
    expect(built.durationInFrames).toBe(60); // cut → no overlap
  });

  it("lets a scene-level transition win over both the composition and brand defaults", () => {
    // Precedence: scene > composition > brand > framework default.
    // Brand=dissolve(15f), composition=fade(15f); the middle scene forces `none` (0f) at its
    // incoming boundary, the last scene inherits the composition's fade (15f).
    const built = build(
      cfg({
        brand: "acme", // dissolve 0.5s
        transitions: { type: "fade", duration: 0.5 },
        scenes: [
          { scene: "hero", duration: 1 },
          { scene: "centered", duration: 1, transition: { type: "none" } }, // scene overrides → cut
          { scene: "outro", duration: 1 },
        ],
      }),
    );
    // 90 − 0 (scene "none") − 15 (composition fade) = 75. Scene "none" beat fade AND dissolve.
    expect(built.durationInFrames).toBe(75);
  });

  it("installs the brand's asset registry inside BrandProvider only when the brand supplies a kit", () => {
    // Render BrandProvider itself (the builder wraps it as an element; here we resolve its tree).
    const kittedTree = BrandProvider({ brand: resolveBrand(kittedBrand), children: null });
    const plainTree = BrandProvider({ brand: resolveBrand(brands.require("acme")), children: null });
    expect(find(kittedTree, AssetRegistryProvider)).toHaveLength(1); // brand kit installed
    expect(find(plainTree, AssetRegistryProvider)).toHaveLength(0); // no kit → no extra provider
  });

  it("throws for an unknown brand name", () => {
    expect(() => build(cfg({ brand: "nope", scenes: [{ scene: "hero", duration: 1 }] }))).toThrow(/not registered|no entry/);
  });

  it("leaves the existing demo unchanged (330 frames, no brand)", () => {
    const built = buildComposition(demoConfig);
    expect(built.durationInFrames).toBe(330);
    expect(isValidElement(built.component({}))).toBe(true);
  });
});
