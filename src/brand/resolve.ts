/**
 * brand/resolve — fold a brand definition into a `ResolvedBrand`.
 *
 * Produces a concrete theme (base mode ← brand overrides, with an optional composition-level
 * mode override taking precedence) and render closures for the brand's logo/watermark that
 * close over the brand's asset kit. The erased kit's `Logo` is cast to accept a string name —
 * the authoring path (`defineBrand<M>`) keeps compile-time safety; this is the erased
 * runtime consumption (mirrors the SceneComponent / AssetRegistry erasure).
 */

import { createElement, type FC, type ReactNode } from "react";
import { themes, type Theme, type ThemeMode, type ThemeOverrides } from "../config/Theme";
import { type AssetMap } from "../assets";
import { type BrandDefinition, type ResolvedBrand } from "./types";

const THEMES = themes as unknown as Record<ThemeMode, Theme>;

/**
 * Fold a brand's overrides onto a base theme. Colors merge by role; font families merge by
 * role and are re-projected through `textStyles`, so overriding `display` actually changes what
 * a `<Headline>` renders in — the token set stays the single source of truth for size and weight.
 */
const mergeTheme = (base: Theme, overrides?: ThemeOverrides): Theme => {
  if (!overrides) return base;
  const colors = overrides.colors ? { ...base.colors, ...overrides.colors } : base.colors;
  const families = overrides.typography?.fontFamilies;
  if (!families) return colors === base.colors ? base : { ...base, colors };

  const fontFamilies = { ...base.typography.fontFamilies, ...families };
  // Re-point every text style at the (possibly overridden) family it names.
  const textStyles = Object.fromEntries(
    Object.entries(base.typography.textStyles).map(([role, style]) => {
      const key = (Object.keys(base.typography.fontFamilies) as Array<keyof typeof fontFamilies>).find(
        (f) => base.typography.fontFamilies[f] === style.fontFamily,
      );
      return [role, key ? { ...style, fontFamily: fontFamilies[key] } : style];
    }),
  ) as Theme["typography"]["textStyles"];

  return { ...base, colors, typography: { ...base.typography, fontFamilies, textStyles } };
};

/** Merge a brand definition (or nothing) into the engine-facing resolved brand. */
export const resolveBrand = <M extends AssetMap = AssetMap>(
  def?: BrandDefinition<M>,
  compositionMode?: ThemeMode,
): ResolvedBrand => {
  const mode = compositionMode ?? def?.mode ?? "light";
  const theme = mergeTheme(THEMES[mode], def?.theme);

  if (!def) return { theme };

  const kit = def.assets;
  const assets = kit?.registry;
  const logos = def.logos as { primary?: string; alternate?: string; watermark?: string } | undefined;

  let renderLogo: ResolvedBrand["renderLogo"];
  let renderWatermark: ResolvedBrand["renderWatermark"];
  if (kit) {
    const LogoComponent = kit.Logo as unknown as FC<{ name: string }>;
    if (logos?.primary) {
      const primary = logos.primary;
      renderLogo = (variant: "primary" | "alternate" = "primary"): ReactNode => {
        const name = variant === "alternate" ? (logos.alternate ?? primary) : primary;
        return createElement(LogoComponent, { name });
      };
    }
    if (logos?.watermark) {
      const wm = logos.watermark;
      renderWatermark = (): ReactNode => createElement(LogoComponent, { name: wm });
    }
  }

  return {
    name: def.name,
    theme,
    fonts: def.fonts,
    assets,
    logos: logos ? { primary: logos.primary, alternate: logos.alternate, watermark: logos.watermark } : undefined,
    renderLogo,
    renderWatermark,
    // eslint-disable-next-line @remotion/non-pure-animation -- config key, not a CSS animation
    transition: def.transition,
    audio: def.audio ? { music: def.audio.music } : undefined,
    meta: def.meta,
  };
};
