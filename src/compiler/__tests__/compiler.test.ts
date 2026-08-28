/**
 * compiler — behavior coverage for the thin public wrapper (Phase S2).
 *
 * Proves: (1) compile succeeds and NEVER exposes `schema`; (2) semantic failures classify without
 * throwing; (3) the DR-S0 structural guard rejects malformed JS inputs cleanly; (4) PARITY — the
 * compiler is functionally identical to `execute` bar the guard + schema projection; (5) `describe`
 * reflects the bound registries.
 */

import { describe, expect, it } from "vitest";
import { defineTemplate, templateRegistry } from "../../templates";
import { execute } from "../../execution";
import { describeFramework } from "../../metadata";
import { defineScene, sceneRegistry } from "../../composition";
import { defineParameterType, parameterTypeRegistry, type ParameterTypeName } from "../../parameters";
import { createCompiler } from "..";

const templates = {
  basic: defineTemplate({
    name: "basic", version: "test",
    parameters: { parameters: [{ key: "title", type: "string", required: true }] },
    build: (p: { title: string }) => ({
      scenes: [
        { scene: "hero", duration: 1, props: { title: p.title } },
        { scene: "outro", duration: 1, props: {} },
      ],
      transitions: { type: "dissolve", duration: 0.5 },
    }),
  }),
};

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
    const viaExecute = execute(goodRequest, { registries: { templates: templateRegistry.extend(templates) } });
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
    const viaExecute = execute(badParams, { registries: { templates: templateRegistry.extend(templates) } });
    expect(viaCompiler.ok).toBe(false);
    expect(viaExecute.ok).toBe(false);
    if (viaCompiler.ok || viaExecute.ok) return;
    expect(viaCompiler.report.issues.map((i) => i.code)).toEqual(viaExecute.report.issues.map((i) => i.code));
  });
});

describe("createCompiler — describe", () => {
  it("reflects the bound registries (equals describeFramework of the same layered registries)", () => {
    expect(compiler.describe()).toEqual(describeFramework({ templates: templateRegistry.extend(templates) }));
  });

  it("includes the bound template in the descriptor", () => {
    expect(compiler.describe().templates.some((t) => t.key === "basic")).toBe(true);
  });
});

/**
 * EXTEND semantics (Phase S3.2): compiler configuration extends the framework defaults; matching
 * keys override builtins. Each test below is paired with the builtin it must NOT have destroyed —
 * if configuration replaced instead of extended, the builtin reference would fail to resolve.
 */
describe("createCompiler — configuration extends the framework defaults", () => {
  const custom = defineScene<{ label?: string }>({ component: () => null, defaultDuration: 1 });

  it("adding a new scene PRESERVES the builtin scenes", () => {
    const c = createCompiler({
      templates: {
        mixed: defineTemplate({
          name: "mixed", version: "test",
          // "custom" is user-supplied; "outro" is a builtin that must still resolve.
          build: () => ({ scenes: [{ scene: "custom", duration: 1 }, { scene: "outro", duration: 1 }] }),
        }),
      },
      scenes: { custom },
    });
    const r = c.compile({ id: "X", template: "mixed", params: {} });
    expect(r.ok).toBe(true);
    expect(c.describe().scenes.map((s) => s.key)).toEqual(
      expect.arrayContaining(["custom", "hero", "outro"]),
    );
  });

  it("overriding a builtin scene works (user definition wins, set does not grow)", () => {
    const base = sceneRegistry.keys().length;
    const c = createCompiler({
      templates: {
        solo: defineTemplate({ name: "solo", version: "test", build: () => ({ scenes: [{ scene: "hero" }] }) }),
      },
      // Same key as the builtin: overrides it, and shortens the default duration from 5s to 2s.
      scenes: { hero: defineScene<{ title?: string }>({ component: () => null, defaultDuration: 2 }) },
    });
    const r = c.compile({ id: "X", template: "solo", params: {} });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.composition.durationInFrames).toBe(60); // 2s @30fps — the override, not the builtin 5s
    expect(c.describe().scenes).toHaveLength(base); // override replaces; it does not add
  });

  it("adding a parameter type PRESERVES the builtin parameter types", () => {
    const slug = defineParameterType<string>({
      name: "slug",
      parse: (raw) => String(raw),
      validate: (value, _d, _c, issues, path) => {
        if (!/^[a-z0-9-]+$/.test(value)) issues.push({ path, code: "slug", severity: "error", message: "must be a slug" });
      },
    });
    const c = createCompiler({
      templates: {
        t: defineTemplate({
          name: "t", version: "test",
          parameters: {
            parameters: [
              { key: "handle", type: "slug" as ParameterTypeName, required: true },
              { key: "title", type: "string", required: true }, // builtin — must still resolve
            ],
          },
          build: (p: { title: string; handle: string }) => ({ scenes: [{ scene: "hero", duration: 1, props: { title: p.title } }] }),
        }),
      },
      parameterTypes: { slug },
    });
    const r = c.compile({ id: "X", template: "t", params: { handle: "my-video", title: "Hi" } });
    expect(r.ok).toBe(true);
    expect(parameterTypeRegistry.has("slug")).toBe(false); // the framework singleton was not mutated
  });

  it("overriding a builtin parameter type works", () => {
    const strict = defineParameterType<string>({
      name: "string",
      parse: (raw) => String(raw),
      validate: (_v, _d, _c, issues, path) => {
        issues.push({ path, code: "always-rejects", severity: "error", message: "overridden string type" });
      },
    });
    const c = createCompiler({
      templates: {
        t: defineTemplate({
          name: "t", version: "test",
          parameters: { parameters: [{ key: "title", type: "string", required: true }] },
          build: (p: { title: string }) => ({ scenes: [{ scene: "hero", duration: 1, props: { title: p.title } }] }),
        }),
      },
      parameterTypes: { string: strict },
    });
    const r = c.compile({ id: "X", template: "t", params: { title: "Hi" } });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.report.issues.map((i) => i.code)).toContain("always-rejects");
  });
});
