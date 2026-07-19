/**
 * metadata/describe — the per-family projectors + `describeFramework` (ADR-009).
 *
 * Each `describe*` is a PURE projection: it reads a registry via `keys()`/`require()` (read-only,
 * never `.extend`, never invoking a code field), copies an explicit allow-list of serializable
 * fields, excludes all code, sorts by `key`, and returns JSON-safe descriptors. It never executes,
 * renders, resolves an asset, or mutates anything.
 */

import { sanitize } from "../errors";
import { sceneRegistry, type SceneResolver, type AssetRegistry, type BrandRegistry } from "../composition";
import { transitionRegistry, type TransitionResolver } from "../transitions";
import { assetRegistry, type AssetSource } from "../assets";
import { brandRegistry } from "../brand";
import { templateRegistry, type TemplateResolver } from "../templates";
import { parameterTypeRegistry, validatorRegistry, type ParameterTypeResolver, type ValidatorResolver } from "../parameters";
import { type FrameworkRegistries, type RegistryFamily } from "../contracts";
import { fill } from "./registries";
import { getCapabilities } from "./capabilities";
import { SCHEMA_VERSION } from "./version";
import {
  type AssetDescriptor,
  type AssetSourceSummary,
  type BrandDescriptor,
  type FrameworkDescriptor,
  type ParameterTypeDescriptor,
  type RegistryDescriptor,
  type SceneDescriptor,
  type TemplateDescriptor,
  type TemplateMetaSummary,
  type TransitionDescriptor,
  type ValidatorDescriptor,
} from "./types";

const identity = (family: RegistryFamily, key: string, name?: string) =>
  name !== undefined ? { key, qualifiedName: `${family}:${key}`, name } : { key, qualifiedName: `${family}:${key}` };

const sortedKeys = (resolver: { keys(): string[] }): string[] => [...resolver.keys()].sort();

/** Classify the DECLARED source syntactically only — no resolution, load, or normalization. */
const summarizeSource = (source: AssetSource | string): AssetSourceSummary => {
  if (typeof source === "string") {
    return /^https?:\/\//.test(source) ? { kind: "url", url: source } : { kind: "file", path: source };
  }
  return source.kind === "local" ? { kind: "file", path: source.path } : { kind: "url", url: source.url };
};

// ── Per-family projectors ────────────────────────────────────────────────────────────────────
export const describeScenes = (scenes: SceneResolver = sceneRegistry): SceneDescriptor[] =>
  sortedKeys(scenes).map((key) => {
    const def = scenes.require(key);
    return { ...identity("scenes", key), defaultDuration: def.defaultDuration, opaque: def.opaque ?? true };
  });

export const describeTransitions = (transitions: TransitionResolver = transitionRegistry): TransitionDescriptor[] =>
  sortedKeys(transitions).map((key) => ({ ...identity("transitions", key), capabilities: transitions.require(key).capabilities }));

export const describeAssets = (assets: AssetRegistry = assetRegistry): AssetDescriptor[] =>
  sortedKeys(assets).map((key) => {
    const def = assets.require(key);
    const d: AssetDescriptor = { ...identity("assets", key), category: def.category, source: summarizeSource(def.source) };
    if (def.roles !== undefined) d.roles = def.roles;
    if (def.metadata !== undefined) d.metadata = def.metadata;
    return d;
  });

export const describeBrands = (brands: BrandRegistry = brandRegistry): BrandDescriptor[] =>
  sortedKeys(brands).map((key) => {
    const def = brands.require(key);
    const fontFamilies = [...new Set((def.fonts ?? []).map((f) => f.family))].sort();
    const d: BrandDescriptor = { ...identity("brands", key, def.name), hasTheme: def.theme !== undefined, fontFamilies };
    if (def.mode !== undefined) d.mode = def.mode;
    if (def.logos !== undefined) {
      const logos: { primary?: string; alternate?: string; watermark?: string } = {};
      if (def.logos.primary !== undefined) logos.primary = def.logos.primary;
      if (def.logos.alternate !== undefined) logos.alternate = def.logos.alternate;
      if (def.logos.watermark !== undefined) logos.watermark = def.logos.watermark;
      d.logos = logos;
    }
    if (def.assets?.registry !== undefined) d.kitAssets = [...def.assets.registry.keys()].sort();
    if (def.meta !== undefined) d.meta = def.meta;
    return d;
  });

const projectTemplate = (def: ReturnType<TemplateResolver["require"]>, key: string): TemplateDescriptor => {
  const d: TemplateDescriptor = { ...identity("templates", key, def.name) };
  if (def.format !== undefined) d.format = def.format;
  if (def.capabilities !== undefined) d.capabilities = def.capabilities;
  if (def.parameters !== undefined) d.parameters = def.parameters;
  if (def.meta !== undefined) {
    const meta: TemplateMetaSummary = {};
    if (def.meta.description !== undefined) meta.description = def.meta.description;
    if (def.meta.category !== undefined) meta.category = def.meta.category;
    if (def.meta.previewParams !== undefined) meta.previewParams = sanitize(def.meta.previewParams);
    d.meta = meta;
  }
  return d;
};

export const describeTemplates = (templates: TemplateResolver = templateRegistry): TemplateDescriptor[] =>
  sortedKeys(templates).map((key) => projectTemplate(templates.require(key), key));

export const describeTemplate = (key: string, templates: TemplateResolver = templateRegistry): TemplateDescriptor | undefined =>
  templates.has(key) ? projectTemplate(templates.require(key), key) : undefined;

export const describeParameterTypes = (types: ParameterTypeResolver = parameterTypeRegistry): ParameterTypeDescriptor[] =>
  sortedKeys(types).map((key) => {
    const def = types.require(key);
    const d: ParameterTypeDescriptor = { ...identity("parameterTypes", key) };
    if (def.ui !== undefined) d.ui = def.ui;
    if (def.capabilities !== undefined) d.capabilities = def.capabilities;
    return d;
  });

export const describeValidators = (validators: ValidatorResolver = validatorRegistry): ValidatorDescriptor[] =>
  sortedKeys(validators).map((key) => ({ ...identity("validators", key) }));

export const describeRegistries = (registries?: Partial<FrameworkRegistries>): RegistryDescriptor[] => {
  const r = fill(registries);
  const entries: [RegistryFamily, { keys(): string[] }][] = [
    ["scenes", r.scenes],
    ["transitions", r.transitions],
    ["assets", r.assets],
    ["brands", r.brands],
    ["templates", r.templates],
    ["parameterTypes", r.parameterTypes],
    ["validators", r.validators],
  ];
  return entries.map(([family, reg]) => {
    const keys = sortedKeys(reg);
    return { family, keys, count: keys.length };
  });
};

// ── Aggregate ────────────────────────────────────────────────────────────────────────────────
export const describeFramework = (
  registries?: Partial<FrameworkRegistries>,
  opts?: { frameworkVersion?: string },
): FrameworkDescriptor => {
  const r = fill(registries);
  const d: FrameworkDescriptor = {
    schemaVersion: SCHEMA_VERSION,
    registries: describeRegistries(r),
    templates: describeTemplates(r.templates),
    brands: describeBrands(r.brands),
    assets: describeAssets(r.assets),
    transitions: describeTransitions(r.transitions),
    scenes: describeScenes(r.scenes),
    parameterTypes: describeParameterTypes(r.parameterTypes),
    validators: describeValidators(r.validators),
    capabilities: getCapabilities(r),
  };
  if (opts?.frameworkVersion !== undefined) d.frameworkVersion = opts.frameworkVersion;
  return d;
};
