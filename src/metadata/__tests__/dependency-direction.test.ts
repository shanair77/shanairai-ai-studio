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
const importsFrom = (file: string, re: RegExp): boolean => re.test(readFileSync(file, "utf8"));

describe("dependency direction (ADR-009 §5)", () => {
  it("nothing imports metadata (it is a leaf)", () => {
    const others = ["src/registry", "src/config", "src/composition", "src/transitions", "src/assets", "src/brand", "src/parameters", "src/templates", "src/execution", "src/requests", "src/contracts", "src/errors"]
      .filter((d) => { try { statSync(d); return true; } catch { return false; } })
      .flatMap(tsFiles);
    const offenders = others.filter((f) => importsFrom(f, /\bfrom\s+["'][^"']*\/metadata(?:\/[^"']*)?["']/));
    expect(offenders).toEqual([]);
  });

  it("metadata imports no execution runtime, no rendering, and mutates no registry", () => {
    const files = tsFiles("src/metadata").filter((f) => !f.includes("__tests__"));
    const src = files.map((f) => readFileSync(f, "utf8")).join("\n");
    expect(/from\s+["'][^"']*\/execution/.test(src)).toBe(false); // no execution import
    expect(/\bexecute\s*\(|buildComposition\s*\(/.test(src)).toBe(false); // never executes/builds
    expect(/\.extend\s*\(/.test(src)).toBe(false); // never mutates a registry
    expect(/from\s+["']react["']|from\s+["']remotion["']/.test(src)).toBe(false); // no React/render
  });
});
