import { defineConfig } from "vitest/config";

/**
 * The render integration suite — separate from `vitest.config.ts` on purpose.
 *
 * These tests build a real webpack bundle and drive a real headless browser. They
 * take minutes rather than milliseconds, so keeping them out of the default suite
 * is what lets the default suite stay something you run on every save. Run them
 * with `npm run test:render`.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/__integration__/**/*.test.ts"],
    // A cold bundle plus a browser launch is minutes, not seconds.
    testTimeout: 600_000,
    hookTimeout: 600_000,
    // One browser at a time: parallel Chrome instances contend for the same cores
    // and turn a slow suite into an unreliable one.
    fileParallelism: false,
  },
});
