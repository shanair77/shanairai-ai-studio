/**
 * parameters/resolve — the validation + resolution engine (ADR-006 §4.5, §4.7).
 *
 * The explicit pipeline, per parameter, then schema-wide:
 *   Raw JSON → Type parse → Type validation → Default resolution
 *            → Template constraints → Named validators → Conditional rules → ResolvedParameters
 *
 * Result-based (collect ALL issues; no control-flow-by-exception). `validateParameters` returns
 * the issue list; `resolveParameters` returns a `Result`; `resolveParametersOrThrow` is the
 * build-path convenience. Resolved params are deeply frozen — `build()` must not mutate them.
 */

import { err, ok, type Result } from "../errors";
import { parameterTypeRegistry } from "./ParameterTypeRegistry";
import { validatorRegistry } from "./validators";
import {
  type DeepReadonly,
  type ParameterCondition,
  type ParameterContext,
  type ParameterDefinition,
  type ParameterIssue,
  type ParameterSchema,
  type ParameterTypeName,
  type ParameterTypeResolver,
  type ParameterValue,
  type ResolvedParameters,
  type ValidatorResolver,
} from "./types";

/** The "type default" precedence tier (ADR-006 §4.12) — the type's zero value where one is safe. */
const TYPE_DEFAULTS: Partial<Record<ParameterTypeName, ParameterValue>> = { boolean: false };

const isObject = (v: unknown): v is Record<string, ParameterValue> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isMultiple = (value: number, step: number): boolean =>
  Math.abs(value / step - Math.round(value / step)) < 1e-9;

/** Evaluate a V1 condition against the resolved-so-far values (ADR-006 §4.8). */
const evalCondition = (c: ParameterCondition, values: Record<string, ParameterValue>): boolean => {
  if ("all" in c) return c.all.every((x) => evalCondition(x, values));
  if ("any" in c) return c.any.some((x) => evalCondition(x, values));
  if ("not" in c) return !evalCondition(c.not, values);
  if ("equals" in c) return values[c.key] === c.equals;
  if ("in" in c) return c.in.includes(values[c.key] as ParameterValue);
  if ("exists" in c) return (values[c.key] !== undefined) === c.exists;
  return false;
};

const deepFreeze = <T>(o: T): T => {
  if (o && typeof o === "object") {
    Object.values(o as Record<string, unknown>).forEach((v) => deepFreeze(v));
    Object.freeze(o);
  }
  return o;
};

/** Stage 4: template constraints (min/max/step/pattern/enum/list). Pushes issues. */
const applyConstraints = (
  def: ParameterDefinition,
  value: ParameterValue,
  ctx: ParameterContext,
  issues: ParameterIssue[],
  path: string,
  types: ParameterTypeResolver,
): void => {
  const c = def.constraints;

  // enum membership (any parameter carrying an enum/options list)
  if (c?.enum || c?.options) {
    const allowed = c.options ? c.options.map((o) => o.value) : (c.enum ?? []);
    if (!allowed.includes(value)) {
      issues.push({ path, code: "enum", severity: "error", message: `"${String(value)}" is not an allowed value.`, expected: allowed, actual: value });
    }
  }

  if (def.type === "number" && typeof value === "number") {
    if (c?.min !== undefined && value < c.min) issues.push({ path, code: "min", severity: "error", message: `Must be ≥ ${c.min}.`, expected: c.min, actual: value });
    if (c?.max !== undefined && value > c.max) issues.push({ path, code: "max", severity: "error", message: `Must be ≤ ${c.max}.`, expected: c.max, actual: value });
    if (c?.step !== undefined && c.step > 0 && !isMultiple(value, c.step)) issues.push({ path, code: "step", severity: "error", message: `Must be a multiple of ${c.step}.`, expected: c.step, actual: value });
  }

  if ((def.type === "string" || def.type === "text" || def.type === "url") && typeof value === "string") {
    if (c?.min !== undefined && value.length < c.min) issues.push({ path, code: "minLength", severity: "error", message: `Must be at least ${c.min} characters.`, expected: c.min, actual: value.length });
    if (c?.max !== undefined && value.length > c.max) issues.push({ path, code: "maxLength", severity: "error", message: `Must be at most ${c.max} characters.`, expected: c.max, actual: value.length });
    if (c?.pattern) {
      let re: RegExp | undefined;
      try { re = new RegExp(c.pattern); } catch { /* invalid regex is an authoring bug; ignore */ }
      if (re && !re.test(value)) issues.push({ path, code: "pattern", severity: "error", message: `Does not match ${c.pattern}.`, expected: c.pattern, actual: value });
    }
  }

  if (def.type === "list" && Array.isArray(value)) {
    if (c?.min !== undefined && value.length < c.min) issues.push({ path, code: "minItems", severity: "error", message: `Must have at least ${c.min} items.`, expected: c.min, actual: value.length });
    if (c?.max !== undefined && value.length > c.max) issues.push({ path, code: "maxItems", severity: "error", message: `Must have at most ${c.max} items.`, expected: c.max, actual: value.length });
    if (c?.itemType) {
      const itemName = c.itemType;
      const itemDef: ParameterDefinition = { key: "", type: itemName };
      value.forEach((item, i) => {
        const ipath = `${path}[${i}]`;
        if (!types.has(itemName)) return;
        const t = types.require(itemName);
        try {
          const parsed = t.parse(item, itemDef, ctx) as ParameterValue;
          t.validate?.(parsed, itemDef, ctx, issues, ipath);
        } catch {
          issues.push({ path: ipath, code: "invalid-type", severity: "error", message: `Expected ${itemName}.`, expected: itemName, actual: item });
        }
      });
    }
  }
};

/** Stages 1–5 for one object level (used at the top level and, recursively, for `group` fields). */
const resolveLevel = (
  defs: ParameterDefinition[],
  values: Record<string, ParameterValue>,
  ctx: ParameterContext,
  issues: ParameterIssue[],
  base: string,
  types: ParameterTypeResolver,
  validators: ValidatorResolver,
): Record<string, ParameterValue> => {
  const resolved: Record<string, ParameterValue> = {};

  for (const def of defs) {
    const path = base ? `${base}.${def.key}` : def.key;
    const provided = Object.prototype.hasOwnProperty.call(values, def.key) && values[def.key] !== undefined;

    if (!provided) {
      // Stage 3: default resolution — parameter default, then type default.
      const d = def.default !== undefined ? def.default : TYPE_DEFAULTS[def.type];
      if (d !== undefined) resolved[def.key] = d;
      continue;
    }

    if (!types.has(def.type)) {
      issues.push({ path, code: "unknown-type", severity: "error", message: `Unknown parameter type "${def.type}".` });
      continue;
    }
    const typeDef = types.require(def.type);

    // Stage 1: type parse.
    let value: ParameterValue;
    try {
      value = typeDef.parse(values[def.key], def, ctx) as ParameterValue;
    } catch {
      issues.push({ path, code: "invalid-type", severity: "error", message: `Expected ${def.type}.`, expected: def.type, actual: values[def.key] });
      continue;
    }

    // Stage 2: type validation.
    typeDef.validate?.(value, def, ctx, issues, path);

    if (def.type === "group" && isObject(value)) {
      // Structural nesting (the only value nesting) — recurse.
      resolved[def.key] = resolveLevel(def.constraints?.fields ?? [], value, ctx, issues, path, types, validators);
      continue;
    }

    // Stage 4: template constraints.
    applyConstraints(def, value, ctx, issues, path, types);

    // Stage 5: named validators (referenced by name; no closures).
    for (const name of def.validators ?? []) {
      if (!validators.has(name)) {
        issues.push({ path, code: "unknown-validator", severity: "error", message: `No validator registered as "${name}".` });
        continue;
      }
      validators.require(name)(value, def, ctx, issues, path);
    }

    resolved[def.key] = value;
  }

  // Stage 6: conditional rules — required (static + requiredWhen), gated by visibleWhen.
  for (const def of defs) {
    const path = base ? `${base}.${def.key}` : def.key;
    const visible = def.conditions?.visibleWhen ? evalCondition(def.conditions.visibleWhen, resolved) : true;
    const required =
      visible && (def.required === true || (def.conditions?.requiredWhen ? evalCondition(def.conditions.requiredWhen, resolved) : false));
    if (required && resolved[def.key] === undefined) {
      issues.push({ path, code: "required", severity: "error", message: `"${def.key}" is required.` });
    }
  }

  return resolved;
};

const run = (
  schema: ParameterSchema,
  values: Record<string, ParameterValue>,
  ctx: ParameterContext,
): { resolved: Record<string, ParameterValue>; issues: ParameterIssue[] } => {
  const issues: ParameterIssue[] = [];
  const types = ctx.types ?? parameterTypeRegistry;
  const validators = ctx.validators ?? validatorRegistry;
  const resolved = resolveLevel(schema.parameters, values, ctx, issues, "", types, validators);
  return { resolved, issues };
};

/** Non-throwing: the full issue list (empty = valid). For forms / CLIs / AI slot-filling. */
export const validateParameters = (
  schema: ParameterSchema,
  values: Record<string, ParameterValue>,
  ctx: ParameterContext = {},
): ParameterIssue[] => run(schema, values, ctx).issues;

/** Result-based: `ok` with deeply-frozen resolved params, or `err` with the error issues. */
export const resolveParameters = (
  schema: ParameterSchema,
  values: Record<string, ParameterValue>,
  ctx: ParameterContext = {},
): Result<DeepReadonly<ResolvedParameters>, ParameterIssue[]> => {
  const { resolved, issues } = run(schema, values, ctx);
  const errors = issues.filter((i) => i.severity === "error");
  if (errors.length > 0) return err(issues);
  return ok(deepFreeze(resolved) as DeepReadonly<ResolvedParameters>);
};

/** Throwing convenience for the build path (mirrors `validateComposition`). */
export const resolveParametersOrThrow = (
  schema: ParameterSchema,
  values: Record<string, ParameterValue>,
  ctx: ParameterContext = {},
): DeepReadonly<ResolvedParameters> => {
  const result = resolveParameters(schema, values, ctx);
  if (!result.ok) {
    const detail = result.errors.map((i) => ` - [${i.code}] ${i.path}: ${i.message}`).join("\n");
    throw new Error(`Parameter validation failed:\n${detail}`);
  }
  return result.value;
};
