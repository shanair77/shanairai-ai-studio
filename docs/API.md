# API Reference

## Purpose

Document every exported public API by module, with signatures and short examples. Import paths
are shown relative to `src/`. This reflects the barrels as of Phase 12.

## Concepts

Public surface = the barrels: `config/*`, `registry`, `format`, `components`,
`components/typography`, `animations`, `scenes`, `transitions`, and the aggregate
`composition`. Internal `_shared`/engine-plumbing types are not documented here.

---

## `composition` (the engine barrel)

```ts
buildComposition(config: CompositionSchema): BuiltComposition
buildComposition<M extends SceneMap>(config: CompositionSchemaFor<M>, scenes: Registry<M>): BuiltComposition
```
Validate a config and assemble a `<Composition>`-ready descriptor.
```ts
type BuiltComposition = { id: string; component: React.FC; durationInFrames: number; fps: number; width: number; height: number };
```

**Config types:** `CompositionSchema`, `CompositionSchemaFor<M>`, `SceneConfig`,
`SceneConfigFor<M>`, `TransitionConfig`, `TransitionConfigFor<M>`, `TransitionType`,
`MusicConfig`, `TimingConfig`, `AssetRef`, `AssetCatalog`.

**Functions:**
```ts
validateComposition(config): void            // throws on structural violations
resolveAssetRef(ref: string): string         // staticFile() for local paths, passthrough for URLs
resolveNamedAsset(catalog, refOrName): string
resolveTimeline(config, fps, scenes?, transitions?): Timeline
resolveVideoConfig(input?): VideoConfig       // { width, height, fps, durationInFrames? }
resolveBrand(brand?): ResolvedBrand           // { name?, theme, mark? }
```

**Registries + kernel (re-exported):**
```ts
sceneRegistry: Registry<BuiltinSceneMap>
createSceneDefinition<P>(spec): SceneDefinition<P>
builtinScenes: BuiltinSceneMap
transitionRegistry: Registry<BuiltinTransitionMap>
createTransitionDefinition<Options>(spec): TransitionDefinition<Options>
builtinTransitions: BuiltinTransitionMap
createRegistry<M>(entries): Registry<M>
```

**Brand context:** `BrandThemeProvider`, `useBrandTheme()`.

**Timeline types:** `Timeline`, `ResolvedScene`, `ResolvedBoundary`.
**Video types:** `VideoConfig`, `VideoConfigInput`, `DEFAULT_FORMAT`.
**Scene/transition types:** `SceneMap`, `SceneName`, `PropsOf<D>`, `SceneDefinition<P>`,
`SceneComponent`, `SceneResolver`, `BuiltinSceneMap`, `TransitionDefinition<O>`,
`TransitionCapabilities`, `TransitionMap`, `TransitionName`, `BuiltinTransitionMap`,
`SlideOptions`, `WipeOptions`.

### Example
```ts
import { buildComposition } from "./composition";
const built = buildComposition({ id: "Demo", format: "horizontal",
  transitions: { type: "fade", duration: 0.5 },
  scenes: [{ scene: "hero", duration: 3, props: { title: "Hi" } }, { scene: "outro", duration: 3 }] });
```

---

## `templates` (the Template Engine barrel)

A template is a **pure** `params → configuration` producer selected by name; `buildFromTemplate`
merges its output and delegates to `buildComposition` (the single assembly pipeline). Templates
**never** return React. See [ADR-005](./adr/ADR-005-template-engine.md).

```ts
createTemplateDefinition<P>(spec: TemplateDefinition<P>): TemplateDefinition<P>   // identity; captures P
templateRegistry: Registry<TemplateMap>                                          // empty default (ships none)

buildFromTemplate<M extends TemplateMap>(spec: TemplateCompositionFor<M>, templates: Registry<M>): BuiltComposition
buildFromTemplate(spec: TemplateCompositionBase, templates, scenes, transitions?, assets?, brands?): BuiltComposition
```

```ts
type TemplateDefinition<P> = {
  name: string;
  format?: FormatName;
  capabilities?: TemplateCapabilities;          // machine-readable; checked before/after build
  validate?: (params: P) => void;               // structural param validation (no Zod)
  build: (params: P, ctx: TemplateContext) => TemplateOutput;   // PURE — configuration, never React
  meta?: TemplateMetadata<P>;                    // human-facing; inert
};
type TemplateOutput = { scenes: SceneConfigBase[]; transitions?; timing?; music?; assets? };
type TemplateCapabilities = { formats?; variableLength?; requiresBrand?; providesTransitions?; providesMusic?; minScenes?; maxScenes? };
type TemplateContext = { width: number; height: number; fps: number; brand?: string };
```

**Precedence** — transition: `scene > caller > template > brand > framework`; music:
`caller > template > brand audio > none`; timing: `caller > template > framework`.
`resolveTemplateDefaults(spec, output, brandMusic?)` exposes the caller/template/brand merge.

**Types:** `TemplateParams`, `TemplateContext`, `TemplateOutput`, `TemplateCapabilities`,
`TemplateMetadata`, `TemplateDefinition<P>`, `TemplateMap`, `TemplateResolver`,
`TemplateComposition<P>`, `TemplateCompositionFor<M>`, `TemplateCompositionBase`, `ParamsOf<D>`.

### Example
```ts
import { createRegistry } from "./registry";
import { buildFromTemplate, createTemplateDefinition } from "./templates";

const promo = createTemplateDefinition({
  name: "promo",
  capabilities: { formats: ["horizontal"], providesTransitions: true, minScenes: 2 },
  validate: (p: { title: string }) => { if (!p.title) throw new Error("promo: `title` required."); },
  build: (p: { title: string }) => ({
    scenes: [{ scene: "hero", duration: 2, props: { title: p.title } }, { scene: "outro", duration: 2 }],
    transitions: { type: "dissolve", duration: 0.5 },
  }),
});
const templates = createRegistry({ promo });
const built = buildFromTemplate({ id: "P", template: "promo", params: { title: "Nova" } }, templates);
```

---

## `parameters` (the Parameter Engine barrel)

Declarative, serializable, **React-free** validation of a template's inputs (ADR-006). A parameter
**type** owns behavior (`parse`/`validate`/`serialize`) and is the registry family; a template's
per-parameter **policy** (required/default/constraints/conditions/metadata/ui) is an embedded
`ParameterSchema`. No Context, no Provider, no Hooks — parameters are pre-render data.

```ts
createParameterTypeDefinition<V>(spec): ParameterTypeDefinition<V>       // identity; captures V
parameterTypeRegistry: Registry<…>                                       // built-in types (string…group)
validatorRegistry: Registry<ValidatorMap>                                // empty; named custom validators

validateParameters(schema, values, ctx?): ParameterIssue[]                                   // non-throwing
resolveParameters(schema, values, ctx?): Result<DeepReadonly<ResolvedParameters>, ParameterIssue[]>
```

**Pipeline:** `parse → type-validate → defaults → constraints → named validators → conditional rules`.
**Precedence:** `caller > parameter default > type default`. Resolved params are deeply frozen.

```ts
type ParameterDefinition = { key; type: ParameterTypeName; required?; default?;
  validators?: string[]; constraints?; conditions?; metadata?; ui?; capabilities? };
type ParameterSchema = { version?; parameters: ParameterDefinition[]; groups?; capabilities? };
type ParameterIssue = { path; code; severity: "error" | "warning"; message; expected?; actual? };
```

Built-in types: `string`, `text`, `number`, `boolean`, `enum`, `color`, `image`, `video`, `audio`,
`brand`, `date`, `url`, `list`, `group`. Asset/brand types validate **names only** (existence +
category) — never resolving or loading. Attach a schema to a template via `TemplateDefinition.parameters`.

### Example
```ts
import { createTemplateDefinition } from "./templates";
const promo = createTemplateDefinition({
  name: "promo",
  parameters: { parameters: [
    { key: "title", type: "string", required: true, constraints: { min: 1, max: 80 } },
    { key: "cta", type: "string", default: "Get started" },
  ] },
  build: (p) => ({ scenes: [{ scene: "hero", duration: 2, props: { title: p.title } }, { scene: "outro", duration: 2 }] }),
});
// buildFromTemplate resolves + validates params (applying defaults) before build().
```

---

## `registry`

```ts
createRegistry<M extends DefinitionMap>(entries: M): Registry<M>
interface Registry<M> { entries; keys(); has(k); get(k); require(k); extend(e); }
type DefinitionMap = Record<string, unknown>
```
See [REGISTRIES.md](./REGISTRIES.md).

---

## `format`

```ts
useFormat(): FormatInfo         // { width, height, fps, aspectRatio, orientation, isPortrait/Landscape/Square, shortSide, longSide, name }
getOrientation(w, h): Orientation
useScale(base?): ScaleInfo      // { factor, scale(v), scaleRounded(v) } — scales by the short side
SafeArea: React.FC<{ preset?: SafeAreaToken; debug?: boolean; style?; children? }>
```
See [LAYOUT.md](./LAYOUT.md).

---

## `components`

Layout primitives (all accept `style`, `className`, `children`):
```ts
Text:      <Text variant color align opacity maxWidth lineClamp />          // TextProps
Container: <Container padding paddingX/Y margin radius background width height flex center absolute fill top/right/bottom/left zIndex safeArea /> // ContainerProps
Row:       <Row gap align justify wrap />                                   // RowProps
Column:    <Column gap align justify fill />                                // ColumnProps
Stack:     <Stack zIndex />                                                 // StackProps — overlapping z-layers
```

## `components/typography`

Semantic type roles (compose `Text`; inherit `align`, `maxWidth`, `opacity`, `color`,
`lineClamp`, `style`):
```ts
Headline · Subheadline · Paragraph · Caption · Eyebrow · Kicker · Quote · CTA
```
`Eyebrow`/`Kicker` add `uppercase?`; `Quote` adds `italic?`; `CTA` adds `uppercase?`.
See [TYPOGRAPHY.md](./TYPOGRAPHY.md).

---

## `animations`

Frame-driven motion primitives. One-shot (take `duration`, `delay` in seconds, `easing`):
```ts
FadeIn · FadeOut · FadeUp · FadeDown · FadeLeft · FadeRight · ScaleIn · BlurReveal · HeroReveal
```
Continuous:
```ts
KenBurns (from/to/panX/panY) · Float (amplitude/period/axis) · Parallax (distance/speed/axis/reverse)
```
Shared: `useAnimationProgress(opts)`, `resolveEasing(easing)`, types `EasingFn`, `EasingLike`,
`MotionProps`, `MotionTimingProps`, `MotionLayoutProps`, `DirectionalFadeProps`.
See [MOTION.md](./MOTION.md).

### Example
```tsx
<FadeUp delay={0.2}><Headline>Title</Headline></FadeUp>
```

---

## `scenes`

Content-agnostic scenes (role slots + `children`, all optional):
```ts
HeroScene · CenteredScene · SplitScene · FeatureScene · GalleryScene · ComparisonScene
QuoteScene · CTASection · LogoRevealScene · OutroScene
```
Shared shell + helpers: `SceneFrame`, types `SceneFrameProps`, `SceneBaseProps`, `ColorToken`,
`Alignment`. See [BUILDING_CUSTOM_SCENES.md](./BUILDING_CUSTOM_SCENES.md).

---

## `transitions`

```ts
createTransitionDefinition<Options>(spec): TransitionDefinition<Options>
transitionRegistry: Registry<BuiltinTransitionMap>
builtinTransitions   // none · fade · dissolve · slide · wipe · clockWipe · iris
dissolve(): TransitionPresentation   // custom transparency-safe cross-dissolve
```
Types: `TransitionDefinition`, `TransitionCapabilities`, `TransitionContext`, `TransitionMap`,
`TransitionResolver`, `OptionsOf`, `TransitionName`, `BuiltinTransitionMap`, `SlideOptions`,
`WipeOptions`, `SlideDirection`, `WipeDirection`. See [TRANSITIONS.md](./TRANSITIONS.md).

---

## `config`

**Theme:** `theme`, `darkTheme`, `themes`, `withAlpha`, types `Theme`, `ThemeMode`,
`ThemeOverrides`.
**Theme context:** `ThemeProvider`, `useTheme()` (`config/ThemeContext`).
**Colors:** `palette`, `gradients`, `semanticColors`, `semanticColorsDark`, `withAlpha`; types
`SemanticColors`, `Palette`, `ColorScale`.
**Typography:** `typography`, `fontFamilies`, `fontWeights`, `letterSpacing`, `lineHeights`,
`fontSizes`, `textStyles`; types `TextStyleToken`, `FontSizeToken`, `Typography`.
**Layout:** `BASE_WIDTH`, `spacing`, `radii`, `borderWidths`, `zIndex`, `formats`, `safeAreas`,
`layout`; types `SpacingToken`, `RadiusToken`, `FormatName`, `Format`, `SafeAreaToken`.
**Timing:** `DEFAULT_FPS`, `secondsToFrames`, `framesToSeconds`, `timing`; types
`DurationToken`, `SceneDurationToken`.
**Animation:** `easings`, `animation`; types `EasingToken`, `AnimationPreset`.
**Fonts:** `fontsReady`, `waitForFonts()`, types `FontFace`, `FontProvider`, `FontStyle`,
`LoadedFace` (`config/fonts`).

See [THEMING.md](./THEMING.md), [TYPOGRAPHY.md](./TYPOGRAPHY.md), [LAYOUT.md](./LAYOUT.md),
[MOTION.md](./MOTION.md), [FONTS.md](./FONTS.md).

## Best practices

- Import from the nearest barrel (`./composition`, `./components`, …) rather than deep paths.
- Reference tokens (`spacing.lg`, `theme.colors.accent`) — never raw values.

## Common mistakes

- Importing engine internals (e.g. `SceneClip`) — they aren't exported and may change.
- Passing raw pixel sizes to primitives instead of scaled tokens.

## Extension points

New public API should be added to the relevant barrel and documented here + in the subsystem
doc. Breaking changes require an ADR ([CONTRIBUTING.md](./CONTRIBUTING.md#adr-requirements)).
