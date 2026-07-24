/**
 * brand/ — the typed, config-driven Brand System (ADR-004, Phase 17 MVP).
 *
 * A `BrandDefinition<M>` is a brand pack aggregating theme, fonts, an `AssetKit<M>`
 * (logos/watermark/audio as category-safe names), a default transition, and
 * motion/CTA/layout/audio defaults + metadata. Compositions select a brand by name; the engine
 * resolves + merges it and provides it via `BrandProvider`. The framework ships no brands.
 *
 * Wired now: theme, logos/watermark, default transition, lazy fonts, metadata. Consumed later
 * (§4.7): motion personality, CTA treatment, surface/layout defaults.
 */

export {
  type BrandDefinition,
  type BrandMap,
  type BrandRegistry,
  type BrandTransition,
  type ResolvedBrand,
} from "./types";

export { defineBrand, brandRegistry } from "./definition";
export { resolveBrand } from "./resolve";
export { BrandProvider, useBrand } from "./BrandContext";
