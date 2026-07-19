/**
 * errors/DomainError — the framework's expected-error type + the JSON-safe diagnostic value (ADR-007).
 *
 * `DomainError` is intentionally TINY: `code`, `message`, and the optional `path`/`expected`/
 * `actual`/`cause`. It carries NO `stage` — the execution layer assigns the stage from the catch
 * site. It extends `Error`, so existing `catch (Error)` callers and messages are unchanged; the
 * Execution Engine catches it (expected) and rethrows everything else (unexpected bugs).
 *
 * `DiagnosticValue` is the JSON-safe value type diagnostics use — see `sanitize()`.
 */

/** A JSON-safe value — the only shape allowed in a serializable diagnostic. */
export type DiagnosticValue = string | number | boolean | null | DiagnosticValue[] | { [key: string]: DiagnosticValue };

/** Fields of a `DomainError` — the whole surface (nothing more). */
export type DomainErrorInit = {
  code: string;
  message: string;
  path?: string;
  expected?: DiagnosticValue;
  actual?: DiagnosticValue;
  cause?: unknown;
};

/** An expected domain/configuration failure. Extends `Error`; classified (not rethrown) by `execute`. */
export class DomainError extends Error {
  readonly code: string;
  readonly path?: string;
  readonly expected?: DiagnosticValue;
  readonly actual?: DiagnosticValue;
  readonly cause?: unknown;

  constructor(init: DomainErrorInit) {
    super(init.message);
    this.name = "DomainError";
    this.code = init.code;
    this.path = init.path;
    this.expected = init.expected;
    this.actual = init.actual;
    this.cause = init.cause;
    // Preserve `instanceof DomainError` across the ES2018 down-level of `extends Error`.
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}
