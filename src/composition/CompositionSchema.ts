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

/** How one scene hands off to the next. Extend as richer transitions are added. */
export type TransitionType = "none" | "fade";

export type TransitionConfig = {
  type: TransitionType;
  /** Overlap/crossfade length in seconds. Defaults to the theme's base duration. */
  duration?: number;
};

/** A reference to a media asset: a `public/`-relative path or an absolute http(s) URL. */
export type AssetRef = string;

/** Named catalog of asset references, so scenes/music can refer to assets by key. */
export type AssetCatalog = Record<string, AssetRef>;

export type MusicConfig = {
  /** Asset reference or catalog key for the audio track. */
  src: AssetRef;
  /** 0–1 playback volume. Default 1. */
  volume?: number;
  /** Loop the track for the whole composition. Default true. */
  loop?: boolean;
  /** Seconds to trim from the start of the track. Default 0. */
  startFrom?: number;
};

export type SceneConfig = {
  /** Registry name of the scene to render (see SceneRegistry). */
  scene: string;
  /** Props forwarded verbatim to the scene component. */
  props?: Record<string, unknown>;
  /** Length in seconds (overridden by `durationInFrames`). */
  duration?: number;
  /** Length in frames (takes precedence over `duration`). */
  durationInFrames?: number;
  /** Transition INTO this scene — overrides the composition default. */
  transition?: TransitionConfig;
  /** Optional instance label shown in the Studio timeline. */
  label?: string;
};

export type TimingConfig = {
  /** Fallback scene length in seconds when a scene declares none. */
  defaultSceneDuration?: number;
};

/** The complete, declarative description of a video. */
export type CompositionSchema = VideoConfigInput & {
  /** Unique composition id (Remotion `<Composition id>`). */
  id: string;
  /** Quick theme-mode select; `brand` takes precedence if both are given. */
  theme?: ThemeMode;
  /** Brand identity + theme overrides. */
  brand?: BrandConfig;
  /** Background music for the whole composition. */
  music?: MusicConfig;
  /** Ordered scenes that make up the video. */
  scenes: SceneConfig[];
  /** Default transition applied between consecutive scenes. Default `{ type: "none" }`. */
  transitions?: TransitionConfig;
  /** Timing fallbacks. */
  timing?: TimingConfig;
  /** Named asset catalog resolvable by scenes and music. */
  assets?: AssetCatalog;
};

const isUrl = (ref: string): boolean => /^https?:\/\//.test(ref);

/** Resolve a single reference to a usable URL (`staticFile` for local paths). */
export const resolveAssetRef = (ref: AssetRef): string => (isUrl(ref) ? ref : staticFile(ref));

/** Resolve a reference that may instead be a catalog key. */
export const resolveNamedAsset = (catalog: AssetCatalog | undefined, refOrName: AssetRef): string =>
  resolveAssetRef(catalog?.[refOrName] ?? refOrName);

/** Structural validation of the invariants the builder relies on. Throws on violation. */
export const validateComposition = (config: CompositionSchema): void => {
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
