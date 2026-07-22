/**
 * execution/execute — the orchestration entry points (ADR-007).
 *
 * `execute` sequences the existing engines' PUBLIC pure helpers through the nine real stages and
 * returns an `ExecutionResult` with an append-only report. It never throws for expected failures; it
 * classifies `DomainError` + template-`build`/`validate` throws into issues and RETHROWS every other
 * error (framework bugs are never masked). It owns sequencing/classification/aggregation/reporting
 * only — no validation rules, defaults, template/composition semantics, or rendering. No React.
 */

import { DomainError, sanitize } from "../errors";
import { buildComposition, type BuiltComposition } from "../composition";
import { type ParameterContext } from "../parameters";
import { validateParameterSchema } from "../parameters/schema";
import {
  assembleTemplateSchema,
  checkTemplateCapabilities,
  resolveTemplate,
  resolveTemplateCanvas,
  resolveTemplateParameters,
  runTemplate,
  validateTemplateOutput,
  type TemplateCompositionFor,
  type TemplateMap,
} from "../templates";
import { resolveRegistries } from "../contracts";
import { createExecutionContext, deriveExecutionId } from "./context";
import { createReport, type DiagnosticBody } from "./report";
import {
  type ExecutionInput,
  type ExecutionRequest,
  type ExecutionResult,
  type ExecutionStage,
  type TypedExecutionInput,
} from "./types";

/**
 * Classify a thrown value at a stage. `DomainError` → its own code. A throw at a USER-code stage
 * (`validate-template-params` / `run-template`) → a distinct code with the sanitized cause. Any
 * other error at any other stage is UNEXPECTED and rethrown.
 */
const classify = (error: unknown, stage: ExecutionStage): DiagnosticBody => {
  if (error instanceof DomainError) {
    return {
      code: error.code,
      message: error.message,
      ...(error.path !== undefined ? { path: error.path } : {}),
      ...(error.expected !== undefined ? { expected: error.expected } : {}),
      ...(error.actual !== undefined ? { actual: error.actual } : {}),
    };
  }
  const message = error instanceof Error ? error.message : String(error);
  const cause = sanitize(error instanceof Error ? { name: error.name, message: error.message } : error);
  if (stage === "validate-template-params") return { code: "template-validation-error", message, actual: cause };
  if (stage === "run-template") return { code: "template-build-error", message, actual: cause };
  throw error; // unexpected — never masked
};

/** Orchestrate a template request into a composition + diagnostics. Never throws for expected failures. */
export function execute(request: ExecutionRequest, input: ExecutionInput = {}): ExecutionResult {
  const registries = resolveRegistries(input.registries);
  const executionId = input.executionId ?? deriveExecutionId(request?.id);
  const report = createReport(executionId);

  // Stage 1 — resolve-template
  let template: ReturnType<typeof resolveTemplate>;
  try {
    template = resolveTemplate(request, registries.templates);
  } catch (error) {
    report.issue("resolve-template", classify(error, "resolve-template"));
    report.failStage("resolve-template");
    return { ok: false, report: report.build() };
  }
  report.ok("resolve-template", request.template);

  const { videoInput, ctx: templateCtx } = resolveTemplateCanvas(request, template);
  const context = createExecutionContext(
    { executionId, canvas: { format: videoInput.format, width: templateCtx.width, height: templateCtx.height, fps: templateCtx.fps }, locale: input.locale },
    registries,
  );

  // The parameter context is built once here and reused by Stage 2 (schema well-formedness) and
  // Stage 3 (caller-value resolution), so both check against the SAME resolved registries.
  const paramCtx: ParameterContext = {
    assets: context.registries.assets,
    brands: context.registries.brands,
    types: context.registries.parameterTypes,
    validators: context.registries.validators,
  };

  // Stage 2 — check-template-capabilities (capabilities + schema well-formedness). A default that
  // violates its own parameter is a TEMPLATE defect, caught here before any caller value is resolved,
  // so it is attributed to the template rather than the caller (ADR-006 §13.1).
  try {
    checkTemplateCapabilities(template, request);
  } catch (error) {
    report.issue("check-template-capabilities", classify(error, "check-template-capabilities"));
    report.failStage("check-template-capabilities");
    return { ok: false, report: report.build() };
  }
  const schemaIssues = validateParameterSchema(template.parameters, paramCtx);
  if (schemaIssues.length > 0) {
    report.issueParams("check-template-capabilities", schemaIssues);
    report.failStage("check-template-capabilities");
    return { ok: false, report: report.build() };
  }
  report.ok("check-template-capabilities");

  // Stage 3 — resolve-parameters (skipped when the template declares no schema). Only CALLER-supplied
  // values are validated here; declared defaults were already validated at Stage 2, so no default is
  // re-validated on this path.
  let params = request.params;
  if (!template.parameters) {
    report.skipped("resolve-parameters", "no schema");
  } else {
    const resolved = resolveTemplateParameters(template, request.params, paramCtx);
    if (resolved.warnings.length > 0) report.warnParams("resolve-parameters", resolved.warnings);
    if (!resolved.ok) {
      report.issueParams("resolve-parameters", resolved.issues);
      report.failStage("resolve-parameters");
      return { ok: false, report: report.build() };
    }
    params = resolved.params;
    report.ok("resolve-parameters", undefined, { parameters: Object.keys(params).length, warnings: resolved.warnings.length });
  }

  // Stage 4 — validate-template-params (skipped when the template declares no validate hook)
  if (!template.validate) {
    report.skipped("validate-template-params", "no validate");
  } else {
    try {
      template.validate(params);
      report.ok("validate-template-params");
    } catch (error) {
      report.issue("validate-template-params", classify(error, "validate-template-params"));
      report.failStage("validate-template-params");
      return { ok: false, report: report.build() };
    }
  }

  // Stage 5 — run-template
  let output: ReturnType<typeof runTemplate>;
  try {
    output = runTemplate(template, params, templateCtx);
  } catch (error) {
    report.issue("run-template", classify(error, "run-template"));
    report.failStage("run-template");
    return { ok: false, report: report.build() };
  }
  // No metrics here: `output` is still UNVALIDATED, and reading `output.scenes.length` before
  // stage 6 crashed `execute()` with a raw TypeError for a malformed template. Counts are
  // reported by stage 6, once the shape is known to be good.
  report.ok("run-template");

  // Stage 6 — validate-template-output
  try {
    validateTemplateOutput(template, output);
    report.ok("validate-template-output", undefined, { scenes: output.scenes.length });
  } catch (error) {
    report.issue("validate-template-output", classify(error, "validate-template-output"));
    report.failStage("validate-template-output");
    return { ok: false, report: report.build() };
  }

  // Stage 7 — resolve-template-defaults (assemble the schema)
  const schema = assembleTemplateSchema(request, videoInput, output);
  report.ok("resolve-template-defaults");

  // Stage 8 — build-composition
  let composition: BuiltComposition;
  try {
    composition = buildComposition(schema, context.registries.scenes, context.registries.transitions, context.registries.assets, context.registries.brands);
  } catch (error) {
    report.issue("build-composition", classify(error, "build-composition"));
    report.failStage("build-composition");
    return { ok: false, schema, report: report.build() };
  }
  report.ok("build-composition");

  // Stage 9 — complete
  report.ok("complete");
  return { ok: true, composition, schema, report: report.build() };
}

/**
 * Throwing convenience for simple callers — a façade over `execute`, NOT a second orchestrator.
 * All sequencing lives in `execute`; this only converts a failed report into an exception.
 */
export function executeOrThrow(request: ExecutionRequest, input: ExecutionInput = {}): BuiltComposition {
  const result = execute(request, input);
  if (!result.ok) {
    const detail = result.report.issues
      .map((i) => ` - [${i.code}] ${i.stage}${i.path !== undefined ? ` (${i.path})` : ""}: ${i.message}`)
      .join("\n");
    throw new Error(`Execution failed:\n${detail}`);
  }
  return result.composition;
}

// ── Typed entry points ───────────────────────────────────────────────────────────────────────
/**
 * `executeTyped` / `executeTypedOrThrow` are the TYPED views of the two entry points above — the
 * compile-time inference that previously lived on `buildFromTemplate` (ADR-005 §4.8).
 *
 * Supplying a concrete `Registry<M>` as `input.registries.templates` infers `M`, so the request's
 * `template` name and `params` are checked against that registry. They are declared as separate
 * functions rather than overloads of `execute` deliberately: an erased overload
 * (`request: ExecutionRequest`) structurally accepts any `{ template: string; params }`, so a
 * mismatched call would silently fall through to it instead of failing to compile. With no erased
 * fallback in scope, a bad template name or param shape is a compile error.
 *
 * They add NO sequencing — both delegate straight to the canonical orchestrator.
 */
export function executeTyped<M extends TemplateMap>(
  request: TemplateCompositionFor<M>,
  input: TypedExecutionInput<M>,
): ExecutionResult {
  return execute(request, input);
}

export function executeTypedOrThrow<M extends TemplateMap>(
  request: TemplateCompositionFor<M>,
  input: TypedExecutionInput<M>,
): BuiltComposition {
  return executeOrThrow(request, input);
}
