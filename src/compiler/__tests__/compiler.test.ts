/**
 * compiler — behavior coverage for the thin public wrapper (Phase S2).
 *
 * Proves: (1) compile succeeds and NEVER exposes `schema`; (2) semantic failures classify without
 * throwing; (3) the DR-S0 structural guard rejects malformed JS inputs cleanly; (4) PARITY — the
 * compiler is functionally identical to `execute` bar the guard + schema projection; (5) `describe`
 * reflects the bound registries.
 */

import { describe, expect, it } from "vitest";
import { createRegistry } from "../../registry";
import { createTemplateDefinition } from "../../templates";
import { execute } from "../../execution";
import { describeFramework } from "../../metadata";
import { createCompiler } from "..";

const templates = createRegistry({
  basic: createTemplateDefinition({
    name: "basic",
    parameters: { parameters: [{ key: "title", type: "string", required: true }] },
    build: (p: { title: string }) => ({
      scenes: [
        { scene: "hero", duration: 1, props: { title: p.title } },
        { scene: "outro", duration: 1, props: {} },
      ],
      transitions: { type: "dissolve", duration: 0.5 },
    }),
  }),
});

const compiler = createCompiler({ templates });
const goodRequest = { id: "R", template: "basic" as const, params: { title: "Hi" } };

describe("createCompiler — compile success", () => {
  it("compiles a valid request to a BuiltComposition", () => {
    const result = compiler.compile(goodRequest);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.composition.id).toBe("R");
    expect(result.composition.durationInFrames).toBeGreaterThan(0);
    expect(typeof result.composition.component).toBe("function");
  });

  it("NEVER exposes `schema` on a successful result (runtime)", () => {
    const result = compiler.compile(goodRequest);
    expect("schema" in result).toBe(false);
  });
});

describe("createCompiler — semantic failures classify (no throw)", () => {
  it("returns ok:false with a report for an unknown template", () => {
    const result = compiler.compile({ id: "R", template: "nope" as never, params: {} as never });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.report.issues.length).toBeGreaterThan(0);
    expect("schema" in result).toBe(false); // never on failures either
  });

  it("returns ok:false for invalid params (missing required)", () => {
    const result = compiler.compile({ id: "R", template: "basic" as const, params: {} as never });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.report.issues.some((i) => i.stage === "resolve-parameters")).toBe(true);
  });
});

describe("createCompiler — DR-S0 structural guard", () => {
  const guardCode = (r: ReturnType<typeof compiler.compile>) =>
    r.ok ? [] : r.report.issues.map((i) => i.code);

  it("rejects a non-object request without throwing", () => {
    expect(() => compiler.compile(null as never)).not.toThrow();
    expect(compiler.compile(null as never).ok).toBe(false);
    expect(guardCode(compiler.compile("nope" as never))).toContain("invalid-request");
  });

  it("rejects a non-string template", () => {
    const result = compiler.compile({ id: "R", template: 5 as never, params: {} as never });
    expect(result.ok).toBe(false);
    expect(guardCode(result)).toContain("invalid-request");
  });

  it("rejects non-object params", () => {
    const result = compiler.compile({ id: "R", template: "basic" as const, params: 42 as never });
    expect(result.ok).toBe(false);
    expect(guardCode(result)).toContain("invalid-request");
  });
});

describe("createCompiler — parity with execute (adds no semantics)", () => {
  it("produces the same composition as execute(request, { registries })", () => {
    const viaCompiler = compiler.compile(goodRequest);
    const viaExecute = execute(goodRequest, { registries: { templates } });
    expect(viaCompiler.ok).toBe(true);
    expect(viaExecute.ok).toBe(true);
    if (!viaCompiler.ok || !viaExecute.ok) return;
    const shape = (c: { id: string; durationInFrames: number; fps: number; width: number; height: number }) => ({
      id: c.id, durationInFrames: c.durationInFrames, fps: c.fps, width: c.width, height: c.height,
    });
    expect(shape(viaCompiler.composition)).toEqual(shape(viaExecute.composition));
  });

  it("reports the same failure classification as execute for a semantic error", () => {
    const badParams = { id: "R", template: "basic" as const, params: {} as never };
    const viaCompiler = compiler.compile(badParams);
    const viaExecute = execute(badParams, { registries: { templates } });
    expect(viaCompiler.ok).toBe(false);
    expect(viaExecute.ok).toBe(false);
    if (viaCompiler.ok || viaExecute.ok) return;
    expect(viaCompiler.report.issues.map((i) => i.code)).toEqual(viaExecute.report.issues.map((i) => i.code));
  });
});

describe("createCompiler — describe", () => {
  it("reflects the bound registries (equals describeFramework of the same registries)", () => {
    expect(compiler.describe()).toEqual(describeFramework({ templates }));
  });

  it("includes the bound template in the descriptor", () => {
    expect(compiler.describe().templates.some((t) => t.key === "basic")).toBe(true);
  });
});
