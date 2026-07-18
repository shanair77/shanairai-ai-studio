import { isValidElement, type ReactElement } from "react";
import { Audio, Sequence } from "remotion";
import { describe, expect, it } from "vitest";
import { createRegistry } from "../../registry";
import { assetRegistry, createAssetDefinition, createAssetKit } from "../../assets";
import { createBrandDefinition } from "../../brand";
import { buildComposition, type CompositionSchemaBase } from "../../composition";
import { sceneRegistry } from "../../composition/SceneRegistry";
import { transitionRegistry } from "../../transitions";
import { demoConfig } from "../../demo/DemoConfig";
import { buildFromTemplate, createTemplateDefinition, resolveTemplateComposition, resolveTemplateDefaults } from "..";
import type { TemplateCompositionBase, TemplateOutput } from "../types";

// ── Fixture templates (test-only; the framework ships none) ────────────────────────────────
type BasicParams = { title: string; body?: string };

const basic = createTemplateDefinition({
  name: "basic",
  format: "horizontal",
  capabilities: { formats: ["horizontal", "square"], providesTransitions: true, minScenes: 2, maxScenes: 3 },
  validate: (p: BasicParams) => { if (!p.title) throw new Error("basic: `title` is required."); },
  build: (p: BasicParams) => ({
    scenes: [
      { scene: "hero", duration: 1, props: { title: p.title } },
      { scene: "outro", duration: 1, props: { title: p.body ?? "" } },
    ],
    transitions: { type: "dissolve", duration: 0.5 },
  }),
});

// No default transition (exercises the brand/framework tiers).
const plain = createTemplateDefinition({
  name: "plain",
  build: () => ({ scenes: [{ scene: "hero", duration: 1, props: {} }, { scene: "outro", duration: 1, props: {} }] }),
});

// A scene-level transition on the middle boundary (exercises "scene wins").
const triple = createTemplateDefinition({
  name: "triple",
  build: () => ({
    scenes: [
      { scene: "hero", duration: 1, props: {} },
      { scene: "centered", duration: 1, props: {}, transition: { type: "none" } },
      { scene: "outro", duration: 1, props: {} },
    ],
    transitions: { type: "dissolve", duration: 0.5 },
  }),
});

const requiresBrand = createTemplateDefinition({
  name: "requiresBrand",
  capabilities: { requiresBrand: true },
  build: () => ({ scenes: [{ scene: "hero", duration: 1, props: {} }, { scene: "outro", duration: 1, props: {} }] }),
});

// Capability must be checked BEFORE build — this build would throw if ever reached.
const guard = createTemplateDefinition({
  name: "guard",
  capabilities: { requiresBrand: true },
  build: () => { throw new Error("guard build must not run"); },
});

const tooFew = createTemplateDefinition({
  name: "tooFew",
  capabilities: { minScenes: 2 },
  build: () => ({ scenes: [{ scene: "hero", duration: 1, props: {} }] }),
});

const tooMany = createTemplateDefinition({
  name: "tooMany",
  capabilities: { maxScenes: 1 },
  build: () => ({ scenes: [{ scene: "hero", duration: 1, props: {} }, { scene: "outro", duration: 1, props: {} }] }),
});

const badDecl = createTemplateDefinition({
  name: "badDecl",
  capabilities: { variableLength: false, minScenes: 2, maxScenes: 3 },
  build: () => ({ scenes: [{ scene: "hero", duration: 1, props: {} }, { scene: "outro", duration: 1, props: {} }] }),
});

const emptyOut = createTemplateDefinition({
  name: "emptyOut",
  build: () => ({ scenes: [] }),
});

const malformed = createTemplateDefinition({
  name: "malformed",
  build: () => ({}) as TemplateOutput,
});

const templates = createRegistry({
  basic, plain, triple, requiresBrand, guard, tooFew, tooMany, badDecl, emptyOut, malformed,
});

const brands = createRegistry({
  b: createBrandDefinition({ name: "B", transition: { type: "dissolve", duration: 1 } }),
});

const build = (spec: TemplateCompositionBase) =>
  buildFromTemplate(spec, templates, sceneRegistry, transitionRegistry, assetRegistry, brands);

const find = (node: unknown, type: unknown, acc: ReactElement[] = []): ReactElement[] => {
  if (Array.isArray(node)) return node.reduce((a, n) => find(n, type, a), acc);
  if (!isValidElement(node)) return acc;
  if (node.type === type) acc.push(node);
  return find((node.props as { children?: unknown }).children, type, acc);
};

// Ordered list of every element's component name — a structural signature of the assembled tree.
const componentOrder = (node: unknown, acc: string[] = []): string[] => {
  if (Array.isArray(node)) return node.reduce((a, n) => componentOrder(n, a), acc);
  if (!isValidElement(node)) return acc;
  const t = node.type as string | { displayName?: string; name?: string };
  acc.push(typeof t === "string" ? t : t.displayName ?? t.name ?? "anon");
  return componentOrder((node.props as { children?: unknown }).children, acc);
};

// The positioned scene-run Sequences (from + durationInFrames) — the timeline signature.
const sequenceSignature = (node: unknown): Array<{ from?: number; durationInFrames?: number }> =>
  find(node, Sequence).map((s) => {
    const p = s.props as { from?: number; durationInFrames?: number };
    return { from: p.from, durationInFrames: p.durationInFrames };
  });

// ── Resolution + validation ────────────────────────────────────────────────────────────────
describe("buildFromTemplate — resolution & validation", () => {
  it("throws a clear error for an unknown template", () => {
    expect(() => build({ id: "x", template: "nope", params: {} })).toThrow(/no template registered as "nope"/);
  });

  it("runs the template's validate(params) hook", () => {
    expect(() => build({ id: "x", template: "basic", params: {} })).toThrow(/`title` is required/);
  });

  it("rejects an empty scene output", () => {
    expect(() => build({ id: "x", template: "emptyOut", params: {} })).toThrow(/produced no scenes/);
  });

  it("rejects a malformed TemplateOutput", () => {
    expect(() => build({ id: "x", template: "malformed", params: {} })).toThrow(/must return a TemplateOutput/);
  });
});

// ── Capabilities ─────────────────────────────────────────────────────────────────────────
describe("buildFromTemplate — capabilities", () => {
  it("accepts a supported format and rejects an unsupported one", () => {
    expect(build({ id: "x", template: "basic", format: "square", params: { title: "Hi" } }).width).toBe(1080);
    expect(() => build({ id: "x", template: "basic", format: "vertical", params: { title: "Hi" } })).toThrow(
      /does not support format "vertical"/,
    );
  });

  it("enforces requiresBrand", () => {
    expect(() => build({ id: "x", template: "requiresBrand", params: {} })).toThrow(/requires a brand/);
    expect(build({ id: "x", template: "requiresBrand", brand: "b", params: {} }).durationInFrames).toBeGreaterThan(0);
  });

  it("checks capabilities BEFORE build() runs", () => {
    // requiresBrand fails first; the throwing build is never reached.
    expect(() => build({ id: "x", template: "guard", params: {} })).toThrow(/requires a brand/);
  });

  it("enforces minScenes and maxScenes", () => {
    expect(() => build({ id: "x", template: "tooFew", params: {} })).toThrow(/fewer than its declared minimum/);
    expect(() => build({ id: "x", template: "tooMany", params: {} })).toThrow(/more than its declared maximum/);
  });

  it("rejects a contradictory fixed-length declaration", () => {
    expect(() => build({ id: "x", template: "badDecl", params: {} })).toThrow(/fixed-length template must declare an exact count/);
  });
});

// ── Precedence ─────────────────────────────────────────────────────────────────────────────
describe("buildFromTemplate — transition precedence (scene > caller > template > brand > framework)", () => {
  it("uses the template default when nothing overrides it", () => {
    // 2×1s − dissolve 0.5s (15f) = 45.
    expect(build({ id: "x", template: "basic", params: { title: "Hi" } }).durationInFrames).toBe(45);
  });

  it("lets the caller override the template default", () => {
    expect(build({ id: "x", template: "basic", transitions: { type: "none" }, params: { title: "Hi" } }).durationInFrames).toBe(60);
  });

  it("lets the template default beat the brand default", () => {
    // template dissolve 0.5s (15f) vs brand dissolve 1.0s (30f) → template wins → 45.
    expect(build({ id: "x", template: "basic", brand: "b", params: { title: "Hi" } }).durationInFrames).toBe(45);
  });

  it("falls back to the brand default, then the framework default", () => {
    expect(build({ id: "x", template: "plain", brand: "b", params: {} }).durationInFrames).toBe(30); // brand 1.0s
    expect(build({ id: "x", template: "plain", params: {} }).durationInFrames).toBe(60); // framework cut
  });

  it("lets a scene-level transition win over the caller default", () => {
    // triple: scene[1] forces `none` (0f); caller fade (15f) applies only at the last boundary.
    // 90 − 0 − 15 = 75 (if the scene were ignored it would be 60).
    expect(build({ id: "x", template: "triple", transitions: { type: "fade", duration: 0.5 }, params: {} }).durationInFrames).toBe(75);
  });
});

describe("resolveTemplateDefaults — music & timing precedence", () => {
  it("music: caller > template (brand audio default fills in downstream)", () => {
    const output = { music: { asset: "b" } };
    expect(resolveTemplateDefaults({ music: { asset: "a" } }, output).music).toEqual({ asset: "a" });
    expect(resolveTemplateDefaults({}, output).music).toEqual({ asset: "b" });
    expect(resolveTemplateDefaults({}, {}).music).toBeUndefined();
  });

  it("timing: caller > template > framework", () => {
    const output = { timing: { defaultSceneDuration: 3 } };
    expect(resolveTemplateDefaults({ timing: { defaultSceneDuration: 5 } }, output).timing).toEqual({ defaultSceneDuration: 5 });
    expect(resolveTemplateDefaults({}, output).timing).toEqual({ defaultSceneDuration: 3 });
    expect(resolveTemplateDefaults({}, {}).timing).toBeUndefined();
  });
});

describe("buildFromTemplate — brand audio default (end to end)", () => {
  it("wires the selected brand's default audio when caller & template omit music", () => {
    const kit = createAssetKit({ bed: createAssetDefinition({ category: "audio", source: "https://cdn/bed.mp3" }) });
    const branded = createRegistry({ m: createBrandDefinition({ name: "M", assets: kit, audio: { music: "bed" } }) });
    const built = buildFromTemplate(
      { id: "M", template: "plain", brand: "m", params: {} },
      templates, sceneRegistry, transitionRegistry, kit.registry, branded,
    );
    const audios = find(built.component({}), Audio);
    expect(audios).toHaveLength(1);
    expect((audios[0].props as { src?: string }).src).toBe("https://cdn/bed.mp3");
  });
});

// ── Delegation, parity, demo integrity ───────────────────────────────────────────────────────
describe("buildFromTemplate — delegation & parity", () => {
  it("produces output identical to the equivalent handwritten CompositionSchema", () => {
    const built = build({ id: "P", template: "basic", format: "horizontal", params: { title: "Hi", body: "there" } });
    const handwritten = buildComposition(
      {
        id: "P", format: "horizontal",
        scenes: [
          { scene: "hero", duration: 1, props: { title: "Hi" } },
          { scene: "outro", duration: 1, props: { title: "there" } },
        ],
        transitions: { type: "dissolve", duration: 0.5 },
      },
      sceneRegistry, transitionRegistry, assetRegistry,
    );
    expect(built.durationInFrames).toBe(handwritten.durationInFrames);
    expect(built.durationInFrames).toBe(45);
    expect(built.width).toBe(handwritten.width);
    expect(built.height).toBe(handwritten.height);
    expect(built.fps).toBe(handwritten.fps);
    expect(isValidElement(built.component({}))).toBe(true);
  });

  it("structural parity: a template schema + its built composition match a handwritten equivalent", () => {
    const spec: TemplateCompositionBase = {
      id: "P", template: "basic", format: "horizontal", params: { title: "Hi", body: "there" },
    };
    const handwritten: CompositionSchemaBase = {
      id: "P", format: "horizontal",
      scenes: [
        { scene: "hero", duration: 1, props: { title: "Hi" } },
        { scene: "outro", duration: 1, props: { title: "there" } },
      ],
      transitions: { type: "dissolve", duration: 0.5 },
    };

    // 1. The template-generated CompositionSchema equals the handwritten one (structure).
    expect(resolveTemplateComposition(spec, templates)).toEqual(handwritten);

    // 2. The built compositions match on canvas + timeline duration.
    const fromTemplate = buildFromTemplate(spec, templates, sceneRegistry, transitionRegistry, assetRegistry);
    const fromHand = buildComposition(handwritten, sceneRegistry, transitionRegistry, assetRegistry);
    expect(fromTemplate.durationInFrames).toBe(fromHand.durationInFrames);
    expect([fromTemplate.width, fromTemplate.height, fromTemplate.fps]).toEqual([fromHand.width, fromHand.height, fromHand.fps]);

    // 3. The assembled tree matches structurally (positioned Sequence runs + scene-component order).
    expect(sequenceSignature(fromTemplate.component({}))).toEqual(sequenceSignature(fromHand.component({})));
    expect(componentOrder(fromTemplate.component({}))).toEqual(componentOrder(fromHand.component({})));
  });

  it("leaves the existing demo unchanged (330 frames)", () => {
    const built = buildComposition(demoConfig);
    expect(built.durationInFrames).toBe(330);
  });
});
