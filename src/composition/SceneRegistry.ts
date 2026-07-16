/**
 * SceneRegistry — a name → scene lookup the builder assembles from.
 *
 * Scenes register themselves here by a stable string name; the builder never imports scene
 * components directly, it resolves them from this registry. That keeps the composition
 * description ("scene": "hero") decoupled from the component, and lets any custom scene
 * join the engine with a single `registerScene(...)` call.
 *
 * The ten built-in scene primitives are registered on import. Their prop shapes differ, so
 * the registry stores them behind a generic component type — the config supplies props.
 */

import { type ComponentType } from "react";
import { theme } from "../config/Theme";
import {
  CenteredScene,
  CTASection,
  ComparisonScene,
  FeatureScene,
  GalleryScene,
  HeroScene,
  LogoRevealScene,
  OutroScene,
  QuoteScene,
  SplitScene,
} from "../scenes";

/** A scene rendered from config-supplied props. */
export type SceneComponent = ComponentType<Record<string, unknown>>;

export type SceneDefinition = {
  /** Stable name referenced by `SceneConfig.scene`. */
  name: string;
  component: SceneComponent;
  /** Default length in seconds when a scene config declares none. */
  defaultDuration: number;
};

/** Minimal contract the Timeline/builder depend on (eases testing with a fake registry). */
export type SceneResolver = {
  require(name: string): SceneDefinition;
  has(name: string): boolean;
  list(): string[];
};

class Registry implements SceneResolver {
  private readonly scenes = new Map<string, SceneDefinition>();

  register(def: SceneDefinition): void {
    this.scenes.set(def.name, def);
  }

  get(name: string): SceneDefinition | undefined {
    return this.scenes.get(name);
  }

  has(name: string): boolean {
    return this.scenes.has(name);
  }

  require(name: string): SceneDefinition {
    const def = this.scenes.get(name);
    if (!def) {
      throw new Error(
        `SceneRegistry: no scene registered as "${name}". Registered: ${this.list().join(", ") || "(none)"}.`,
      );
    }
    return def;
  }

  list(): string[] {
    return [...this.scenes.keys()];
  }
}

/** The shared singleton registry. */
export const sceneRegistry = new Registry();

/** Register a scene by name (use for custom scenes). */
export const registerScene = (def: SceneDefinition): void => sceneRegistry.register(def);

// Scene components have distinct prop types; the registry holds them generically.
const asScene = (component: ComponentType<never>): SceneComponent => component as unknown as SceneComponent;

// --- Built-in scenes register themselves by name on import. ---
const DEFAULT_SCENE_DURATION = theme.timing.scene.base;

(
  [
    ["hero", HeroScene],
    ["centered", CenteredScene],
    ["split", SplitScene],
    ["feature", FeatureScene],
    ["gallery", GalleryScene],
    ["comparison", ComparisonScene],
    ["quote", QuoteScene],
    ["cta", CTASection],
    ["logo-reveal", LogoRevealScene],
    ["outro", OutroScene],
  ] as const
).forEach(([name, component]) =>
  registerScene({ name, component: asScene(component as ComponentType<never>), defaultDuration: DEFAULT_SCENE_DURATION }),
);
