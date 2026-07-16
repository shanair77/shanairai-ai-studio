import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure-logic suite: no DOM, no jsdom/happy-dom.
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
  },
});
