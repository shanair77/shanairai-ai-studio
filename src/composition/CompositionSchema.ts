/**
 * CompositionSchema — the declarative shape of an entire video.
 *
 * One object describes everything the engine needs to assemble a composition: canvas
 * (via VideoConfigInput), theme, brand, music, the ordered scenes, the default transition
 * between them, timing fallbacks, and a named asset catalog. Nothing here is
 * business-specific — it is pure configuration that the builder turns into a React tree.
 *
 * No Zod (it is not a dependency): types are plain TypeScript, with a light runtime
 * `validateComposition` for the structural invariants the builder relies on.
 */

import { staticFile } from "remotion";
import { type ThemeMode } from "../config/Theme";
import { type VideoConfigInput } from "./VideoConfig";
import type { BrandConfig } from "./BrandConfig";
import type { BuiltinSceneMap, PropsOf, SceneMap } from "./SceneRegistry";
import type { BuiltinTransitionMap, OptionsOf, TransitionMap } from "../transitions";

/**
 * A transition config discriminated on `type`: each registered transition accepts exactly
 * its options. Derived from a transition map, so names and options are compile-checked.
 */
export type TransitionConfigFor<M extends TransitionMap> = {
  [N in keyof M & string]: {
    type: N;
    /** Overlap length in seconds. Defaults to the theme's base duration. */
    duration?: number;
    options?: OptionsOf<M[N]>;
  };
}[keyof M & string];

/** Transition config over the built-in transitions. */
export type TransitionConfig = TransitionConfigFor<BuiltinTransitionMap>;

/** The built-in transition names. */
export type TransitionType = keyof BuiltinTransitionMap & string;

/** Erased runtime transition shape the resolver operates on (type is any string). */
export type TransitionConfigBase = {
  type: string;
  duration?: number;
  options?: unknown;
};

/** A reference to a media asset: a `public/`-relative path or an absolute http(s) URL. */
export type AssetRef = string;

/** Named catalog of asset references, so scenes/music can refer to assets by key. */
export type AssetCatalog = Record<string, AssetRef>;

export type MusicConfig = {
  /** Named audio asset, resolved from the asset registry (preferred). */
  asset?: string;
  /** Legacy raw ref or catalog key for the audio track. Kept for backward compatibility. */
  src?: AssetRef;
  /** 0–1 playback volume. Default 1. */
  volume?: number;
  /** Loop the track for the whole composition. Default true. */
  loop?: boolean;
  /** Seconds to trim from the start of the track. Default 0. (Alias of `trimBefore`.) */
  startFrom?: number;
  /** Seconds to trim from the start of the track. */
  trimBefore?: number;
  /** Seconds to trim from the end of the track. */
  trimAfter?: number;
  /** Fade-in duration in seconds (frame-driven volume envelope). */
  fadeIn?: number;
  /** Fade-out duration in seconds (frame-driven volume envelope). */
  fadeOut?: number;
};

export type TimingConfig = {
  /** Fallback scene length in seconds when a scene declares none. */
  defaultSceneDuration?: number;
};

/** Fields every scene config carries besides its name, props, and transition. */
type SceneConfigMeta = {
  /** Length in seconds (overridden by `durationInFrames`). */
  duration?: number;
  /** Length in frames (takes precedence over `duration`). */
  durationInFrames?: number;
  /** Optional instance label shown in the Studio timeline. */
  label?: string;
  /**
   * Override the scene's opacity for this instance (feeds the transition opacity contract).
   * Defaults to the scene definition's `opaque`, then `true`.
   */
  opaque?: boolean;
};

/**
 * A scene config discriminated on `scene`: each registry name accepts exactly that scene's
 * props. Derived from a scene map, so names and props are compile-checked.
 */
export type SceneConfigFor<M extends SceneMap> = {
  [N in keyof M & string]: SceneConfigMeta & {
    scene: N;
    props?: PropsOf<M[N]>;
    /** Transition INTO this scene — overrides the composition default. */
    transition?: TransitionConfig;
  };
}[keyof M & string];

/** The complete, declarative description of a video, over a given scene map. */
export type CompositionSchemaFor<M extends SceneMap> = VideoConfigInput & {
  /** Unique composition id (Remotion `<Composition id>`). */
  id: string;
  /** Quick theme-mode select; `brand` takes precedence if both are given. */
  theme?: ThemeMode;
  /** Brand identity + theme overrides. */
  brand?: BrandConfig | string;
  /** Background music for the whole composition. */
  music?: MusicConfig;
  /** Ordered scenes that make up the video. */
  scenes: SceneConfigFor<M>[];
  /** Default transition applied between consecutive scenes. Default `{ type: "none" }`. */
  transitions?: TransitionConfig;
  /** Timing fallbacks. */
  timing?: TimingConfig;
  /** Named asset catalog resolvable by scenes and music. */
  assets?: AssetCatalog;
};

/** Scene config over the built-in scenes. */
export type SceneConfig = SceneConfigFor<BuiltinSceneMap>;

/** Composition config over the built-in scenes — the default authoring type. */
export type CompositionSchema = CompositionSchemaFor<BuiltinSceneMap>;

/** Erased runtime shape the builder/timeline/validation operate on (name is any string). */
export type SceneConfigBase = SceneConfigMeta & {
  scene: string;
  /** Opaque config-supplied props at the erased layer (typed per-scene in `SceneConfigFor`). */
  props?: unknown;
  /** Transition INTO this scene (erased). */
  transition?: TransitionConfigBase;
};

/** Erased runtime composition shape (any registry). */
export type CompositionSchemaBase = VideoConfigInput & {
  id: string;
  theme?: ThemeMode;
  brand?: BrandConfig | string;
  music?: MusicConfig;
  scenes: SceneConfigBase[];
  transitions?: TransitionConfigBase;
  timing?: TimingConfig;
  assets?: AssetCatalog;
};

const isUrl = (ref: string): boolean => /^https?:\/\//.test(ref);

/** Resolve a single reference to a usable URL (`staticFile` for local paths). */
export const resolveAssetRef = (ref: AssetRef): string => (isUrl(ref) ? ref : staticFile(ref));

/** Resolve a reference that may instead be a catalog key. */
export const resolveNamedAsset = (catalog: AssetCatalog | undefined, refOrName: AssetRef): string =>
  resolveAssetRef(catalog?.[refOrName] ?? refOrName);

/** Structural validation of the invariants the builder relies on. Throws on violation. */
export const validateComposition = (config: CompositionSchemaBase): void => {
  if (!config || typeof config.id !== "string" || config.id.length === 0) {
    throw new Error("CompositionSchema: a non-empty `id` is required.");
  }
  if (!Array.isArray(config.scenes) || config.scenes.length === 0) {
    throw new Error(`CompositionSchema "${config.id}": at least one scene is required.`);
  }
  config.scenes.forEach((scene, i) => {
    if (!scene || typeof scene.scene !== "string" || scene.scene.length === 0) {
      throw new Error(`CompositionSchema "${config.id}": scenes[${i}] is missing a scene name.`);
    }
  });
};
