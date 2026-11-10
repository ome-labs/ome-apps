import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const here = dirname(fileURLToPath(import.meta.url));

// The brand package exports its raw files (`@ome-labs/brand/assets/*`), but `import.meta.glob` needs a path or an
// alias, so the kit names that exported folder once here and globs the logo and app icon files through it.
const brandAssets = dirname(
  fileURLToPath(import.meta.resolve("@ome-labs/brand/assets/catalog.json")),
);

// The overview lists the packages the kit shows, with their versions. Workspace packages don't export their
// package.json, so the build reads them from the kit's own node_modules links.
const workspacePackages = ["tokens", "brand", "icons", "format", "ui-web"].map((name) => {
  const manifest = JSON.parse(
    readFileSync(join(here, "node_modules/@ome-labs", name, "package.json"), "utf8"),
  ) as { name: string; version: string; description: string };

  return { name: manifest.name, version: manifest.version, description: manifest.description };
});

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { "import.meta.env.KIT_PACKAGES": JSON.stringify(workspacePackages) },
  resolve: { alias: { "@brand-assets": brandAssets } },
});
