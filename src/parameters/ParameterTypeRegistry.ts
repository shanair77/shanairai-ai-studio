/**
 * parameters/ParameterTypeRegistry — the built-in parameter-type vocabulary + its registry.
 *
 * Each entry is BEHAVIOR only (ADR-006 §4.2): `parse` guards/coerces the JSON shape (throwing on a
 * mismatch — the resolver turns that into an issue), and `validate` checks intrinsic validity
 * (grammar, or a NAME's existence/category) by PUSHING issues. Asset/brand types verify references
 * ONLY — existence + category — never resolving, loading, or inspecting metadata (ADR-006 §4.10).
 *
 * Mirrors `builtinTransitions` / `transitionRegistry`: the framework ships this primitive
 * vocabulary; packs extend it with `.extend(...)`.
 */

import { createRegistry } from "../registry";
import { type AssetCategory } from "../assets";
import { createParameterTypeDefinition } from "./definition";
import {
  type ParameterContext,
  type ParameterDefinition,
  type ParameterIssue,
  type ParameterTypeDefinition,
  type ParameterTypeName,
  type ParameterValue,
} from "./types";

const expect = (cond: boolean, kind: string): void => {
  if (!cond) throw new Error(`Expected ${kind}.`);
};
const isPlainObject = (v: unknown): v is Record<string, ParameterValue> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const HEX = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const FUNC_COLOR = /^(rgb|hsl)a?\(/;
const TOKEN = /^[a-zA-Z][\w-]*$/;

/** image/video/audio share one shape: a name whose asset must exist with a matching category. */
const assetType = (typeName: string, category: AssetCategory): ParameterTypeDefinition<string> =>
  createParameterTypeDefinition<string>({
    name: typeName,
    parse: (raw) => {
      expect(typeof raw === "string", typeName);
      return raw as string;
    },
    validate: (value, def, ctx, issues, path) => {
      if (!ctx.assets) return; // no registry to check against → best-effort (skip)
      const required: AssetCategory = def.constraints?.assetCategory ?? category;
      if (!ctx.assets.has(value)) {
        issues.push({ path, code: "unknown-asset", severity: "error", message: `No asset registered as "${value}".`, actual: value });
        return;
      }
      const actual = ctx.assets.require(value).category; // discriminant only — never resolved/loaded
      if (actual !== required) {
        issues.push({
          path, code: "asset-category", severity: "error",
          message: `Asset "${value}" is a ${actual}, expected a ${required}.`, expected: required, actual,
        });
      }
    },
    ui: { control: "assetPicker" },
  });

const str = (name: string, control: "input" | "textarea"): ParameterTypeDefinition<string> =>
  createParameterTypeDefinition<string>({
    name,
    parse: (raw) => {
      expect(typeof raw === "string", name);
      return raw as string;
    },
    ui: { control },
  });

/** The built-in parameter types (BEHAVIOR only). */
export const builtinParameterTypes = {
  string: str("string", "input"),
  text: str("text", "textarea"),

  number: createParameterTypeDefinition<number>({
    name: "number",
    parse: (raw) => {
      expect(typeof raw === "number" && Number.isFinite(raw), "number");
      return raw as number;
    },
    ui: { control: "input" },
  }),

  boolean: createParameterTypeDefinition<boolean>({
    name: "boolean",
    parse: (raw) => {
      expect(typeof raw === "boolean", "boolean");
      return raw as boolean;
    },
    ui: { control: "switch" },
  }),

  // Membership is a CONSTRAINT (policy) checked by the resolver; the type only guards a primitive.
  enum: createParameterTypeDefinition<ParameterValue>({
    name: "enum",
    parse: (raw) => {
      expect(typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean", "enum value");
      return raw as ParameterValue;
    },
    ui: { control: "select" },
  }),

  color: createParameterTypeDefinition<string>({
    name: "color",
    parse: (raw) => {
      expect(typeof raw === "string", "color");
      return raw as string;
    },
    validate: (value, _def, _ctx, issues, path) => {
      const ok = HEX.test(value) || FUNC_COLOR.test(value) || TOKEN.test(value);
      if (!ok) issues.push({ path, code: "invalid-color", severity: "error", message: `"${value}" is not a valid color.`, actual: value });
    },
    ui: { control: "colorPicker" },
  }),

  image: assetType("image", "image"),
  video: assetType("video", "video"),
  audio: assetType("audio", "audio"),

  brand: createParameterTypeDefinition<string>({
    name: "brand",
    parse: (raw) => {
      expect(typeof raw === "string", "brand");
      return raw as string;
    },
    validate: (value, _def, ctx, issues, path) => {
      if (ctx.brands && !ctx.brands.has(value)) {
        issues.push({ path, code: "unknown-brand", severity: "error", message: `No brand registered as "${value}".`, actual: value });
      }
    },
  }),

  date: createParameterTypeDefinition<string>({
    name: "date",
    parse: (raw) => {
      expect(typeof raw === "string", "date");
      return raw as string;
    },
    validate: (value, _def, _ctx, issues, path) => {
      if (Number.isNaN(Date.parse(value))) {
        issues.push({ path, code: "invalid-date", severity: "error", message: `"${value}" is not a valid date.`, actual: value });
      }
    },
    ui: { control: "datePicker" },
  }),

  url: createParameterTypeDefinition<string>({
    name: "url",
    parse: (raw) => {
      expect(typeof raw === "string", "url");
      return raw as string;
    },
    validate: (value, _def, _ctx, issues, path) => {
      try {
        void new URL(value);
      } catch {
        issues.push({ path, code: "invalid-url", severity: "error", message: `"${value}" is not a valid URL.`, actual: value });
      }
    },
    ui: { control: "input" },
  }),

  list: createParameterTypeDefinition<ParameterValue[]>({
    name: "list",
    parse: (raw) => {
      expect(Array.isArray(raw), "list");
      return raw as ParameterValue[];
    },
    ui: { control: "repeater" },
  }),

  group: createParameterTypeDefinition<Record<string, ParameterValue>>({
    name: "group",
    parse: (raw) => {
      expect(isPlainObject(raw), "group (object)");
      return raw as Record<string, ParameterValue>;
    },
  }),
  // Anchored to `ParameterTypeName` (not `Record<string, …>`) so the built-in map and the closed
  // name vocabulary must agree EXACTLY: a missing built-in or an extra key is a compile error. This
  // is the single guard against the two ever drifting apart (ADR-006 §13.7 item 1). `ParameterTypeName`
  // stays authoritative because `types` cannot import this module (that would be a cycle).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Record<ParameterTypeName, ParameterTypeDefinition<any>>;

/**
 * The default parameter-type registry — created directly from `builtinParameterTypes`, exactly as
 * `sceneRegistry` / `transitionRegistry` are created from `builtinScenes` / `builtinTransitions`.
 * The built-in vocabulary is the single definition site; the registry is just that map wrapped by
 * the kernel. Consumers stay consistent with the other families: extend it in place
 * (`parameterTypeRegistry.extend({ mySlug })`, immutable) or supply a replacement registry via
 * `ParameterContext.types`.
 */
export const parameterTypeRegistry = createRegistry(builtinParameterTypes);

// Re-export the issue/context types used by validators, for convenience.
export type { ParameterContext, ParameterDefinition, ParameterIssue };
