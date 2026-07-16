/**
 * BrandConfig — the identity half of the engine's configuration.
 *
 * A brand is pure configuration: a name, which theme mode to start from, semantic color
 * overrides to merge on top, and a reference to a mark asset (the engine ships no mark).
 * `resolveBrand` folds that into a concrete `Theme`, which the builder feeds to the theme
 * context so primitives recolor to the brand.
 *
 * The context itself lives in the `config` layer (`config/ThemeContext`) so primitives can
 * read it with a downward import; `BrandThemeProvider` / `useBrandTheme` are kept here as
 * stable aliases over that shared context. No brand names or business logic live here —
 * those are supplied per composition.
 */

import { themes, type Theme, type ThemeMode, type ThemeOverrides } from "../config/Theme";
import { ThemeProvider, useTheme } from "../config/ThemeContext";
import type { AssetRef } from "./CompositionSchema";

export type BrandConfig = {
  /** Display name (used by any mark/endcard you build — optional). */
  name?: string;
  /** Base theme mode to start from. Default "light". */
  mode?: ThemeMode;
  /** Semantic color overrides merged onto the base theme. */
  theme?: ThemeOverrides;
  /** Reference to a brand mark asset (path or catalog key). None ships by default. */
  mark?: AssetRef;
};

export type ResolvedBrand = {
  name?: string;
  theme: Theme;
  mark?: AssetRef;
};

/** Theme modes are structurally identical; treat the map as Theme-valued for the engine. */
const THEMES = themes as unknown as Record<ThemeMode, Theme>;

const mergeTheme = (base: Theme, overrides?: ThemeOverrides): Theme =>
  overrides?.colors ? { ...base, colors: { ...base.colors, ...overrides.colors } } : base;

/** Fold a brand config into a concrete theme + identity. */
export const resolveBrand = (brand: BrandConfig = {}): ResolvedBrand => ({
  name: brand.name,
  theme: mergeTheme(THEMES[brand.mode ?? "light"], brand.theme),
  mark: brand.mark,
});

/** Provide the active brand theme to everything rendered beneath it. */
export const BrandThemeProvider = ThemeProvider;

/** Read the active brand theme. Falls back to the default theme outside a provider. */
export const useBrandTheme = useTheme;
