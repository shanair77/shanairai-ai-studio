/**
 * parameters/types — the Parameter Engine's typed contracts (ADR-006, Phase 21 MVP).
 *
 * Strict separation (ADR-006 §4.2): `ParameterTypeDefinition` owns BEHAVIOR (parse/validate/
 * default ui/capabilities) and is the registry family; `ParameterDefinition` owns
 * POLICY (required/default/constraints/conditions/metadata/ui) and is embedded in a template's
 * `ParameterSchema`. Everything is pure JSON except code (validators), which is referenced by name.
 * No React, no Provider, no Hooks — parameters are pre-render data (ADR-006 §5–§6).
 */

import { type AssetCategory, type AssetRegistry } from "../assets";
import { type BrandRegistry } from "../brand";

/** A pure JSON value — fully serializable. */
export type ParameterValue = string | number | boolean | null | ParameterValue[] | { [key: string]: ParameterValue };

/** The built-in parameter-type vocabulary. (`richText` is reserved — not implemented.) */
export type ParameterTypeName =
  | "string" | "text" | "number" | "boolean" | "enum" | "color"
  | "image" | "video" | "audio" | "brand" | "date" | "url" | "list" | "group";

/** One choice in an `enum` parameter. */
export type EnumOption = { value: ParameterValue; label?: string; icon?: string };

/** How this template constrains a parameter's value (policy). */
export type ParameterConstraints = {
  /** Numeric bound / string-length / list-length. */
  min?: number;
  max?: number;
  /** Numeric step (number type). */
  step?: number;
  /** Regex source (string / url). Compiled at validation time. */
  pattern?: string;
  /** Allowed values (enum). `options` is the richer form. */
  enum?: readonly ParameterValue[];
  options?: EnumOption[];
  /** Element type for a `list`. */
  itemType?: ParameterTypeName;
  /** Nested parameters for a `group` (the ONLY value nesting). */
  fields?: ParameterDefinition[];
  /** Required asset category for image/video/audio (defaults to the type's implied category). */
  assetCategory?: AssetCategory;
};

/**
 * V1 condition model (declarative JSON). An expression AST is reserved for V2 (ADR-006 §4.8) and
 * intentionally NOT implemented.
 */
export type ParameterCondition =
  | { key: string; equals: ParameterValue }
  | { key: string; in: ParameterValue[] }
  | { key: string; exists: boolean }
  | { all: ParameterCondition[] }
  | { any: ParameterCondition[] }
  | { not: ParameterCondition };

/** Conditional policy for a parameter. */
export type ParameterConditions = {
  /** The parameter is required only when this condition holds. */
  requiredWhen?: ParameterCondition;
  /** The parameter is shown/active only when this condition holds (gates required in the engine). */
  visibleWhen?: ParameterCondition;
};

/** Default UI hints for a type / per-parameter overrides. Inert — never affects validation. */
export type ParameterUIHints = {
  control?:
    | "input" | "textarea" | "select" | "radio" | "switch"
    | "slider" | "colorPicker" | "assetPicker" | "datePicker" | "repeater";
  rows?: number;
  unit?: string;
  columns?: number;
  collapsible?: boolean;
};

/** Human-facing parameter metadata for discovery. Inert — never affects validation or rendering. */
export type ParameterMetadata = {
  label?: string;
  description?: string;
  placeholder?: string;
  helpText?: string;
  /** `ParameterGroup` id (presentation only). */
  group?: string;
  advanced?: boolean;
  order?: number;
  icon?: string;
};

/** Machine-read, declarative capability flags (future-facing). Distinct from metadata. */
export type ParameterCapabilities = {
  localizable?: boolean;
  responsive?: boolean;
  computed?: boolean;
  aiGeneratable?: boolean;
};

/** One parameter's POLICY — how THIS template uses a type. Nested objects keep it lean. */
export type ParameterDefinition = {
  key: string;
  type: ParameterTypeName;
  required?: boolean;
  default?: ParameterValue;
  /** Named custom validators (serializable refs → `validatorRegistry`). No closures. */
  validators?: string[];
  constraints?: ParameterConstraints;
  conditions?: ParameterConditions;
  metadata?: ParameterMetadata;
  ui?: ParameterUIHints;
  capabilities?: ParameterCapabilities;
};

/** UI ORGANIZATION ONLY — never affects validation or the resolved value shape (ADR-006 §4.9). */
export type ParameterGroup = {
  id: string;
  label?: string;
  description?: string;
  order?: number;
  advanced?: boolean;
  /** Keys of parameters in this section. */
  parameters: string[];
};

/** A template's declarative parameter schema (embedded in `TemplateDefinition`). */
export type ParameterSchema = {
  version?: number;
  parameters: ParameterDefinition[];
  /** Optional UI sections (presentation only). */
  groups?: ParameterGroup[];
  capabilities?: ParameterCapabilities;
};

/** A validation issue — path-addressed and severity-tagged (ADR-006 §4.6). */
export type ParameterIssue = {
  /** Dotted + array-indexed path, e.g. `features[2].title`. */
  path: string;
  /** Machine code, e.g. `required`, `min`, `pattern`, `unknown-asset`. */
  code: string;
  severity: "error" | "warning";
  message: string;
  expected?: unknown;
  actual?: unknown;
};

/** Deeply-readonly view — `build()` receives resolved params it must not mutate (ADR-006 §4.11). */
export type DeepReadonly<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

/** The resolved parameter object (mutable base; results are handed out `DeepReadonly`). */
export type ResolvedParameters = Record<string, ParameterValue>;

// ── The type vocabulary (registry family — BEHAVIOR only) ────────────────────────────────────

/** A named custom validator (code, referenced by name — never inlined into a schema). */
export type Validator = (
  value: ParameterValue,
  def: ParameterDefinition,
  ctx: ParameterContext,
  issues: ParameterIssue[],
  path: string,
) => void;
export type ValidatorMap = Record<string, Validator>;
export type ValidatorResolver = { require(name: string): Validator; has(name: string): boolean; keys(): string[] };

/** Read-only context for validation: registries to check NAME references (never resolves/loads). */
export type ParameterContext = {
  /** For image/video/audio name existence + category checks (never resolves/loads assets). */
  assets?: AssetRegistry;
  /** For brand name existence checks (nothing else). */
  brands?: BrandRegistry;
  /** The parameter-type vocabulary (defaults to `parameterTypeRegistry`). */
  types?: ParameterTypeResolver;
  /** Named validators (defaults to `validatorRegistry`). */
  validators?: ValidatorResolver;
};

/** A parameter type — BEHAVIOR only (ADR-006 §4.2). Never carries template policy. */
export type ParameterTypeDefinition<V = unknown> = {
  name: string;
  /** JSON value → typed value. Throws on a shape mismatch (the resolver converts it to an issue). */
  parse: (raw: unknown, def: ParameterDefinition, ctx: ParameterContext) => V;
  /** Intrinsic validity beyond shape (grammar, name existence). Pushes issues; never throws. */
  validate?: (value: V, def: ParameterDefinition, ctx: ParameterContext, issues: ParameterIssue[], path: string) => void;
  /** Default UI hints for this type (overridable per-parameter). */
  ui?: ParameterUIHints;
  capabilities?: ParameterCapabilities;
};

/**
 * A map of type name → definition. The value's `V` is erased to `any` so definitions of differing
 * value types fit one map (mirrors `SceneMap` / `TemplateMap`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ParameterTypeMap = Record<string, ParameterTypeDefinition<any>>;

/** Erased runtime type lookup (mirrors SceneResolver / BrandRegistry). */
export type ParameterTypeResolver = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  require(name: string): ParameterTypeDefinition<any>;
  has(name: string): boolean;
  keys(): string[];
};
