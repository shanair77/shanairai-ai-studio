/**
 * metadata/capabilities — the rolled-up capability report (ADR-009 §4.7).
 *
 * Computed on demand from the registries; NEVER cached or materialized inside the engine (that would
 * be a second source of truth / add staleness). A consumer may memoize on immutable registries.
 * Deterministic: every list is sorted.
 */

import { type AssetCategory } from "../assets";
import { type FormatName } from "../config/Layout";
import { type FrameworkRegistries, resolveRegistries } from "../contracts";
import { type CapabilityReport } from "./types";

/** Aggregate declared capabilities across families. */
export const getCapabilities = (registries?: Partial<FrameworkRegistries>): CapabilityReport => {
  const r = resolveRegistries(registries);

  const formats = new Set<FormatName>();
  const templatesRequiringBrand: string[] = [];
  for (const key of [...r.templates.keys()].sort()) {
    const def = r.templates.require(key);
    if (def.format) formats.add(def.format);
    for (const f of def.capabilities?.formats ?? []) formats.add(f);
    if (def.capabilities?.requiresBrand === true) templatesRequiringBrand.push(key);
  }

  const assetCategories = new Set<AssetCategory>();
  for (const key of r.assets.keys()) assetCategories.add(r.assets.require(key).category);

  const supportsTransparency: string[] = [];
  const requiresOpaqueIncoming: string[] = [];
  for (const key of [...r.transitions.keys()].sort()) {
    const caps = r.transitions.require(key).capabilities;
    if (caps.supportsTransparency) supportsTransparency.push(key);
    if (caps.requiresOpaqueIncoming) requiresOpaqueIncoming.push(key);
  }

  return {
    formats: [...formats].sort(),
    assetCategories: [...assetCategories].sort(),
    parameterTypes: [...r.parameterTypes.keys()].sort(),
    transitions: { supportsTransparency, requiresOpaqueIncoming },
    templatesRequiringBrand,
    counts: {
      scenes: r.scenes.keys().length,
      transitions: r.transitions.keys().length,
      assets: r.assets.keys().length,
      brands: r.brands.keys().length,
      templates: r.templates.keys().length,
      parameterTypes: r.parameterTypes.keys().length,
      validators: r.validators.keys().length,
    },
  };
};
