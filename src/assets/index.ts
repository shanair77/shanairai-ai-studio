/**
 * assets/ — the typed, config-driven Asset Engine (ADR-003, MVP).
 *
 * Categories image/video/audio/svg over local + remote sources, resolved to a discriminated
 * `ResolvedAsset`. `defineAssetKit(map)` gives compile-time, category-safe literal names and
 * typed renderers (Image/Video/Audio/Svg/Logo). The framework ships no assets — the default
 * `assetRegistry` is empty; brands/videos populate their own.
 *
 * Deferred (extension points, not implemented): Lottie, captions, gradients, masks, inline-SVG
 * markup, metadata probing, opacity inference, @remotion/preload, and the serializable
 * asset-render spec.
 */

export {
  type AssetCategory,
  type AssetSource,
  type AssetMetadata,
  type AssetRole,
  type AssetDefinition,
  type AssetMap,
  type CategoryOf,
  type NamesOfCategory,
  type ResolvedAsset,
  type AssetSourceResolver,
  type AssetRegistry,
  type Fit,
} from "./types";

export { defineAsset, assetRegistry } from "./definition";

export {
  LocalAssetResolver,
  RemoteAssetResolver,
  DEFAULT_RESOLVERS,
  normaliseSource,
} from "./resolvers";

export { resolveAsset, assertCategory, validateMetadata } from "./resolve";

export { audioVolume } from "./audio";

export {
  defineAssetKit,
  AssetRegistryProvider,
  useAssetRegistry,
  type AssetKit,
  type AssetImageProps,
  type AssetVideoProps,
  type AssetAudioProps,
  type AssetSvgProps,
  type AssetLogoProps,
} from "./AssetKit";
