/**
 * lib — the package's library entry (Phase 28: packaging).
 *
 * SIDE-EFFECT FREE BY CONSTRUCTION. Importing this module must never register a Remotion root,
 * load fonts, mount compositions, touch the DOM, or mutate global state. The application entry
 * (`src/index.ts`, which calls `registerRoot`) is deliberately NOT the package entry.
 *
 * Scope is intentionally MINIMAL for this phase — only the modules that are provably free of
 * import-time side effects: `errors`, `registry`, and the Request Processing front-end. The full
 * public surface (execution, metadata, templates, parameters, composition) is Phase 29 work; those
 * layers currently reach `config/fonts` transitively, whose module scope starts font loading on
 * import, so exposing them here would break the entry-safety guarantee above.
 */

// ── errors: DomainError + JSON-safe diagnostics + Result (zero dependencies) ──────────────────
export { DomainError, sanitize, ok, err } from "./errors";
export type { DiagnosticValue, DomainErrorInit, Result } from "./errors";

// ── registry: the generic registry kernel ─────────────────────────────────────────────────────
export { createRegistry } from "./registry";
export type { Registry, DefinitionMap } from "./registry";

// ── requests: the untrusted-input front-end (syntax, versioning, normalization) ────────────────
export { processRequest, processRequestOrThrow, CURRENT_REQUEST_VERSION } from "./requests";
export type {
  RawInput,
  RawExecutionRequest,
  RequestEnvelope,
  NormalizedExecutionRequest,
  RequestStage,
  RequestIssue,
  RequestWarning,
  RequestSpan,
  RequestReport,
  RequestResult,
  RequestContext,
  RequestSchemaVersion,
  Migration,
} from "./requests";
