import { describe, expect, it } from "vitest";
import { createRegistry } from "../../registry";
import { assetRegistry, buildComposition, sceneRegistry, type MusicConfig } from "../../composition";
import { brandRegistry } from "../../brand";
import { transitionRegistry } from "../../transitions";
import { type ValidatorMap } from "../../parameters";
import { buildFromTemplate, createTemplateDefinition } from "../../templates";
import { execute, executeOrThrow } from "..";
import { resolveRegistries } from "../../contracts";
import { createExecutionContext } from "../context";
import type { ExecutionRequest, ExecutionSpan } from "../types";

// ── Fixtures (test-only) ───────────────────────────────────────────────────────────────────────
const withSchema = createTemplateDefinition({
  name: "withSchema",
  parameters: { parameters: [
    { key: "title", type: "string", required: true },
    { key: "subtitle", type: "string", default: "—" },
  ] },
  build: (p: { title: string; subtitle?: string }) => ({
    scenes: [{ scene: "hero", duration: 1, props: { title: p.title } }, { scene: "outro", duration: 1, props: {} }],
    transitions: { type: "dissolve", duration: 0.5 },
  }),
});

const legacy = createTemplateDefinition({
  name: "legacy",
  validate: (p: { title?: string }) => { if (!p.title) throw new Error("legacy: title required"); },
  build: (p: { title?: string }) => ({ scenes: [{ scene: "hero", duration: 1, props: { title: p.title } }, { scene: "outro", duration: 1, props: {} }] }),
});

const throwsInBuild = createTemplateDefinition({ name: "throwsInBuild", build: () => { throw new Error("kaboom in build"); } });
const requiresBrand = createTemplateDefinition({ name: "requiresBrand", capabilities: { requiresBrand: true }, build: () => ({ scenes: [{ scene: "hero", duration: 1, props: {} }, { scene: "outro", duration: 1, props: {} }] }) });
const emptyOut = createTemplateDefinition({ name: "emptyOut", build: () => ({ scenes: [] }) });
const badMusic = createTemplateDefinition({ name: "badMusic", build: () => ({ scenes: [{ scene: "hero", duration: 1, props: {} }, { scene: "outro", duration: 1, props: {} }], music: {} as MusicConfig }) });
const softWarn = createTemplateDefinition({
  name: "softWarn",
  parameters: { parameters: [{ key: "mode", type: "string", validators: ["softCheck"] }] },
  build: () => ({ scenes: [{ scene: "hero", duration: 1, props: {} }, { scene: "outro", duration: 1, props: {} }] }),
});

const templates = createRegistry({ withSchema, legacy, throwsInBuild, requiresBrand, emptyOut, badMusic, softWarn });
const validators = createRegistry<ValidatorMap>({
  softCheck: (value, _def, _ctx, issues, path) => { if (value === "warn") issues.push({ path, code: "soft", severity: "warning", message: "heads up" }); },
});

const run = (request: ExecutionRequest, extra?: { validators?: typeof validators }) =>
  execute(request, { registries: { templates, ...(extra?.validators ? { validators: extra.validators } : {}) } });

const status = (trace: ExecutionSpan[], stage: string) => trace.find((s) => s.stage === stage)?.status;

// ── Success ──────────────────────────────────────────────────────────────────────────────────
describe("execute — success", () => {
  it("returns a composition + a full ok trace, defaults applied", () => {
    const result = run({ id: "S", template: "withSchema", params: { title: "Hi" } });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.composition.durationInFrames).toBe(45); // 2×1s − dissolve 0.5s
    expect(result.report.issues).toEqual([]);
    expect(result.report.trace[result.report.trace.length - 1]).toMatchObject({ stage: "complete", status: "ok" });
    expect(status(result.report.trace, "resolve-parameters")).toBe("ok");
    expect(status(result.report.trace, "validate-template-params")).toBe("skipped"); // no validate hook
  });

  it("skips resolve-parameters for a schema-less template and runs validate", () => {
    const result = run({ id: "L", template: "legacy", params: { title: "Hi" } });
    expect(result.ok).toBe(true);
    expect(status(result.report.trace, "resolve-parameters")).toBe("skipped"); // no schema
    expect(status(result.report.trace, "validate-template-params")).toBe("ok");
  });
});

// ── Failure + classification ─────────────────────────────────────────────────────────────────
describe("execute — failure classification", () => {
  it("maps an unknown template to a DomainError issue and halts", () => {
    const result = run({ id: "U", template: "nope", params: {} });
    expect(result.ok).toBe(false);
    expect(result.report.issues[0]).toMatchObject({ stage: "resolve-template", code: "unknown-template", severity: "error" });
    expect(status(result.report.trace, "resolve-template")).toBe("failed");
    expect(status(result.report.trace, "complete")).toBe("skipped");
  });

  it("maps a capability DomainError (requiresBrand)", () => {
    const result = run({ id: "B", template: "requiresBrand", params: {} });
    expect(result.ok).toBe(false);
    expect(result.report.issues[0]).toMatchObject({ stage: "check-template-capabilities", code: "requires-brand" });
    expect(status(result.report.trace, "resolve-template")).toBe("ok");
    expect(status(result.report.trace, "check-template-capabilities")).toBe("failed");
  });

  it("maps a schema validation failure at resolve-parameters", () => {
    const result = run({ id: "P", template: "withSchema", params: {} });
    expect(result.ok).toBe(false);
    expect(result.report.issues[0]).toMatchObject({ stage: "resolve-parameters", code: "required", path: "title" });
  });

  it("maps an imperative validate() throw to template-validation-error with the cause message", () => {
    const result = run({ id: "V", template: "legacy", params: {} });
    expect(result.ok).toBe(false);
    expect(result.report.issues[0]).toMatchObject({ stage: "validate-template-params", code: "template-validation-error", message: "legacy: title required" });
    expect(result.report.issues[0].actual).toMatchObject({ message: "legacy: title required" });
  });

  it("maps a build() throw to template-build-error (distinct from validation)", () => {
    const result = run({ id: "K", template: "throwsInBuild", params: {} });
    expect(result.ok).toBe(false);
    expect(result.report.issues[0]).toMatchObject({ stage: "run-template", code: "template-build-error", message: "kaboom in build" });
  });

  it("maps a template-output DomainError", () => {
    const result = run({ id: "E", template: "emptyOut", params: {} });
    expect(result.ok).toBe(false);
    expect(result.report.issues[0]).toMatchObject({ stage: "validate-template-output", code: "empty-output" });
  });

  it("rethrows an unexpected (non-DomainError) error — never masks framework bugs", () => {
    expect(() => run({ id: "M", template: "badMusic", params: {} })).toThrow(/MusicConfig/);
  });
});

// ── Warnings, determinism, immutability of history ──────────────────────────────────────────────
describe("execute — diagnostics", () => {
  it("accumulates warnings on success (Parameter Engine warning severity)", () => {
    const result = run({ id: "W", template: "softWarn", params: { mode: "warn" } }, { validators });
    expect(result.ok).toBe(true);
    expect(result.report.warnings).toHaveLength(1);
    expect(result.report.warnings[0]).toMatchObject({ stage: "resolve-parameters", severity: "warning", code: "soft" });
  });

  it("produces an append-only trace — earlier ok spans survive a later failure", () => {
    const result = run({ id: "A", template: "withSchema", params: {} });
    expect(result.report.trace[0]).toMatchObject({ stage: "resolve-template", status: "ok" });
    expect(result.report.trace[1]).toMatchObject({ stage: "check-template-capabilities", status: "ok" });
    expect(result.report.trace[2]).toMatchObject({ stage: "resolve-parameters", status: "failed" });
  });

  it("is deterministic and free of nondeterministic fields", () => {
    const a = run({ id: "D", template: "withSchema", params: { title: "Hi" } });
    const b = run({ id: "D", template: "withSchema", params: { title: "Hi" } });
    expect(a.report).toEqual(b.report);
    const keys = a.report.trace.flatMap((s) => Object.keys(s));
    expect(keys.some((k) => /time|stamp|duration|ms|stack|addr/i.test(k))).toBe(false);
  });

  it("has a JSON-serializable report", () => {
    const result = run({ id: "J", template: "throwsInBuild", params: {} });
    expect(JSON.parse(JSON.stringify(result.report))).toEqual(result.report);
  });
});

// ── executionId ────────────────────────────────────────────────────────────────────────────────
describe("execute — executionId", () => {
  it("derives deterministically from the request id and is caller-overridable", () => {
    expect(run({ id: "MyId", template: "withSchema", params: { title: "Hi" } }).report.executionId).toBe("exec:MyId");
    const overridden = execute({ id: "MyId", template: "withSchema", params: { title: "Hi" } }, { registries: { templates }, executionId: "custom-1" });
    expect(overridden.report.executionId).toBe("custom-1");
  });
});

// ── Immutable context ─────────────────────────────────────────────────────────────────────────
describe("ExecutionContext immutability (ADR-007 §4.5)", () => {
  it("freezes the container/environment/canvas but keeps registries live", () => {
    const ctx = createExecutionContext(
      { executionId: "exec:x", canvas: { format: "horizontal", width: 1920, height: 1080, fps: 30 } },
      resolveRegistries({ templates }),
    );
    expect(Object.isFrozen(ctx)).toBe(true);
    expect(Object.isFrozen(ctx.environment)).toBe(true);
    expect(Object.isFrozen(ctx.environment.canvas)).toBe(true);
    expect(Object.isFrozen(ctx.registries)).toBe(true);
    expect(Object.isFrozen(ctx.registries.templates)).toBe(false); // live singleton, not deep-frozen
    expect(() => { (ctx.environment as { executionId: string }).executionId = "y"; }).toThrow(TypeError);
  });
});

// ── Parity ───────────────────────────────────────────────────────────────────────────────────
describe("execute — parity with buildFromTemplate", () => {
  it("executeOrThrow produces the same BuiltComposition as buildFromTemplate", () => {
    const request = { id: "PAR", template: "withSchema", params: { title: "Hi", subtitle: "there" } } as const;
    const viaExec = executeOrThrow(request, { registries: { templates } });
    const viaBuild = buildFromTemplate(request, templates, sceneRegistry, transitionRegistry, assetRegistry, brandRegistry);
    expect([viaExec.durationInFrames, viaExec.width, viaExec.height, viaExec.fps]).toEqual([viaBuild.durationInFrames, viaBuild.width, viaBuild.height, viaBuild.fps]);
  });

  it("execute(...).schema matches buildComposition's expectation (round-trips through the builder)", () => {
    const result = execute({ id: "SC", template: "withSchema", params: { title: "Hi" } }, { registries: { templates } });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const rebuilt = buildComposition(result.schema, sceneRegistry, transitionRegistry, assetRegistry, brandRegistry);
    expect(rebuilt.durationInFrames).toBe(result.composition.durationInFrames);
  });
});
