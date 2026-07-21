/**
 * execution/report — the APPEND-ONLY report accumulator (ADR-007 §4.6).
 *
 * Stages may append spans, issues, and warnings; no stage may modify or remove diagnostics produced
 * by an earlier stage (there are no mutate/remove methods). The report is deterministic and
 * JSON-safe: no timestamps, durations, stacks, random ids, or addresses. `expected`/`actual` are
 * already `DiagnosticValue` (from `DomainError`) or sanitized before being appended.
 */

import { sanitize, type DiagnosticValue } from "../errors";
import { type ParameterIssue } from "../parameters";
import { EXECUTION_STAGES, type ExecutionStage } from "./stages";
import { type ExecutionIssue, type ExecutionReport, type ExecutionSpan, type ExecutionWarning } from "./types";

/** A JSON-safe diagnostic body appended to an issue/warning. */
export type DiagnosticBody = { code: string; message: string; path?: string; expected?: DiagnosticValue; actual?: DiagnosticValue };

export type ReportBuilder = {
  ok(stage: ExecutionStage, note?: string, counts?: Record<string, number>): void;
  skipped(stage: ExecutionStage, note?: string): void;
  /** Mark `stage` failed and append `skipped` (note "halted") for every later stage. */
  failStage(stage: ExecutionStage): void;
  issue(stage: ExecutionStage, body: DiagnosticBody): void;
  warnParams(stage: ExecutionStage, issues: ParameterIssue[]): void;
  issueParams(stage: ExecutionStage, issues: ParameterIssue[]): void;
  build(): ExecutionReport;
};

const paramToDiagnostic = (stage: ExecutionStage, p: ParameterIssue): ExecutionIssue => ({
  stage,
  severity: "error",
  code: p.code,
  message: p.message,
  ...(p.path !== undefined ? { path: p.path } : {}),
  ...(p.expected !== undefined ? { expected: sanitize(p.expected) } : {}),
  ...(p.actual !== undefined ? { actual: sanitize(p.actual) } : {}),
});

/** Create an append-only report builder. */
export const createReport = (executionId: string): ReportBuilder => {
  const trace: ExecutionSpan[] = [];
  const issues: ExecutionIssue[] = [];
  const warnings: ExecutionWarning[] = [];

  return {
    ok: (stage, note, counts) => {
      trace.push({ stage, status: "ok", ...(note !== undefined ? { note } : {}), ...(counts !== undefined ? { counts } : {}) });
    },
    skipped: (stage, note) => {
      trace.push({ stage, status: "skipped", ...(note !== undefined ? { note } : {}) });
    },
    failStage: (stage) => {
      trace.push({ stage, status: "failed" });
      const from = EXECUTION_STAGES.indexOf(stage);
      for (let i = from + 1; i < EXECUTION_STAGES.length; i += 1) {
        trace.push({ stage: EXECUTION_STAGES[i], status: "skipped", note: "halted" });
      }
    },
    issue: (stage, body) => {
      issues.push({
        stage,
        severity: "error",
        code: body.code,
        message: body.message,
        ...(body.path !== undefined ? { path: body.path } : {}),
        ...(body.expected !== undefined ? { expected: body.expected } : {}),
        ...(body.actual !== undefined ? { actual: body.actual } : {}),
      });
    },
    warnParams: (stage, ps) => {
      ps.forEach((p) => warnings.push({ ...paramToDiagnostic(stage, p), severity: "warning" }));
    },
    issueParams: (stage, ps) => {
      ps.forEach((p) => issues.push(paramToDiagnostic(stage, p)));
    },
    build: () => ({ executionId, trace, issues, warnings }),
  };
};
