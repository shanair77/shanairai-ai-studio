import { describe, expect, it } from "vitest";
import { DomainError } from "../../errors";
import { createRegistry } from "../../registry";
import { defineTemplate } from "../../templates";
import { executeOrThrow } from "../../execution";
import { processRequest, processRequestOrThrow } from "..";
import { BASELINE_REQUEST_VERSION, CURRENT_REQUEST_VERSION } from "../version";
import type { MigrationMap, RequestSpan } from "../types";

const status = (trace: RequestSpan[], stage: string) => trace.find((s) => s.stage === stage)?.status;
const codes = (report: { issues: { code: string }[] }) => report.issues.map((i) => i.code);

// ── Parse ────────────────────────────────────────────────────────────────────────────────────
describe("processRequest — parse", () => {
  it("parses a JSON string and an already-parsed value equivalently", () => {
    const a = processRequest(JSON.stringify({ id: "x", template: "t", params: { n: 1 } }));
    const b = processRequest({ id: "x", template: "t", params: { n: 1 } });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) expect(a.request).toEqual(b.request);
  });
  it("rejects invalid JSON and non-objects", () => {
    const bad = processRequest("{ not json");
    expect(bad.ok).toBe(false);
    expect(codes(bad.report)).toEqual(["invalid-json"]);
    expect(processRequest(42).ok).toBe(false);
  });
});

// ── Migration (single-step, chained) ───────────────────────────────────────────────────────────
describe("processRequest — migration", () => {
  const migrations = createRegistry<MigrationMap>({
    "1": (raw) => ({ ...raw, id: `${String(raw.id)}-v2` }),
    "2": (raw) => ({ ...raw, id: `${String(raw.id)}-v3` }),
  });

  it("composes single-step migrations v1 → v2 → v3", () => {
    const result = processRequest({ version: "1", id: "x", template: "t", params: {} }, { migrations, targetVersion: "3" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.request.id).toBe("x-v2-v3");
    expect(result.report.fromVersion).toBe("1");
    expect(result.report.toVersion).toBe("3");
    expect(status(result.report.trace, "migrate")).toBe("ok");
  });

  it("treats an un-versioned request as the BASELINE version, not the current one", () => {
    // A request with no `version` predates versioning, so it must migrate up from the baseline floor.
    // FORWARD-REGRESSION GUARD: today BASELINE_REQUEST_VERSION === CURRENT_REQUEST_VERSION === "1", so
    // this cannot yet observe an output divergence — the buggy (default-from-CURRENT) and fixed
    // (default-from-BASELINE) code produce the same result. Its purpose is future protection: once
    // CURRENT advances past the baseline, defaulting from CURRENT would SKIP this migration and fail
    // here. Do not "simplify" it away on the grounds that the two constants are currently equal.
    expect(BASELINE_REQUEST_VERSION).toBe("1");
    expect(CURRENT_REQUEST_VERSION).toBe("1");
    const migrations = createRegistry<MigrationMap>({ "1": (raw) => ({ ...raw, id: `${String(raw.id)}-migrated` }) });
    const result = processRequest({ id: "x", template: "t", params: {} }, { migrations, targetVersion: "2" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.request.id).toBe("x-migrated"); // the 1→2 migration ran ⇒ absent version started at baseline "1"
    expect(result.report.fromVersion).toBe("1");
  });

  it("reports unsupported-version when a step is missing", () => {
    const partial = createRegistry<MigrationMap>({ "1": (raw) => raw });
    const result = processRequest({ version: "1", id: "x", template: "t", params: {} }, { migrations: partial, targetVersion: "3" });
    expect(result.ok).toBe(false);
    expect(codes(result.report)).toEqual(["unsupported-version"]);
  });

  it("rejects a version newer than the target", () => {
    const result = processRequest({ version: "5", id: "x", template: "t", params: {} });
    expect(result.ok).toBe(false);
    expect(codes(result.report)).toEqual(["unsupported-version"]);
  });

  it("maps a migration DomainError to an issue", () => {
    const throwing = createRegistry<MigrationMap>({ "1": () => { throw new DomainError({ code: "bad-migration", message: "boom" }); } });
    const result = processRequest({ version: "1", id: "x", template: "t", params: {} }, { migrations: throwing, targetVersion: "2" });
    expect(result.ok).toBe(false);
    expect(result.report.issues[0]).toMatchObject({ stage: "migrate", code: "bad-migration" });
  });

  it("rethrows an unexpected migration error (never masks framework bugs)", () => {
    const buggy = createRegistry<MigrationMap>({ "1": () => { throw new Error("unexpected bug"); } });
    expect(() => processRequest({ version: "1", id: "x", template: "t", params: {} }, { migrations: buggy, targetVersion: "2" })).toThrow(/unexpected bug/);
  });
});

// ── Envelope validation (syntax) ────────────────────────────────────────────────────────────────
describe("processRequest — validate-envelope", () => {
  it("rejects a missing id / template and a non-object params, with paths", () => {
    const result = processRequest({ template: 5, params: [] });
    expect(result.ok).toBe(false);
    const paths = result.report.issues.map((i) => i.path).sort();
    expect(paths).toEqual(["id", "params", "template"]);
    expect(status(result.report.trace, "validate-envelope")).toBe("failed");
    expect(status(result.report.trace, "complete")).toBe("skipped");
  });
  it("validates envelope shapes but NOT semantics (unknown template passes syntax)", () => {
    const result = processRequest({ id: "x", template: "does-not-exist", params: {} });
    expect(result.ok).toBe(true); // no existence check here — that is Execution's job
    if (result.ok) expect(result.request.template).toBe("does-not-exist");
  });
});

// ── Normalize + defaults ────────────────────────────────────────────────────────────────────────
describe("processRequest — normalize & defaults", () => {
  it("trims identifiers, quarantines unknown fields with a warning, defaults params", () => {
    const result = processRequest({ id: "  x  ", template: " t ", bogus: 1, params: undefined });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.request.id).toBe("x");
    expect(result.request.template).toBe("t");
    expect(result.request.params).toEqual({});
    expect(result.report.warnings.map((w) => w.code)).toContain("unknown-field");
    expect(Object.keys(result.request)).not.toContain("bogus");
  });
});

// ── JSON safety ──────────────────────────────────────────────────────────────────────────────────
describe("processRequest — JSON safety", () => {
  it("rejects non-serializable params with a path", () => {
    expect(codes(processRequest({ id: "x", template: "t", params: { fn: () => 0 } }).report)).toEqual(["non-serializable"]);
    const el = { $$typeof: Symbol.for("react.element"), type: "div", props: {} };
    const r = processRequest({ id: "x", template: "t", params: { node: el } });
    expect(r.ok).toBe(false);
    expect(r.report.issues[0]).toMatchObject({ code: "non-serializable", path: "params.node" });
  });
  it("accepts fully-serializable params", () => {
    expect(processRequest({ id: "x", template: "t", params: { a: 1, b: "y", c: [1, 2], d: { e: true } } }).ok).toBe(true);
  });
});

// ── Determinism, parity, serialization ──────────────────────────────────────────────────────────
describe("processRequest — determinism & parity", () => {
  it("produces a deterministic, JSON-serializable report", () => {
    const a = processRequest({ id: "x", template: "t", params: { n: 1 } });
    const b = processRequest({ id: "x", template: "t", params: { n: 1 } });
    expect(a.report).toEqual(b.report);
    expect(JSON.parse(JSON.stringify(a.report))).toEqual(a.report);
  });

  it("processRequestOrThrow yields a request equal to the hand-built ExecutionRequest", () => {
    const built = processRequestOrThrow({ id: "x", template: "t", params: { a: 1 } });
    expect(built).toEqual({ id: "x", template: "t", params: { a: 1 } });
    expect(() => JSON.stringify(built)).not.toThrow();
  });

  it("hands off to execute identically to a hand-built request", () => {
    const templates = createRegistry({
      basic: defineTemplate({
        name: "basic", version: "test",
        parameters: { parameters: [{ key: "title", type: "string", required: true }] },
        build: (p: { title: string }) => ({ scenes: [{ scene: "hero", duration: 1, props: { title: p.title } }, { scene: "outro", duration: 1, props: {} }], transitions: { type: "dissolve", duration: 0.5 } }),
      }),
    });
    const request = processRequestOrThrow(JSON.stringify({ id: "R", template: "basic", params: { title: "Hi" } }));
    const viaProcess = executeOrThrow(request, { registries: { templates } });
    // A hand-authored request must execute identically to the same request round-tripped through
    // processRequest — the front-end changes transport syntax only, never semantics.
    const viaDirect = executeOrThrow({ id: "R", template: "basic", params: { title: "Hi" } }, { registries: { templates } });
    expect(viaProcess.durationInFrames).toBe(viaDirect.durationInFrames);
  });
});
