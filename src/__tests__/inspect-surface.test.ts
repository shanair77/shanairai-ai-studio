/**
 * inspect-surface — locks the `./inspect` entry (Phase S4).
 *
 * (1) RUNTIME LOCK: the exact runtime (value) exports (`processRequest`, `CURRENT_REQUEST_VERSION`).
 * (2) REACT-FREE GUARD: the RUNTIME import closure of `inspect.ts` must contain zero React, Remotion,
 *     `@remotion/*`, or `.tsx` — type-only imports/exports are erased and must not count as edges.
 *     This is the standing guarantee that a future edit cannot drag React into the transport entry.
 * (3) DECLARATION LEAK GUARD: no compiler/execution internals leak through `inspect.d.ts`, and the
 *     type-only `FrameworkDescriptor` export introduces no runtime metadata dependency.
 */

import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as inspect from "../inspect";
// The walker moved to a shared module when `render-surface.test.ts` needed the same
// analysis; the guarantees asserted below are unchanged.
import { runtimeClosure } from "./import-graph";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const EXPECTED_RUNTIME_EXPORTS = ["CURRENT_REQUEST_VERSION", "processRequest"].sort();

describe("inspect surface — runtime exports", () => {
  it("exports exactly the two locked runtime names", () => {
    const actual = Object.keys(inspect)
      .filter((k) => (inspect as Record<string, unknown>)[k] !== undefined)
      .sort();
    expect(actual).toEqual(EXPECTED_RUNTIME_EXPORTS);
  });

  it("does not expose describeFramework or the throwing request variant", () => {
    for (const gone of ["describeFramework", "processRequestOrThrow", "createCompiler"]) {
      expect(gone in inspect).toBe(false);
    }
  });
});

describe("inspect surface — React-free guard", () => {
  it("the runtime closure imports no React, Remotion, @remotion/*, or .tsx", () => {
    const { bare, tsx } = runtimeClosure(SRC, "inspect.ts");
    const banned = bare.filter((d) => d === "react" || d === "remotion" || d.startsWith("@remotion/"));
    expect(banned, `forbidden runtime deps: ${banned.join(", ")}`).toEqual([]);
    expect(tsx, `React component files in runtime closure: ${tsx.join(", ")}`).toEqual([]);
    // sanity: the type-only FrameworkDescriptor export must NOT pull the metadata reflector at runtime
    expect(bare).toEqual([]);
  });
});

// Names that must never appear as a type reference in the public `./inspect` declaration.
const FORBIDDEN = [
  "CompositionSchemaBase",
  "CompositionSchema",
  "ExecutionResult",
  "ExecutionContext",
  "ExecutionEnvironment",
  "CompileRequest",
  "CompileResult",
  "Compiler",
];

const resolveDts = (fromRel: string, target: string): string => {
  const dir = fromRel.includes("/") ? fromRel.slice(0, fromRel.lastIndexOf("/")).split("/") : [];
  const stack = [...dir];
  for (const p of target.split("/")) {
    if (p === "." || p === "") continue;
    else if (p === "..") stack.pop();
    else stack.push(p);
  }
  return `${stack.join("/")}.d.ts`;
};

describe("inspect surface — declaration leak guard", () => {
  it("no forbidden internal type is reachable from inspect.d.ts", () => {
    const out = mkdtempSync(join(tmpdir(), "ai-studio-inspect-dts-"));
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
          return;
        }
        const code = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
        for (const name of FORBIDDEN) {
          if (new RegExp(`\\b${name}\\b`).test(code)) violations.push(`${name} via src/${rel}`);
        }
        for (const m of code.matchAll(/(?:from|import\()\s*"(\.[^"]+)"/g)) {
          walk(resolveDts(rel, m[1]));
        }
      };
      walk("inspect.d.ts");
      expect(seen.size).toBeGreaterThan(1);
      expect(violations, `forbidden types in inspect closure:\n${violations.join("\n")}`).toEqual([]);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }, 60_000);
});
