/**
 * __tests__/import-graph — a static walker over the RUNTIME import closure of an entry.
 *
 * Extracted from `inspect-surface.test.ts` when `render-surface.test.ts` needed the
 * same analysis. Two copies of a sixty-line parser is two parsers that drift, and
 * the drift would be silent: each guard would keep passing against its own
 * increasingly different idea of what an import edge is.
 *
 * THE ONE SUBTLETY, and the reason this is not a regex over the file. `import type`
 * and `export type` are erased by the compiler and are NOT runtime edges. A guard
 * that counted them would fail on a perfectly safe type-only reference to a React
 * component's props — and, far worse, a guard that ignored the distinction the
 * other way would pass a real runtime import written next to a type one. So the
 * clause is parsed: a brace list counts only if some specifier in it is a value.
 *
 * Static rather than dynamic on purpose. Importing the entry and inspecting the
 * module cache would only prove what today's code paths happen to load; reading the
 * source proves what the graph permits.
 */

import { readFileSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";

const STMT = /(?:^|\n)\s*(import|export)\b(.*?)\bfrom\s+"([^"]+)"/gs;
const SIDE_EFFECT = /(?:^|\n)\s*import\s+"([^"]+)"/g;

/** Does this statement survive type erasure? */
export const isRuntimeEdge = (kw: string, clause: string): boolean => {
  const c = clause.trim();
  if (kw === "export") return !c.startsWith("type"); // `export type {…}` is erased
  if (c.startsWith("type")) return false; // `import type {…}` is erased
  const brace = c.match(/\{([\s\S]*)\}/);
  if (brace) {
    const nonBrace = c.slice(0, brace.index).replace(/,$/, "").trim();
    if (nonBrace && nonBrace !== "type") return true; // default import alongside braces
    const specs = brace[1].split(",").map((s) => s.trim()).filter(Boolean);
    return specs.length > 0 && !specs.every((s) => /^type\s/.test(s)); // some value specifier
  }
  return true; // default / namespace import
};

/** Resolve a relative specifier to a real file, trying the extensions TypeScript would. */
const resolveRel = (fromFile: string, spec: string): string | null => {
  if (!spec.startsWith(".")) return null; // bare dep — the caller records it
  const base = normalize(join(dirname(fromFile), spec));
  for (const cand of [`${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) {
    try {
      readFileSync(cand);
      return cand;
    } catch {
      /* try next */
    }
  }
  return null;
};

export type RuntimeClosure = {
  /** Every first-party file reachable at runtime, relative to `srcDir`. */
  files: string[];
  /** Every bare (node_modules or `node:`) specifier reached at runtime. */
  bare: string[];
  /** The `.tsx` files in the closure — a proxy for "React got in here". */
  tsx: string[];
};

/** Walk the runtime import closure of `entryRel` within `srcDir`. */
export const runtimeClosure = (srcDir: string, entryRel: string): RuntimeClosure => {
  const seen = new Set<string>();
  const bare = new Set<string>();
  const tsx: string[] = [];
  const stack = [join(srcDir, entryRel)];

  while (stack.length) {
    const f = stack.pop()!;
    if (seen.has(f)) continue;
    seen.add(f);
    if (f.endsWith(".tsx")) tsx.push(relative(srcDir, f));

    let src: string;
    try {
      src = readFileSync(f, "utf8");
    } catch {
      continue;
    }

    for (const m of src.matchAll(STMT)) {
      if (!isRuntimeEdge(m[1], m[2])) continue;
      if (m[3].startsWith(".")) {
        const t = resolveRel(f, m[3]);
        if (t) stack.push(t);
      } else {
        bare.add(m[3]);
      }
    }
    for (const m of src.matchAll(SIDE_EFFECT)) {
      const t = resolveRel(f, m[1]);
      if (t) stack.push(t);
      else if (!m[1].startsWith(".")) bare.add(m[1]);
    }
  }

  return { files: [...seen].map((f) => relative(srcDir, f)), bare: [...bare], tsx };
};
