import { describe, expect, it } from "vitest";
import { theme, darkTheme } from "../../config/Theme";
import { resolveBrand } from "../BrandConfig";

describe("resolveBrand", () => {
  describe("normal", () => {
    it("returns the default light theme and no identity when given nothing", () => {
      const r = resolveBrand();
      expect(r.name).toBeUndefined();
      expect(r.mark).toBeUndefined();
      expect(r.theme.colors.background).toBe(theme.colors.background);
    });

    it('selects the dark base when mode is "dark"', () => {
      const r = resolveBrand({ mode: "dark" });
      expect(r.theme.colors.background).toBe(darkTheme.colors.background);
      expect(r.theme.colors.textPrimary).toBe(darkTheme.colors.textPrimary);
    });

    it("passes name and mark through", () => {
      const r = resolveBrand({ name: "Acme", mark: "logo.png" });
      expect(r.name).toBe("Acme");
      expect(r.mark).toBe("logo.png");
    });
  });

  describe("color override merging", () => {
    it("overrides only the provided color keys and leaves the rest of the base intact", () => {
      const r = resolveBrand({ theme: { colors: { background: "#123456" } } });
      expect(r.theme.colors.background).toBe("#123456");
      expect(r.theme.colors.textPrimary).toBe(theme.colors.textPrimary); // untouched
    });

    it("composes mode + overrides (dark base, one overridden accent)", () => {
      const r = resolveBrand({ mode: "dark", theme: { colors: { accent: "#00E0C6" } } });
      expect(r.theme.colors.accent).toBe("#00E0C6");
      expect(r.theme.colors.background).toBe(darkTheme.colors.background); // dark base kept
    });

    it("accepts arbitrary color strings (the Phase 10B literal-typing fix)", () => {
      const r = resolveBrand({ theme: { colors: { accent: "rgba(0,0,0,0.5)", surface: "hsl(210 40% 12%)" } } });
      expect(r.theme.colors.accent).toBe("rgba(0,0,0,0.5)");
      expect(r.theme.colors.surface).toBe("hsl(210 40% 12%)");
    });
  });

  describe("edge", () => {
    it("returns base color values for an empty colors object", () => {
      const r = resolveBrand({ theme: { colors: {} } });
      expect(r.theme.colors.background).toBe(theme.colors.background);
    });

    it("does not mutate the shared default theme when applying overrides", () => {
      const before = theme.colors.background;
      resolveBrand({ theme: { colors: { background: "#FF0000" } } });
      expect(theme.colors.background).toBe(before); // base untouched
    });

    it("keeps typography/other slices identical to the base theme", () => {
      const r = resolveBrand({ theme: { colors: { background: "#000" } } });
      expect(r.theme.typography).toBe(theme.typography);
    });
  });
});
