/**
 * render-surface — locks the Node/portable split introduced in M2.28.
 *
 * The whole justification for putting rendering behind its own export is that the
 * rest of the package stays free of it. That claim is easy to make and easy to
 * break by accident: one convenience re-export from `lib.ts`, one shared helper
 * that happens to live in `render/`, and the root entry starts requiring
 * `@remotion/renderer` — which means a headless Chrome and a native compositor
 * binary — to compile a template in a browser.
 *
 * Nothing catches that at review. Everything still typechecks, every test still
 * passes, and the breakage surfaces as an install-size complaint or a bundler
 * error in somebody else's project. So it is asserted here instead, statically,
 * against the import graph rather than against what today's code paths happen to
 * execute.
 *
 * The inverse is deliberately NOT asserted: `render` importing from the portable
 * side is the intended direction and happens on every render.
 */

import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { runtimeClosure } from "./import-graph";

const SRC = join(process.cwd(), "src");

/** Deps that make a module Node-only. Any of these in a portable entry is the bug. */
const NODE_ONLY = ["@remotion/renderer", "@remotion/bundler", "@remotion/tailwind-v4"];

const isNodeBuiltin = (specifier: string): boolean => specifier.startsWith("node:");

describe("the root entry stays free of the render surface", () => {
  it("reaches no renderer, bundler or tailwind package", () => {
    const { bare } = runtimeClosure(SRC, "lib.ts");
    const leaked = bare.filter((d) => NODE_ONLY.includes(d));

    expect(leaked, `\`.\` must not depend on: ${leaked.join(", ")}`).toEqual([]);
  });

  it("reaches no Node builtin, so it still runs in a browser", () => {
    const { bare } = runtimeClosure(SRC, "lib.ts");
    const builtins = bare.filter(isNodeBuiltin);

    expect(builtins, `\`.\` must not depend on: ${builtins.join(", ")}`).toEqual([]);
  });

  it("does not reach into src/render at all", () => {
    const { files } = runtimeClosure(SRC, "lib.ts");
    const reached = files.filter((f) => f.startsWith("render/") || f === "render.ts");

    expect(reached, `\`.\` must not reach: ${reached.join(", ")}`).toEqual([]);
  });
});

describe("the inspect entry stays free of it too", () => {
  it("reaches neither the render surface nor a Node builtin", () => {
    const { bare, files } = runtimeClosure(SRC, "inspect.ts");

    expect(bare.filter((d) => NODE_ONLY.includes(d) || isNodeBuiltin(d))).toEqual([]);
    expect(files.filter((f) => f.startsWith("render/"))).toEqual([]);
  });
});

describe("the packs entry stays portable", () => {
  it("carries content without carrying a renderer", () => {
    // Packs are named by module specifier and imported by the render BUNDLE, which
    // webpack builds for a browser. A pack that dragged in `node:fs` would fail
    // there — late, and with an error pointing at the wrong thing.
    const { bare, files } = runtimeClosure(SRC, "packs/index.ts");

    expect(bare.filter((d) => NODE_ONLY.includes(d) || isNodeBuiltin(d))).toEqual([]);
    expect(files.filter((f) => f.startsWith("render/"))).toEqual([]);
  });
});

describe("the render entry is the one place Node-only code lives", () => {
  it("does reach the renderer and bundler — otherwise it could not render", () => {
    const { bare } = runtimeClosure(SRC, "render.ts");

    // The positive assertion matters as much as the negative ones: a `./render`
    // that stopped importing the renderer would pass every guard above while
    // having quietly stopped working.
    expect(bare).toContain("@remotion/renderer");
    expect(bare).toContain("@remotion/bundler");
    // Tailwind is not optional decoration here — an unstyled render is a failed one.
    expect(bare).toContain("@remotion/tailwind-v4");
  });
});

describe("the package manifest matches the split", () => {
  it("declares the Node-only dependencies as OPTIONAL peers", async () => {
    const pkg = (await import("../../package.json", { with: { type: "json" } })).default as {
      peerDependencies: Record<string, string>;
      peerDependenciesMeta?: Record<string, { optional?: boolean }>;
      exports: Record<string, unknown>;
    };

    for (const dep of NODE_ONLY) {
      expect(pkg.peerDependencies[dep], `${dep} must be a peer`).toBeDefined();
      // Not decoration. npm 7+ INSTALLS peer dependencies automatically, so a
      // non-optional peer here would push a renderer and a headless browser onto
      // every consumer of the compiler — the exact cost this split exists to
      // avoid. `optional: true` is what makes it opt-in.
      expect(pkg.peerDependenciesMeta?.[dep]?.optional, `${dep} must be an OPTIONAL peer`).toBe(true);
    }
  });

  it("publishes the render surface under its own subpath", async () => {
    const pkg = (await import("../../package.json", { with: { type: "json" } })).default as {
      exports: Record<string, unknown>;
    };

    expect(Object.keys(pkg.exports)).toContain("./render");
    expect(Object.keys(pkg.exports)).toContain("./packs");
  });
});
