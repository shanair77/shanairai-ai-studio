/**
 * SceneRegistry — the typed name → scene lookup the builder assembles from.
 *
 * Each scene is bound once with `createSceneDefinition<Props>()`, capturing its component,
 * default duration, AND prop type. The `builtinScenes` map is the single source of truth
 * (no separate registration array), and both the runtime registry and the config types are
 * derived from it — so a misspelled scene name or prop is now a compile error, not a silent
 * drop. Built on the generic registry kernel (`../registry`); custom scenes join type-safely
 * via `sceneRegistry.extend({...})`.
 */

import { type ComponentType } from "react";
import { theme } from "../config/Theme";
import { createRegistry, type Registry } from "../registry";
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
  type CenteredSceneProps,
  type CTASectionProps,
  type ComparisonSceneProps,
  type FeatureSceneProps,
  type GallerySceneProps,
  type HeroSceneProps,
  type LogoRevealSceneProps,
  type OutroSceneProps,
  type QuoteSceneProps,
  type SplitSceneProps,
} from "../scenes";

/**
 * Erased component type for the registry's runtime plumbing. `any` is required here — and
 * ONLY here: a heterogeneous registry must both STORE components of differing prop types and
 * CALL them with config-supplied props, and only `any` is assignable in both directions.
 * Scene authors never touch this; type safety lives at the config-authoring surface.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SceneComponent = ComponentType<any>;

/** A scene bound to its component + duration, carrying its prop type `P` for inference. */
export type SceneDefinition<P> = {
  component: ComponentType<P>;
  /** Default length in seconds when a scene config declares none. */
  defaultDuration: number;
  /**
   * Whether the scene fully covers the frame opaquely (its default surface does). Default
   * `true`. Feeds the transition opacity contract; a scene used transparently (translucent
   * surface / overlay) can override per-instance via `SceneConfig.opaque`.
   */
  opaque?: boolean;
};

/**
 * A map of scene name → definition. The value's prop type is erased to `any` so definitions
 * of differing prop shapes fit one map; each scene's concrete props are recovered by
 * `PropsOf<M[N]>` from the specific `typeof builtinScenes` (never from this constraint).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SceneMap = Record<string, SceneDefinition<any>>;

/** Extract a scene definition's prop type. */
export type PropsOf<D> = D extends SceneDefinition<infer P> ? P : never;

/** Minimal erased contract the Timeline/builder depend on (satisfied by any scene Registry). */
export type SceneResolver = {
  require(name: string): { component: SceneComponent; defaultDuration: number; opaque?: boolean };
  has(name: string): boolean;
  keys(): string[];
};

const DEFAULT_SCENE_DURATION = theme.timing.scene.base;

/** Bind a scene component (+ optional default duration / opacity) into a typed definition. */
export const createSceneDefinition = <P>(spec: {
  component: ComponentType<P>;
  defaultDuration?: number;
  opaque?: boolean;
}): SceneDefinition<P> => ({
  component: spec.component,
  defaultDuration: spec.defaultDuration ?? DEFAULT_SCENE_DURATION,
  ...(spec.opaque !== undefined ? { opaque: spec.opaque } : {}),
});

/** The built-in scenes — the single definition site (replaces the old registration array). */
export const builtinScenes = {
  hero: createSceneDefinition<HeroSceneProps>({ component: HeroScene }),
  centered: createSceneDefinition<CenteredSceneProps>({ component: CenteredScene }),
  split: createSceneDefinition<SplitSceneProps>({ component: SplitScene }),
  feature: createSceneDefinition<FeatureSceneProps>({ component: FeatureScene }),
  gallery: createSceneDefinition<GallerySceneProps>({ component: GalleryScene }),
  comparison: createSceneDefinition<ComparisonSceneProps>({ component: ComparisonScene }),
  quote: createSceneDefinition<QuoteSceneProps>({ component: QuoteScene }),
  cta: createSceneDefinition<CTASectionProps>({ component: CTASection }),
  "logo-reveal": createSceneDefinition<LogoRevealSceneProps>({ component: LogoRevealScene }),
  outro: createSceneDefinition<OutroSceneProps>({ component: OutroScene }),
} satisfies SceneMap;

export type BuiltinSceneMap = typeof builtinScenes;

/** The strongly-typed union of built-in scene names. */
export type SceneName = keyof BuiltinSceneMap & string;

/** The default scene registry (built-ins). Extend it for custom scenes. */
export const sceneRegistry: Registry<BuiltinSceneMap> = createRegistry(builtinScenes);
