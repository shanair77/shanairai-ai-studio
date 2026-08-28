/**
 * render-isolation — enforces the deterministic render rule.
 *
 * Acquisition talks to external providers. Nothing Remotion renders may reach it, or a re-render
 * of an approved campaign could generate a *different* sound effect and quietly change a locked
 * film. Acquisition therefore runs as a pre-render production step and leaves ordinary local files
 * behind; by render time an acquired asset is indistinguishable from one that was always there.
 *
 * This is a structural guard rather than behavioural detection, in the same spirit as the fonts
 * import-safety test: whatever anyone adds to the acquisition layer later, no render-path module
 * is allowed to import it.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(process.cwd(), "src");

const tsFiles = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...tsFiles(p));
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
  }
  return out;
};

/**
 * Catches a VALUE `import … from "…/acquisition"` or `export … from "…/acquisition"` — a barrel
 * re-export is exactly how the dependency would sneak back in.
 *
 * `import type` / `export type` are deliberately allowed: they are fully erased by the compiler
 * and cannot pull the module into a bundle, so a project's declaration file may name the
 * acquisition contract without breaking render determinism. An inline `import { type X }` is NOT
 * allowed, because the statement itself survives and the module is still resolved at runtime.
 */
const REACHES_ACQUISITION = /(?:import|export)\s+(?!type\s)[^;]*?from\s+["'][^"']*acquisition[^"']*["']/;

/** Comments are not code. Scanning them produces false positives — a doc comment that merely
 *  mentions an import is not one. */
const stripComments = (t: string): string =>
  t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

/** Everything the renderer can reach. Acquisition itself and test files are exempt. */
const renderPathFiles = () =>
  tsFiles(SRC).filter((f) => {
    const rel = relative(SRC, f);
    return !rel.startsWith("acquisition") && !rel.includes("__tests__");
  });

describe("deterministic render rule", () => {
  it("no render-path module imports the acquisition layer", () => {
    const offenders = renderPathFiles()
      .filter((f) => REACHES_ACQUISITION.test(stripComments(readFileSync(f, "utf8"))))
      .map((f) => relative(SRC, f));
    expect(offenders).toEqual([]);
  });

  it("the package entry points do not reach acquisition", () => {
    for (const entry of ["index.ts", "lib.ts", "Root.tsx"]) {
      expect(REACHES_ACQUISITION.test(stripComments(readFileSync(join(SRC, entry), "utf8")))).toBe(false);
    }
  });

  it("the acquisition layer performs no work merely on import", async () => {
    // Importing must be free of I/O and network. If this ever throws or hangs, a module-level
    // side effect has been introduced.
    const mod = await import("../index");
    expect(typeof mod.acquireAssets).toBe("function");
    expect(typeof mod.verifyAudio).toBe("function");
  });

  it("the provider adapter reads its credential at call time, never at import", () => {
    const src = readFileSync(join(SRC, "acquisition/providers/elevenlabs.ts"), "utf8");
    // Only executable module scope counts — a doc comment naming the env var is fine and useful.
    const moduleScope = stripComments(src.slice(0, src.indexOf("export const elevenLabsProvider")));
    expect(moduleScope).not.toContain("process.env");
    // ...and it genuinely is read inside the acquire call.
    expect(src.slice(src.indexOf("async acquire"))).toContain("process.env.ELEVENLABS_API_KEY");
  });
});
