import { defineConfig } from "tsup";

/**
 * Library build (Phase 28: packaging; `./inspect` entry added Phase S4).
 *
 * `src/lib.ts` is the side-effect-free root entry; `src/inspect.ts` is the React-free
 * transport-validation entry (`./inspect`). The application entry (`src/index.ts`, which calls
 * `registerRoot`) is deliberately excluded. tsup is used instead of bare `tsc` because tsc emits
 * directory specifiers (`from "./errors"`) that Node ESM rejects with ERR_UNSUPPORTED_DIR_IMPORT;
 * fixing that with tsc alone would require adding `.js` extensions across the source. tsup resolves
 * the graph, so the published artifact runs under both Node ESM and bundlers. Peer dependencies
 * (react / remotion / @remotion/*) are externalised automatically.
 */
export default defineConfig({
  entry: { lib: "src/lib.ts", inspect: "src/inspect.ts" },
  format: ["esm"],
  outDir: "dist",
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "node18",
  platform: "neutral",
  splitting: false,
});
