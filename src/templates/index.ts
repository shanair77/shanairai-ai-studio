/**
 * templates/ — the typed, config-driven Template Engine (ADR-005, Phase 19 MVP).
 *
 * A `TemplateDefinition<P>` is a template pack: a PURE function from typed `params` +
 * `TemplateContext` to a `TemplateOutput` (a `CompositionSchema` fragment — never React), plus
 * machine-readable `TemplateCapabilities` and human-facing `TemplateMetadata`. Compositions select
 * a template by name via a `TemplateComposition`. The framework ships NO templates.
 *
 * This layer exports the PURE stage helpers and owns no sequencing: `execute()` (src/execution) is
 * the single canonical orchestrator that drives them and delegates to `buildComposition`, applying
 * the precedence scene > caller > template > brand > framework.
 *
 * This is a layer ABOVE the Composition Engine: it depends downward on `composition` (+ config /
 * registry); nothing in `composition` depends on it, and it never imports `execution` (no cycle).
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

export { defineTemplate } from "./definition";
export { templateRegistry } from "./TemplateRegistry";
// Public stage helpers (ADR-007) — the Execution Engine drives these in order; `templates` never
// imports `execution`, and exposes no sequencing function of its own.
export {
  resolveTemplateDefaults,
  resolveTemplate,
  resolveTemplateCanvas,
  checkTemplateCapabilities,
  resolveTemplateParameters,
  runTemplate,
  validateTemplateOutput,
  assembleTemplateSchema,
  type TemplateParameterResolution,
} from "./stages";
