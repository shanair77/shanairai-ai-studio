import { isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { Audio } from "remotion";
import { createRegistry } from "../../registry";
import { AssetRegistryProvider, defineAsset } from "../../assets";
import { demoConfig } from "../../demo/DemoConfig";
import { buildComposition } from "../CompositionBuilder";
import { sceneRegistry } from "../SceneRegistry";
import { transitionRegistry } from "../../transitions";
import type { CompositionSchemaBase } from "../CompositionSchema";

const findAll = (node: unknown, type: unknown, acc: ReactElement[] = []): ReactElement[] => {
  if (Array.isArray(node)) {
    node.forEach((n) => findAll(n, type, acc));
    return acc;
  }
  if (!isValidElement(node)) return acc;
  if (node.type === type) acc.push(node);
  findAll((node.props as { children?: unknown }).children, type, acc);
  return acc;
};

// Remote sources avoid staticFile so no render context is needed.
const audioAssets = createRegistry({ bed: defineAsset({ category: "audio", source: "https://cdn/bed.mp3" }) });

const base = (music: CompositionSchemaBase["music"]): CompositionSchemaBase => ({
  id: "M",
  width: 1920,
  height: 1080,
  fps: 30,
  music,
  scenes: [{ scene: "hero", duration: 1 }],
});

describe("music integration", () => {
  it("resolves a named audio asset to <Audio> and wraps the tree in AssetRegistryProvider", () => {
    const built = buildComposition(base({ asset: "bed", volume: 0.5, fadeIn: 0.5 }), sceneRegistry, transitionRegistry, audioAssets);
    const tree = built.component({});
    expect(findAll(tree, AssetRegistryProvider)).toHaveLength(1);
    const audios = findAll(tree, Audio);
    expect(audios).toHaveLength(1);
    expect((audios[0].props as { src: string }).src).toBe("https://cdn/bed.mp3");
  });

  it("rejects a music asset whose category is not audio", () => {
    const imgAssets = createRegistry({ pic: defineAsset({ category: "image", source: "https://cdn/p.png" }) });
    expect(() => buildComposition(base({ asset: "pic" }), sceneRegistry, transitionRegistry, imgAssets)).toThrow(/audio/);
  });

  it("throws for a missing music asset", () => {
    expect(() => buildComposition(base({ asset: "nope" }), sceneRegistry, transitionRegistry, audioAssets)).toThrow(
      /not registered|no entry/,
    );
  });

  it("leaves the existing demo unchanged (330 frames, no asset registry, no music)", () => {
    const built = buildComposition(demoConfig);
    expect(built.durationInFrames).toBe(330);
    expect(isValidElement(built.component({}))).toBe(true);
    expect(findAll(built.component({}), Audio)).toHaveLength(0);
  });
});
