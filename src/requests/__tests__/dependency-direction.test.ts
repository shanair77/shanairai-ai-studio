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
// Runtime source only — test files legitimately import across layers for integration testing.
const sourceFiles = (dir: string) => tsFiles(dir).filter((f) => !f.includes("__tests__"));
const read = (files: string[]) => files.map((f) => ({ f, src: readFileSync(f, "utf8") }));

// The framework registries the syntax layer must never touch (ADR-008 §4.1 invariant).
const FRAMEWORK_REGISTRIES = /\b(templateRegistry|sceneRegistry|assetRegistry|brandRegistry|transitionRegistry|parameterTypeRegistry|validatorRegistry)\b/;
const importsExecution = /\bfrom\s+["'][^"']*\/execution(?:\/[^"']*)?["']/;
const importsRequests = /\bfrom\s+["'][^"']*\/requests(?:\/[^"']*)?["']/;
const importsContracts = /\bfrom\s+["'][^"']*\/contracts(?:\/[^"']*)?["']/;

describe("dependency direction (ADR-008 §4.1, §5)", () => {
  it("requests accesses NO framework registry (syntax-vs-semantics invariant)", () => {
    const offenders = read(sourceFiles("src/requests"))
      .filter(({ src }) => FRAMEWORK_REGISTRIES.test(src))
      .map(({ f }) => f);
    expect(offenders).toEqual([]);
  });

  it("requests never imports execution", () => {
    const offenders = read(sourceFiles("src/requests")).filter(({ src }) => importsExecution.test(src)).map(({ f }) => f);
    expect(offenders).toEqual([]);
  });

  it("execution never imports requests", () => {
    const offenders = read(sourceFiles("src/execution")).filter(({ src }) => importsRequests.test(src)).map(({ f }) => f);
    expect(offenders).toEqual([]);
  });

  it("contracts imports neither execution nor requests (leaf protocol)", () => {
    const offenders = read(sourceFiles("src/contracts"))
      .filter(({ src }) => importsExecution.test(src) || importsRequests.test(src))
      .map(({ f }) => f);
    expect(offenders).toEqual([]);
  });

  it("the family layers never import contracts (contracts depends on them, not vice-versa)", () => {
    const families = ["src/templates", "src/composition", "src/transitions", "src/assets", "src/brand", "src/parameters"];
    const offenders = families.flatMap((d) => read(tsFiles(d)))
      .filter(({ f }) => !f.includes("__tests__"))
      .filter(({ src }) => importsContracts.test(src))
      .map(({ f }) => f);
    expect(offenders).toEqual([]);
  });
});
