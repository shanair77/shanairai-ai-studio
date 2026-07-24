/**
 * scenes/ — Full-frame scene primitives.
 *
 * Reusable, content-agnostic scene shells composed ONLY from existing primitives —
 * typography (`components/typography`), layout (`components`), motion (`animations`), the
 * theme, `SafeArea`, and `useScale()`. Each fills the frame, paints a theme-token surface,
 * insets content in the safe area, and orchestrates staggered entrance motion.
 *
 * They carry no copy, colors, assets, logos, or brand identity: every scene exposes role slots
 * (eyebrow / title / subtitle / body / actions / panes / quote / mark …) and a `children`
 * escape hatch, so one scene serves any subject — real estate, mortgage, travel, AI
 * influencers, AI agents, storytelling, corporate, education — by swapping the content in.
 *
 * HeroScene       — opening statement (HeroReveal title + stagger).
 * CenteredScene   — general centered message block.
 * SplitScene      — two panes side by side (stacks in portrait).
 * FeatureScene    — header over a wrapping row of features.
 * GalleryScene    — a staggered set of items (row or column).
 * ComparisonScene — equal panes set against each other.
 * QuoteScene      — featured quotation / testimonial.
 * CTASection      — focused call-to-action block.
 * LogoRevealScene — reveal choreography for a caller-supplied mark.
 * OutroScene      — closing card / sign-off.
 *
 * SceneFrame and its shared helpers are exported too, for building further scenes.
 */

export { HeroScene, type HeroSceneProps } from "./HeroScene";
export { CenteredScene, type CenteredSceneProps } from "./CenteredScene";
export { SplitScene, type SplitSceneProps } from "./SplitScene";
export { FeatureScene, type FeatureSceneProps } from "./FeatureScene";
export { GalleryScene, type GallerySceneProps } from "./GalleryScene";
export { ComparisonScene, type ComparisonSceneProps } from "./ComparisonScene";
export { QuoteScene, type QuoteSceneProps } from "./QuoteScene";
export { CTASection, type CTASectionProps } from "./CTASection";
export { LogoRevealScene, type LogoRevealSceneProps } from "./LogoRevealScene";
export { OutroScene, type OutroSceneProps } from "./OutroScene";

// Shared scene shell + helpers, for composing additional scenes.
export {
  SceneFrame,
  type SceneFrameProps,
  type SceneBaseProps,
  type ColorToken,
  type Alignment,
} from "./SceneFrame";
