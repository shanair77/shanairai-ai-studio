/**
 * brand/BrandContext — the brand provider + hook, and the lazy font loader.
 *
 * `BrandProvider` composes: the theme context (recolor); the brand's asset registry (installed
 * only when the brand supplies a kit, so brand-owned assets — logos, watermarks, future
 * backgrounds/overlays/endcards — resolve through the active brand); a lazy `BrandFontLoader`
 * (loads the brand's font manifest when this composition renders — deduplicated,
 * delayRender-gated); and a `BrandContext` carrying the resolved brand (logos, transition,
 * metadata). `useBrand()` reads it. `BrandThemeProvider` stays a theme-only alias elsewhere.
 */

import React, { createContext, createElement, useContext, useMemo } from "react";
import { ThemeProvider } from "../config/ThemeContext";
import { loadFonts, type FontFace } from "../config/fonts";
import { AssetRegistryProvider } from "../assets";
import { type ResolvedBrand } from "./types";

const BrandContext = createContext<ResolvedBrand | null>(null);

/** Read the active resolved brand (null outside a `BrandProvider`). */
export const useBrand = (): ResolvedBrand | null => useContext(BrandContext);

/** Loads a brand's font manifest lazily at render (deduplicated), then renders its children. */
const BrandFontLoader: React.FC<{ fonts?: FontFace[]; children?: React.ReactNode }> = ({ fonts, children }) => {
  useMemo(() => {
    if (fonts && fonts.length > 0) void loadFonts(fonts);
  }, [fonts]);
  return createElement(React.Fragment, null, children);
};

/**
 * Provide the resolved brand to the tree:
 *   ThemeProvider → [AssetRegistryProvider, when the brand supplies a kit] → BrandFontLoader → BrandContext.
 * Installing the brand's asset registry lets brand-owned assets inherit from the active brand; when
 * the brand has no kit the layer is skipped, so the composition's own asset registry stays in effect.
 */
export const BrandProvider: React.FC<{ brand: ResolvedBrand; children?: React.ReactNode }> = ({ brand, children }) => {
  const inner = createElement(
    BrandFontLoader,
    { fonts: brand.fonts },
    createElement(BrandContext.Provider, { value: brand }, children),
  );
  const withAssets = brand.assets
    ? createElement(AssetRegistryProvider, { registry: brand.assets }, inner)
    : inner;
  return createElement(ThemeProvider, { theme: brand.theme }, withAssets);
};
