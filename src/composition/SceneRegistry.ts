/**
 * SceneRegistry — the typed name → scene lookup the builder assembles from.
 *
 * Each scene is bound once with `defineScene<Props>()`, capturing its component,
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
  MediaScene,
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
  type MediaSceneProps,
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
  /**
   * Where this scene's props name assets, as dotted paths into its own props.
   *
   * ## Why this has to be declared
   *
   * A scene's props are the component's own, so an asset reference is a
   * CONVENTION — `media.asset` for the media scene — rather than something the
   * type system marks. Audio and music are different: they are resolved eagerly
   * in `buildComposition` from `AudioCue.asset` and `MusicConfig.asset`, so
   * those references are unambiguous. A scene's are not resolved until the
   * component renders and calls `registry.require`, which is inside React and
   * far too late to plan against.
   *
   * Declaring the paths here closes that gap without guessing. The alternatives
   * were worse: walking props for any key called `asset` would count a prop
   * that merely shares the name, and matching strings against the registry
   * would count a caption that happened to equal an asset key. Both are the
   * kind of wrong that produces a plausible plan.
   *
   * It belongs on the scene rather than on a template because it describes the
   * COMPONENT — one declaration covers every template that ever uses this
   * scene, and a per-template mapping would be the hand-maintained table this
   * is meant to avoid.
   *
   * A path may cross an optional link (`media.asset` where `media` is
   * optional); a path that resolves to nothing contributes nothing.
   */
  assetPaths?: readonly string[];
  /** Default length in seconds when a scene config declares none. */
  defaultDuration: number;
  /**
   * Whether the scene fully covers the frame opaquely (its default surface does). Default
   * `true`. Feeds the transition opacity contract; a scene meant to render transparently
   * (translucent surface / overlay) declares `opaque: false` here.
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
  require(name: string): {
    component: SceneComponent;
    defaultDuration: number;
    opaque?: boolean;
    assetPaths?: readonly string[];
  };
  has(name: string): boolean;
  keys(): string[];
};

const DEFAULT_SCENE_DURATION = theme.timing.scene.base;

/** Bind a scene component (+ optional default duration / opacity) into a typed definition. */
export const defineScene = <P>(spec: {
  component: ComponentType<P>;
  defaultDuration?: number;
  opaque?: boolean;
  assetPaths?: readonly string[];
}): SceneDefinition<P> => ({
  component: spec.component,
  defaultDuration: spec.defaultDuration ?? DEFAULT_SCENE_DURATION,
  ...(spec.opaque !== undefined ? { opaque: spec.opaque } : {}),
  ...(spec.assetPaths !== undefined ? { assetPaths: spec.assetPaths } : {}),
});

/** The built-in scenes — the single definition site (replaces the old registration array). */
export const builtinScenes = {
  media: defineScene<MediaSceneProps>({
    component: MediaScene,
    defaultDuration: theme.timing.scene.short,
    // The plate. `MediaBackdrop` resolves this from the active registry when it
    // renders; declaring it here is what lets a plan know about it beforehand.
    assetPaths: ["media.asset"],
  }),
  hero: defineScene<HeroSceneProps>({ component: HeroScene }),
  centered: defineScene<CenteredSceneProps>({ component: CenteredScene }),
  split: defineScene<SplitSceneProps>({ component: SplitScene }),
  feature: defineScene<FeatureSceneProps>({ component: FeatureScene }),
  gallery: defineScene<GallerySceneProps>({ component: GalleryScene }),
  comparison: defineScene<ComparisonSceneProps>({ component: ComparisonScene }),
  quote: defineScene<QuoteSceneProps>({ component: QuoteScene }),
  cta: defineScene<CTASectionProps>({ component: CTASection }),
  "logo-reveal": defineScene<LogoRevealSceneProps>({ component: LogoRevealScene }),
  outro: defineScene<OutroSceneProps>({ component: OutroScene }),
} satisfies SceneMap;

export type BuiltinSceneMap = typeof builtinScenes;

/** The strongly-typed union of built-in scene names. */
export type SceneName = keyof BuiltinSceneMap & string;

/** The default scene registry (built-ins). Extend it for custom scenes. */
export const sceneRegistry: Registry<BuiltinSceneMap> = createRegistry(builtinScenes);
