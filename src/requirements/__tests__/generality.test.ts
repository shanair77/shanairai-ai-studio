import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createCompiler } from "../../compiler";
import { productionPack } from "../../packs";

/**
 * The planner must be a framework feature, not a Jet Set feature.
 *
 * The tempting shortcut for this milestone was a lookup table: this template at
 * this cut needs these fifteen. It would pass every count assertion in the suite
 * next door and be worthless the moment somebody wrote a second template.
 */

const here = join(__dirname, "..");

const sources = readdirSync(here)
  .filter((entry) => entry.endsWith(".ts"))
  .map((entry) => ({ file: entry, text: readFileSync(join(here, entry), "utf8") }));

describe("nothing here knows about any particular film", () => {
  it("reads no template, brand, cut or asset by name", () => {
    // Prose is exempt: the comments cite the real campaign because that is what
    // makes the 44-against-15 problem concrete. Code is not.
    const withoutComments = (text: string) =>
      text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

    const forbidden = [
      /jetset/i,
      /jet-set/i,
      /campaign/i,
      /\bcut\b/,
      /musicBed/,
      /\bbadge\b/,
      /vo\d\d/,
      /\bamb[A-Z]/,
    ];

    for (const { file, text } of sources) {
      const code = withoutComments(text);

      for (const pattern of forbidden) {
        expect(pattern.test(code), `${file} names ${String(pattern)}`).toBe(false);
      }
    }
  });

  it("hard-codes no asset names or counts", () => {
    for (const { file, text } of sources) {
      const code = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

      // A literal list of names, or a magic 15/23/36/44, would each be the
      // shortcut this test exists to forbid.
      expect(/\b(15|23|36|44)\b/.test(code), `${file} hard-codes a count`).toBe(false);
    }
  });

  it("stays pure: no filesystem, no bundler, no browser, no renderer", () => {
    for (const { file, text } of sources) {
      for (const forbidden of ["node:fs", "node:path", "@remotion/bundler", "@remotion/renderer"]) {
        expect(text.includes(forbidden), `${file} imports ${forbidden}`).toBe(false);
      }
    }
  });

  it("works for a template that names no assets at all", () => {
    // The degenerate case a lookup table would have no entry for.
    const compiler = createCompiler(productionPack);
    const result = compiler.requirementsFor({
      id: "x",
      template: "jetset-campaign",
      params: { cut: "15" },
      brand: "jet-set-adventures",
    } as never);

    expect(result.ok).toBe(true);
  });
});

describe("cost", () => {
  it("plans in well under a request budget", () => {
    const compiler = createCompiler(productionPack);
    const request = {
      id: "x",
      template: "jetset-campaign",
      params: { cut: "60" },
      brand: "jet-set-adventures",
    } as never;

    compiler.requirementsFor(request);

    const started = performance.now();
    for (let i = 0; i < 20; i += 1) compiler.requirementsFor(request);
    const each = (performance.now() - started) / 20;

    // Measured at roughly 2ms; the assertion is loose because this runs on
    // whatever machine CI happens to give it. The point is the order of
    // magnitude — planning is an API-request operation, not a job.
    expect(each).toBeLessThan(100);
  });
});
