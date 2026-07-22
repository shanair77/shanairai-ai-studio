/**
 * composition/ — The configuration-driven Composition Engine.
 *
 * Describe a video entirely as data (a `CompositionSchema`) and let `buildComposition`
 * assemble the final `<Composition>` from it — no hardcoded React trees, no templates,
 * no business logic. Scenes are resolved by name from the `sceneRegistry`; timing and
 * transitions are computed by the `Timeline`; brand + theme and the canvas are resolved
 * from config; music and assets are wired in by the builder.
 *
 *   buildComposition   — validate config → resolved `<Composition>` descriptor.
 *   CompositionSchema  — the typed, declarative shape of a whole video.
 *   sceneRegistry      — typed name → scene lookup; `.extend({...})` to add your own.
 *   transitionRegistry — typed transition lookup (fade/dissolve/slide/wipe/clockWipe/iris).
 *   createSceneDefinition / createTransitionDefinition — bind definitions for each registry.
 *   resolveTimeline    — scenes + transitions → durations + boundaries + total.
 *   VideoConfig        — canvas resolution (format / width / height / fps / duration).
 *   BrandConfig        — brand identity + theme resolution + theme context.
 */

export { createRegistry, type Registry, type DefinitionMap } from "../registry";

export { buildComposition, type BuiltComposition } from "./CompositionBuilder";

export {
  type CompositionSchema,
  type CompositionSchemaFor,
  type CompositionSchemaBase,
  type SceneConfig,
  type SceneConfigFor,
  type SceneConfigBase,
  type TransitionConfig,
  type TransitionConfigFor,
  type TransitionConfigBase,
  type TransitionType,
  type MusicConfig,
  type TimingConfig,
  type AssetRef,
  type AssetCatalog,
  resolveAssetRef,
  resolveNamedAsset,
  validateComposition,
} from "./CompositionSchema";

export {
  transitionRegistry,
  builtinTransitions,
  createTransitionDefinition,
  type TransitionDefinition,
  type TransitionCapabilities,
  type TransitionMap,
  type TransitionName,
  type BuiltinTransitionMap,
  type SlideOptions,
  type WipeOptions,
} from "../transitions";

export {
  createAssetKit,
  createAssetDefinition,
  assetRegistry,
  AssetRegistryProvider,
  useAssetRegistry,
  LocalAssetResolver,
  RemoteAssetResolver,
  resolveAsset,
  audioVolume,
  type AssetKit,
  type AssetDefinition,
  type AssetMap,
  type AssetCategory,
  type AssetSource,
  type AssetMetadata,
  type ResolvedAsset,
  type AssetSourceResolver,
  type AssetRegistry,
  type NamesOfCategory,
  type CategoryOf,
} from "../assets";

export {
  resolveVideoConfig,
  DEFAULT_FORMAT,
  type VideoConfig,
  type VideoConfigInput,
} from "./VideoConfig";

export { type BrandConfig } from "./BrandConfig";

export {
  createBrandDefinition,
  brandRegistry,
  resolveBrand,
  BrandProvider,
  useBrand,
  type BrandDefinition,
  type ResolvedBrand,
  type BrandMap,
  type BrandRegistry,
  type BrandTransition,
} from "../brand";

export {
  sceneRegistry,
  createSceneDefinition,
  builtinScenes,
  type SceneComponent,
  type SceneDefinition,
  type SceneResolver,
  type SceneMap,
  type PropsOf,
  type SceneName,
  type BuiltinSceneMap,
} from "./SceneRegistry";

export {
  resolveTimeline,
  type Timeline,
  type ResolvedScene,
  type ResolvedBoundary,
} from "./Timeline";
