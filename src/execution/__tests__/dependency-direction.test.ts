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

const importsExecution = (file: string): boolean =>
  /\bfrom\s+["'][^"']*\/execution(?:\/[^"']*)?["']/.test(readFileSync(file, "utf8"));

describe("dependency direction (ADR-007 §5)", () => {
  it("templates never imports execution", () => {
    const offenders = tsFiles("src/templates").filter(importsExecution);
    expect(offenders).toEqual([]);
  });

  it("composition never imports execution", () => {
    const offenders = tsFiles("src/composition").filter(importsExecution);
    expect(offenders).toEqual([]);
  });

  it("parameters, brand, assets, and errors never import execution", () => {
    const offenders = ["src/parameters", "src/brand", "src/assets", "src/errors"].flatMap(tsFiles).filter(importsExecution);
    expect(offenders).toEqual([]);
  });
});
