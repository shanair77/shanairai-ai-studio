/**
 * brand/definition — the brand definition factory + the default (empty) brand registry.
 *
 * `createBrandDefinition<M>` captures the asset kit's map type so `logos`/`audio` names are
 * compile-time category-safe. The framework ships NO brands, so `brandRegistry` is empty by
 * default; brand packs populate their own via `createRegistry(...)` / `.extend(...)`.
 */

import { createRegistry, type Registry } from "../registry";
import { type AssetMap } from "../assets";
import { type BrandDefinition, type BrandMap } from "./types";

/** Bind a brand pack, preserving its asset-kit map type for typed logo/audio names. */
export const defineBrand = <M extends AssetMap>(spec: BrandDefinition<M>): BrandDefinition<M> => spec;

/**
 * Internal compatibility alias for the pre-SDK name. `defineBrand` is the canonical authoring name
 * (Phase S3); remaining internal call sites migrate in a later cleanup commit.
 */
export const createBrandDefinition = defineBrand;

/** The default brand registry — empty. Populate with brand packs. */
export const brandRegistry: Registry<BrandMap> = createRegistry<BrandMap>({});
