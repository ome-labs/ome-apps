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
