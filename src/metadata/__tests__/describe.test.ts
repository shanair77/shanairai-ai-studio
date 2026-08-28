import { describe, expect, it } from "vitest";
import { createRegistry } from "../../registry";
import { defineAsset, defineAssetKit } from "../../assets";
import { defineBrand } from "../../brand";
import { defineTemplate } from "../../templates";
import { type ValidatorMap } from "../../parameters";
import {
  describeAssets,
  describeBrands,
  describeFramework,
  describeParameterTypes,
  describeRegistries,
  describeScenes,
  describeTemplate,
  describeTemplates,
  describeTransitions,
  describeValidators,
  getCapabilities,
  SCHEMA_VERSION,
} from "..";

// ── Fixture registries ─────────────────────────────────────────────────────────────────────────
const assets = createRegistry({
  heroImg: defineAsset({ category: "image", source: "images/hero.png", roles: ["background"], metadata: { width: 1920, height: 1080 } }),
  remoteVid: defineAsset({ category: "video", source: "https://cdn/clip.mp4" }), // bare url string
  localAudio: defineAsset({ category: "audio", source: "audio/bed.mp3" }), // bare relative path
  structuredRemote: defineAsset({ category: "svg", source: { kind: "remote", url: "https://cdn/logo.svg" } }),
  structuredLocal: defineAsset({ category: "image", source: { kind: "local", path: "images/x.png" } }),
});

const kit = defineAssetKit({ mark: defineAsset({ category: "svg", source: "https://cdn/m.svg" }) });
const brands = createRegistry({
  midnight: defineBrand({ // display name ("Midnight Co") ≠ registry key ("midnight")
    name: "Midnight Co",
    mode: "dark",
    theme: { colors: { accent: "#00E0C6" } },
    fonts: [
      { family: "Inter", weights: [400], styles: ["normal"], subsets: ["latin"] },
      { family: "Inter", weights: [700], styles: ["normal"], subsets: ["latin"] }, // dup family
    ],
    assets: kit,
    logos: { primary: "mark" },
    meta: { legal: "© Midnight", handles: { x: "@midnight" } },
  }),
});

const templates = createRegistry({
  promo: defineTemplate({ // display name ("Promo") ≠ key ("promo")
    name: "Promo", version: "test",
    format: "horizontal",
    capabilities: { formats: ["horizontal", "square"], requiresBrand: true, minScenes: 2 },
    parameters: { parameters: [{ key: "title", type: "string", required: true }] },
    meta: { description: "A promo.", category: "marketing", previewParams: { title: "Hi" } },
    build: () => ({ scenes: [{ scene: "hero", duration: 1, props: {} }] }),
  }),
  boom: defineTemplate({
    name: "boom", version: "test",
    validate: () => { throw new Error("validate boom"); },
    build: () => { throw new Error("build boom"); },
  }),
});

const validators = createRegistry<ValidatorMap>({ nonEmpty: () => {} });
const all = { assets, brands, templates, validators };

const hasFunction = (v: unknown): boolean => {
  if (typeof v === "function") return true;
  if (Array.isArray(v)) return v.some(hasFunction);
  if (v && typeof v === "object") return Object.values(v).some(hasFunction);
  return false;
};

// ── Projection correctness ─────────────────────────────────────────────────────────────────────
describe("describe* — projection", () => {
  it("scenes: defaultDuration + opaque, identity, sorted, no component", () => {
    const scenes = describeScenes(); // built-ins
    expect(scenes).toEqual([...scenes].sort((a, b) => a.key.localeCompare(b.key)));
    const hero = scenes.find((s) => s.key === "hero");
    expect(hero).toMatchObject({ key: "hero", qualifiedName: "scenes:hero", opaque: true });
    expect(typeof hero?.defaultDuration).toBe("number");
    expect(hero).not.toHaveProperty("component");
  });

  it("transitions: capabilities only, no presentation", () => {
    const t = describeTransitions().find((x) => x.key === "dissolve");
    expect(t?.capabilities).toMatchObject({ supportsTransparency: true });
    expect(t).not.toHaveProperty("presentation");
  });

  it("parameter types: ui/capabilities only, no parse/validate", () => {
    const s = describeParameterTypes().find((x) => x.key === "string");
    expect(s?.qualifiedName).toBe("parameterTypes:string");
    expect(s).not.toHaveProperty("parse");
  });

  it("validators: key + qualifiedName only", () => {
    expect(describeValidators(validators)).toEqual([{ key: "nonEmpty", qualifiedName: "validators:nonEmpty" }]);
  });

  it("registries: family/keys/count, sorted keys", () => {
    const regs = describeRegistries(all);
    expect(regs.find((r) => r.family === "assets")).toMatchObject({ count: 5 });
    expect(regs.find((r) => r.family === "assets")?.keys).toEqual([...(regs.find((r) => r.family === "assets")?.keys ?? [])].sort());
  });
});

// ── Identity ─────────────────────────────────────────────────────────────────────────────────────
describe("identity — key canonical, name display", () => {
  it("uses the registry key as canonical and the definition name as display", () => {
    const b = describeBrands(brands)[0];
    expect(b.key).toBe("midnight"); // canonical
    expect(b.name).toBe("Midnight Co"); // display, differs from key
    expect(b.qualifiedName).toBe("brands:midnight");
    const t = describeTemplate("promo", templates);
    expect(t).toMatchObject({ key: "promo", name: "Promo", qualifiedName: "templates:promo" });
  });
});

// ── Brands ───────────────────────────────────────────────────────────────────────────────────────
describe("describeBrands", () => {
  it("projects hasTheme, deduped fontFamilies, logos, kitAssets, meta", () => {
    const b = describeBrands(brands)[0];
    expect(b.hasTheme).toBe(true);
    expect(b.fontFamilies).toEqual(["Inter"]); // deduped
    expect(b.logos).toEqual({ primary: "mark" });
    expect(b.kitAssets).toEqual(["mark"]);
    expect(b.meta).toEqual({ legal: "© Midnight", handles: { x: "@midnight" } });
    expect(b).not.toHaveProperty("assets"); // the kit (code) is excluded
  });
});

// ── Assets: source summary (declarative) ─────────────────────────────────────────────────────────
describe("describeAssets — declarative source summary", () => {
  it("local asset (relative path) → file", () => {
    expect(describeAssets(assets).find((a) => a.key === "localAudio")?.source).toEqual({ kind: "file", path: "audio/bed.mp3" });
    expect(describeAssets(assets).find((a) => a.key === "structuredLocal")?.source).toEqual({ kind: "file", path: "images/x.png" });
  });
  it("remote asset (bare URL string + structured) → url", () => {
    expect(describeAssets(assets).find((a) => a.key === "remoteVid")?.source).toEqual({ kind: "url", url: "https://cdn/clip.mp4" });
    expect(describeAssets(assets).find((a) => a.key === "structuredRemote")?.source).toEqual({ kind: "url", url: "https://cdn/logo.svg" });
  });
  it("bare relative path → file (not rewritten)", () => {
    expect(describeAssets(assets).find((a) => a.key === "heroImg")?.source).toEqual({ kind: "file", path: "images/hero.png" });
  });
  it("projects category/roles/metadata without resolving", () => {
    const a = describeAssets(assets).find((x) => x.key === "heroImg");
    expect(a).toMatchObject({ category: "image", roles: ["background"], metadata: { width: 1920, height: 1080 } });
  });
});

// ── Templates ────────────────────────────────────────────────────────────────────────────────────
describe("describeTemplates", () => {
  it("projects capabilities + the ParameterSchema verbatim + sanitized meta; excludes build/validate", () => {
    const t = describeTemplate("promo", templates)!;
    expect(t.capabilities).toMatchObject({ requiresBrand: true, formats: ["horizontal", "square"] });
    expect(t.parameters).toEqual({ parameters: [{ key: "title", type: "string", required: true }] });
    expect(t.meta).toEqual({ description: "A promo.", category: "marketing", previewParams: { title: "Hi" } });
    expect(t).not.toHaveProperty("build");
    expect(t).not.toHaveProperty("validate");
  });
  it("describeTemplate returns undefined for an unknown key", () => {
    expect(describeTemplate("nope", templates)).toBeUndefined();
  });
});

// ── The defining guarantee: describe never executes ──────────────────────────────────────────────
describe("no-execution guarantee", () => {
  it("describes a template whose build() AND validate() throw — without invoking them", () => {
    expect(() => describeTemplate("boom", templates)).not.toThrow();
    expect(() => describeTemplates(templates)).not.toThrow();
    expect(describeTemplate("boom", templates)).toMatchObject({ key: "boom", qualifiedName: "templates:boom" });
    expect(() => describeFramework(all)).not.toThrow();
  });
});

// ── Capabilities ────────────────────────────────────────────────────────────────────────────────
describe("getCapabilities", () => {
  it("aggregates formats, categories, requiresBrand, and counts", () => {
    const caps = getCapabilities(all);
    expect(caps.formats).toEqual(["horizontal", "square"]); // union of promo.format + capabilities.formats, sorted
    expect(caps.assetCategories).toEqual(["audio", "image", "svg", "video"]); // sorted, deduped
    expect(caps.templatesRequiringBrand).toEqual(["promo"]);
    expect(caps.transitions.supportsTransparency).toContain("dissolve");
    expect(caps.counts.assets).toBe(5);
    expect(caps.counts.brands).toBe(1);
  });
});

// ── Aggregate + JSON safety + determinism ────────────────────────────────────────────────────────
describe("describeFramework — JSON-safe + deterministic", () => {
  it("carries schemaVersion + optional frameworkVersion", () => {
    expect(describeFramework(all).schemaVersion).toBe(SCHEMA_VERSION);
    expect(describeFramework(all, { frameworkVersion: "9.9" }).frameworkVersion).toBe("9.9");
    expect(describeFramework(all)).not.toHaveProperty("frameworkVersion");
  });

  it("contains no functions and round-trips through JSON", () => {
    const fw = describeFramework(all);
    expect(hasFunction(fw)).toBe(false);
    expect(JSON.parse(JSON.stringify(fw))).toEqual(fw);
  });

  it("is deterministic across calls", () => {
    expect(describeFramework(all)).toEqual(describeFramework(all));
  });
});
