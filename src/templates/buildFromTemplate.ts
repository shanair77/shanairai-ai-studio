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
import { resolveParametersOrThrow, type ParameterValue } from "../parameters";
import { templateRegistry } from "./TemplateRegistry";
import {
  type TemplateCompositionBase,
  type TemplateCompositionFor,
  type TemplateContext,
  type TemplateDefinition,
  type TemplateMap,
  type TemplateOutput,
  type TemplateResolver,
} from "./types";

/** Structural validation of a `TemplateComposition`'s own fields. Throws on violation. */
const validateSpec = (spec: TemplateCompositionBase): void => {
  if (!spec || typeof spec.id !== "string" || spec.id.length === 0) {
    throw new Error("TemplateComposition: a non-empty `id` is required.");
  }
  if (typeof spec.template !== "string" || spec.template.length === 0) {
    throw new Error(`TemplateComposition "${spec.id}": a non-empty \`template\` name is required.`);
  }
  if (spec.params === null || typeof spec.params !== "object") {
    throw new Error(`TemplateComposition "${spec.id}": \`params\` must be an object.`);
  }
};

/**
 * Static capability checks that can run BEFORE `build` — plus a declaration-consistency guard.
 * Throws actionable errors for a missing required brand, an unsupported format, or a contradictory
 * scene-count declaration.
 */
const checkCapabilitiesBeforeBuild = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: TemplateDefinition<any>,
  spec: TemplateCompositionBase,
): void => {
  const caps = template.capabilities;
  if (!caps) return;

  if (caps.requiresBrand && spec.brand === undefined) {
    throw new Error(`Template "${template.name}" requires a brand, but none was provided.`);
  }

  if (caps.formats && caps.formats.length > 0) {
    const format: FormatName = spec.format ?? template.format ?? DEFAULT_FORMAT;
    if (!caps.formats.includes(format)) {
      throw new Error(
        `Template "${template.name}" does not support format "${format}". Supported: ${caps.formats.join(", ")}.`,
      );
    }
  }

  if (caps.minScenes !== undefined && caps.maxScenes !== undefined) {
    if (caps.minScenes > caps.maxScenes) {
      throw new Error(
        `Template "${template.name}" declares minScenes (${caps.minScenes}) greater than maxScenes (${caps.maxScenes}).`,
      );
    }
    if (caps.variableLength === false && caps.minScenes !== caps.maxScenes) {
      throw new Error(
        `Template "${template.name}" declares variableLength: false but a scene-count range [${caps.minScenes}, ${caps.maxScenes}]. ` +
          `A fixed-length template must declare an exact count (minScenes === maxScenes).`,
      );
    }
  }
};

/** Validate the shape and scene-count bounds of a template's output. Throws on violation. */
const validateOutput = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: TemplateDefinition<any>,
  output: TemplateOutput,
): void => {
  if (!output || typeof output !== "object" || !Array.isArray(output.scenes)) {
    throw new Error(`Template "${template.name}".build() must return a TemplateOutput with a \`scenes\` array.`);
  }
  if (output.scenes.length === 0) {
    throw new Error(`Template "${template.name}".build() produced no scenes.`);
  }
  const caps = template.capabilities;
  const n = output.scenes.length;
  if (caps?.minScenes !== undefined && n < caps.minScenes) {
    throw new Error(`Template "${template.name}" produced ${n} scenes, fewer than its declared minimum (${caps.minScenes}).`);
  }
  if (caps?.maxScenes !== undefined && n > caps.maxScenes) {
    throw new Error(`Template "${template.name}" produced ${n} scenes, more than its declared maximum (${caps.maxScenes}).`);
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

/**
 * Pure producer: resolve a template composition into a normal `CompositionSchema`. It resolves the
 * template, evaluates capabilities, validates + runs the pure `build`, validates the output, and
 * applies the caller-vs-template precedence — NO rendering, and no registries beyond the template
 * lookup. `buildFromTemplate` = this + `buildComposition`, so the schema is independently testable
 * and `buildFromTemplate` stays a pure `CompositionSchema` producer (brand/theme/scene/transition/
 * asset resolution and the brand-audio default all live in `buildComposition`).
 */
export function resolveTemplateComposition(
  spec: TemplateCompositionBase,
  templates: TemplateResolver = templateRegistry,
  assets?: AssetRegistry,
  brands?: BrandRegistry,
): CompositionSchemaBase {
  // 1–2. Resolve the template by name (clear error for an unknown template).
  validateSpec(spec);
  if (!templates.has(spec.template)) {
    throw new Error(
      `buildFromTemplate: no template registered as "${spec.template}". Registered: ${templates.keys().join(", ") || "(none)"}.`,
    );
  }
  const template = templates.require(spec.template);

  // 3. Resolve the requested canvas + build the TemplateContext (canvas dims only — the builder
  //    independently resolves the video config for assembly; no duration logic is duplicated).
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

  // 4. Evaluate static capabilities before build.
  checkCapabilitiesBeforeBuild(template, spec);
  // 5. Resolve params: schema-based validation first (defaults + coercion + validation), then the
  //    imperative validate() hook. Templates without a schema keep the legacy raw-params path.
  const params = template.parameters
    ? (resolveParametersOrThrow(template.parameters, spec.params as Record<string, ParameterValue>, {
        assets,
        brands,
        format: videoInput.format,
      }) as unknown as typeof spec.params)
    : spec.params;
  template.validate?.(params);
  // 6. Call the pure build (configuration only).
  const output = template.build(params, ctx);
  // 7. Validate the output shape + scene-count bounds.
  validateOutput(template, output);

  // 8–9. Apply precedence and produce a normal CompositionSchema.
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
