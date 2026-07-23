/**
 * compiler/ — the SDK's registry-bound entry point (Phase S2).
 *
 * `createCompiler(config)` binds a set of registries and returns a `{ compile, describe }` instance:
 * `compile` guards structural sanity, delegates to the canonical `execute`, and projects a
 * schema-free `CompileResult`; `describe` reflects the same registries via `describeFramework`. The
 * compiler adds no semantics of its own — it binds, guards, delegates, projects, and describes.
 *
 * This barrel is INTERNAL for Phase S2: nothing re-exports it from the package entry (`lib.ts`).
 * Public exposure — alongside the `define*` authoring renames — is Phase S3.
 */

export { createCompiler } from "./compiler";
export type { CompilerConfig, CompileRequest, CompileResult, Compiler } from "./types";
