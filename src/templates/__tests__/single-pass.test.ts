/**
 * single-pass — regression guard for ADR-006 §13.7 item 3.
 *
 * `resolveTemplateParameters` previously ran the whole pipeline twice (validate-then-resolve) purely
 * to split warnings from errors, so every parameter parse and every named validator executed twice.
 * It now takes ONE pass via `resolveParametersDetailed`. A named validator with a side-effect counter
 * must therefore fire exactly once — this test failed (count === 2) before the fix.
 */

import { describe, expect, it } from "vitest";
import { createTemplateDefinition, resolveTemplateParameters } from "..";
import { resolveParametersDetailed, validatorRegistry, type ParameterContext, type Validator } from "../../parameters";

describe("resolveTemplateParameters — single pipeline pass", () => {
  it("executes each named validator exactly once", () => {
    let calls = 0;
    const counting: Validator = () => {
      calls += 1;
    };
    const validators = validatorRegistry.extend({ counting });
    const template = createTemplateDefinition({
      name: "t",
      parameters: { parameters: [{ key: "title", type: "string", required: true, validators: ["counting"] }] },
      build: (p: { title: string }) => ({ scenes: [{ scene: "hero", duration: 1, props: { title: p.title } }] }),
    });
    const ctx: ParameterContext = { validators };

    const result = resolveTemplateParameters(template, { title: "Hi" }, ctx);

    expect(result.ok).toBe(true);
    expect(calls).toBe(1);
  });

  it("still resolves the value and reports warnings from that one pass", () => {
    const warn: Validator = (_v, _def, _ctx, issues, path) => {
      issues.push({ path, code: "soft", severity: "warning", message: "heads up" });
    };
    const validators = validatorRegistry.extend({ warn });
    const template = createTemplateDefinition({
      name: "t",
      parameters: {
        parameters: [
          { key: "title", type: "string", default: "Untitled", validators: ["warn"] },
          { key: "loop", type: "boolean" },
        ],
      },
      build: (p: { title: string }) => ({ scenes: [{ scene: "hero", duration: 1, props: { title: p.title } }] }),
    });

    const result = resolveTemplateParameters(template, { title: "Hi" }, { validators });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.params).toEqual({ title: "Hi", loop: false });
    expect(result.warnings.map((w) => w.code)).toEqual(["soft"]);
  });
});

describe("resolveParametersDetailed — unambiguous states from one pass", () => {
  const schema = { parameters: [{ key: "n", type: "number" as const, constraints: { min: 5 } }] };

  it("success exposes a usable value and its warnings, and runs validators once", () => {
    let calls = 0;
    const counting: Validator = () => {
      calls += 1;
    };
    const validators = validatorRegistry.extend({ counting });
    const s = { parameters: [{ key: "n", type: "number" as const, validators: ["counting"] }] };
    const r = resolveParametersDetailed(s, { n: 7 }, { validators });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toEqual({ n: 7 });
    expect(r.warnings).toEqual([]);
    expect(calls).toBe(1);
  });

  it("failure exposes errors and NO resolved value (cannot be mistaken for valid params)", () => {
    const r = resolveParametersDetailed(schema, { n: 1 });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.map((i) => i.code)).toContain("min");
    // The failure branch carries no `value` field — a caller cannot read a partial resolution.
    expect("value" in r).toBe(false);
  });
});
