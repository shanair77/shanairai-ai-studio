import { type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { theme, darkTheme } from "../../config/Theme";
import { createRegistry } from "../../registry";
import { defineAsset, defineAssetKit } from "../../assets";
import { defineBrand } from "../definition";
import { resolveBrand } from "../resolve";

// Remote sources avoid staticFile so logo closures resolve without a render context.
const kit = defineAssetKit({
  logo: defineAsset({ category: "svg", source: "https://cdn/logo.svg" }),
  alt: defineAsset({ category: "image", source: "https://cdn/alt.png" }),
  wm: defineAsset({ category: "svg", source: "https://cdn/wm.svg" }),
});

// Register + require so the definition is the erased BrandDefinition the engine sees.
const brands = createRegistry({
  acme: defineBrand({
    name: "Acme",
    mode: "dark",
    theme: { colors: { accent: "#00E0C6" } },
    assets: kit,
    logos: { primary: "logo", alternate: "alt", watermark: "wm" },
    transition: { type: "dissolve", duration: 0.5 },
    meta: { legal: "© Acme", handles: { instagram: "@acme" } },
  }),
});
const def = brands.require("acme");

const nameOf = (node: unknown): unknown => ((node as ReactElement).props as { name?: unknown }).name;

describe("resolveBrand", () => {
  it("merges the dark base with brand color overrides", () => {
    const r = resolveBrand(def);
    expect(r.name).toBe("Acme");
    expect(r.theme.colors.accent).toBe("#00E0C6");
    expect(r.theme.colors.background).toBe(darkTheme.colors.background); // dark base kept
  });

  it("lets a composition-level mode override the brand mode", () => {
    const r = resolveBrand(def, "light");
    expect(r.theme.colors.background).toBe(theme.colors.background); // light base
    expect(r.theme.colors.accent).toBe("#00E0C6"); // brand override still applied
  });

  it("carries transition, metadata, and audio through", () => {
    const r = resolveBrand(def);
    expect(r.transition).toEqual({ type: "dissolve", duration: 0.5 });
    expect(r.meta?.legal).toBe("© Acme");
    expect(r.logos).toMatchObject({ primary: "logo", watermark: "wm" });
  });

  it("renders logos/watermark as brand-kit nodes for the right asset names", () => {
    const r = resolveBrand(def);
    expect(nameOf(r.renderLogo?.())).toBe("logo");
    expect(nameOf(r.renderLogo?.("alternate"))).toBe("alt");
    expect(nameOf(r.renderWatermark?.())).toBe("wm");
  });

  it("defaults to the light theme with no definition", () => {
    expect(resolveBrand().theme.colors.background).toBe(theme.colors.background);
    expect(resolveBrand(undefined, "dark").theme.colors.background).toBe(darkTheme.colors.background);
    expect(resolveBrand().renderLogo).toBeUndefined();
  });
});

describe("typography overrides", () => {
  it("leaves the base theme untouched when no typography override is given", () => {
    const r = resolveBrand({ name: "B", theme: { colors: { accent: "#123456" } } });
    expect(r.theme.typography.fontFamilies.display).toBe(theme.typography.fontFamilies.display);
    expect(r.theme.colors.accent).toBe("#123456");
  });

  it("overrides a family stack and re-points the text styles that use it", () => {
    const r = resolveBrand({
      name: "B",
      theme: { typography: { fontFamilies: { display: '"Fraunces", serif' } } },
    });
    expect(r.theme.typography.fontFamilies.display).toBe('"Fraunces", serif');
    // display/h1/h2 all name the `display` family, so all three follow it.
    expect(r.theme.typography.textStyles.display.fontFamily).toBe('"Fraunces", serif');
    expect(r.theme.typography.textStyles.h1.fontFamily).toBe('"Fraunces", serif');
    expect(r.theme.typography.textStyles.h2.fontFamily).toBe('"Fraunces", serif');
  });

  it("does not disturb styles that name a different family", () => {
    const r = resolveBrand({
      name: "B",
      theme: { typography: { fontFamilies: { display: '"Fraunces", serif' } } },
    });
    expect(r.theme.typography.textStyles.body.fontFamily).toBe(theme.typography.fontFamilies.body);
    expect(r.theme.typography.textStyles.overline.fontFamily).toBe(theme.typography.fontFamilies.accent);
  });

  it("keeps sizes, weights and tracking — a brand swaps the typeface, not the scale", () => {
    const r = resolveBrand({
      name: "B",
      theme: { typography: { fontFamilies: { body: '"Instrument Sans", sans-serif' } } },
    });
    expect(r.theme.typography.textStyles.body.fontSize).toBe(theme.typography.textStyles.body.fontSize);
    expect(r.theme.typography.textStyles.body.fontWeight).toBe(theme.typography.textStyles.body.fontWeight);
    expect(r.theme.typography.textStyles.body.letterSpacing).toBe(theme.typography.textStyles.body.letterSpacing);
  });

  it("merges colours and typography together", () => {
    const r = resolveBrand({
      name: "B",
      theme: { colors: { accent: "#E7A63F" }, typography: { fontFamilies: { display: '"Fraunces", serif' } } },
    });
    expect(r.theme.colors.accent).toBe("#E7A63F");
    expect(r.theme.typography.textStyles.h1.fontFamily).toBe('"Fraunces", serif');
  });
});
