/**
 * requests/ — the Request Processing Pipeline (ADR-008, Phase 25 MVP).
 *
 * The untrusted-input front-end: `processRequest` converts arbitrary JSON into a guaranteed-valid,
 * guaranteed-serializable `ExecutionRequest` via parse → migrate → validate-envelope → normalize →
 * apply-defaults, returning a `Result` with an append-only, deterministic `RequestReport`.
 *
 * Architectural invariant (ADR-008 §4.1): this layer owns SYNTAX only — structure, version,
 * normalization, JSON-safety. It accesses NO registry and performs NO semantic validation, defaults,
 * rendering, or execution. Execution owns all semantics. Depends downward on `contracts`, `errors`,
 * `registry` (kernel), and family *types*; nothing imports it except the composing app.
 */

export { processRequest, processRequestOrThrow } from "./process";
export { CURRENT_REQUEST_VERSION, migrationRegistry } from "./version";
export { findNonJsonPath } from "./jsonSafety";
export type {
  RawInput,
  RawExecutionRequest,
  RequestSchemaVersion,
  NormalizedExecutionRequest,
  RequestStage,
  RequestIssue,
  RequestWarning,
  RequestSpan,
  RequestReport,
  RequestResult,
  Migration,
  MigrationMap,
  MigrationRegistry,
  RequestContext,
} from "./types";
