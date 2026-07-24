/**
 * compiler/compiler — `createCompiler`, the SDK's registry-bound entry point (Phase S2).
 *
 * A THIN wrapper over the existing engine — it adds NO compilation semantics. It binds content once
 * (compiler configuration EXTENDS the framework defaults; matching keys override builtins), then per
 * request it:
 *   1. GUARDS structural sanity (DR-S0): the request is an object with a string `template` and an
 *      object (or absent) `params`. This is the ONLY validation `compile` owns. It performs NO
 *      migration, normalization, version handling, defaults, or transport validation — those belong
 *      permanently to `processRequest`.
 *   2. DELEGATES to `execute`, the single canonical semantic orchestrator.
 *   3. PROJECTS the `ExecutionResult` to a schema-free `CompileResult`.
 * `describe()` reflects the SAME bound registries via `describeFramework`.
 *
 * `createReport` / `deriveExecutionId` are execution-INTERNAL helpers imported directly; using them
 * here does not make them public.
 */

import { assetRegistry } from "../assets";
import { brandRegistry } from "../brand";
import { sceneRegistry } from "../composition";
import { type FrameworkRegistries } from "../contracts";
import { sanitize } from "../errors";
import { execute } from "../execution";
import { createReport } from "../execution/report";
import { deriveExecutionId } from "../execution/context";
import { describeFramework } from "../metadata";
import { parameterTypeRegistry, validatorRegistry } from "../parameters";
import { templateRegistry, type TemplateMap } from "../templates";
import { transitionRegistry } from "../transitions";
import { type Compiler, type CompilerConfig, type CompileRequest, type CompileResult } from "./types";

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Structural sanity only (DR-S0). Returns the first violation's diagnostic, or null when sane. */
const structuralViolation = (
  request: unknown,
): { message: string; path?: string; actual: unknown } | null => {
  if (!isPlainObject(request)) return { message: "Request must be an object.", actual: request };
  if (typeof request.template !== "string")
    return { message: "Request `template` must be a string.", path: "template", actual: request.template };
  if (request.params !== undefined && !isPlainObject(request.params))
    return { message: "Request `params` must be an object.", path: "params", actual: request.params };
  return null;
};

/**
 * Layer a user map onto a framework default registry. EXTEND semantics: the default is the single
 * source of truth and the user's entries are merged on top, with matching keys overriding the
 * builtin. Uses the registry kernel's existing immutable `extend` — the framework singletons are
 * never mutated. An omitted family returns `undefined`, so the engine's own `resolveRegistries`
 * supplies the untouched default.
 */
const layer = <R extends { extend(entries: Record<string, never>): unknown }>(
  base: R,
  map: Record<string, unknown> | undefined,
): R => (map === undefined ? base : (base.extend(map as Record<string, never>) as R));

export function createCompiler<M extends TemplateMap>(config: CompilerConfig<M>): Compiler<M> {
  // Bind once. Every family follows ONE rule — provided entries extend the framework defaults.
  const registries: Partial<FrameworkRegistries> = {
    templates: layer(templateRegistry, config.templates),
    scenes: layer(sceneRegistry, config.scenes),
    transitions: layer(transitionRegistry, config.transitions),
    assets: layer(assetRegistry, config.assets),
    brands: layer(brandRegistry, config.brands),
    parameterTypes: layer(parameterTypeRegistry, config.parameterTypes),
    validators: layer(validatorRegistry, config.validators),
  };

  return {
    compile(request: CompileRequest<M>): CompileResult {
      const violation = structuralViolation(request);
      if (violation) {
        // Emit a failure report shaped exactly like an `execute` first-stage failure, so a guard
        // rejection is indistinguishable in structure from an engine rejection (only the code differs).
        const report = createReport(deriveExecutionId(isPlainObject(request) ? request.id : undefined));
        report.issue("resolve-template", {
          code: "invalid-request",
          message: violation.message,
          ...(violation.path !== undefined ? { path: violation.path } : {}),
          actual: sanitize(violation.actual),
        });
        report.failStage("resolve-template");
        return { ok: false, report: report.build() };
      }

      const result = execute(request, { registries });
      return result.ok
        ? { ok: true, composition: result.composition, report: result.report }
        : { ok: false, report: result.report };
    },
    describe: () => describeFramework(registries),
  };
}
