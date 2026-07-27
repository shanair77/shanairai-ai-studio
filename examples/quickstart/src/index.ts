/**
 * Quick Start — the smallest complete example.
 *
 * defineTemplate → createCompiler → compile. Run with `npm start`.
 * Uses only the public `@shanairai/ai-studio` surface.
 */
import { createCompiler, defineTemplate } from "@shanairai/ai-studio";

// 1. Author a template: typed params in → composition data out. It never returns React.
const promo = defineTemplate({
  name: "promo",
  parameters: {
    parameters: [{ key: "title", type: "string", required: true }],
  },
  build: (p: { title: string }) => ({
    scenes: [
      { scene: "hero", duration: 2, props: { title: p.title } },
      { scene: "outro", duration: 2 },
    ],
    transitions: { type: "fade", duration: 0.5 },
  }),
});

// 2. Bind a compiler over your templates.
const compiler = createCompiler({ templates: { promo } });

// 3. Compile a request. The result is a discriminated union — no try/catch.
const result = compiler.compile({
  id: "MyVideo",
  template: "promo",
  params: { title: "Ship faster" },
});

if (!result.ok) {
  console.error("compile failed:", result.report.issues);
  process.exit(1);
}

const c = result.composition;
console.log("Compiled BuiltComposition (mount this in a Remotion <Composition>):");
console.log({
  id: c.id,
  durationInFrames: c.durationInFrames,
  fps: c.fps,
  width: c.width,
  height: c.height,
  component: typeof c.component,
});
