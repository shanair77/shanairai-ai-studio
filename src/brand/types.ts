/**
 * brand/types — the Brand System's typed contracts (ADR-004, Phase 17 MVP).
 *
 * A `BrandDefinition<M>` is a brand pack: it aggregates theme, fonts, an `AssetKit<M>`
 * (logos/watermark/audio as category-safe names), a default transition, and
 * motion/CTA/layout/audio defaults + metadata. `ResolvedBrand` is the engine-facing merged
 * form, carrying a concrete theme, the erased kit registry, and render closures for logos.
 *
 * Motion/CTA/surface/layout defaults are TYPED here but consumed in scoped follow-ups (§4.7).
 */

import type React from "react";
import { type EasingToken } from "../config/Animation";
import { type SafeAreaToken } from "../config/Layout";
import { type Theme, type ThemeMode, type ThemeOverrides } from "../config/Theme";
import { type FontFace } from "../config/fonts";
import { type AssetKit, type AssetMap, type AssetRegistry, type NamesOfCategory } from "../assets";
import { type TransitionName } from "../transitions";

/** A semantic color token. */
type ColorToken = keyof Theme["colors"];
type BrandAlignment = "start" | "center" | "end";

/** A brand's default scene-to-scene transition. */
export type BrandTransition = { type: TransitionName; duration?: number; options?: unknown };

/** A brand pack. Generic over its asset kit's map `M` for typed logo/audio names. */
export type BrandDefinition<M extends AssetMap = AssetMap> = {
  name: string;
  mode?: ThemeMode;
  theme?: ThemeOverrides;
  /** This brand's font manifest, loaded lazily when its composition renders. */
  fonts?: FontFace[];
  /** The brand's asset kit — logos/watermark/audio reference names within it. */
  assets?: AssetKit<M>;
  logos?: {
    primary?: NamesOfCategory<M, "image" | "svg">;
    alternate?: NamesOfCategory<M, "image" | "svg">;
    watermark?: NamesOfCategory<M, "image" | "svg">;
  };
  surface?: { default?: ColorToken; opaqueByDefault?: boolean };
  motion?: { easing?: EasingToken; durationScale?: number; stagger?: number };
  transition?: BrandTransition;
  cta?: { uppercase?: boolean; weight?: number; letterSpacing?: string };
  layout?: { safeArea?: SafeAreaToken; align?: BrandAlignment; maxWidth?: number };
  audio?: { music?: NamesOfCategory<M, "audio">; sfx?: Record<string, NamesOfCategory<M, "audio">> };
  meta?: { handles?: Record<string, string>; legal?: string; url?: string };
};

/** A map of brand name → definition. */
export type BrandMap = Record<string, BrandDefinition>;

/**
 * Erased runtime brand lookup (mirrors SceneResolver / AssetRegistry). `BrandDefinition<any>`
 * is required so a concrete brand registry — whose defs carry a specific asset-kit map — is
 * assignable regardless of that map type.
 */
export type BrandRegistry = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  require(name: string): BrandDefinition<any>;
  has(name: string): boolean;
  keys(): string[];
};

/** The engine-facing, merged brand. */
export type ResolvedBrand = {
  name?: string;
  theme: Theme;
  fonts?: FontFace[];
  /** The brand kit's asset registry (erased), if any. */
  assets?: AssetRegistry;
  logos?: { primary?: string; alternate?: string; watermark?: string };
  /** Render the brand's logo as a node (closes over the brand's kit). */
  renderLogo?: (variant?: "primary" | "alternate") => React.ReactNode;
  /** Render the brand's watermark as a node. */
  renderWatermark?: () => React.ReactNode;
  surface?: { default?: ColorToken; opaqueByDefault?: boolean };
  motion?: { easing?: EasingToken; durationScale?: number; stagger?: number };
  transition?: BrandTransition;
  cta?: BrandDefinition["cta"];
  layout?: BrandDefinition["layout"];
  audio?: { music?: string };
  meta?: BrandDefinition["meta"];
};
