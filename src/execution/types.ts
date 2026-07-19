/**
 * execution/types — the Lifecycle & Execution Engine's types (ADR-007, refactored onto contracts).
 *
 * The execution layer ORCHESTRATES the existing engines and produces diagnostics. It owns no
 * validation rules, defaults, precedence, rendering, or template/composition/parameter semantics.
 * It imports no React. The shared protocol (`ExecutionRequest`, `FrameworkRegistries`, the
 * `Diagnostic`/`Report` generics) lives in `contracts`; this module only parameterizes those
 * generics with the execution stage vocabulary and adds execution-specific infrastructure.
 */

import { type FormatName } from "../config/Layout";
import { type BuiltComposition, type CompositionSchemaBase } from "../composition";
import { type DeepReadonly } from "../parameters";
import {
  type Diagnostic,
  type ExecutionRequest as ContractExecutionRequest,
  type FrameworkRegistries,
  type Issue,
  type Report,
  type Span,
  type Warning,
} from "../contracts";

/** Re-export the canonical request contract under the execution name (single definition in contracts). */
export type ExecutionRequest = ContractExecutionRequest;

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

// Concrete diagnostics = the shared `contracts` generics parameterized by the execution stage.
export type ExecutionDiagnostic = Diagnostic<ExecutionStage>;
export type ExecutionIssue = Issue<ExecutionStage>;
export type ExecutionWarning = Warning<ExecutionStage>;
export type ExecutionSpan = Span<ExecutionStage>;

/** The append-only, deterministic, JSON-safe diagnostic bundle. */
export type ExecutionReport = Report<ExecutionStage> & { executionId: string };

/** Infrastructure only — environment (ADR-007 §4.5). No feature state accumulates here. */
export type ExecutionEnvironment = {
  executionId: string;
  canvas: { format?: FormatName; width: number; height: number; fps: number };
  locale?: string; // reserved
};

/**
 * The immutable resolved environment. `environment` is a `DeepReadonly` view (plain data);
 * `registries` is a shallow `Readonly` container of LIVE resolver singletons — deliberately not
 * deep-frozen (recursing into resolver methods would strip their call signatures). Runtime enforces
 * a top-level `Object.freeze` of the container, environment, canvas, and the registries container.
 */
export type ExecutionContext = {
  readonly environment: DeepReadonly<ExecutionEnvironment>;
  readonly registries: Readonly<FrameworkRegistries>;
};

/** Caller-facing options: partial registries + a deterministic, overridable execution id. Canvas is derived. */
export type ExecutionInput = {
  registries?: Partial<FrameworkRegistries>;
  executionId?: string;
  locale?: string; // reserved
};

/** The result — `composition` is opaque; `schema` is config-shaped and NOT guaranteed serializable. */
export type ExecutionResult =
  | { ok: true; composition: BuiltComposition; schema: CompositionSchemaBase; report: ExecutionReport }
  | { ok: false; schema?: CompositionSchemaBase; report: ExecutionReport };
