/**
 * custom-registries — regression coverage for the capability gap the duplicate orchestrator had.
 *
 * The removed `resolveTemplateComposition`/`buildFromTemplate` path accepted only `templates`,
 * `assets`, and `brands`; it had no parameter for the parameter-type or validator registries, so
 * `resolveParameters` silently fell back to the GLOBAL `parameterTypeRegistry`/`validatorRegistry`.
 * A caller-supplied vocabulary was ignored with no diagnostic.
 *
 * `execute()` threads both through `ExecutionContext`. Each test below is paired with a CONTROL that
 * runs the same request WITHOUT the custom registry and asserts it fails — if the control passed,
 * a hidden global fallback would be satisfying the request and the positive test would prove nothing.
 */

import { describe, expect, it } from "vitest";
import { createRegistry } from "../../registry";
import {
  createParameterTypeDefinition,
  parameterTypeRegistry,
  validatorRegistry,
  type ParameterTypeName,
} from "../../parameters";
import { createTemplateDefinition } from "../../templates";
import { execute } from "../execute";

// A parameter type that exists ONLY in the custom registry.
const slug = createParameterTypeDefinition<string>({
  name: "slug",
  parse: (raw) => String(raw),
  validate: (value, _def, _ctx, issues, path) => {
    if (!/^[a-z0-9-]+$/.test(value)) {
      issues.push({ path, code: "slug", severity: "error", message: "must be a lowercase slug", actual: value });
    }
  },
});

const customTypes = parameterTypeRegistry.extend({ slug });
const customValidators = validatorRegistry.extend({
  "no-foo": (value: unknown, _def: unknown, _ctx: unknown, issues: { path: string; code: string; severity: "error"; message: string }[], path: string) => {
    if (typeof value === "string" && value.includes("foo")) {
      issues.push({ path, code: "no-foo", severity: "error", message: "must not contain foo" });
    }
  },
} as never);

const scenes = (title: string) => [
  { scene: "hero" as const, duration: 1, props: { title } },
  { scene: "outro" as const, duration: 1, props: {} },
];

const templates = createRegistry({
  usesCustomType: createTemplateDefinition({
    name: "usesCustomType",
    // NOTE: `ParameterTypeName` is a CLOSED union of the 14 builtin names, so a schema cannot name
    // a custom type without a cast — a pre-existing Parameter Engine limitation, out of scope here.
    // The registry resolves it by string at runtime, which is what this suite exercises.
    parameters: { parameters: [{ key: "handle", type: "slug" as ParameterTypeName, required: true }] },
    build: (p: { handle: string }) => ({ scenes: scenes(p.handle) }),
  }),
  usesCustomValidator: createTemplateDefinition({
    name: "usesCustomValidator",
    parameters: { parameters: [{ key: "title", type: "string", required: true, validators: ["no-foo"] }] },
    build: (p: { title: string }) => ({ scenes: scenes(p.title) }),
  }),
});

const codes = (r: ReturnType<typeof execute>): string[] => r.report.issues.map((i) => i.code);

describe("custom parameter types via execution registries", () => {
  it("resolves a parameter type supplied through input.registries", () => {
    const result = execute(
      { id: "T", template: "usesCustomType", params: { handle: "my-video" } },
      { registries: { templates, parameterTypes: customTypes } },
    );
    expect(result.ok).toBe(true);
  });

  it("enforces that custom type's validation rules", () => {
    const result = execute(
      { id: "T", template: "usesCustomType", params: { handle: "Not A Slug" } },
      { registries: { templates, parameterTypes: customTypes } },
    );
    expect(result.ok).toBe(false);
    expect(codes(result)).toContain("slug");
  });

  it("CONTROL: without the custom registry the type is unknown (no global fallback)", () => {
    const result = execute(
      { id: "T", template: "usesCustomType", params: { handle: "my-video" } },
      { registries: { templates } },
    );
    expect(result.ok).toBe(false);
    expect(codes(result)).toContain("unknown-type");
  });
});

describe("custom validators via execution registries", () => {
  it("runs a named validator supplied through input.registries", () => {
    const result = execute(
      { id: "V", template: "usesCustomValidator", params: { title: "foobar" } },
      { registries: { templates, validators: customValidators } },
    );
    expect(result.ok).toBe(false);
    expect(codes(result)).toContain("no-foo");
  });

  it("passes when the value satisfies the custom validator", () => {
    const result = execute(
      { id: "V", template: "usesCustomValidator", params: { title: "clean" } },
      { registries: { templates, validators: customValidators } },
    );
    expect(result.ok).toBe(true);
  });

  it("CONTROL: without the custom registry the validator is unknown (no global fallback)", () => {
    const result = execute(
      { id: "V", template: "usesCustomValidator", params: { title: "foobar" } },
      { registries: { templates } },
    );
    expect(result.ok).toBe(false);
    expect(codes(result)).toContain("unknown-validator");
  });
});
