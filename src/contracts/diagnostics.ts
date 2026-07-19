/**
 * contracts/diagnostics — the canonical, stage-parameterized diagnostic protocol (ADR-008 §4.2).
 *
 * ONE shared shape for the append-only, JSON-safe reports produced by `execution`
 * (`Report<ExecutionStage>`) and `requests` (`Report<RequestStage>`). `expected`/`actual` are
 * `DiagnosticValue` (JSON-safe). Concrete layers parameterize `S` with their own stage union;
 * these generics are never duplicated.
 */

import { type DiagnosticValue } from "../errors";

/** A path-addressed, stage-tagged diagnostic. */
export type Diagnostic<S extends string> = {
  stage: S;
  code: string;
  message: string;
  path?: string;
  expected?: DiagnosticValue;
  actual?: DiagnosticValue;
};

export type Issue<S extends string> = Diagnostic<S> & { severity: "error" };
export type Warning<S extends string> = Diagnostic<S> & { severity: "warning" };

/** A trace span — describes WORK, not warnings. Chronological. */
export type Span<S extends string> = {
  stage: S;
  status: "ok" | "failed" | "skipped";
  note?: string;
  counts?: Record<string, number>;
};

/** The append-only diagnostic bundle (concrete layers add their own id/version fields). */
export type Report<S extends string> = {
  trace: Span<S>[];
  issues: Issue<S>[];
  warnings: Warning<S>[];
};
