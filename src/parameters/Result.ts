/**
 * parameters/Result — a tiny Result type for the parameter engine.
 *
 * The engine works in `Result` (collect ALL issues; no control-flow-by-exception) so forms, CLIs,
 * and AI slot-filling can surface every problem at once. A throwing helper is layered on top for
 * the build path (ADR-006 §4.7).
 */

export type Result<T, E> = { ok: true; value: T } | { ok: false; errors: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(errors: E): Result<never, E> => ({ ok: false, errors });
