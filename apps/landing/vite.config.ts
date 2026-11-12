import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

import { pages, siteUrl } from "./src/site/pages.ts";

// Browsers, the web manifest and search engines ask for icons at fixed root paths (/favicon.ico, /icon-512.png),
// so the brand's web icons are served there instead of under hashed asset names, without copying them into the app.
const brandIcons = dirname(
  fileURLToPath(import.meta.resolve("@ome-labs/brand/assets/app-icon/web/favicon.svg")),
);
const rootIcons: Record<string, string> = {
  "favicon.ico": "favicon-32.png",
  "favicon.svg": "favicon.svg",
  "apple-touch-icon.png": "apple-touch-icon.png",
  "icon-192.png": "icon-192.png",
  "icon-512.png": "icon-512.png",
};

// The brand's web entry re-exports its whole catalog (every scene's URL, the manifest), built with `new URL()` at
// module level, which a bundler must assume has side effects. The site only takes the logo from it, so its modules
// are marked side-effect free here and the catalog drops out of the page script. (Scenes come from art/art-files.)
const brandSource = join(dirname(fileURLToPath(import.meta.resolve("@ome-labs/brand/web"))), "..");

function brandWithoutSideEffects(): Plugin {
  return {
    name: "ome:brand-tree-shaking",
    transform(code, id) {
      if (!id.startsWith(brandSource) || !/\.tsx?$/.test(id)) return;

      return { code, map: null, moduleSideEffects: false };
    },
  };
}

// The brand's folder of raw files, for globbing just the scenes the site uses (art/art-files.ts).
const brandAssets = dirname(
  fileURLToPath(import.meta.resolve("@ome-labs/brand/assets/catalog.json")),
);

function serveBrandIcons(): Plugin {
  return {
    name: "ome:brand-icons",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const file = rootIcons[(request.url ?? "").slice(1)];
        if (!file) return next();
        response.setHeader("Content-Type", file.endsWith(".svg") ? "image/svg+xml" : "image/png");
        response.end(readFileSync(join(brandIcons, file)));
      });
    },
    generateBundle() {
      if (this.environment.name !== "client") return;
      for (const [fileName, file] of Object.entries(rootIcons)) {
        this.emitFile({ type: "asset", fileName, source: readFileSync(join(brandIcons, file)) });
      }
    },
  };
}

export default defineConfig({
  plugins: [
    tanstackStart({
      srcDirectory: "src",
      // The route tree is generated on every build and dev start, so it lives in a gitignored folder.
      router: { generatedRouteTree: "./generated/route-tree.ts" },
      // Every page is prerendered to static HTML: the site has no server, and crawlers get the full text.
      pages: [
        ...pages.map((page) => ({
          path: page.path,
          sitemap: { priority: page.priority, changefreq: "weekly" as const },
        })),
        // Static hosts serve /404.html for a path they don't have.
        { path: "/404", sitemap: { exclude: true }, prerender: { outputPath: "/404.html" } },
      ],
      prerender: { enabled: true, crawlLinks: true, failOnError: true, autoSubfolderIndex: true },
      sitemap: { enabled: true, host: siteUrl, outputPath: "sitemap.xml" },
    }),
    react(),
    tailwindcss(),
    serveBrandIcons(),
    brandWithoutSideEffects(),
  ],
  resolve: { alias: { "@brand-assets": brandAssets } },
  build: {
    // Pixel art stays a file of its own even when it's tiny: inlined into the script, every page would carry it.
    assetsInlineLimit: (file) => (file.endsWith(".webp") ? false : undefined),
  },
});
