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
import {
  assembleTemplateSchema,
  checkTemplateCapabilities,
  resolveTemplate,
  resolveTemplateCanvas,
  resolveTemplateParameters,
  runTemplate,
  validateTemplateOutput,
} from "../templates";
import { createExecutionContext, deriveExecutionId, resolveRegistries } from "./context";
import { createReport, type DiagnosticBody } from "./report";
import { type ExecutionInput, type ExecutionRequest, type ExecutionResult, type ExecutionStage } from "./types";

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

  // Stage 2 — check-template-capabilities
  try {
    checkTemplateCapabilities(template, request);
  } catch (error) {
    report.issue("check-template-capabilities", classify(error, "check-template-capabilities"));
    report.failStage("check-template-capabilities");
    return { ok: false, report: report.build() };
  }
  report.ok("check-template-capabilities");

  // Stage 3 — resolve-parameters (skipped when the template declares no schema)
  let params = request.params;
  if (!template.parameters) {
    report.skipped("resolve-parameters", "no schema");
  } else {
    const paramCtx: ParameterContext = {
      assets: context.registries.assets,
      brands: context.registries.brands,
      format: context.environment.canvas.format,
      types: context.registries.parameterTypes,
      validators: context.registries.validators,
    };
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
  report.ok("run-template", undefined, { scenes: output.scenes.length });

  // Stage 6 — validate-template-output
  try {
    validateTemplateOutput(template, output);
    report.ok("validate-template-output");
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

/** Throwing convenience for simple callers (mirrors `buildFromTemplate`). */
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
