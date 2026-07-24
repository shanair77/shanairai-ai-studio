/**
 * assets/definition — the asset definition factory + the default (empty) registry.
 *
 * `createAssetDefinition<C>` captures the category for typed metadata + typed consumption. The
 * framework ships NO assets, so `assetRegistry` is empty by default; brands/videos populate it
 * via `createRegistry(...)` / `.extend(...)` and typed access via `createAssetKit`.
 */

import { createRegistry, type Registry } from "../registry";
import { type AssetCategory, type AssetDefinition, type AssetMap } from "./types";

/** Bind a source (+ optional metadata/roles) into a typed asset definition. */
export const defineAsset = <C extends AssetCategory>(spec: AssetDefinition<C>): AssetDefinition<C> => spec;

/**
 * Internal compatibility alias for the pre-SDK name. `defineAsset` is the canonical authoring name
 * (Phase S3); remaining internal call sites migrate in a later cleanup commit.
 */
export const createAssetDefinition = defineAsset;

/** The default asset registry — empty. Populate per brand/video. */
export const assetRegistry: Registry<AssetMap> = createRegistry<AssetMap>({});
