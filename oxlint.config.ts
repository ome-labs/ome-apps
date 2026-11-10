import config from "klarity/oxlint/react";
import { defineConfig } from "oxlint";

// Apps and UI packages reach icons and other packages only through their public entry points:
// icons go through `@ome-labs/icons` (so the kit stays at its 85 icons), and nothing imports another
// package's `src/`.
const restrictedImports = {
  patterns: [
    {
      group: ["@hugeicons/*"],
      message: "Use @ome-labs/icons: apps and UI packages only use the kit's icons.",
    },
    {
      group: ["@ome-labs/*/src", "@ome-labs/*/src/*"],
      message: "Import a package through its exports, not its src/ folder.",
    },
  ],
};

export default defineConfig({
  extends: [config],
  rules: { "no-restricted-imports": ["error", restrictedImports] },
  overrides: [
    {
      // Stories and tests render fixed sample data; memoising their props would only obscure them.
      files: ["**/stories/**", "**/*.stories.tsx", "**/tests/**", "**/*.test.tsx"],
      rules: {
        "react-perf/jsx-no-new-object-as-prop": "off",
        "react-perf/jsx-no-new-array-as-prop": "off",
        "react-perf/jsx-no-new-function-as-prop": "off",
        "react-perf/jsx-no-jsx-as-prop": "off",
      },
    },
    {
      // Base UI composes through `render={<Element />}` and inline callbacks handed to primitives that aren't
      // memoised; wrapping each in useMemo or useCallback would add code and save no renders.
      files: ["packages/ui-web/**", "packages/ui-native/**"],
      rules: {
        "react-perf/jsx-no-jsx-as-prop": "off",
        "react-perf/jsx-no-new-function-as-prop": "off",
      },
    },
    {
      // The icons package is the one place that wraps Hugeicons.
      files: ["packages/icons/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: restrictedImports.patterns.filter(
              (pattern) => !pattern.group.includes("@hugeicons/*"),
            ),
          },
        ],
      },
    },
  ],
});
