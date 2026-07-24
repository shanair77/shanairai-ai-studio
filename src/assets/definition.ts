/**
 * assets/definition — the asset definition factory + the default (empty) registry.
 *
 * `defineAsset<C>` captures the category for typed metadata + typed consumption. The
 * framework ships NO assets, so `assetRegistry` is empty by default; brands/videos populate it
 * via `createRegistry(...)` / `.extend(...)` and typed access via `defineAssetKit`.
 */

import { createRegistry, type Registry } from "../registry";
import { type AssetCategory, type AssetDefinition, type AssetMap } from "./types";

/** Bind a source (+ optional metadata/roles) into a typed asset definition. */
export const defineAsset = <C extends AssetCategory>(spec: AssetDefinition<C>): AssetDefinition<C> => spec;

/** The default asset registry — empty. Populate per brand/video. */
export const assetRegistry: Registry<AssetMap> = createRegistry<AssetMap>({});
