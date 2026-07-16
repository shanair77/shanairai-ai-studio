import { describe, expect, it } from "vitest";
import { theme } from "../../config/Theme";
import { registerScene, sceneRegistry, type SceneComponent } from "../SceneRegistry";

const BUILTINS = [
  "hero",
  "centered",
  "split",
  "feature",
  "gallery",
  "comparison",
  "quote",
  "cta",
  "logo-reveal",
  "outro",
];

// A throwaway component for registration tests.
const noopScene: SceneComponent = () => null;

describe("SceneRegistry", () => {
  describe("built-ins (self-registered on import)", () => {
    it("registers all ten built-in scenes by name", () => {
      for (const name of BUILTINS) {
        expect(sceneRegistry.has(name)).toBe(true);
      }
      expect(sceneRegistry.list()).toEqual(expect.arrayContaining(BUILTINS));
    });

    it("resolves a built-in to a component with the default scene duration", () => {
      const def = sceneRegistry.require("hero");
      expect(typeof def.component).toBe("function");
      expect(def.defaultDuration).toBe(theme.timing.scene.base);
    });
  });

  describe("register / require", () => {
    it("registers a custom scene and resolves it", () => {
      registerScene({ name: "test-custom-a", component: noopScene, defaultDuration: 4 });
      expect(sceneRegistry.has("test-custom-a")).toBe(true);
      expect(sceneRegistry.require("test-custom-a")).toMatchObject({ name: "test-custom-a", defaultDuration: 4 });
    });

    it("overwrites an existing registration with the same name", () => {
      registerScene({ name: "test-custom-b", component: noopScene, defaultDuration: 2 });
      registerScene({ name: "test-custom-b", component: noopScene, defaultDuration: 9 });
      expect(sceneRegistry.require("test-custom-b").defaultDuration).toBe(9);
    });
  });

  describe("expected failure", () => {
    it("throws for an unregistered name, listing what is registered", () => {
      expect(() => sceneRegistry.require("does-not-exist")).toThrow(/no scene registered as "does-not-exist"/);
      expect(() => sceneRegistry.require("does-not-exist")).toThrow(/hero/); // enumerates registered names
    });
  });
});
