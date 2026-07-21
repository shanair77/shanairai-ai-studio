/**
 * import-safety — enforces Invariant #9 ("side effects live at the entry").
 *
 * Framework modules are pure on import. The ONE module whose evaluation does work is
 * `config/fonts/bootstrap.ts`, and only the application entry may import it. This is a
 * structural constraint, not behavioural detection: whatever side effect anyone adds later,
 * it must live in a `bootstrap` module that no framework layer is allowed to reach.
 *
 * The regression this guards is real — Phase 17 added `loadFonts` beside the eager
 * `provider.load(fontManifest)` call, so `brand/BrandContext` value-imported the module and
 * every layer above it (composition → templates → execution → metadata) began loading fonts
 * on import rather than on invocation.
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

/** Matches BOTH `import ... from "./bootstrap"` and `export ... from "./bootstrap"` — a
 *  re-export from a barrel is exactly how the side effect would silently return. */
const REFERENCES_BOOTSTRAP = /\b(?:import|export)\b[^;]*?["'][^"']*\/bootstrap["']|\bimport\s+["'][^"']*\/bootstrap["']/;

describe("import safety (ARCHITECTURE.md invariant #9)", () => {
  it("only the application entry references a bootstrap module", () => {
    const offenders = tsFiles("src")
      .filter((f) => !f.includes("__tests__"))
      .filter((f) => f !== join("src", "index.ts"))
      .filter((f) => REFERENCES_BOOTSTRAP.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("package.json#sideEffects declares exactly the bootstrap module", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { sideEffects: string[] };
    expect([...pkg.sideEffects].sort()).toEqual(["**/config/fonts/bootstrap.ts", "*.css"]);
  });
});
