/**
 * requests/report — the APPEND-ONLY request report accumulator (ADR-008 §4.6).
 *
 * Mirrors the execution report discipline: stages append spans/issues/warnings; nothing modifies or
 * removes an earlier diagnostic (no mutate/remove methods). Deterministic + JSON-safe: no timestamps,
 * durations, stacks, random ids, or addresses. `requestId`/`fromVersion` are report metadata (not
 * diagnostics) supplied at `build`.
 */

import { type RequestIssue, type RequestReport, type RequestSchemaVersion, type RequestSpan, type RequestStage, type RequestWarning } from "./types";

const STAGES: RequestStage[] = ["parse", "migrate", "validate-envelope", "normalize", "apply-defaults", "complete"];

/** A JSON-safe diagnostic body appended to an issue/warning. */
export type DiagnosticBody = { code: string; message: string; path?: string; expected?: RequestIssue["expected"]; actual?: RequestIssue["actual"] };

export type RequestReportBuilder = {
  ok(stage: RequestStage, note?: string): void;
  skipped(stage: RequestStage, note?: string): void;
  /** Mark `stage` failed and append `skipped` (note "halted") for every later stage. */
  failStage(stage: RequestStage): void;
  issue(stage: RequestStage, body: DiagnosticBody): void;
  warning(stage: RequestStage, body: DiagnosticBody): void;
  build(requestId: string, fromVersion?: RequestSchemaVersion): RequestReport;
};

const push = (list: (RequestIssue | RequestWarning)[], stage: RequestStage, severity: "error" | "warning", body: DiagnosticBody): void => {
  list.push({
    stage,
    severity,
    code: body.code,
    message: body.message,
    ...(body.path !== undefined ? { path: body.path } : {}),
    ...(body.expected !== undefined ? { expected: body.expected } : {}),
    ...(body.actual !== undefined ? { actual: body.actual } : {}),
  } as RequestIssue | RequestWarning);
};

/** Create an append-only request report builder for a target version. */
export const createReport = (toVersion: RequestSchemaVersion): RequestReportBuilder => {
  const trace: RequestSpan[] = [];
  const issues: RequestIssue[] = [];
  const warnings: RequestWarning[] = [];

  return {
    ok: (stage, note) => { trace.push({ stage, status: "ok", ...(note !== undefined ? { note } : {}) }); },
    skipped: (stage, note) => { trace.push({ stage, status: "skipped", ...(note !== undefined ? { note } : {}) }); },
    failStage: (stage) => {
      trace.push({ stage, status: "failed" });
      const from = STAGES.indexOf(stage);
      for (let i = from + 1; i < STAGES.length; i += 1) trace.push({ stage: STAGES[i], status: "skipped", note: "halted" });
    },
    issue: (stage, body) => push(issues, stage, "error", body),
    warning: (stage, body) => push(warnings, stage, "warning", body),
    build: (requestId, fromVersion) => ({ requestId, toVersion, ...(fromVersion !== undefined ? { fromVersion } : {}), trace, issues, warnings }),
  };
};
