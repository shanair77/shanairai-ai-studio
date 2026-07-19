/**
 * templates/buildFromTemplate — resolve a template composition into a built composition.
 *
 * The public entry point of the Template Engine. It resolves a template by name, evaluates its
 * static capabilities, runs the optional `validate` hook, calls the PURE `build` (which returns
 * configuration, never React), validates the output, applies the fixed precedence, and then
 * delegates to the existing `buildComposition` — the single assembly/render pipeline. It owns NO
 * timeline, scene, transition, brand, asset, provider, or duration logic; it only produces a
 * `CompositionSchema` for `buildComposition` to assemble.
 *
 * Precedence (ADR-005 §4.5):
 *   transition: scene > caller > template > brand > framework   (scene/brand handled downstream)
 *   music:      caller > template > brand audio default > none
 *   timing:     caller > template > framework
 */

import { type Registry } from "../registry";
import { type TransitionResolver } from "../transitions";
import {
  DEFAULT_FORMAT,
  assetRegistry,
  brandRegistry,
  buildComposition,
  resolveVideoConfig,
  sceneRegistry,
  transitionRegistry,
  type AssetRegistry,
  type BrandRegistry,
  type BuiltComposition,
  type CompositionSchemaBase,
  type MusicConfig,
  type SceneResolver,
  type TimingConfig,
  type TransitionConfigBase,
  type VideoConfigInput,
} from "../composition";
import { type FormatName } from "../config/Layout";
import { DomainError } from "../errors";
import {
  resolveParameters,
  resolveParametersOrThrow,
  validateParameters,
  type ParameterContext,
  type ParameterIssue,
  type ParameterValue,
} from "../parameters";
import { templateRegistry } from "./TemplateRegistry";
import {
  type TemplateCompositionBase,
  type TemplateCompositionFor,
  type TemplateContext,
  type TemplateDefinition,
  type TemplateMap,
  type TemplateOutput,
  type TemplateParams,
  type TemplateResolver,
} from "./types";

/**
 * Stage 1 (public pure helper) — structural request validation + template lookup. Throws
 * `DomainError` on an invalid request or an unknown template name.
 */
export const resolveTemplate = (
  spec: TemplateCompositionBase,
  templates: TemplateResolver = templateRegistry,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): TemplateDefinition<any> => {
  if (!spec || typeof spec.id !== "string" || spec.id.length === 0) {
    throw new DomainError({ code: "invalid-request", message: "TemplateComposition: a non-empty `id` is required.", path: "id" });
  }
  if (typeof spec.template !== "string" || spec.template.length === 0) {
    throw new DomainError({ code: "invalid-request", message: `TemplateComposition "${spec.id}": a non-empty \`template\` name is required.`, path: "template" });
  }
  if (spec.params === null || typeof spec.params !== "object") {
    throw new DomainError({ code: "invalid-request", message: `TemplateComposition "${spec.id}": \`params\` must be an object.`, path: "params" });
  }
  if (!templates.has(spec.template)) {
    throw new DomainError({
      code: "unknown-template",
      message: `buildFromTemplate: no template registered as "${spec.template}". Registered: ${templates.keys().join(", ") || "(none)"}.`,
      path: "template",
      actual: spec.template,
    });
  }
  return templates.require(spec.template);
};

/**
 * Resolve the requested canvas + the `TemplateContext` (canvas dims only — the builder independently
 * resolves the video config for assembly; no duration logic is duplicated).
 */
export const resolveTemplateCanvas = (
  spec: TemplateCompositionBase,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: TemplateDefinition<any>,
): { videoInput: VideoConfigInput; ctx: TemplateContext } => {
  const videoInput: VideoConfigInput = {
    format: spec.format ?? template.format,
    width: spec.width,
    height: spec.height,
    fps: spec.fps,
    duration: spec.duration,
    durationInFrames: spec.durationInFrames,
  };
  const video = resolveVideoConfig(videoInput);
  const ctx: TemplateContext = {
    width: video.width,
    height: video.height,
    fps: video.fps,
    brand: typeof spec.brand === "string" ? spec.brand : undefined,
  };
  return { videoInput, ctx };
};

/**
 * Stage 2 (public pure helper) — static capability checks before build, plus a declaration
 * consistency guard. Throws `DomainError` for a missing required brand, an unsupported format, or a
 * contradictory scene-count declaration.
 */
export const checkTemplateCapabilities = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: TemplateDefinition<any>,
  spec: TemplateCompositionBase,
): void => {
  const caps = template.capabilities;
  if (!caps) return;

  if (caps.requiresBrand && spec.brand === undefined) {
    throw new DomainError({ code: "requires-brand", message: `Template "${template.name}" requires a brand, but none was provided.`, path: "brand" });
  }

  if (caps.formats && caps.formats.length > 0) {
    const format: FormatName = spec.format ?? template.format ?? DEFAULT_FORMAT;
    if (!caps.formats.includes(format)) {
      throw new DomainError({
        code: "unsupported-format",
        message: `Template "${template.name}" does not support format "${format}". Supported: ${caps.formats.join(", ")}.`,
        path: "format",
        expected: [...caps.formats],
        actual: format,
      });
    }
  }

  if (caps.minScenes !== undefined && caps.maxScenes !== undefined) {
    if (caps.minScenes > caps.maxScenes) {
      throw new DomainError({ code: "capability-declaration", message: `Template "${template.name}" declares minScenes (${caps.minScenes}) greater than maxScenes (${caps.maxScenes}).` });
    }
    if (caps.variableLength === false && caps.minScenes !== caps.maxScenes) {
      throw new DomainError({
        code: "capability-declaration",
        message:
          `Template "${template.name}" declares variableLength: false but a scene-count range [${caps.minScenes}, ${caps.maxScenes}]. ` +
          `A fixed-length template must declare an exact count (minScenes === maxScenes).`,
      });
    }
  }
};

/**
 * Stage 3 (Result form, for the Execution Engine) — resolve + validate the caller's params against
 * the template's schema, applying defaults; returns errors/warnings rather than throwing. A template
 * without a schema passes its raw params through. `buildFromTemplate` uses the throwing form.
 */
export type TemplateParameterResolution =
  | { ok: true; params: TemplateParams; warnings: ParameterIssue[] }
  | { ok: false; issues: ParameterIssue[]; warnings: ParameterIssue[] };

export const resolveTemplateParameters = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: TemplateDefinition<any>,
  rawParams: TemplateParams,
  ctx: ParameterContext,
): TemplateParameterResolution => {
  if (!template.parameters) return { ok: true, params: rawParams, warnings: [] };
  const all = validateParameters(template.parameters, rawParams as Record<string, ParameterValue>, ctx);
  const warnings = all.filter((i) => i.severity === "warning");
  const errors = all.filter((i) => i.severity === "error");
  if (errors.length > 0) return { ok: false, issues: errors, warnings };
  const res = resolveParameters(template.parameters, rawParams as Record<string, ParameterValue>, ctx);
  return { ok: true, params: res.ok ? (res.value as unknown as TemplateParams) : rawParams, warnings };
};

/** Stage 5 (public pure helper) — run the pure template build (configuration only). */
export const runTemplate = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: TemplateDefinition<any>,
  params: TemplateParams,
  ctx: TemplateContext,
): TemplateOutput => template.build(params, ctx);

/**
 * Stage 6 (public pure helper) — validate the shape + scene-count bounds of a template's output.
 * Throws `DomainError` on violation.
 */
export const validateTemplateOutput = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: TemplateDefinition<any>,
  output: TemplateOutput,
): void => {
  if (!output || typeof output !== "object" || !Array.isArray(output.scenes)) {
    throw new DomainError({ code: "invalid-output", message: `Template "${template.name}".build() must return a TemplateOutput with a \`scenes\` array.` });
  }
  if (output.scenes.length === 0) {
    throw new DomainError({ code: "empty-output", message: `Template "${template.name}".build() produced no scenes.` });
  }
  const caps = template.capabilities;
  const n = output.scenes.length;
  if (caps?.minScenes !== undefined && n < caps.minScenes) {
    throw new DomainError({ code: "min-scenes", message: `Template "${template.name}" produced ${n} scenes, fewer than its declared minimum (${caps.minScenes}).`, expected: caps.minScenes, actual: n });
  }
  if (caps?.maxScenes !== undefined && n > caps.maxScenes) {
    throw new DomainError({ code: "max-scenes", message: `Template "${template.name}" produced ${n} scenes, more than its declared maximum (${caps.maxScenes}).`, expected: caps.maxScenes, actual: n });
  }
};

/**
 * The precedence policy for the template's *defaults* (isolated + pure so it is directly testable):
 *   transition: caller ?? template   (a scene-level transition wins downstream; brand fills in downstream)
 *   music:      caller ?? template   (the brand's default audio fills in downstream, in buildComposition)
 *   timing:     caller ?? template   (the framework default fills in downstream)
 */
export const resolveTemplateDefaults = (
  spec: Pick<TemplateCompositionBase, "transitions" | "music" | "timing">,
  output: Pick<TemplateOutput, "transitions" | "music" | "timing">,
): { transitions?: TransitionConfigBase; music?: MusicConfig; timing?: TimingConfig } => ({
  transitions: spec.transitions ?? output.transitions,
  music: spec.music ?? output.music,
  timing: spec.timing ?? output.timing,
});

/** Stage 7 (public pure helper) — merge precedence + assemble a normal `CompositionSchema`. */
export const assembleTemplateSchema = (
  spec: TemplateCompositionBase,
  videoInput: VideoConfigInput,
  output: TemplateOutput,
): CompositionSchemaBase => {
  const defaults = resolveTemplateDefaults(spec, output);
  return {
    ...videoInput,
    id: spec.id,
    theme: spec.theme,
    brand: spec.brand,
    scenes: output.scenes,
    transitions: defaults.transitions,
    music: defaults.music,
    timing: defaults.timing,
    assets: output.assets,
  };
};

/**
 * Pure producer (convenience): compose the public stage helpers into a normal `CompositionSchema`.
 * Behaviour is unchanged from prior phases — it validates + runs the pure `build` and applies the
 * caller-vs-template precedence, with NO rendering. `buildFromTemplate` = this + `buildComposition`;
 * the Execution Engine drives the same helpers stage-by-stage (ADR-007). Uses the throwing parameter
 * form; the Execution Engine uses the Result form (`resolveTemplateParameters`).
 */
export function resolveTemplateComposition(
  spec: TemplateCompositionBase,
  templates: TemplateResolver = templateRegistry,
  assets?: AssetRegistry,
  brands?: BrandRegistry,
): CompositionSchemaBase {
  const template = resolveTemplate(spec, templates);
  const { videoInput, ctx } = resolveTemplateCanvas(spec, template);
  checkTemplateCapabilities(template, spec);
  const params = template.parameters
    ? (resolveParametersOrThrow(template.parameters, spec.params as Record<string, ParameterValue>, {
        assets,
        brands,
        format: videoInput.format,
      }) as unknown as typeof spec.params)
    : spec.params;
  template.validate?.(params);
  const output = runTemplate(template, params, ctx);
  validateTemplateOutput(template, output);
  return assembleTemplateSchema(spec, videoInput, output);
}

// Typed: `template` name + `params` inferred from the concrete template registry.
export function buildFromTemplate<M extends TemplateMap>(
  spec: TemplateCompositionFor<M>,
  templates: Registry<M>,
): BuiltComposition;
// Full control: erased registries (requires the scene registry as the 3rd arg, so 2-arg calls
// resolve to the typed overload above).
export function buildFromTemplate(
  spec: TemplateCompositionBase,
  templates: TemplateResolver,
  scenes: SceneResolver,
  transitions?: TransitionResolver,
  assets?: AssetRegistry,
  brands?: BrandRegistry,
): BuiltComposition;
export function buildFromTemplate(
  spec: TemplateCompositionBase,
  templates: TemplateResolver = templateRegistry,
  scenes: SceneResolver = sceneRegistry,
  transitions: TransitionResolver = transitionRegistry,
  assets: AssetRegistry = assetRegistry,
  brands: BrandRegistry = brandRegistry,
): BuiltComposition {
  // Pure producer → the single assembly/render pipeline. buildFromTemplate adds no assembly logic.
  // assets/brands are forwarded so a parameter schema can validate asset/brand NAME references.
  const schema = resolveTemplateComposition(spec, templates, assets, brands);
  return buildComposition(schema, scenes, transitions, assets, brands);
}
