/**
 * contracts/ — the neutral protocol layer (ADR-008).
 *
 * The single canonical home for the types shared across top-level consumers: the execution request,
 * the framework registries bundle, the registry-family names, and the stage-parameterized diagnostic
 * protocol. `execution`, `requests`, and `metadata` consume these; `Result` lives in `errors`.
 *
 * Types + ONE runtime utility (`resolveRegistries`, the canonical registries default-fill). Depends
 * downward on the family modules + `errors`; nothing in those imports it, so there is no cycle.
 * Consumers that import types alone (e.g. `requests`) stay weightless — type imports are elided.
 */

export { type FrameworkRegistries, type RegistryFamily } from "./registries";
export { type ExecutionRequest } from "./request";
export { type Diagnostic, type Issue, type Warning, type Span, type Report } from "./diagnostics";
export { resolveRegistries } from "./resolveRegistries";
