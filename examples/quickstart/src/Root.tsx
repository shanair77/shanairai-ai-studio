/**
 * The Remotion integration: mount the compiled BuiltComposition in a <Composition>.
 * Register this Root with Remotion's `registerRoot`, then `npx remotion render Promo`.
 */
import { Composition } from "remotion";
import { createCompiler, defineTemplate } from "@shanairai/ai-studio";

const promo = defineTemplate({
  name: "promo",
  parameters: { parameters: [{ key: "title", type: "string", required: true }] },
  build: (p: { title: string }) => ({
    scenes: [
      { scene: "hero", duration: 2, props: { title: p.title } },
      { scene: "outro", duration: 2 },
    ],
    transitions: { type: "fade", duration: 0.5 },
  }),
});

const compiler = createCompiler({ templates: { promo } });
const result = compiler.compile({ id: "Promo", template: "promo", params: { title: "Ship faster" } });

export const RemotionRoot = () => {
  if (!result.ok) throw new Error("compile failed: " + JSON.stringify(result.report.issues));
  const c = result.composition;
  return (
    <Composition
      id={c.id}
      component={c.component}
      durationInFrames={c.durationInFrames}
      fps={c.fps}
      width={c.width}
      height={c.height}
    />
  );
};
