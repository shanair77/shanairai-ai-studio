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
 *   defineScene        — bind a scene definition.
 *   resolveTimeline    — scenes + transitions → durations + boundaries + total.
 *   VideoConfig        — canvas resolution (format / width / height / fps / duration).
 *
 * This barrel exports ONLY the composition engine's own surface. Sibling layers are imported
 * directly from their own barrels — `../registry`, `../transitions`, `../assets`, `../brand` — so
 * this layer is no longer a cross-layer re-export hub.
 */

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
  validateComposition,
} from "./CompositionSchema";

export {
  resolveVideoConfig,
  DEFAULT_FORMAT,
  type VideoConfig,
  type VideoConfigInput,
} from "./VideoConfig";

export {
  sceneRegistry,
  defineScene,
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
