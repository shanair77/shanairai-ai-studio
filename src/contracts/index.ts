/**
 * contracts/ — the neutral protocol layer (ADR-008).
 *
 * The single canonical home for the types shared across top-level consumers: the execution request,
 * the framework registries bundle, the registry-family names, and the stage-parameterized diagnostic
 * protocol. `execution`, `requests`, and `metadata` consume these; `Result` lives in `errors`.
 *
 * Type-only. Depends downward on the family type modules + `errors`; nothing in those imports it, so
 * there is no cycle. No runtime, no React.
 */

export { type FrameworkRegistries, type RegistryFamily } from "./registries";
export { type ExecutionRequest } from "./request";
export { type Diagnostic, type Issue, type Warning, type Span, type Report } from "./diagnostics";
