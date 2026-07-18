import { describe, expect, it } from "vitest";
import { createRegistry } from "../../registry";
import { assetRegistry } from "../../assets";
import { brandRegistry } from "../../brand";
import { buildComposition } from "../../composition";
import { sceneRegistry } from "../../composition/SceneRegistry";
import { transitionRegistry } from "../../transitions";
import { demoConfig } from "../../demo/DemoConfig";
import { buildFromTemplate, createTemplateDefinition } from "..";
import type { ParameterSchema } from "../../parameters";
import type { TemplateCompositionBase } from "../types";

const schema: ParameterSchema = {
  parameters: [
    { key: "title", type: "string", required: true },
    { key: "subtitle", type: "string", default: "—" },
    { key: "count", type: "number", constraints: { min: 1, max: 3 } },
  ],
};

// Schema-backed template: build reads resolved params (defaults applied).
let seen: Record<string, unknown> | undefined;
const withSchema = createTemplateDefinition({
  name: "withSchema",
  parameters: schema,
  build: (p: { title: string; subtitle?: string; count?: number }) => {
    seen = { ...p };
    return { scenes: [{ scene: "hero", duration: 1, props: { title: p.title } }, { scene: "outro", duration: 1, props: {} }], transitions: { type: "dissolve", duration: 0.5 } };
  },
});

// Legacy template: no schema, imperative validate only.
const legacy = createTemplateDefinition({
  name: "legacy",
  validate: (p: { title?: string }) => { if (!p.title) throw new Error("legacy: title required"); },
  build: (p: { title?: string }) => ({ scenes: [{ scene: "hero", duration: 1, props: { title: p.title } }, { scene: "outro", duration: 1, props: {} }] }),
});

// Both schema + imperative validate — schema runs first, then validate.
const order: string[] = [];
const both = createTemplateDefinition({
  name: "both",
  parameters: { parameters: [{ key: "title", type: "string", required: true }] },
  validate: (p: { title: string }) => { order.push(`validate:${p.title}`); },
  build: () => { order.push("build"); return { scenes: [{ scene: "hero", duration: 1, props: {} }, { scene: "outro", duration: 1, props: {} }] }; },
});

const templates = createRegistry({ withSchema, legacy, both });
const build = (spec: TemplateCompositionBase) =>
  buildFromTemplate(spec, templates, sceneRegistry, transitionRegistry, assetRegistry, brandRegistry);

describe("template parameter integration", () => {
  it("resolves defaults and passes them into build()", () => {
    seen = undefined;
    build({ id: "x", template: "withSchema", params: { title: "Hi" } });
    expect(seen).toEqual({ title: "Hi", subtitle: "—" });
  });

  it("rejects invalid params before build()", () => {
    expect(() => build({ id: "x", template: "withSchema", params: {} })).toThrow(/Parameter validation failed[\s\S]*required/);
    expect(() => build({ id: "x", template: "withSchema", params: { title: "Hi", count: 9 } })).toThrow(/max/);
  });

  it("keeps the legacy raw-params path (no schema) working", () => {
    const built = build({ id: "x", template: "legacy", params: { title: "Hi" } });
    expect(built.durationInFrames).toBe(60); // 2×1s, no transition
    expect(() => build({ id: "x", template: "legacy", params: {} })).toThrow(/legacy: title required/);
  });

  it("runs schema resolution before the imperative validate() hook", () => {
    order.length = 0;
    build({ id: "x", template: "both", params: { title: "Hi" } });
    expect(order).toEqual(["validate:Hi", "build"]); // schema passed (no throw) → validate → build
    // schema rejects before validate is reached:
    order.length = 0;
    expect(() => build({ id: "x", template: "both", params: {} })).toThrow(/required/);
    expect(order).toEqual([]);
  });

  it("leaves the existing demo unchanged (330 frames)", () => {
    expect(buildComposition(demoConfig).durationInFrames).toBe(330);
  });
});
