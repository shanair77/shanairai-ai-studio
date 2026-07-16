/**
 * BrandConfig — the identity half of the engine's configuration.
 *
 * A brand is pure configuration: a name, which theme mode to start from, semantic color
 * overrides to merge on top, and a reference to a mark asset (the engine ships no mark).
 * `resolveBrand` folds that into a concrete `Theme`; `BrandThemeProvider` / `useBrandTheme`
 * expose it via context so scenes (and, in a later phase, the primitives themselves) can
 * read the active brand theme instead of the static default.
 *
 * No brand names or business logic live here — those are supplied per composition.
 */

import React, { createContext, useContext } from "react";
import { theme as defaultTheme, themes, type Theme, type ThemeMode, type ThemeOverrides } from "../config/Theme";
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

const BrandThemeContext = createContext<Theme>(defaultTheme);

/** Provide the active brand theme to everything rendered beneath it. */
export const BrandThemeProvider: React.FC<{ theme: Theme; children?: React.ReactNode }> = ({ theme, children }) =>
  createElementProvider(theme, children);

// Kept as a helper so this stays a `.ts` file (no JSX).
const createElementProvider = (theme: Theme, children?: React.ReactNode): React.ReactElement =>
  React.createElement(BrandThemeContext.Provider, { value: theme }, children);

/** Read the active brand theme. Falls back to the default theme outside a provider. */
export const useBrandTheme = (): Theme => useContext(BrandThemeContext);
