import { resolve } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";

// Every dependency is bundled (`externalizeDeps: false`), so the packaged app ships no node_modules. The preload is a
// single CommonJS file: sandboxed preloads cannot load ES modules or other files.
export default defineConfig({
  main: {
    build: {
      externalizeDeps: false,
      rollupOptions: { input: resolve(import.meta.dirname, "src/main/index.ts") },
    },
  },
  preload: {
    build: {
      externalizeDeps: false,
      isolatedEntries: true,
      rollupOptions: {
        input: resolve(import.meta.dirname, "src/preload/index.ts"),
        output: { format: "cjs", entryFileNames: "[name].cjs" },
      },
    },
  },
  renderer: {
    root: resolve(import.meta.dirname, "src/renderer"),
    plugins: [react(), tailwindcss()],
    build: {
      minify: true,
      rollupOptions: { input: resolve(import.meta.dirname, "src/renderer/index.html") },
    },
  },
});
