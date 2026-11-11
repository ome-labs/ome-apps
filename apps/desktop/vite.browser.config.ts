import { resolve } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The renderer in a plain browser on the fixtures (`src/browser/`), for reviewing screens without Electron or a
// daemon. The app itself builds with `electron.vite.config.ts`.
export default defineConfig({
  root: resolve(import.meta.dirname, "src"),
  plugins: [react(), tailwindcss()],
  server: { port: 5199, open: "/browser/index.html" },
});
