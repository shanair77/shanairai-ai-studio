/**
 * templates/types — the Template Engine's typed contracts (ADR-005, Phase 19 MVP).
 *
 * A `TemplateDefinition<P>` is a template pack: a PURE function from typed `params` +
 * `TemplateContext` to a `TemplateOutput` (a `CompositionSchema` fragment — never React), plus a
 * machine-readable `TemplateCapabilities` descriptor and human-facing `TemplateMetadata`. A
 * `TemplateComposition` selects a template by name and supplies its params; `execute()` resolves +
 * validates + merges it and delegates to the existing `buildComposition`.
 *
 * Capabilities and metadata are deliberately separate: capabilities are read (and enforced)
 * BEFORE build and drive validation; metadata is descriptive prose that never affects rendering.
 */

import { type FormatName } from "../config/Layout";
import { type ThemeMode } from "../config/Theme";
import { type ParameterSchema } from "../parameters";
import {
  type MusicConfig,
  type SceneConfigBase,
  type TimingConfig,
  type TransitionConfig,
  type TransitionConfigBase,
  type VideoConfigInput,
} from "../composition";

/** Serializable content/options a caller (or AI Director) fills. */
export type TemplateParams = Record<string, unknown>;

/** Read-only context passed to `build`: resolved canvas + brand NAME (never the React tree). */
export type TemplateContext = {
  width: number;
  height: number;
  fps: number;
  /** The selected brand's name, if any. */
  brand?: string;
};

/**
 * The configuration fragment a template emits — NOT a React tree. It slots directly into a
 * `CompositionSchema`: scenes plus optional default choreography (transitions/timing/music/assets).
 */
export type TemplateOutput = {
  scenes: SceneConfigBase[];
  /** The template's default transition choreography (a caller override outranks it). */
  transitions?: TransitionConfigBase;
  /** The template's default timing fallbacks. */
  timing?: TimingConfig;
  /** Music the template wires by name (a caller override outranks it). */
  music?: MusicConfig;
};

/**
 * Static, declarative description read WITHOUT executing `build` — mirrors ADR-002 transition
 * capabilities. Drives pre-render validation and gives tooling/the AI Director a selection
 * vocabulary. Distinct from `TemplateMetadata` (which is human-facing and inert).
 */
export type TemplateCapabilities = {
  /** Designed-for formats; omitted/empty = format-agnostic. */
  formats?: FormatName[];
  /** Total duration depends on params (e.g. a variable-length list slot). */
  variableLength?: boolean;
  /** The template renders correctly only with an active brand. */
  requiresBrand?: boolean;
  /** The template emits its own default transition choreography. */
  providesTransitions?: boolean;
  /** The template wires its own music track (a caller override outranks it). */
  providesMusic?: boolean;
  /** Lower bound on the number of scenes the template emits. */
  minScenes?: number;
  /** Upper bound on the number of scenes the template emits. */
  maxScenes?: number;
};

/** Human-facing template metadata for discovery. Never affects rendering. */
export type TemplateMetadata<P extends TemplateParams = TemplateParams> = {
  description?: string;
  category?: string;
  /** Example params for previews/tooling. */
  previewParams?: P;
};

/** A template pack, generic over its param type `P` for compile-time authoring safety. */
export type TemplateDefinition<P extends TemplateParams = TemplateParams> = {
  name: string;
  /** Default canvas format the template targets. */
  format?: FormatName;
  /** Machine-readable capabilities (checked before/after `build`). */
  capabilities?: TemplateCapabilities;
  /**
   * Optional declarative parameter schema (ADR-006). When present, `execute()` resolves +
   * validates the caller's params against it (applying defaults) BEFORE `build` runs. Independent
   * of `P`, which stays the author's static type. Additive — templates without a schema are unchanged.
   */
  parameters?: ParameterSchema;
  /** Optional imperative param validation (throws). Runs AFTER schema resolution when both exist. */
  validate?: (params: P) => void;
  /** PURE: typed params + context → configuration. MUST NOT return React. */
  build: (params: P, ctx: TemplateContext) => TemplateOutput;
  /** Human-facing metadata (inert). */
  meta?: TemplateMetadata<P>;
};

/**
 * A map of template name → definition. The value's param type is erased to `any` so definitions
 * of differing param shapes fit one map (mirrors `SceneMap`); each template's concrete params are
 * recovered by `ParamsOf<M[N]>` from the specific `typeof registry`, never from this constraint.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TemplateMap = Record<string, TemplateDefinition<any>>;

/** Extract a template definition's param type. */
export type ParamsOf<D> = D extends TemplateDefinition<infer P> ? P : never;

/**
 * Erased runtime template lookup (mirrors SceneResolver / BrandRegistry). `TemplateDefinition<any>`
 * is required so a concrete template registry — whose defs carry a specific param type — is
 * assignable regardless of that type.
 */
export type TemplateResolver = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  require(name: string): TemplateDefinition<any>;
  has(name: string): boolean;
  keys(): string[];
};

/**
 * A template-driven composition — kept SEPARATE from `CompositionSchema` (ADR-005 §3). Selects a
 * template by name, supplies its params, and may override caller-level defaults. `P` types the
 * params; use `TemplateCompositionFor<M>` to infer `P` from a concrete template registry.
 */
export type TemplateComposition<P extends TemplateParams = TemplateParams> = VideoConfigInput & {
  id: string;
  template: string;
  params: P;
  brand?: string;
  theme?: ThemeMode;
  /** Caller override of the template's default transition. */
  transitions?: TransitionConfig;
  /** Caller override of the template's music. */
  music?: MusicConfig;
  /** Caller override of the template's timing. */
  timing?: TimingConfig;
};

/**
 * A template composition discriminated over a template map `M`: the `template` name selects the
 * entry and `params` is typed to exactly that template's params. Powers the typed
 * `execute(request, { registries: { templates } })` overload (mirrors `SceneConfigFor` /
 * `CompositionSchemaFor`).
 */
export type TemplateCompositionFor<M extends TemplateMap> = VideoConfigInput & {
  id: string;
  brand?: string;
  theme?: ThemeMode;
  transitions?: TransitionConfig;
  music?: MusicConfig;
  timing?: TimingConfig;
} & {
  [N in keyof M & string]: { template: N; params: ParamsOf<M[N]> };
}[keyof M & string];

/** Erased runtime composition shape the builder operates on (name/params are opaque). */
export type TemplateCompositionBase = VideoConfigInput & {
  id: string;
  template: string;
  params: TemplateParams;
  brand?: string;
  theme?: ThemeMode;
  transitions?: TransitionConfigBase;
  music?: MusicConfig;
  timing?: TimingConfig;
};
