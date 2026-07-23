/**
 * execution/ — the Lifecycle & Execution Engine (ADR-007, Phase 23 MVP).
 *
 * `execute` is the SINGLE canonical orchestrator: it sequences the other engines' public pure
 * helpers through nine real stages and returns an append-only, deterministic, JSON-safe
 * `ExecutionReport`. `executeOrThrow` is a throwing façade over it — not a second implementation,
 * and no other layer sequences the stages (enforced by `__tests__/single-orchestrator.test.ts`).
 * It owns sequencing/classification/aggregation/reporting only.
 *
 * The sequencer is deliberately IMPERATIVE (ADR-007 amendment): the stage set is closed and
 * non-homomorphic, so the ordering is typed heterogeneous data flow rather than a pipeline
 * description. Stage order/vocabulary live once in `./stages` (internal).
 *
 * Boundaries (ADR-007 §4.4, §4.8): no validation rules, defaults, precedence, rendering, or
 * template/composition/parameter semantics; no React; imports downward on `templates`,
 * `composition`, `parameters` (types), and `errors`. Nothing imports this layer.
 */

// Public surface = the entry points + the request/input/result/report TYPES. The context types
// (ExecutionContext, ExecutionEnvironment), the context/report construction helpers
// (createExecutionContext, deriveExecutionId, createReport), and the stage list (EXECUTION_STAGES)
// are execution-internal and deliberately NOT re-exported.
export { execute, executeOrThrow, executeTyped, executeTypedOrThrow } from "./execute";
export type {
  ExecutionRequest,
  ExecutionInput,
  TypedExecutionInput,
  ExecutionStage,
  ExecutionDiagnostic,
  ExecutionIssue,
  ExecutionWarning,
  ExecutionSpan,
  ExecutionReport,
  ExecutionResult,
} from "./types";
// The registries bundle is now the canonical `FrameworkRegistries` from `contracts`.
export type { FrameworkRegistries } from "../contracts";
