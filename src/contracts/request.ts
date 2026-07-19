/**
 * contracts/request — the canonical execution request contract (ADR-008 §4.2).
 *
 * `ExecutionRequest` is the ONE shared definition of what `requests` produces and `execution`
 * consumes. MVP is template-driven (an alias of `TemplateCompositionBase`); a future discriminated
 * union may add schema-direct execution.
 */

import { type TemplateCompositionBase } from "../templates";

/** The execution request — template-driven in MVP. */
export type ExecutionRequest = TemplateCompositionBase;
