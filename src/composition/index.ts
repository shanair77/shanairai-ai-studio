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
 *   CompositionSchema  — the declarative shape of a whole video.
 *   sceneRegistry      — name → scene lookup; `registerScene` to add your own.
 *   buildTimeline      — scenes + transitions → absolute frame windows.
 *   VideoConfig        — canvas resolution (format / width / height / fps / duration).
 *   BrandConfig        — brand identity + theme resolution + theme context.
 */

export { buildComposition, type BuiltComposition } from "./CompositionBuilder";

export {
  type CompositionSchema,
  type SceneConfig,
  type TransitionConfig,
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
  resolveVideoConfig,
  DEFAULT_FORMAT,
  type VideoConfig,
  type VideoConfigInput,
} from "./VideoConfig";

export {
  resolveBrand,
  BrandThemeProvider,
  useBrandTheme,
  type BrandConfig,
  type ResolvedBrand,
} from "./BrandConfig";

export {
  sceneRegistry,
  registerScene,
  type SceneComponent,
  type SceneDefinition,
  type SceneResolver,
} from "./SceneRegistry";

export {
  buildTimeline,
  type Timeline,
  type TimelineEntry,
  type ResolvedTransition,
} from "./Timeline";
