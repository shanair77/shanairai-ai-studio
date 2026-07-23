import { describe, expect, it } from "vitest";
import { theme } from "../../config/Theme";
import { secondsToFrames } from "../../config/Timing";
import type { CompositionSchemaBase } from "../CompositionSchema";
import type { SceneComponent, SceneResolver } from "../SceneRegistry";
import type { TransitionCapabilities, TransitionDefinition, TransitionResolver } from "../../transitions";
import { resolveTimeline } from "../Timeline";

const noopScene: SceneComponent = () => null;

// Opacity is a property of the scene definition: the "transparent" scene declares itself
// non-opaque; every other scene inherits the default (opaque).
const fakeScenes = (defaultDuration = 5): SceneResolver => ({
  require: (name: string) => {
    if (name === "missing") throw new Error(`fake: no scene "${name}"`);
    return { component: noopScene, defaultDuration, ...(name === "transparent" ? { opaque: false } : {}) };
  },
  has: (name: string) => name !== "missing",
  keys: () => [],
});

const makeTransition = (capabilities: TransitionCapabilities): TransitionDefinition<void> => ({
  presentation: () => ({ component: () => null, props: {} }),
  capabilities,
});

const CUT = makeTransition({ affectsEntering: false, affectsExiting: false, requiresOpaqueIncoming: false, supportsTransparency: true });
const FADE = makeTransition({ affectsEntering: true, affectsExiting: false, requiresOpaqueIncoming: true, supportsTransparency: false });
const DISSOLVE = makeTransition({ affectsEntering: true, affectsExiting: true, requiresOpaqueIncoming: false, supportsTransparency: true });

const fakeTransitions: TransitionResolver = {
  require: (type: string) => {
    if (type === "none") return CUT;
    if (type === "fade") return FADE;
    if (type === "dissolve") return DISSOLVE;
    throw new Error(`fake: no transition "${type}"`);
  },
  has: () => true,
  keys: () => ["none", "fade", "dissolve"],
};

const cfg = (
  partial: Partial<CompositionSchemaBase> & Pick<CompositionSchemaBase, "scenes">,
): CompositionSchemaBase => ({ id: "test", ...partial });

const run = (partial: Partial<CompositionSchemaBase> & Pick<CompositionSchemaBase, "scenes">, fps = 30) =>
  resolveTimeline(cfg(partial), fps, fakeScenes(), fakeTransitions);

describe("resolveTimeline", () => {
  describe("scenes & durations", () => {
    it("resolves a single scene with a leading cut boundary", () => {
      const t = run({ scenes: [{ scene: "a", duration: 3 }] });
      expect(t.scenes).toHaveLength(1);
      expect(t.scenes[0]).toMatchObject({ name: "a", durationInFrames: 90, opaque: true });
      expect(t.boundaries[0]).toMatchObject({ frames: 0 });
      expect(t.durationInFrames).toBe(90);
    });

    it("threads fps into frame conversion", () => {
      expect(run({ scenes: [{ scene: "a", duration: 3 }] }, 60).scenes[0].durationInFrames).toBe(180);
    });

    it("resolves duration precedence: duration > timing default > registry default", () => {
      expect(run({ scenes: [{ scene: "a", duration: 3 }] }).scenes[0].durationInFrames).toBe(90);
      expect(run({ timing: { defaultSceneDuration: 2 }, scenes: [{ scene: "a" }] }).scenes[0].durationInFrames).toBe(60);
      expect(run({ scenes: [{ scene: "a" }] }).scenes[0].durationInFrames).toBe(150); // registry default 5s
    });

    it("defaults props to {} and carries the label", () => {
      const t = run({ scenes: [{ scene: "a", duration: 1, label: "Intro" }] });
      expect(t.scenes[0].props).toEqual({});
      expect(t.scenes[0].label).toBe("Intro");
    });
  });

  describe("boundaries, overlap & total", () => {
    it("computes fade overlap and total = sum(scene) - sum(overlap)", () => {
      const t = run({
        transitions: { type: "fade", duration: 0.5 },
        scenes: [{ scene: "a", duration: 3 }, { scene: "b", duration: 3 }, { scene: "c", duration: 3 }],
      });
      expect(t.boundaries.map((b) => b.frames)).toEqual([0, 15, 15]);
      expect(t.durationInFrames).toBe(270 - 30); // 240
    });

    it("keeps boundaries the same length as scenes; boundaries[0] is a 0-frame cut", () => {
      const t = run({ transitions: { type: "fade" }, scenes: [{ scene: "a", duration: 2 }, { scene: "b", duration: 2 }] });
      expect(t.boundaries).toHaveLength(2);
      expect(t.boundaries[0].frames).toBe(0);
    });

    it("uses the theme base duration when a fade omits its duration", () => {
      const t = run({ transitions: { type: "fade" }, scenes: [{ scene: "a", duration: 3 }, { scene: "b", duration: 3 }] });
      expect(t.boundaries[1].frames).toBe(secondsToFrames(theme.timing.durations.base, 30)); // 15
    });

    it("clamps the overlap to the shorter neighbouring scene", () => {
      const t = run({
        transitions: { type: "fade", duration: 2 }, // 60 requested
        scenes: [{ scene: "a", duration: 3 }, { scene: "b", duration: 0.5 }], // cur = 15
      });
      expect(t.boundaries[1].frames).toBe(15);
      expect(t.durationInFrames).toBe(90 + 15 - 15); // 90
    });

    it("treats 'none' as a 0-frame cut regardless of duration", () => {
      const t = run({
        transitions: { type: "none", duration: 1 },
        scenes: [{ scene: "a", duration: 3 }, { scene: "b", duration: 3 }],
      });
      expect(t.boundaries[1].frames).toBe(0);
      expect(t.durationInFrames).toBe(180);
    });

    it("lets a per-scene transition override the default", () => {
      const t = run({
        transitions: { type: "fade", duration: 0.5 },
        scenes: [
          { scene: "a", duration: 3 },
          { scene: "b", duration: 3, transition: { type: "none" } },
          { scene: "c", duration: 3 },
        ],
      });
      expect(t.boundaries.map((b) => b.frames)).toEqual([0, 0, 15]);
    });
  });

  describe("opacity contract", () => {
    it("resolves effective opacity from the scene definition", () => {
      const t = run({ scenes: [{ scene: "a", duration: 1 }, { scene: "transparent", duration: 1 }] });
      expect(t.scenes[0].opaque).toBe(true);
      expect(t.scenes[1].opaque).toBe(false);
    });

    it("rejects a requiresOpaqueIncoming transition into a non-opaque scene", () => {
      expect(() =>
        run({
          transitions: { type: "fade", duration: 0.5 },
          scenes: [{ scene: "a", duration: 3 }, { scene: "transparent", duration: 3 }],
        }),
      ).toThrow(/requires an opaque incoming scene/);
    });

    it("accepts a transparency-safe transition into a non-opaque scene", () => {
      expect(() =>
        run({
          transitions: { type: "dissolve", duration: 0.5 },
          scenes: [{ scene: "a", duration: 3 }, { scene: "transparent", duration: 3 }],
        }),
      ).not.toThrow();
    });

    it("does not apply the contract to the first scene", () => {
      expect(() =>
        run({ transitions: { type: "fade" }, scenes: [{ scene: "transparent", duration: 3 }] }),
      ).not.toThrow();
    });
  });

  describe("expected failure", () => {
    it("propagates the scene registry error for an unknown scene", () => {
      expect(() => run({ scenes: [{ scene: "missing" }] })).toThrow(/missing/);
    });
  });
});
