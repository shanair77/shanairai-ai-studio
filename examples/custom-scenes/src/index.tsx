/**
 * Custom scenes — author a scene component, register it, and use it in a template.
 *
 * `defineScene` binds a React component into a typed scene definition. Passing it via
 * `createCompiler({ scenes: { … } })` ADDS it to the built-in scenes (matching keys override).
 * Run with `npm start`.
 */
import { AbsoluteFill } from "remotion";
import { createCompiler, defineScene, defineTemplate } from "@shanairai/ai-studio";

// 1. Author a custom scene as a plain Remotion/React component.
type BadgeProps = { label?: string; color?: string };
const Badge = ({ label = "Badge", color = "#00E0C6" }: BadgeProps) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", backgroundColor: "#0b1220" }}>
    <div style={{ color, fontSize: 96, fontWeight: 800, letterSpacing: -2 }}>{label}</div>
  </AbsoluteFill>
);

// 2. Bind it into a typed scene definition (carries its prop type + default duration).
const badge = defineScene<BadgeProps>({ component: Badge, defaultDuration: 2 });

// 3. A template that uses the custom scene ("badge") alongside a built-in ("outro").
const showcase = defineTemplate({
  name: "showcase",
  build: () => ({
    scenes: [
      { scene: "badge", duration: 2, props: { label: "Custom Scene", color: "#FFD166" } },
      { scene: "outro", duration: 1 },
    ],
    transitions: { type: "dissolve", duration: 0.4 },
  }),
});

// 4. Register the custom scene with the compiler and compile.
const compiler = createCompiler({ templates: { showcase }, scenes: { badge } });
const result = compiler.compile({ id: "Showcase", template: "showcase", params: {} });

if (!result.ok) {
  console.error("compile failed:", result.report.issues);
  process.exit(1);
}
console.log("Compiled with custom scene. duration =", result.composition.durationInFrames, "frames");
console.log("Scenes now available:", compiler.describe().scenes.map((s) => s.key).join(", "));
