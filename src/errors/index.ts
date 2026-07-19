/**
 * errors/ — the framework's expected-error primitives (ADR-007).
 *
 * Zero dependencies. `DomainError` marks an EXPECTED domain/configuration failure so the Execution
 * Engine can classify it (→ an issue) and rethrow everything else (unexpected bugs). `sanitize`
 * keeps diagnostics JSON-safe and deterministic. Imported by `registry`, `templates`, `composition`
 * (at their expected throw-sites) and by `execution`.
 */

export { DomainError, type DiagnosticValue, type DomainErrorInit } from "./DomainError";
export { sanitize } from "./sanitize";
export { type Result, ok, err } from "./Result";
