import { describe, expect, it } from "vitest";
import { theme } from "../../config/Theme";
import { createRegistry } from "../../registry";
import { createSceneDefinition, sceneRegistry, type SceneComponent } from "../SceneRegistry";

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
  describe("built-ins (single definition site)", () => {
    it("registers all ten built-in scenes by name", () => {
      for (const name of BUILTINS) {
        expect(sceneRegistry.has(name)).toBe(true);
      }
      expect(sceneRegistry.keys()).toEqual(expect.arrayContaining(BUILTINS));
    });

    it("resolves a built-in to a component with the default scene duration", () => {
      const def = sceneRegistry.require("hero");
      expect(typeof def.component).toBe("function");
      expect(def.defaultDuration).toBe(theme.timing.scene.base);
    });
  });

  describe("createSceneDefinition", () => {
    it("binds a component and defaults the duration to the theme's base scene length", () => {
      const def = createSceneDefinition({ component: noopScene });
      expect(def.component).toBe(noopScene);
      expect(def.defaultDuration).toBe(theme.timing.scene.base);
    });

    it("honours an explicit default duration", () => {
      expect(createSceneDefinition({ component: noopScene, defaultDuration: 7 }).defaultDuration).toBe(7);
    });
  });

  describe("extend (immutable, typed)", () => {
    it("returns a new registry with the added scene, leaving the base untouched", () => {
      const extended = sceneRegistry.extend({
        "test-custom": createSceneDefinition({ component: noopScene, defaultDuration: 4 }),
      });
      expect(extended.has("test-custom")).toBe(true);
      expect(extended.require("test-custom").defaultDuration).toBe(4);
      expect(extended.has("hero")).toBe(true); // built-ins carried over
      expect(sceneRegistry.has("test-custom")).toBe(false); // base is not mutated
    });

    it("overrides an existing name in the extended registry", () => {
      const extended = sceneRegistry.extend({
        hero: createSceneDefinition({ component: noopScene, defaultDuration: 9 }),
      });
      expect(extended.require("hero").defaultDuration).toBe(9);
    });
  });

  describe("createRegistry (generic kernel)", () => {
    it("builds an isolated registry and enumerates its keys", () => {
      const r = createRegistry({ a: createSceneDefinition({ component: noopScene, defaultDuration: 1 }) });
      expect(r.keys()).toEqual(["a"]);
      expect(r.get("a").defaultDuration).toBe(1);
    });
  });

  describe("expected failure", () => {
    it("throws for an unregistered name, listing what is registered", () => {
      expect(() => sceneRegistry.require("does-not-exist")).toThrow(/no entry registered as "does-not-exist"/);
      expect(() => sceneRegistry.require("does-not-exist")).toThrow(/hero/); // enumerates registered names
    });
  });
});
