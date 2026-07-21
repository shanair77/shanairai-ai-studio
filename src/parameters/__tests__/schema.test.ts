/**
 * schema — the internal schema well-formedness checker (validateParameterSchema).
 *
 * Unit-level: proves each default-validity check fires, that a valid schema is clean, that nested
 * group-field defaults are covered regardless of depth, and that asset-reference checking stays
 * best-effort when no registry is supplied.
 */

import { describe, expect, it } from "vitest";
import { createRegistry } from "../../registry";
import { validatorRegistry } from "../validators";
import { validateParameterSchema } from "../schema";
import type { ParameterSchema, Validator } from "../types";

const codes = (schema: ParameterSchema, ctx = {}) => validateParameterSchema(schema, ctx).map((i) => i.code);

describe("validateParameterSchema", () => {
  it("passes a well-formed schema (no defaults or valid defaults)", () => {
    const schema: ParameterSchema = {
      parameters: [
        { key: "title", type: "string", default: "Hi" },
        { key: "count", type: "number", default: 3, constraints: { min: 1, max: 5 } },
        { key: "accent", type: "color", default: "#0A0A0A" },
        { key: "maybe", type: "string" }, // no default → nothing to check
      ],
    };
    expect(validateParameterSchema(schema)).toEqual([]);
  });

  it("flags a default that violates a numeric constraint", () => {
    const schema: ParameterSchema = {
      parameters: [{ key: "count", type: "number", default: 99, constraints: { min: 1, max: 5 } }],
    };
    expect(codes(schema)).toContain("max");
  });

  it("flags a default that fails intrinsic type validation", () => {
    const schema: ParameterSchema = {
      parameters: [{ key: "accent", type: "color", default: "#ZZZ" }],
    };
    // color's intrinsic validate rejects it (code from resolve.ts), reframed as a default defect.
    expect(validateParameterSchema(schema)).toHaveLength(1);
    expect(validateParameterSchema(schema)[0].message).toMatch(/default for "accent" is invalid/);
  });

  it("flags a default that fails a named validator", () => {
    const noFoo: Validator = (value, _def, _ctx, issues, path) => {
      if (typeof value === "string" && value.includes("foo")) {
        issues.push({ path, code: "no-foo", severity: "error", message: "must not contain foo" });
      }
    };
    const validators = validatorRegistry.extend({ "no-foo": noFoo });
    const schema: ParameterSchema = {
      parameters: [{ key: "slug", type: "string", default: "foobar", validators: ["no-foo"] }],
    };
    expect(codes(schema, { validators })).toContain("no-foo");
  });

  it("validates nested group-field defaults regardless of depth", () => {
    const schema: ParameterSchema = {
      parameters: [
        {
          key: "cta",
          type: "group",
          constraints: {
            fields: [
              { key: "label", type: "string", default: "Go" }, // valid
              { key: "weight", type: "number", default: 999, constraints: { max: 900 } }, // invalid, 2 levels deep
            ],
          },
        },
      ],
    };
    const issues = validateParameterSchema(schema);
    expect(issues).toHaveLength(1);
    expect(issues[0].path).toBe("cta.weight");
    expect(issues[0].code).toBe("max");
  });

  it("checks an asset-referencing default against a supplied registry", () => {
    const schema: ParameterSchema = {
      parameters: [{ key: "bg", type: "image", default: "missing-asset" }],
    };
    const assets = createRegistry({});
    expect(codes(schema, { assets })).toContain("unknown-asset");
  });

  it("is best-effort when the relevant registry is absent (documents existing behavior)", () => {
    const schema: ParameterSchema = {
      parameters: [{ key: "bg", type: "image", default: "missing-asset" }],
    };
    // No `assets` registry → the image type's validate skips → no issue (not a new fallback).
    expect(validateParameterSchema(schema)).toEqual([]);
  });

  it("does not report `required` as a schema defect", () => {
    const schema: ParameterSchema = {
      parameters: [{ key: "needed", type: "string", required: true }], // no default, required
    };
    expect(validateParameterSchema(schema)).toEqual([]);
  });
});
