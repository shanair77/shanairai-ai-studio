/**
 * errors/Result — the framework's tiny Result primitive.
 *
 * A domain-free `{ ok } | { errors }` union used at layer boundaries (parameters, execution,
 * requests) to collect ALL problems without control-flow-by-exception. It lives in the
 * zero-dependency `errors` module so every layer can share ONE canonical `Result` (relocated here
 * from `parameters` in Phase 25; the `parameters` barrel re-exports it for back-compat).
 */

export type Result<T, E> = { ok: true; value: T } | { ok: false; errors: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(errors: E): Result<never, E> => ({ ok: false, errors });
