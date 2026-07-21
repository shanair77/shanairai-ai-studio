/**
 * parameters/schema — internal schema WELL-FORMEDNESS checker (ADR-006 §4.5, §13.7 item 4).
 *
 * A template's declared `default` values are part of the schema, not caller input. A default that
 * violates its own parameter's type, intrinsic validation, or constraints is a TEMPLATE AUTHORING
 * defect and must be caught before any caller data is considered — the Execution Engine runs this at
 * Stage 2 (`check-template-capabilities`), so an invalid default is attributed to the template, never
 * the caller (ADR-006 §13.1).
 *
 * INTERNAL. Not exported from `parameters/index.ts` or `lib.ts` — "reserve, don't build": external
 * schema-linting/CLI/IDE consumers do not exist yet. Framework code imports it via `../parameters/schema`.
 *
 * ── Architectural invariant: ONE implementation of parameter-validation semantics ──────────────
 * This module's ONLY job is to COLLECT template-declared defaults (top-level and nested `group`
 * fields) into the same caller-shaped value tree that `validateParameters()` already expects. It
 * performs NO parsing and NO validation of its own — it decides nothing about whether a value is
 * valid.
 *
 * All parsing, intrinsic type validation, constraint checking, group/list recursion, and
 * named-validator execution remain owned EXCLUSIVELY by `validateParameters()` / `resolveLevel()`
 * in `./resolve`. By shaping defaults into a value tree and handing it to that single engine, a
 * declared default is validated by exactly the same code path as a caller-supplied value.
 *
 * This is deliberate: it keeps ONE implementation of parameter-validation semantics. Do not move
 * any parse/validate/constraint logic into this file — doing so would fork the semantics and
 * reintroduce the duplication this design exists to prevent.
 */

import { validateParameters } from "./resolve";
import {
  type ParameterContext,
  type ParameterDefinition,
  type ParameterIssue,
  type ParameterSchema,
  type ParameterValue,
} from "./types";

const isPlainObject = (v: unknown): v is Record<string, ParameterValue> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Shape every declared default (top-level AND nested `group` fields) into a values tree, so feeding
 * it to `validateParameters` validates each default against its own definition. A group's declared
 * default object wins per-key over its fields' own defaults (it is the more specific declaration).
 */
const collectDefaults = (defs: ParameterDefinition[]): Record<string, ParameterValue> => {
  const out: Record<string, ParameterValue> = {};
  for (const def of defs) {
    if (def.type === "group") {
      const nested = collectDefaults(def.constraints?.fields ?? []);
      const own = isPlainObject(def.default) ? def.default : undefined;
      if (own) out[def.key] = { ...nested, ...own };
      else if (def.default !== undefined) out[def.key] = def.default; // non-object group default → caught by parse
      else if (Object.keys(nested).length > 0) out[def.key] = nested;
    } else if (def.default !== undefined) {
      out[def.key] = def.default;
    }
  }
  return out;
};

/**
 * Validate a template's declared defaults. Returns error-level issues reframed as template-default
 * defects (the underlying `code` is preserved; only the message is reframed, and never blames the
 * caller). `[]` means well-formed. `required` issues are dropped — schema validity is not about
 * presence, and non-defaulted required params would otherwise show up as noise.
 *
 * Best-effort, same as the resolver: an asset/brand-referencing default is only checked when the
 * corresponding registry is present in `ctx`; with no registry it is skipped, not failed (no new
 * fallback semantics are invented). Warning-level default issues are not surfaced this phase.
 */
export const validateParameterSchema = (
  schema: ParameterSchema | undefined,
  ctx: ParameterContext = {},
): ParameterIssue[] => {
  if (!schema) return [];
  const defaults = collectDefaults(schema.parameters);
  if (Object.keys(defaults).length === 0) return [];
  return validateParameters(schema, defaults, ctx)
    .filter((i) => i.severity === "error" && i.code !== "required")
    .map((i) => ({ ...i, message: `default for "${i.path}" is invalid: ${i.message}` }));
};
