/**
 * execution/stages — the SINGLE source of truth for the pipeline's stage vocabulary and order.
 *
 * `EXECUTION_STAGES` is the ordered list; `ExecutionStage` is derived from it, so the vocabulary
 * cannot drift from the order (previously the union and the array were maintained independently,
 * and a stage missing from the array silently stopped being marked skipped after a halt).
 *
 * This is data, not a pipeline description: `execute()` remains an imperative sequencer (ADR-007
 * amendment). The list exists so the report builder knows what follows a failure, and so a test can
 * assert the implementation's real trace matches it. Internal to `execution` — not re-exported.
 */

export const EXECUTION_STAGES = [
  "resolve-template",
  "check-template-capabilities",
  "resolve-parameters",
  "validate-template-params",
  "run-template",
  "validate-template-output",
  "resolve-template-defaults",
  "build-composition",
  "complete",
] as const;

/** The ordered, real pipeline stages (ADR-007 §4.3) — derived from `EXECUTION_STAGES`. */
export type ExecutionStage = (typeof EXECUTION_STAGES)[number];
