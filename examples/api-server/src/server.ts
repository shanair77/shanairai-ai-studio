/**
 * API server — validate untrusted request JSON with the React-free `./inspect` entry,
 * then compile it. Demonstrates the two-tier pattern in a single process for clarity.
 *
 *   POST /compile  { id, template, params }  →  200 { composition metadata } | 400/422 { report }
 *
 * Run with `npm start`, then:
 *   curl -s localhost:8787/compile -H 'content-type: application/json' \
 *     -d '{"id":"v1","template":"promo","params":{"title":"Hello"}}'
 */
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createCompiler, defineTemplate } from "@shanairai/ai-studio";
import { processRequest } from "@shanairai/ai-studio/inspect";

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

export const app = new Hono();

app.post("/compile", async (c) => {
  // 1. Transport validation (React-free): hand the RAW body to processRequest — it owns parsing,
  //    versioning, and JSON-safety, and returns `invalid-json` (not a thrown error) on bad input.
  const validated = processRequest(await c.req.text());
  if (!validated.ok) {
    return c.json({ stage: "transport", report: validated.report }, 400);
  }

  // 2. Semantic compile. `validated.request` is a transport-validated (erased) request; casting it to
  //    the typed compile input at this trust boundary is safe — `compile` re-validates semantically.
  const result = compiler.compile(validated.request as Parameters<typeof compiler.compile>[0]);
  if (!result.ok) {
    return c.json({ stage: "compile", report: result.report }, 422);
  }

  const b = result.composition;
  return c.json({
    ok: true,
    composition: { id: b.id, durationInFrames: b.durationInFrames, fps: b.fps, width: b.width, height: b.height },
  });
});

// Only start a listener when run directly (kept importable for tests).
if (process.env.NODE_ENV !== "test") {
  serve({ fetch: app.fetch, port: 8787 }, (i) => console.log(`listening on http://localhost:${i.port}`));
}
