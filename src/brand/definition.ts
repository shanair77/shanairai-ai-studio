/**
 * brand/definition — the brand definition factory + the default (empty) brand registry.
 *
 * `defineBrand<M>` captures the asset kit's map type so `logos`/`audio` names are
 * compile-time category-safe. The framework ships NO brands, so `brandRegistry` is empty by
 * default; brand packs populate their own via `createRegistry(...)` / `.extend(...)`.
 */

import { createRegistry, type Registry } from "../registry";
import { type AssetMap } from "../assets";
import { type BrandDefinition, type BrandMap } from "./types";

/** Bind a brand pack, preserving its asset-kit map type for typed logo/audio names. */
export const defineBrand = <M extends AssetMap>(spec: BrandDefinition<M>): BrandDefinition<M> => spec;

/** The default brand registry — empty. Populate with brand packs. */
export const brandRegistry: Registry<BrandMap> = createRegistry<BrandMap>({});
