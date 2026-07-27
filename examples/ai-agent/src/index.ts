/**
 * AI agent — the reflect → propose → compile → inspect loop.
 *
 * 1. `compiler.describe()` exposes a JSON-safe catalog.
 * 2. An "agent" discovers a template and its parameter schema.
 * 3. The agent generates a request from the schema.
 * 4. `compile()` turns it into a composition.
 * 5. The agent inspects the report (refine on failure).
 *
 * The agent here is a trivial deterministic stand-in for an LLM. Run with `npm start`.
 */
import { createCompiler, defineTemplate, type FrameworkDescriptor } from "@shanairai/ai-studio";

const promo = defineTemplate({
  name: "promo",
  parameters: {
    parameters: [
      { key: "title", type: "string", required: true },
      { key: "subtitle", type: "string" },
    ],
  },
  build: (p: { title: string; subtitle?: string }) => ({
    scenes: [
      { scene: "hero", duration: 2, props: { title: p.title, subtitle: p.subtitle } },
      { scene: "outro", duration: 1 },
    ],
    transitions: { type: "fade", duration: 0.5 },
  }),
});

const compiler = createCompiler({ templates: { promo } });

// 1 + 2. Reflect: the agent discovers what it can build.
const catalog: FrameworkDescriptor = compiler.describe();
const template = catalog.templates[0];
const schema = template.parameters?.parameters ?? [];
console.log(
  `Agent discovered template "${template.key}" with params:`,
  schema.map((p) => `${p.key}:${p.type}${p.required ? "*" : ""}`).join(", "),
);

// 3. Propose: generate a request purely from the discovered schema.
const params: Record<string, unknown> = {};
for (const p of schema) {
  if (p.type === "string") params[p.key] = p.required ? "An AI-authored headline" : "a supporting subtitle";
}
const request = { id: "agent-video", template: template.key, params };

// 4. Compile. The agent-built request is untyped JSON; casting at this boundary is safe —
//    `compile` re-validates it semantically and returns a structured report either way.
const result = compiler.compile(request as Parameters<typeof compiler.compile>[0]);

// 5. Inspect the report.
if (result.ok) {
  console.log(`Compiled "${result.composition.id}" → ${result.composition.durationInFrames} frames.`);
  console.log("Stages:", result.report.trace.map((s) => `${s.stage}:${s.status}`).join(" → "));
} else {
  console.log("Compile failed — the agent would refine using:");
  for (const issue of result.report.issues) {
    console.log(`  [${issue.code}] ${issue.stage}: ${issue.message}`);
  }
}
