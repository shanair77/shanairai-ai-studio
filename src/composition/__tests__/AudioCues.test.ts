import { isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { Audio, Sequence } from "remotion";
import { createRegistry } from "../../registry";
import { defineAsset } from "../../assets";
import { buildComposition } from "../CompositionBuilder";
import { sceneRegistry } from "../SceneRegistry";
import { transitionRegistry } from "../../transitions";
import type { AudioCue, CompositionSchemaBase } from "../CompositionSchema";

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
const assets = createRegistry({
  bed: defineAsset({ category: "audio", source: "https://cdn/bed.mp3" }),
  vo: defineAsset({ category: "audio", source: "https://cdn/vo.mp3" }),
  ocean: defineAsset({ category: "audio", source: "https://cdn/ocean.mp3" }),
  pic: defineAsset({ category: "image", source: "https://cdn/p.png" }),
});

/** 10s at 30fps = 300 frames. */
const base = (audio?: AudioCue[], music?: CompositionSchemaBase["music"]): CompositionSchemaBase => ({
  id: "A",
  width: 1080,
  height: 1920,
  fps: 30,
  audio,
  music,
  scenes: [{ scene: "hero", duration: 10 }],
});

const build = (audio?: AudioCue[], music?: CompositionSchemaBase["music"]) =>
  buildComposition(base(audio, music), sceneRegistry, transitionRegistry, assets);

describe("audio cues", () => {
  it("positions each cue in its own Sequence at the right frame", () => {
    const built = build([{ asset: "vo", role: "voiceover", startAt: 2, duration: 3 }]);
    const seqs = findAll(built.component({}), Sequence).filter(
      (s) => (s.props as { from?: number }).from === 60,
    );
    expect(seqs).toHaveLength(1);
    expect((seqs[0].props as { durationInFrames: number }).durationInFrames).toBe(90);
  });

  it("runs an open-ended cue to the end of the composition", () => {
    const built = build([{ asset: "ocean", role: "ambience", startAt: 4, loop: true }]);
    const seq = findAll(built.component({}), Sequence).find((s) => (s.props as { from?: number }).from === 120);
    expect((seq?.props as { durationInFrames: number }).durationInFrames).toBe(300 - 120);
  });

  it("clamps a cue that would overrun the composition rather than dropping it", () => {
    const built = build([{ asset: "vo", startAt: 9, duration: 30 }]);
    const seq = findAll(built.component({}), Sequence).find((s) => (s.props as { from?: number }).from === 270);
    expect((seq?.props as { durationInFrames: number }).durationInFrames).toBe(30);
  });

  it("supports a J-cut: a cue may start before the scene it belongs to", () => {
    // Two scenes; the ocean cue starts 0.5s BEFORE the second one begins.
    const built = buildComposition(
      {
        id: "J",
        fps: 30,
        scenes: [{ scene: "hero", duration: 5 }, { scene: "hero", duration: 5 }],
        audio: [{ asset: "ocean", role: "ambience", startAt: 4.5 }],
      },
      sceneRegistry,
      transitionRegistry,
      assets,
    );
    const seq = findAll(built.component({}), Sequence).find((s) => (s.props as { from?: number }).from === 135);
    expect(seq).toBeDefined();
  });

  it("renders music and every cue as distinct <Audio> layers", () => {
    const built = build(
      [
        { asset: "vo", role: "voiceover", startAt: 1, duration: 2 },
        { asset: "ocean", role: "ambience", startAt: 0, duration: 4 },
      ],
      { asset: "bed" },
    );
    expect(findAll(built.component({}), Audio)).toHaveLength(3);
  });

  it("rejects a cue whose asset is not audio", () => {
    expect(() => build([{ asset: "pic" }])).toThrow(/audio/);
  });

  it("rejects a cue with a missing asset name", () => {
    expect(() => build([{ asset: "" }])).toThrow(/asset/);
  });

  it("rejects a negative startAt", () => {
    expect(() => build([{ asset: "vo", startAt: -1 }])).toThrow(/startAt/);
  });

  it("leaves compositions without cues completely unchanged", () => {
    const built = build();
    expect(findAll(built.component({}), Audio)).toHaveLength(0);
    expect(isValidElement(built.component({}))).toBe(true);
  });
});

describe("music ducking driven by cue roles", () => {
  const volumeOf = (audio: ReactElement) => (audio.props as { volume: number | ((f: number) => number) }).volume;

  it("ducks the bed across a voiceover cue and lifts it afterwards", () => {
    const built = build(
      [{ asset: "vo", role: "voiceover", startAt: 3, duration: 3 }],
      { asset: "bed", volume: 0.6, ducking: { level: 0.2, ramp: 0.2 } },
    );
    const music = findAll(built.component({}), Audio)[0];
    const v = volumeOf(music) as (f: number) => number;
    expect(typeof v).toBe("function");
    expect(v(0)).toBeCloseTo(0.6); // before
    expect(v(135)).toBeCloseTo(0.2); // mid-line (frame 90-180)
    expect(v(290)).toBeCloseTo(0.6); // after
  });

  it("ignores cues whose role is not in the duck set", () => {
    const built = build(
      [{ asset: "ocean", role: "ambience", startAt: 3, duration: 3 }],
      { asset: "bed", volume: 0.6, ducking: { level: 0.2 } },
    );
    const v = volumeOf(findAll(built.component({}), Audio)[0]);
    expect(v).toBe(0.6); // constant — nothing to duck under
  });

  it("honours a custom `under` role set", () => {
    const built = build(
      [{ asset: "ocean", role: "ambience", startAt: 3, duration: 3 }],
      { asset: "bed", volume: 0.6, ducking: { level: 0.2, ramp: 0.2, under: ["ambience"] } },
    );
    const v = volumeOf(findAll(built.component({}), Audio)[0]) as (f: number) => number;
    expect(v(135)).toBeCloseTo(0.2);
  });

  it("does not duck at all when ducking is not configured", () => {
    const built = build([{ asset: "vo", role: "voiceover", startAt: 3, duration: 3 }], { asset: "bed", volume: 0.6 });
    expect(volumeOf(findAll(built.component({}), Audio)[0])).toBe(0.6);
  });
});
