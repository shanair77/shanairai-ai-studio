/**
 * lib — the package's public SDK entry (`.`), Phase S3.3.
 *
 * SIDE-EFFECT FREE BY CONSTRUCTION. Importing this module must never register a Remotion root, load
 * fonts, mount compositions, touch the DOM, or mutate global state. The application entry
 * (`src/index.ts`, which calls `registerRoot`) is deliberately NOT the package entry.
 *
 * This is the INTENTIONALLY SMALL primary surface: the compiler (`createCompiler` → `compile` /
 * `describe`) and the `define*` authoring API, plus exactly the contract types those signatures
 * reference so the declaration surface is self-contained. Reflection is `compiler.describe()`; the
 * standalone `describeFramework` and the transport front-end (`processRequest`) are deferred to the
 * React-free `./inspect` entry (Phase S4). Engine internals — `execute`, `buildComposition`,
 * `createRegistry`, `CompositionSchema`, resolvers, report builders, stage helpers — stay internal.
 */

// ══ Runtime — compiler ══════════════════════════════════════════════════════════════════════════
export { createCompiler } from "./compiler";

// ══ Runtime — authoring (`define*` is the canonical vocabulary) ══════════════════════════════════
export { defineTemplate } from "./templates";
export { defineScene } from "./composition";
export { defineTransition } from "./transitions";
export { defineBrand } from "./brand";
export { defineAsset, defineAssetKit } from "./assets";

// ══ Runtime — error contract ════════════════════════════════════════════════════════════════════
export { DomainError } from "./errors";

// ══ Types — compiler contract ═══════════════════════════════════════════════════════════════════
export type {
  Compiler,
  CompilerConfig,
  CompileRequest,
  CompileResult,
  RequirementResult,
} from "./compiler";

// ══ Types — requirement planning ════════════════════════════════════════════════════════════════
// What a SPECIFIC render needs, as opposed to what a pack holds. Pure, and on
// the compiler surface rather than behind `./render`: planning must work with
// no bundler, no browser and no renderer installed.
export type {
  PlannedRequirement,
  ReferenceOrigin,
  UnresolvedReference,
} from "./requirements/types";

// ══ Types — authoring definitions (`define*` inputs / returns) ══════════════════════════════════
export type {
  TemplateDefinition,
  TemplateOutput,
  TemplateContext,
  TemplateParams,
  TemplateCapabilities,
  TemplateMap,
} from "./templates";
export type { SceneDefinition, SceneMap } from "./composition";
export type { TransitionDefinition, TransitionMap } from "./transitions";
export type { BrandDefinition, BrandMap } from "./brand";
export type { AssetDefinition, AssetKit, AssetMap, AssetCategory, AssetSource } from "./assets";
export type { ParameterSchema, ParameterDefinition, ParameterTypeMap, ValidatorMap } from "./parameters";

// ══ Types — authoring config fields ═════════════════════════════════════════════════════════════
export type {
  BuiltComposition,
  VideoConfigInput,
  MusicConfig,
  TimingConfig,
  TransitionConfig,
} from "./composition";
export type { FormatName } from "./config/Layout";
export type { ThemeMode } from "./config/Theme";

// ══ Types — diagnostics (consume `CompileResult.report`) ════════════════════════════════════════
// Only the aggregate `ExecutionReport` is exported; its element subtypes (issue/warning/span/stage)
// stay reachable through the declaration graph and can be promoted to named exports later without a
// breaking change — consistent with the `FrameworkDescriptor` treatment.
export type { ExecutionReport } from "./execution";

// ══ Types — inspection (`Compiler.describe()` return) ═══════════════════════════════════════════
export type { FrameworkDescriptor } from "./metadata";

// ══ Types — registry kernel (reachable via `AssetKit`; the runtime `createRegistry` stays internal) ══
export type { Registry, DefinitionMap } from "./registry";

// ══ Types — error contract support ══════════════════════════════════════════════════════════════
export type { DiagnosticValue, DomainErrorInit } from "./errors";
