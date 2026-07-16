import { describe, expect, it } from "vitest";
import { theme } from "../../config/Theme";
import { secondsToFrames } from "../../config/Timing";
import type { CompositionSchemaBase } from "../CompositionSchema";
import type { SceneComponent, SceneResolver } from "../SceneRegistry";
import { buildTimeline } from "../Timeline";

const noopScene: SceneComponent = () => null;

/** A fake registry so Timeline is tested in isolation from the real scene components. */
const fakeRegistry = (defaultDuration = 5): SceneResolver => ({
  require: (name: string) => {
    if (name === "missing") throw new Error(`fake: no scene "${name}"`);
    return { component: noopScene, defaultDuration };
  },
  has: (name: string) => name !== "missing",
  keys: () => [],
});

const cfg = (
  partial: Partial<CompositionSchemaBase> & Pick<CompositionSchemaBase, "scenes">,
): CompositionSchemaBase => ({
  id: "test",
  ...partial,
});

describe("buildTimeline", () => {
  describe("normal", () => {
    it("places a single scene at frame 0 with no transition", () => {
      const t = buildTimeline(cfg({ scenes: [{ scene: "a", duration: 3 }] }), 30, fakeRegistry());
      expect(t.entries).toHaveLength(1);
      expect(t.entries[0]).toMatchObject({ name: "a", from: 0, durationInFrames: 90, key: "a-0" });
      expect(t.entries[0].transitionIn).toEqual({ type: "none", frames: 0 });
      expect(t.durationInFrames).toBe(90);
    });

    it("sequences multiple scenes contiguously when there is no transition", () => {
      const t = buildTimeline(
        cfg({ scenes: [{ scene: "a", duration: 3 }, { scene: "b", duration: 3 }, { scene: "c", duration: 3 }] }),
        30,
        fakeRegistry(),
      );
      expect(t.entries.map((e) => e.from)).toEqual([0, 90, 180]);
      expect(t.durationInFrames).toBe(270);
    });

    it("overlaps scenes by the fade duration (crossfade)", () => {
      const t = buildTimeline(
        cfg({
          transitions: { type: "fade", duration: 0.5 },
          scenes: [{ scene: "a", duration: 3 }, { scene: "b", duration: 3 }, { scene: "c", duration: 3 }],
        }),
        30,
        fakeRegistry(),
      );
      // 0.5s @30 = 15 frame overlap → 0, 90-15=75, 75+90-15=150
      expect(t.entries.map((e) => e.from)).toEqual([0, 75, 150]);
      expect(t.entries.map((e) => e.transitionIn)).toEqual([
        { type: "none", frames: 0 },
        { type: "fade", frames: 15 },
        { type: "fade", frames: 15 },
      ]);
      expect(t.durationInFrames).toBe(240);
    });

    it("threads fps into the frame conversion", () => {
      const t = buildTimeline(cfg({ scenes: [{ scene: "a", duration: 3 }] }), 60, fakeRegistry());
      expect(t.entries[0].durationInFrames).toBe(180);
    });
  });

  describe("edge", () => {
    it("clamps a transition overlap to the shorter neighbouring scene", () => {
      const t = buildTimeline(
        cfg({
          transitions: { type: "fade", duration: 2 }, // 60 frames requested
          scenes: [{ scene: "a", duration: 3 }, { scene: "b", duration: 0.5 }], // cur = 15 frames
        }),
        30,
        fakeRegistry(),
      );
      expect(t.entries[1].transitionIn.frames).toBe(15); // min(60, prev 90, cur 15)
      expect(t.entries[1].from).toBe(75); // 90 - 15
      expect(t.durationInFrames).toBe(90);
    });

    it("never applies a transition to the first scene even under a default fade", () => {
      const t = buildTimeline(
        cfg({ transitions: { type: "fade", duration: 0.5 }, scenes: [{ scene: "a", duration: 3 }] }),
        30,
        fakeRegistry(),
      );
      expect(t.entries[0].transitionIn).toEqual({ type: "none", frames: 0 });
    });

    it("lets a per-scene transition override the composition default", () => {
      const t = buildTimeline(
        cfg({
          transitions: { type: "fade", duration: 0.5 },
          scenes: [
            { scene: "a", duration: 3 },
            { scene: "b", duration: 3, transition: { type: "none" } }, // hard cut
            { scene: "c", duration: 3 },
          ],
        }),
        30,
        fakeRegistry(),
      );
      expect(t.entries[1].transitionIn.frames).toBe(0);
      expect(t.entries.map((e) => e.from)).toEqual([0, 90, 165]); // b contiguous, c fades 15
    });

    it("uses the theme's base duration when a fade omits its duration", () => {
      const t = buildTimeline(
        cfg({ transitions: { type: "fade" }, scenes: [{ scene: "a", duration: 3 }, { scene: "b", duration: 3 }] }),
        30,
        fakeRegistry(),
      );
      expect(t.entries[1].transitionIn.frames).toBe(secondsToFrames(theme.timing.durations.base, 30)); // 15
    });

    it("prefers durationInFrames over duration", () => {
      const t = buildTimeline(cfg({ scenes: [{ scene: "a", duration: 3, durationInFrames: 42 }] }), 30, fakeRegistry());
      expect(t.entries[0].durationInFrames).toBe(42);
    });

    it("falls back to timing.defaultSceneDuration, then the registry default", () => {
      const withTiming = buildTimeline(
        cfg({ timing: { defaultSceneDuration: 2 }, scenes: [{ scene: "a" }] }),
        30,
        fakeRegistry(5),
      );
      expect(withTiming.entries[0].durationInFrames).toBe(60); // 2s

      const withRegistryDefault = buildTimeline(cfg({ scenes: [{ scene: "a" }] }), 30, fakeRegistry(5));
      expect(withRegistryDefault.entries[0].durationInFrames).toBe(150); // 5s
    });

    it("defaults props to an empty object and carries the label through", () => {
      const t = buildTimeline(cfg({ scenes: [{ scene: "a", duration: 1, label: "Intro" }] }), 30, fakeRegistry());
      expect(t.entries[0].props).toEqual({});
      expect(t.entries[0].label).toBe("Intro");
    });

    it("returns an empty, zero-length timeline for no scenes", () => {
      const t = buildTimeline(cfg({ scenes: [] }), 30, fakeRegistry());
      expect(t.entries).toEqual([]);
      expect(t.durationInFrames).toBe(0);
    });
  });

  describe("expected failure", () => {
    it("propagates the registry error for an unregistered scene name", () => {
      expect(() => buildTimeline(cfg({ scenes: [{ scene: "missing" }] }), 30, fakeRegistry())).toThrow(/missing/);
    });
  });
});
