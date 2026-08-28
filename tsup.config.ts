import { defineConfig } from "tsup";

/**
 * Library build (Phase 28: packaging; `./inspect` entry added Phase S4; `./render`
 * and `./packs` added M2.28).
 *
 * `src/lib.ts` is the side-effect-free root entry; `src/inspect.ts` is the React-free
 * transport-validation entry (`./inspect`). The application entry (`src/index.ts`, which calls
 * `registerRoot`) is deliberately excluded. tsup is used instead of bare `tsc` because tsc emits
 * directory specifiers (`from "./errors"`) that Node ESM rejects with ERR_UNSUPPORTED_DIR_IMPORT;
 * fixing that with tsc alone would require adding `.js` extensions across the source. tsup resolves
 * the graph, so the published artifact runs under both Node ESM and bundlers. Peer dependencies
 * (react / remotion / @remotion/*) are externalised automatically.
 *
 * TWO CONFIGS, BECAUSE THERE ARE TWO PLATFORMS. `platform` is per-config in tsup, and
 * the render entry is the one part of this package that genuinely requires Node: it
 * reads `node:fs`, spawns a bundler and drives a browser. Building it as `neutral`
 * alongside the rest would either fail on those imports or, worse, emit something
 * that looks importable from a browser and is not. Keeping it in its own `node`
 * config states the split in the build that the `exports` map states to consumers.
 */

/** Everything that must stay reachable from a browser bundle. */
const portable = defineConfig({
  entry: { lib: "src/lib.ts", inspect: "src/inspect.ts", packs: "src/packs/index.ts" },
  format: ["esm"],
  outDir: "dist",
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "node18",
  platform: "neutral",
  /**
   * SPLITTING IS LOAD-BEARING, not an optimisation.
   *
   * `.` and `./packs` share the assets and brand modules, and those modules define
   * React contexts. Without splitting, each entry inlines its own copy — so
   * `buildComposition` (reached through `.`) installs a provider using one context
   * object while a brand component (reached through `./packs`) reads a different
   * one, and the render dies with "no <AssetRegistryProvider> found in the tree".
   *
   * Nothing about that is visible in this repo's own tests, which run from `src`
   * as a single module graph with a single copy of every context. It only appears
   * once the built entries are imported together, which is what the render bundle
   * does. Splitting emits the shared modules as one chunk both entries import.
   */
  splitting: true,
});

/**
 * The Node-only render surface.
 *
 * `clean` is false here: the portable config above clears `dist` first, and a second
 * clean would delete what it just built.
 */
const node = defineConfig({
  entry: { render: "src/render.ts" },
  format: ["esm"],
  outDir: "dist",
  dts: true,
  sourcemap: true,
  clean: false,
  treeshake: true,
  target: "node18",
  platform: "node",
  splitting: false,
});

export default [portable, node].flat();
