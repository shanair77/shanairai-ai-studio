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

import { DomainError } from "../errors";
import { type ThemeMode } from "../config/Theme";
import { type VideoConfigInput } from "./VideoConfig";
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

/**
 * What a cue is FOR in the mix. This is not decoration — `voiceover` cues are what the builder
 * derives music-ducking windows from, so tagging a line correctly is what makes the mix work.
 */
export type AudioRole = "voiceover" | "sfx" | "ambience";

/**
 * One positioned sound on the timeline: narration, a Foley hit, or an ambience bed.
 *
 * `startAt` is absolute composition time in SECONDS, deliberately independent of scene
 * boundaries — that is what makes J-cuts and L-cuts expressible. A cue that starts before the
 * scene it belongs to (ocean arriving under the previous shot) is simply a smaller `startAt`;
 * one that runs past its scene is a longer `duration`. No special syntax, no new concept.
 */
export type AudioCue = {
  /** Named audio asset, resolved from the asset registry. */
  asset: string;
  /** Mix role. Default "sfx". `voiceover` additionally drives music ducking. */
  role?: AudioRole;
  /** When the cue begins, in seconds from the start of the composition. Default 0. */
  startAt?: number;
  /** How long the cue occupies the timeline, in seconds. Omit to run to the end. */
  duration?: number;
  /** 0–1 playback volume. Default 1. */
  volume?: number;
  /** Loop the source for the cue's whole length (ambience beds). Default false. */
  loop?: boolean;
  /** Seconds trimmed from the start of the source. */
  trimBefore?: number;
  /** Seconds trimmed from the end of the source. */
  trimAfter?: number;
  /** Fade-in over this many seconds. */
  fadeIn?: number;
  /** Fade-out over this many seconds. */
  fadeOut?: number;
  /** Optional label for the Studio timeline. */
  label?: string;
};

/** How music should duck beneath other cues. */
export type DuckingConfig = {
  /** Volume to duck TO (absolute, not a multiplier). Default 0.28. */
  level?: number;
  /** Ramp in and out of the duck, in seconds. Default 0.35. */
  ramp?: number;
  /** Which cue roles trigger the duck. Default ["voiceover"]. */
  under?: AudioRole[];
};

export type MusicConfig = {
  /** Named audio asset, resolved from the asset registry. */
  asset?: string;
  /**
   * When the bed enters, in seconds from the start of the composition. Default 0.
   *
   * A film may deliberately open without music — narration over room tone, with the bed arriving
   * on a cut. Expressing that needs a start offset; without one the only options are music from
   * frame zero or no music at all. Duck windows are rebased onto the offset automatically.
   */
  startAt?: number;
  /** 0–1 playback volume. Default 1. */
  volume?: number;
  /** Loop the track for the whole composition. Default true. */
  loop?: boolean;
  /** Seconds to trim from the start of the track. */
  trimBefore?: number;
  /** Seconds to trim from the end of the track. */
  trimAfter?: number;
  /** Fade-in duration in seconds (frame-driven volume envelope). */
  fadeIn?: number;
  /** Fade-out duration in seconds (frame-driven volume envelope). */
  fadeOut?: number;
  /** Duck beneath narration. Omit for no ducking. */
  ducking?: DuckingConfig;
};

export type TimingConfig = {
  /** Fallback scene length in seconds when a scene declares none. */
  defaultSceneDuration?: number;
};

/** Fields every scene config carries besides its name, props, and transition. */
type SceneConfigMeta = {
  /** Length in seconds. */
  duration?: number;
  /** Optional instance label shown in the Studio timeline. */
  label?: string;
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
  /** Registered brand name (resolved from the brand registry). */
  brand?: string;
  /** Background music for the whole composition. */
  music?: MusicConfig;
  /**
   * Positioned sound cues — narration, sound design, ambience — laid over the whole
   * composition independently of scene boundaries. See `AudioCue`.
   */
  audio?: AudioCue[];
  /** Ordered scenes that make up the video. */
  scenes: SceneConfigFor<M>[];
  /** Default transition applied between consecutive scenes. Default `{ type: "none" }`. */
  transitions?: TransitionConfig;
  /** Timing fallbacks. */
  timing?: TimingConfig;
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
  brand?: string;
  music?: MusicConfig;
  audio?: AudioCue[];
  scenes: SceneConfigBase[];
  transitions?: TransitionConfigBase;
  timing?: TimingConfig;
};

/** Structural validation of the invariants the builder relies on. Throws `DomainError` on violation. */
export const validateComposition = (config: CompositionSchemaBase): void => {
  if (!config || typeof config.id !== "string" || config.id.length === 0) {
    throw new DomainError({ code: "invalid-composition", message: "CompositionSchema: a non-empty `id` is required.", path: "id" });
  }
  if (!Array.isArray(config.scenes) || config.scenes.length === 0) {
    throw new DomainError({ code: "invalid-composition", message: `CompositionSchema "${config.id}": at least one scene is required.`, path: "scenes" });
  }
  config.scenes.forEach((scene, i) => {
    if (!scene || typeof scene.scene !== "string" || scene.scene.length === 0) {
      throw new DomainError({ code: "invalid-composition", message: `CompositionSchema "${config.id}": scenes[${i}] is missing a scene name.`, path: `scenes[${i}].scene` });
    }
  });
  if (config.audio !== undefined) {
    if (!Array.isArray(config.audio)) {
      throw new DomainError({ code: "invalid-composition", message: `CompositionSchema "${config.id}": \`audio\` must be an array of cues.`, path: "audio" });
    }
    config.audio.forEach((cue, i) => {
      if (!cue || typeof cue.asset !== "string" || cue.asset.length === 0) {
        throw new DomainError({ code: "invalid-composition", message: `CompositionSchema "${config.id}": audio[${i}] is missing an \`asset\` name.`, path: `audio[${i}].asset` });
      }
      if (cue.startAt !== undefined && (!Number.isFinite(cue.startAt) || cue.startAt < 0)) {
        throw new DomainError({ code: "invalid-composition", message: `CompositionSchema "${config.id}": audio[${i}].startAt must be a non-negative number of seconds.`, path: `audio[${i}].startAt`, actual: cue.startAt });
      }
      if (cue.duration !== undefined && (!Number.isFinite(cue.duration) || cue.duration <= 0)) {
        throw new DomainError({ code: "invalid-composition", message: `CompositionSchema "${config.id}": audio[${i}].duration must be a positive number of seconds.`, path: `audio[${i}].duration`, actual: cue.duration });
      }
    });
  }
};
