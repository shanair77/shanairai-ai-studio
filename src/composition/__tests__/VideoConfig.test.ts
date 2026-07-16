import { describe, expect, it } from "vitest";
import { formats } from "../../config/Layout";
import { DEFAULT_FORMAT, resolveVideoConfig } from "../VideoConfig";

describe("resolveVideoConfig", () => {
  describe("normal", () => {
    it("resolves each named format preset to its dimensions and fps", () => {
      expect(resolveVideoConfig({ format: "vertical" })).toMatchObject({ width: 1080, height: 1920, fps: 30 });
      expect(resolveVideoConfig({ format: "horizontal" })).toMatchObject({ width: 1920, height: 1080, fps: 30 });
      expect(resolveVideoConfig({ format: "square" })).toMatchObject({ width: 1080, height: 1080, fps: 30 });
    });

    it("lets explicit width/height/fps override the preset", () => {
      const v = resolveVideoConfig({ format: "vertical", width: 720, height: 1280, fps: 60 });
      expect(v).toMatchObject({ width: 720, height: 1280, fps: 60 });
    });

    it("converts `duration` (seconds) to frames at the resolved fps", () => {
      expect(resolveVideoConfig({ duration: 5 }).durationInFrames).toBe(150); // 5 * 30
      expect(resolveVideoConfig({ duration: 5, fps: 60 }).durationInFrames).toBe(300); // 5 * 60
    });

    it("lets `durationInFrames` take precedence over `duration`", () => {
      expect(resolveVideoConfig({ duration: 5, durationInFrames: 42 }).durationInFrames).toBe(42);
    });

    it("falls back to the DEFAULT_FORMAT when no input is given", () => {
      const preset = formats[DEFAULT_FORMAT];
      expect(resolveVideoConfig()).toMatchObject({ width: preset.width, height: preset.height, fps: preset.fps });
    });
  });

  describe("edge", () => {
    it("leaves durationInFrames undefined when neither duration is given (Timeline derives it)", () => {
      expect(resolveVideoConfig({ format: "vertical" }).durationInFrames).toBeUndefined();
    });

    it("applies a partial override (width only) and takes height from the preset", () => {
      const v = resolveVideoConfig({ format: "horizontal", width: 3840 });
      expect(v.width).toBe(3840);
      expect(v.height).toBe(1080);
    });

    it("resolves fps before converting seconds, so fps override changes the frame count", () => {
      expect(resolveVideoConfig({ duration: 2, fps: 24 }).durationInFrames).toBe(48);
    });

    it("passes non-standard custom dimensions through unchanged", () => {
      expect(resolveVideoConfig({ width: 999, height: 333 })).toMatchObject({ width: 999, height: 333 });
    });
  });

  describe("documented current behavior (no runtime guard)", () => {
    it("throws on an invalid format string (only reachable by bypassing TS)", () => {
      // formats[bad] is undefined -> preset.width access throws. Documents the gap; no guard today.
      expect(() => resolveVideoConfig({ format: "nope" as never })).toThrow();
    });
  });
});
