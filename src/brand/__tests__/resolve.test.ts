import { type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { theme, darkTheme } from "../../config/Theme";
import { createRegistry } from "../../registry";
import { createAssetDefinition, createAssetKit } from "../../assets";
import { createBrandDefinition } from "../definition";
import { resolveBrand } from "../resolve";

// Remote sources avoid staticFile so logo closures resolve without a render context.
const kit = createAssetKit({
  logo: createAssetDefinition({ category: "svg", source: "https://cdn/logo.svg" }),
  alt: createAssetDefinition({ category: "image", source: "https://cdn/alt.png" }),
  wm: createAssetDefinition({ category: "svg", source: "https://cdn/wm.svg" }),
});

// Register + require so the definition is the erased BrandDefinition the engine sees.
const brands = createRegistry({
  acme: createBrandDefinition({
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
