/**
 * single-orchestrator — the architectural regression guard for Phase 30.
 *
 * The framework had TWO sequencers over the same stage helpers: `execute()` here and
 * `resolveTemplateComposition`/`buildFromTemplate` in `templates`. They drifted — the latter could
 * not accept custom parameter-type/validator registries — and nothing detected it, because each was
 * individually correct. This test makes a second sequencing path fail loudly instead of silently.
 *
 * The rule: exactly ONE module may call the stage helpers in sequence, and it must be
 * `execution/execute.ts`. `executeOrThrow` is a facade over `execute` and adds no sequencing.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const tsFiles = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...tsFiles(p));
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
  }
  return out;
};

const sourceFiles = (dir: string): string[] => tsFiles(dir).filter((f) => !f.includes("__tests__"));

/** The pure stage helpers `templates` exposes. Calling several in sequence IS orchestration. */
const STAGE_HELPERS = [
  "resolveTemplate",
  "checkTemplateCapabilities",
  "resolveTemplateParameters",
  "runTemplate",
  "validateTemplateOutput",
  "assembleTemplateSchema",
] as const;

/** Count distinct stage helpers a file actually CALLS (`name(`), ignoring imports/exports/types. */
const stageHelpersCalledIn = (src: string): string[] =>
  STAGE_HELPERS.filter((h) => new RegExp(`(?<![\\w.])${h}\\s*\\(`).test(src));

const THE_ORCHESTRATOR = join("src", "execution", "execute.ts");

describe("single canonical orchestrator", () => {
  it("only execution/execute.ts sequences the template stage helpers", () => {
    const offenders = sourceFiles("src")
      .filter((f) => f !== THE_ORCHESTRATOR)
      // Calling one helper is legitimate use; calling several in one module is a second sequencer.
      .filter((f) => stageHelpersCalledIn(readFileSync(f, "utf8")).length > 1);
    expect(offenders).toEqual([]);
  });

  it("execute.ts really is the orchestrator (guards against a vacuous test)", () => {
    const called = stageHelpersCalledIn(readFileSync(THE_ORCHESTRATOR, "utf8"));
    expect(called).toEqual([...STAGE_HELPERS]);
  });

  it("templates exposes no sequencing entry point", () => {
    const src = sourceFiles("src/templates")
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
    expect(src).not.toMatch(/\bbuildFromTemplate\b/);
    expect(src).not.toMatch(/\bresolveTemplateComposition\b/);
  });

  it("templates never imports execution (no cycle)", () => {
    const offenders = sourceFiles("src/templates").filter((f) =>
      /\bfrom\s+["'][^"']*\/execution(?:\/[^"']*)?["']/.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("no layer below execution calls buildComposition after running a template", () => {
    // buildComposition is the assembly step; only the orchestrator (and the app/demo, which builds a
    // handwritten schema directly) may pair it with template evaluation.
    const offenders = sourceFiles("src")
      .filter((f) => f !== THE_ORCHESTRATOR)
      .filter((f) => {
        const src = readFileSync(f, "utf8");
        return /(?<![\w.])buildComposition\s*\(/.test(src) && stageHelpersCalledIn(src).length > 0;
      });
    expect(offenders).toEqual([]);
  });
});
