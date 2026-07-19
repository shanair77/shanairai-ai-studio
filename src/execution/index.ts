/**
 * execution/ — the Lifecycle & Execution Engine (ADR-007, Phase 23 MVP).
 *
 * A single orchestration IMPLEMENTATION reached by two public entry points: `buildFromTemplate`
 * (throwing, in `templates`) and `execute` (Result-based, here). `execute` sequences the existing
 * engines' public pure helpers through nine real stages and returns an append-only, deterministic,
 * JSON-safe `ExecutionReport`. It owns sequencing/classification/aggregation/reporting only.
 *
 * Boundaries (ADR-007 §4.4, §4.8): no validation rules, defaults, precedence, rendering, or
 * template/composition/parameter semantics; no React; imports downward on `templates`,
 * `composition`, `parameters` (types), and `errors`. Nothing imports this layer.
 */

// Public surface = the two entry points + the result/report/context TYPES. The context/report
// construction helpers (createExecutionContext, resolveRegistries, deriveExecutionId, createReport,
// …) are execution-internal and deliberately NOT re-exported.
export { execute, executeOrThrow } from "./execute";
export type {
  ExecutionRequest,
  ExecutionInput,
  ExecutionStage,
  ExecutionDiagnostic,
  ExecutionIssue,
  ExecutionWarning,
  ExecutionSpan,
  ExecutionReport,
  ExecutionEnvironment,
  ExecutionContext,
  ExecutionResult,
} from "./types";
// The registries bundle is now the canonical `FrameworkRegistries` from `contracts`.
export type { FrameworkRegistries } from "../contracts";
