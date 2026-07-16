import { config } from "@remotion/eslint-config-flat";

export default [
  ...config,
  {
    // Remotion's animation-purity rules target composition/render code and mis-fire on
    // pure-logic Vitest suites (e.g. on config keys named `transition`). Silence them for
    // tests only; production linting is unchanged.
    files: ["**/__tests__/**/*.ts"],
    rules: {
      "@remotion/non-pure-animation": "off",
    },
  },
];
