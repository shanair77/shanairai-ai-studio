import { describe, expect, it } from "vitest";
import { createRegistry } from "../../registry";
import { createAssetDefinition } from "../../assets";
import { createBrandDefinition } from "../../brand";
import {
  resolveParameters,
  validateParameters,
  type ParameterContext,
  type ParameterSchema,
  type ValidatorMap,
} from "..";

const assets = createRegistry({
  heroImg: createAssetDefinition({ category: "image", source: "https://cdn/h.png" }),
  bed: createAssetDefinition({ category: "audio", source: "https://cdn/b.mp3" }),
  clip: createAssetDefinition({ category: "video", source: "https://cdn/c.mp4" }),
});
const brands = createRegistry({ acme: createBrandDefinition({ name: "Acme" }) });
const validators = createRegistry<ValidatorMap>({
  nonEmpty: (value, _def, _ctx, issues, path) => {
    if (typeof value === "string" && value.trim() === "") issues.push({ path, code: "non-empty", severity: "error", message: "must not be blank" });
  },
});
const ctx: ParameterContext = { assets, brands, validators };

const schema = (parameters: ParameterSchema["parameters"]): ParameterSchema => ({ parameters });
const codes = (schemaDef: ParameterSchema, values: Record<string, unknown>) =>
  validateParameters(schemaDef, values as never, ctx).map((i) => i.code);
/** Test convenience: resolve and unwrap the value (throws on failure). */
const resolved = (schemaDef: ParameterSchema, values: Record<string, unknown>) => {
  const r = resolveParameters(schemaDef, values as never, ctx);
  if (!r.ok) throw new Error(r.errors.map((i) => `${i.path}: ${i.message}`).join("; "));
  return r.value;
};

// ── Defaults & precedence ────────────────────────────────────────────────────────────────────
describe("defaults & precedence", () => {
  it("applies parameter defaults and the boolean type default", () => {
    const s = schema([
      { key: "title", type: "string", default: "Untitled" },
      { key: "loop", type: "boolean" },
    ]);
    const r = resolved(s, {});
    expect(r).toEqual({ title: "Untitled", loop: false });
  });

  it("caller value beats the parameter default", () => {
    const s = schema([{ key: "title", type: "string", default: "Untitled" }]);
    expect(resolved(s, { title: "Nova" })).toEqual({ title: "Nova" });
  });

  it("leaves an absent optional with no default undefined", () => {
    const s = schema([{ key: "subtitle", type: "string" }]);
    expect(resolved(s, {})).toEqual({});
  });
});

// ── Required ─────────────────────────────────────────────────────────────────────────────────
describe("required", () => {
  it("reports a missing required parameter", () => {
    expect(codes(schema([{ key: "title", type: "string", required: true }]), {})).toEqual(["required"]);
  });
  it("passes when the required value is present", () => {
    expect(codes(schema([{ key: "title", type: "string", required: true }]), { title: "Hi" })).toEqual([]);
  });
});

// ── Per-type parse ───────────────────────────────────────────────────────────────────────────
describe("type parse", () => {
  it("flags a value of the wrong shape as invalid-type", () => {
    expect(codes(schema([{ key: "n", type: "number" }]), { n: "x" })).toEqual(["invalid-type"]);
    expect(codes(schema([{ key: "b", type: "boolean" }]), { b: 1 })).toEqual(["invalid-type"]);
    expect(codes(schema([{ key: "l", type: "list" }]), { l: {} })).toEqual(["invalid-type"]);
    expect(codes(schema([{ key: "g", type: "group" }]), { g: [] })).toEqual(["invalid-type"]);
  });
  it("accepts well-shaped primitives", () => {
    expect(codes(schema([{ key: "n", type: "number" }, { key: "b", type: "boolean" }, { key: "t", type: "text" }]),
      { n: 3, b: true, t: "multi\nline" })).toEqual([]);
  });
});

// ── Numeric / string constraints ──────────────────────────────────────────────────────────────
describe("constraints", () => {
  it("number min/max/step", () => {
    const s = schema([{ key: "n", type: "number", constraints: { min: 1, max: 10, step: 2 } }]);
    expect(codes(s, { n: 0 })).toEqual(["min"]);
    expect(codes(s, { n: 12 })).toEqual(["max"]);
    expect(codes(s, { n: 3 })).toEqual(["step"]);
    expect(codes(s, { n: 4 })).toEqual([]);
  });
  it("string length + regex", () => {
    const s = schema([{ key: "code", type: "string", constraints: { min: 2, max: 4, pattern: "^[a-z]+$" } }]);
    expect(codes(s, { code: "a" })).toEqual(["minLength"]);
    expect(codes(s, { code: "abcde" })).toEqual(["maxLength"]);
    expect(codes(s, { code: "AB" })).toEqual(["pattern"]);
    expect(codes(s, { code: "abc" })).toEqual([]);
  });
  it("enum membership", () => {
    const s = schema([{ key: "size", type: "enum", constraints: { enum: ["s", "m", "l"] } }]);
    expect(codes(s, { size: "xl" })).toEqual(["enum"]);
    expect(codes(s, { size: "m" })).toEqual([]);
  });
});

// ── Grammar types ──────────────────────────────────────────────────────────────────────────────
describe("grammar types", () => {
  it("color / url / date", () => {
    expect(codes(schema([{ key: "c", type: "color" }]), { c: "#12g" })).toEqual(["invalid-color"]);
    expect(codes(schema([{ key: "c", type: "color" }]), { c: "#1a2b3c" })).toEqual([]);
    expect(codes(schema([{ key: "u", type: "url" }]), { u: "not a url" })).toEqual(["invalid-url"]);
    expect(codes(schema([{ key: "u", type: "url" }]), { u: "https://x.com" })).toEqual([]);
    expect(codes(schema([{ key: "d", type: "date" }]), { d: "nope" })).toEqual(["invalid-date"]);
    expect(codes(schema([{ key: "d", type: "date" }]), { d: "2026-07-18" })).toEqual([]);
  });
});

// ── Lists & groups ───────────────────────────────────────────────────────────────────────────
describe("lists & groups", () => {
  it("list length + item type", () => {
    const s = schema([{ key: "tags", type: "list", constraints: { itemType: "string", min: 1, max: 2 } }]);
    expect(codes(s, { tags: [] })).toEqual(["minItems"]);
    expect(codes(s, { tags: ["a", "b", "c"] })).toEqual(["maxItems"]);
    expect(codes(s, { tags: ["a", 3] })).toEqual(["invalid-type"]); // item[1] wrong type
    expect(codes(s, { tags: ["a"] })).toEqual([]);
  });

  it("nested group fields + nested required + nested resolved value", () => {
    const s = schema([
      { key: "cta", type: "group", constraints: { fields: [
        { key: "label", type: "string", required: true },
        { key: "url", type: "url", default: "https://x.com" },
      ] } },
    ]);
    expect(validateParameters(s, { cta: {} } as never, ctx).map((i) => i.path)).toEqual(["cta.label"]);
    expect(resolved(s, { cta: { label: "Go" } })).toEqual({ cta: { label: "Go", url: "https://x.com" } });
  });
});

// ── Asset & brand (names only) ──────────────────────────────────────────────────────────────────
describe("asset & brand reference validation", () => {
  it("image: existence + category compatibility", () => {
    expect(codes(schema([{ key: "img", type: "image" }]), { img: "missing" })).toEqual(["unknown-asset"]);
    expect(codes(schema([{ key: "img", type: "image" }]), { img: "bed" })).toEqual(["asset-category"]); // bed is audio
    expect(codes(schema([{ key: "img", type: "image" }]), { img: "heroImg" })).toEqual([]);
  });
  it("audio & video categories", () => {
    expect(codes(schema([{ key: "a", type: "audio" }]), { a: "bed" })).toEqual([]);
    expect(codes(schema([{ key: "v", type: "video" }]), { v: "clip" })).toEqual([]);
    expect(codes(schema([{ key: "a", type: "audio" }]), { a: "heroImg" })).toEqual(["asset-category"]);
  });
  it("brand: existence only", () => {
    expect(codes(schema([{ key: "b", type: "brand" }]), { b: "nope" })).toEqual(["unknown-brand"]);
    expect(codes(schema([{ key: "b", type: "brand" }]), { b: "acme" })).toEqual([]);
  });
  it("skips reference checks when no registry is supplied", () => {
    expect(validateParameters(schema([{ key: "img", type: "image" }]), { img: "whatever" } as never, {})).toEqual([]);
  });
});

// ── Named validators ──────────────────────────────────────────────────────────────────────────
describe("named validators", () => {
  it("runs a registered validator", () => {
    expect(codes(schema([{ key: "t", type: "string", validators: ["nonEmpty"] }]), { t: "   " })).toEqual(["non-empty"]);
    expect(codes(schema([{ key: "t", type: "string", validators: ["nonEmpty"] }]), { t: "ok" })).toEqual([]);
  });
  it("reports an unknown validator name", () => {
    expect(codes(schema([{ key: "t", type: "string", validators: ["ghost"] }]), { t: "x" })).toEqual(["unknown-validator"]);
  });
});

// ── Conditional rules ──────────────────────────────────────────────────────────────────────────
describe("conditional rules", () => {
  it("requiredWhen makes a field required only when the condition holds", () => {
    const s = schema([
      { key: "hasCta", type: "boolean" },
      { key: "ctaLabel", type: "string", conditions: { requiredWhen: { key: "hasCta", equals: true } } },
    ]);
    expect(codes(s, { hasCta: false })).toEqual([]);
    expect(codes(s, { hasCta: true })).toEqual(["required"]);
    expect(codes(s, { hasCta: true, ctaLabel: "Buy" })).toEqual([]);
  });

  it("visibleWhen gates the required check", () => {
    const s = schema([
      { key: "advanced", type: "boolean" },
      { key: "seed", type: "number", required: true, conditions: { visibleWhen: { key: "advanced", equals: true } } },
    ]);
    expect(codes(s, { advanced: false })).toEqual([]); // hidden → not required
    expect(codes(s, { advanced: true })).toEqual(["required"]);
  });
});

// ── Result behavior & immutability ──────────────────────────────────────────────────────────────
describe("Result behavior & immutability", () => {
  it("resolveParameters returns ok with resolved params or err with issues", () => {
    const s = schema([{ key: "title", type: "string", required: true }]);
    const good = resolveParameters(s, { title: "Hi" }, ctx);
    expect(good.ok).toBe(true);
    if (good.ok) expect(good.value).toEqual({ title: "Hi" });

    const bad = resolveParameters(s, {}, ctx);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors[0]).toMatchObject({ path: "title", code: "required", severity: "error" });
  });

  it("resolveParameters returns err on invalid params", () => {
    const s = schema([{ key: "n", type: "number", constraints: { min: 5 } }]);
    const r = resolveParameters(s, { n: 1 } as never, ctx);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.map((i) => i.code)).toContain("min");
  });

  it("resolved params are deeply frozen", () => {
    const s = schema([{ key: "cta", type: "group", constraints: { fields: [{ key: "label", type: "string", default: "Go" }] } }]);
    const r = resolved(s, {}) as { cta: { label: string } };
    expect(Object.isFrozen(r)).toBe(true);
    expect(Object.isFrozen(r.cta)).toBe(true);
    expect(() => { (r as { cta: { label: string } }).cta.label = "x"; }).toThrow(TypeError);
  });
});

// ── Serializability ────────────────────────────────────────────────────────────────────────────
describe("serializability", () => {
  it("a schema round-trips through JSON unchanged", () => {
    const s: ParameterSchema = {
      parameters: [
        { key: "title", type: "string", required: true, constraints: { min: 1, max: 80 }, metadata: { label: "Title" } },
        { key: "size", type: "enum", constraints: { options: [{ value: "s", label: "Small" }, { value: "l", label: "Large" }] } },
        { key: "cta", type: "group", constraints: { fields: [{ key: "url", type: "url" }] }, conditions: { visibleWhen: { key: "size", equals: "l" } } },
      ],
    };
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });
});
