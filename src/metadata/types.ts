/**
 * metadata/types — the Metadata Engine's descriptor contracts (ADR-009 §4.3).
 *
 * A descriptor is the serializable, code-free projection of a Definition — a pure function of
 * `(Definition, key)`. `key` is canonical (the registry key), `qualifiedName` is globally unique
 * (`${family}:${key}`), `name` is display-only. Every field here is JSON-safe by construction.
 */

import { type DiagnosticValue } from "../errors";
import { type FormatName } from "../config/Layout";
import { type ThemeMode } from "../config/Theme";
import { type AssetCategory, type AssetMetadata, type AssetRole } from "../assets";
import { type TransitionCapabilities } from "../transitions";
import { type TemplateCapabilities } from "../templates";
import { type ParameterSchema, type ParameterUIHints } from "../parameters";
import { type RegistryFamily } from "../contracts";

/** Stable identity. `key` = canonical (registry key); `qualifiedName` = `${family}:${key}`; `name` = display. */
export type DescriptorIdentity = { key: string; qualifiedName: string; name?: string };

/**
 * The DECLARED asset source, reported exactly as authored (ADR-009 accepted refinement). Metadata
 * never resolves, loads, validates, imports, hashes, or transforms it; a bare string is classified
 * purely syntactically (`http(s)://` → url, else file).
 */
export type AssetSourceSummary =
  | { kind: "file"; path: string }
  | { kind: "url"; url: string }
  | { kind: "inline" }; // reserved source kinds (gradient / inline markup)

export type SceneDescriptor = DescriptorIdentity & { defaultDuration: number; opaque: boolean };
export type TransitionDescriptor = DescriptorIdentity & { capabilities: TransitionCapabilities };
export type AssetDescriptor = DescriptorIdentity & {
  category: AssetCategory;
  roles?: AssetRole[];
  metadata?: AssetMetadata;
  source?: AssetSourceSummary;
};
export type BrandDescriptor = DescriptorIdentity & {
  mode?: ThemeMode;
  hasTheme: boolean;
  fontFamilies: string[];
  logos?: { primary?: string; alternate?: string; watermark?: string };
  kitAssets?: string[];
  meta?: { handles?: Record<string, string>; legal?: string; url?: string };
};
/** Template metadata projection — `previewParams` is sanitized to keep the descriptor JSON-safe. */
export type TemplateMetaSummary = { description?: string; category?: string; previewParams?: DiagnosticValue };
export type TemplateDescriptor = DescriptorIdentity & {
  /**
   * The registered implementation's version.
   *
   * Present so an agent reading `describe()` can pin exactly what it inspected
   * — the catalogue and the render request speak about the same thing.
   */
  version: string;
  format?: FormatName;
  /**
   * The frame rate this template declares, when it declares one.
   *
   * Present because a format preset is NOT a safe substitute: `vertical` is
   * 30fps and the first production template renders at 24, so a client reading
   * the preset would miscalculate every duration it derived. Absent when the
   * template is cadence-agnostic, which genuinely means "whatever the format
   * says".
   */
  fps?: number;
  capabilities?: TemplateCapabilities;
  parameters?: ParameterSchema;
  meta?: TemplateMetaSummary;
};
export type ParameterTypeDescriptor = DescriptorIdentity & { ui?: ParameterUIHints };
export type ValidatorDescriptor = DescriptorIdentity;

export type RegistryDescriptor = { family: RegistryFamily; keys: string[]; count: number };

/** Rolled-up "what can this framework do?" — declared capabilities across families (ADR-009 §4.3). */
export type CapabilityReport = {
  formats: FormatName[];
  assetCategories: AssetCategory[];
  parameterTypes: string[];
  transitions: { supportsTransparency: string[]; requiresOpaqueIncoming: string[] };
  templatesRequiringBrand: string[];
  counts: Record<RegistryFamily, number>;
};

/** The serializable framework snapshot. */
export type FrameworkDescriptor = {
  schemaVersion: string; // metadata-owned (descriptor-format version)
  frameworkVersion?: string; // caller-supplied; the engine never reads disk
  registries: RegistryDescriptor[];
  templates: TemplateDescriptor[];
  brands: BrandDescriptor[];
  assets: AssetDescriptor[];
  transitions: TransitionDescriptor[];
  scenes: SceneDescriptor[];
  parameterTypes: ParameterTypeDescriptor[];
  validators: ValidatorDescriptor[];
  capabilities: CapabilityReport;
};
