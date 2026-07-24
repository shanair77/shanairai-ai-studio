/**
 * public-surface — locks the npm `.` entry (Phase S3.3).
 *
 * (1) RUNTIME LOCK: the exact set of runtime (value) exports from `lib.ts`. Any accidental add or
 *     removal — a stray re-export, a helper that leaked out — fails here.
 * (2) LEAK GUARD: the declaration surface reachable from `lib.d.ts` must contain NO forbidden
 *     implementation type as a type reference (comments excluded). Standing guarantee that a public
 *     signature never exposes `CompositionSchemaBase`, `ExecutionResult`, resolvers, etc.
 *
 * The type-only surface is not enumerated at runtime (types are erased); it is governed by the leak
 * guard plus `tsc`, which fails the build if an exported declaration references an inaccessible type.
 */

import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as sdk from "../lib";

const ROOT = process.cwd();

const EXPECTED_RUNTIME_EXPORTS = [
  "DomainError",
  "createCompiler",
  "defineAsset",
  "defineAssetKit",
  "defineBrand",
  "defineScene",
  "defineTemplate",
  "defineTransition",
].sort();

describe("public surface — runtime exports", () => {
  it("exports exactly the locked runtime names (no more, no less)", () => {
    const actual = Object.keys(sdk)
      .filter((k) => (sdk as Record<string, unknown>)[k] !== undefined)
      .sort();
    expect(actual).toEqual(EXPECTED_RUNTIME_EXPORTS);
  });

  it("does not export removed implementation primitives", () => {
    for (const gone of [
      "ok", "err", "sanitize", "createRegistry", "CURRENT_REQUEST_VERSION",
      "processRequest", "processRequestOrThrow", "execute", "buildComposition",
    ]) {
      expect(gone in sdk).toBe(false);
    }
  });
});

// Names that must NEVER appear as a type reference in the public declaration surface.
const FORBIDDEN = [
  "CompositionSchemaBase",
  "CompositionSchema",
  "ExecutionResult",
  "ExecutionContext",
  "ExecutionEnvironment",
  "ExecutionInput",
  "ExecutionRequest",
  "TemplateCompositionBase",
  "TemplateCompositionFor",
  "Resolver",
];

// Resolve a relative import target (from a src-relative .d.ts) to a src-relative module path.
const resolveRel = (fromRel: string, target: string): string => {
  const dir = fromRel.includes("/") ? fromRel.slice(0, fromRel.lastIndexOf("/")).split("/") : [];
  const stack = [...dir];
  for (const p of target.split("/")) {
    if (p === "." || p === "") continue;
    else if (p === "..") stack.pop();
    else stack.push(p);
  }
  return stack.join("/");
};

describe("public surface — declaration leak guard", () => {
  it("no forbidden implementation type is reachable from the public `.` declaration", () => {
    const out = mkdtempSync(join(tmpdir(), "ai-studio-dts-"));
    try {
      execSync(
        `npx tsc -p tsconfig.json --noEmit false --declaration --emitDeclarationOnly --outDir "${out}"`,
        { cwd: ROOT, stdio: "pipe" },
      );

      const seen = new Set<string>();
      const violations: string[] = [];
      const walk = (rel: string): void => {
        if (seen.has(rel)) return;
        seen.add(rel);
        let text: string;
        try {
          text = readFileSync(join(out, "src", rel), "utf8");
        } catch {
          return; // non-src (react, @remotion/*) or absent — outside our surface
        }
        const code = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
        for (const name of FORBIDDEN) {
          if (new RegExp(`\\b${name}\\b`).test(code)) violations.push(`${name} via src/${rel}`);
        }
        for (const m of code.matchAll(/(?:from|import\()\s*"(\.[^"]+)"/g)) {
          walk(`${resolveRel(rel, m[1])}.d.ts`);
        }
      };
      walk("lib.d.ts");

      expect(seen.size).toBeGreaterThan(1); // proved we actually walked the graph
      expect(violations, `forbidden types in public closure:\n${violations.join("\n")}`).toEqual([]);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }, 60_000);
});
