/**
 * Multi-brand — one template compiled under several brands.
 *
 * Brands are registered content selected by name. The same template + params produces a
 * composition themed per brand (brand overrides recolor the tree at render time).
 * Run with `npm start`.
 */
import { createCompiler, defineBrand, defineTemplate } from "@shanairai/ai-studio";

const promo = defineTemplate({
  name: "promo",
  parameters: { parameters: [{ key: "title", type: "string", required: true }] },
  build: (p: { title: string }) => ({
    scenes: [
      { scene: "hero", duration: 2, props: { title: p.title } },
      { scene: "outro", duration: 1 },
    ],
    transitions: { type: "fade", duration: 0.5 },
  }),
});

// Two brands: same identity shape, different mode + accent.
const acme = defineBrand({ name: "Acme", mode: "dark", theme: { colors: { accent: "#00E0C6" } } });
const globex = defineBrand({ name: "Globex", mode: "light", theme: { colors: { accent: "#FF5C7A" } } });

const compiler = createCompiler({ templates: { promo }, brands: { acme, globex } });

// Compile the SAME request under each brand.
for (const brand of ["acme", "globex"] as const) {
  const result = compiler.compile({
    id: `Promo-${brand}`,
    template: "promo",
    params: { title: "Launch Day" },
    brand,
  });
  console.log(
    `${brand.padEnd(7)} →`,
    result.ok ? `ok (${result.composition.id}, ${result.composition.durationInFrames} frames)` : result.report.issues,
  );
}

console.log("Registered brands:", compiler.describe().brands.map((b) => b.key).join(", "));
