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
import { type Theme, type ThemeMode, type ThemeOverrides } from "../config/Theme";
import { type FontFace } from "../config/fonts";
import { type AssetKit, type AssetMap, type AssetRegistry, type NamesOfCategory } from "../assets";
import { type TransitionName } from "../transitions";

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
  transition?: BrandTransition;
  audio?: { music?: NamesOfCategory<M, "audio"> };
  meta?: { handles?: Record<string, string>; legal?: string; url?: string };
};

/**
 * A map of brand name → definition.
 *
 * The value's asset-kit map is erased to `any` for the same reason `BrandRegistry`
 * erases it below, and `TemplateMap` erases its param type: `AssetKit<M>` holds a
 * `Registry<M>`, which is invariant in `M`, so a real brand pack — whose kit has a
 * concrete map of fifty named assets — is not assignable to `BrandDefinition<AssetMap>`.
 * Defaulting rather than erasing made this type unable to hold any brand actually
 * shipped, which is what a `BrandMap` exists to hold. Each brand's real asset names
 * are still recovered from its own definition, never from this constraint.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BrandMap = Record<string, BrandDefinition<any>>;

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
  transition?: BrandTransition;
  audio?: { music?: string };
  meta?: BrandDefinition["meta"];
};
