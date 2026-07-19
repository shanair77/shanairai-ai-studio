/**
 * execution/types — the Lifecycle & Execution Engine's contracts (ADR-007).
 *
 * The execution layer ORCHESTRATES the existing engines and produces diagnostics. It owns no
 * validation rules, defaults, precedence, rendering, or template/composition/parameter semantics.
 * It imports no React. The request/diagnostics contracts are React-free; the terminal
 * `BuiltComposition` is an opaque runtime artifact (§4.8).
 */

import { type DiagnosticValue } from "../errors";
import { type FormatName } from "../config/Layout";
import { type BuiltComposition, type CompositionSchemaBase, type SceneResolver, type AssetRegistry, type BrandRegistry } from "../composition";
import { type TransitionResolver } from "../transitions";
import { type DeepReadonly, type ParameterTypeResolver, type ValidatorResolver } from "../parameters";
import { type TemplateCompositionBase, type TemplateResolver } from "../templates";

/** The execution request — template-driven ONLY in MVP. JSON-safe by convention, not enforced. */
export type ExecutionRequest = TemplateCompositionBase;

/** The ordered, real pipeline stages (ADR-007 §4.3). */
export type ExecutionStage =
  | "resolve-template"
  | "check-template-capabilities"
  | "resolve-parameters"
  | "validate-template-params"
  | "run-template"
  | "validate-template-output"
  | "resolve-template-defaults"
  | "build-composition"
  | "complete";

/** A diagnostic — path-addressed, stage-tagged, JSON-safe (`expected`/`actual` are `DiagnosticValue`). */
export type ExecutionDiagnostic = {
  stage: ExecutionStage;
  code: string;
  message: string;
  path?: string;
  expected?: DiagnosticValue;
  actual?: DiagnosticValue;
};
export type ExecutionIssue = ExecutionDiagnostic & { severity: "error" };
export type ExecutionWarning = ExecutionDiagnostic & { severity: "warning" };

/** A trace span — describes WORK, not warnings. Chronological. */
export type ExecutionSpan = {
  stage: ExecutionStage;
  status: "ok" | "failed" | "skipped";
  note?: string;
  counts?: Record<string, number>;
};

/** The append-only, deterministic, JSON-safe diagnostic bundle. */
export type ExecutionReport = {
  executionId: string;
  trace: ExecutionSpan[];
  issues: ExecutionIssue[];
  warnings: ExecutionWarning[];
};

/** Infrastructure only — environment (ADR-007 §4.5). No feature state accumulates here. */
export type ExecutionEnvironment = {
  executionId: string;
  canvas: { format?: FormatName; width: number; height: number; fps: number };
  locale?: string; // reserved
};

/** Infrastructure only — the resolvers the pipeline calls. */
export type ExecutionRegistries = {
  templates: TemplateResolver;
  scenes: SceneResolver;
  transitions: TransitionResolver;
  assets: AssetRegistry;
  brands: BrandRegistry;
  parameterTypes?: ParameterTypeResolver;
  validators?: ValidatorResolver;
};

/**
 * The immutable resolved environment. `environment` is a `DeepReadonly` view (plain data);
 * `registries` is a shallow `Readonly` container of LIVE resolver singletons — deliberately not
 * deep-frozen (recursing into resolver methods would strip their call signatures). Runtime enforces
 * a top-level `Object.freeze` of the container, environment, canvas, and the registries container.
 */
export type ExecutionContext = {
  readonly environment: DeepReadonly<ExecutionEnvironment>;
  readonly registries: Readonly<ExecutionRegistries>;
};

/** Caller-facing options: partial registries + a deterministic, overridable execution id. Canvas is derived. */
export type ExecutionInput = {
  registries?: Partial<ExecutionRegistries>;
  executionId?: string;
  locale?: string; // reserved
};

/** The result — `composition` is opaque; `schema` is config-shaped and NOT guaranteed serializable. */
export type ExecutionResult =
  | { ok: true; composition: BuiltComposition; schema: CompositionSchemaBase; report: ExecutionReport }
  | { ok: false; schema?: CompositionSchemaBase; report: ExecutionReport };
