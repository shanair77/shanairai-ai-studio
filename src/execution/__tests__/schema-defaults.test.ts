/**
 * schema-defaults — an invalid template default is a Stage-2 failure, not a Stage-3 (caller) failure.
 *
 * Proves the attribution the architecture requires (ADR-006 §13.1): a malformed default halts at
 * `check-template-capabilities`, before `resolve-parameters` ever runs, so `build()` is never reached
 * and the caller is never blamed. Caller-value validation at Stage 3 is unchanged.
 */

import { describe, expect, it } from "vitest";
import { createRegistry } from "../../registry";
import { validatorRegistry, type Validator } from "../../parameters";
import { createTemplateDefinition } from "../../templates";
import { execute } from "../execute";

const scenes = (title: string) => [
  { scene: "hero" as const, duration: 1, props: { title } },
  { scene: "outro" as const, duration: 1, props: {} },
];

const stageOf = (r: ReturnType<typeof execute>, status: string) =>
  r.report.trace.filter((s) => s.status === status).map((s) => s.stage);

const traceStatus = (r: ReturnType<typeof execute>, stage: string) =>
  r.report.trace.find((s) => s.stage === stage)?.status;

describe("invalid template default → Stage 2 (check-template-capabilities)", () => {
  const badConstraint = createRegistry({
    t: createTemplateDefinition({
      name: "t",
      parameters: { parameters: [{ key: "count", type: "number", default: 99, constraints: { min: 1, max: 5 } }] },
      build: (p: { count: number }) => ({ scenes: scenes(String(p.count)) }),
    }),
  });

  it("1. a default violating a numeric constraint fails at Stage 2, before Stage 3", () => {
    const r = execute({ id: "A", template: "t", params: {} }, { registries: { templates: badConstraint } });
    expect(r.ok).toBe(false);
    expect(r.report.issues.map((i) => i.stage)).toContain("check-template-capabilities");
    expect(r.report.issues.every((i) => i.stage !== "resolve-parameters")).toBe(true);
    expect(traceStatus(r, "check-template-capabilities")).toBe("failed");
    expect(stageOf(r, "skipped")).toContain("resolve-parameters"); // Stage 3 never ran
    expect(stageOf(r, "skipped")).toContain("build-composition"); // build() never reached
  });

  it("2. a default failing intrinsic type validation fails at Stage 2", () => {
    const templates = createRegistry({
      t: createTemplateDefinition({
        name: "t",
        parameters: { parameters: [{ key: "accent", type: "color", default: "#ZZZ" }] },
        build: () => ({ scenes: scenes("x") }),
      }),
    });
    const r = execute({ id: "B", template: "t", params: {} }, { registries: { templates } });
    expect(r.ok).toBe(false);
    expect(r.report.issues[0].stage).toBe("check-template-capabilities");
    expect(r.report.issues[0].message).toMatch(/default for "accent" is invalid/);
  });

  it("3. a default failing a custom named validator fails at Stage 2", () => {
    const noFoo: Validator = (value, _def, _ctx, issues, path) => {
      if (typeof value === "string" && value.includes("foo")) {
        issues.push({ path, code: "no-foo", severity: "error", message: "must not contain foo" });
      }
    };
    const validators = validatorRegistry.extend({ "no-foo": noFoo });
    const templates = createRegistry({
      t: createTemplateDefinition({
        name: "t",
        parameters: { parameters: [{ key: "slug", type: "string", default: "foobar", validators: ["no-foo"] }] },
        build: () => ({ scenes: scenes("x") }),
      }),
    });
    const r = execute({ id: "C", template: "t", params: {} }, { registries: { templates, validators } });
    expect(r.ok).toBe(false);
    expect(r.report.issues[0].stage).toBe("check-template-capabilities");
    expect(r.report.issues[0].code).toBe("no-foo");
  });

  it("4. a valid default succeeds and reaches Stage 3", () => {
    const templates = createRegistry({
      t: createTemplateDefinition({
        name: "t",
        parameters: { parameters: [{ key: "count", type: "number", default: 3, constraints: { min: 1, max: 5 } }] },
        build: (p: { count: number }) => ({ scenes: scenes(String(p.count)) }),
      }),
    });
    const r = execute({ id: "D", template: "t", params: {} }, { registries: { templates } });
    expect(r.ok).toBe(true);
    expect(traceStatus(r, "check-template-capabilities")).toBe("ok");
    expect(traceStatus(r, "resolve-parameters")).toBe("ok");
  });

  it("5. caller-supplied invalid input still fails at Stage 3 (schema is valid)", () => {
    const templates = createRegistry({
      t: createTemplateDefinition({
        name: "t",
        parameters: { parameters: [{ key: "count", type: "number", default: 3, constraints: { min: 1, max: 5 } }] },
        build: (p: { count: number }) => ({ scenes: scenes(String(p.count)) }),
      }),
    });
    const r = execute({ id: "E", template: "t", params: { count: 99 } }, { registries: { templates } });
    expect(r.ok).toBe(false);
    expect(traceStatus(r, "check-template-capabilities")).toBe("ok"); // schema is well-formed
    expect(r.report.issues.map((i) => i.stage)).toContain("resolve-parameters"); // caller value fails here
  });

  it("6. a valid caller value does NOT hide a malformed template default", () => {
    // The default is invalid AND the caller supplies a valid value for the same key.
    const r = execute({ id: "F", template: "t", params: { count: 3 } }, { registries: { templates: badConstraint } });
    expect(r.ok).toBe(false);
    // Still a Stage-2 failure — a good caller value cannot mask a malformed declaration.
    expect(traceStatus(r, "check-template-capabilities")).toBe("failed");
    expect(stageOf(r, "skipped")).toContain("resolve-parameters");
  });
});
