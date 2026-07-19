/**
 * templates/ — the typed, config-driven Template Engine (ADR-005, Phase 19 MVP).
 *
 * A `TemplateDefinition<P>` is a template pack: a PURE function from typed `params` +
 * `TemplateContext` to a `TemplateOutput` (a `CompositionSchema` fragment — never React), plus
 * machine-readable `TemplateCapabilities` and human-facing `TemplateMetadata`. Compositions select
 * a template by name via a `TemplateComposition`; `buildFromTemplate` resolves + validates +
 * merges (precedence: scene > caller > template > brand > framework) and delegates to the existing
 * `buildComposition` — the single assembly pipeline. The framework ships NO templates.
 *
 * This is a layer ABOVE the Composition Engine: it depends downward on `composition` (+ config /
 * registry); nothing in `composition` depends on it (no cycle).
 */

export {
  type TemplateParams,
  type TemplateContext,
  type TemplateOutput,
  type TemplateCapabilities,
  type TemplateMetadata,
  type TemplateDefinition,
  type TemplateMap,
  type TemplateResolver,
  type TemplateComposition,
  type TemplateCompositionFor,
  type TemplateCompositionBase,
  type ParamsOf,
} from "./types";

export { createTemplateDefinition } from "./definition";
export { templateRegistry } from "./TemplateRegistry";
export {
  buildFromTemplate,
  resolveTemplateComposition,
  resolveTemplateDefaults,
  // Public stage helpers (ADR-007) — the Execution Engine drives these; templates never imports execution.
  resolveTemplate,
  resolveTemplateCanvas,
  checkTemplateCapabilities,
  resolveTemplateParameters,
  runTemplate,
  validateTemplateOutput,
  assembleTemplateSchema,
  type TemplateParameterResolution,
} from "./buildFromTemplate";
