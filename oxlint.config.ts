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
      // The kit app and the tests render fixed reference pages and sample data; memoising their props would only
      // obscure them.
      files: ["apps/kit/**", "**/tests/**", "**/*.test.tsx"],
      rules: {
        "react-perf/jsx-no-new-object-as-prop": "off",
        "react-perf/jsx-no-new-array-as-prop": "off",
        "react-perf/jsx-no-new-function-as-prop": "off",
        "react-perf/jsx-no-jsx-as-prop": "off",
      },
    },
    {
      // The website hands motion its targets inline (`animate={{ … }}`) and wires small handlers on plain elements;
      // motion compares values itself and DOM elements don't memoise, so useMemo or useCallback would save nothing.
      files: ["apps/landing/**"],
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
      // The desktop renderer fills ui-web's slots (`topBar`, `sidebar`, `render={<Link />}`) with elements; those
      // components don't memoise, so wrapping each slot in useMemo would add code and save no renders.
      files: ["apps/desktop/src/renderer/**"],
      rules: { "react-perf/jsx-no-jsx-as-prop": "off" },
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
