import react from "@vitejs/plugin-react";
import defineConfig from "klarity/vitest/react";

import viteConfig from "./vite.config.ts";

export default defineConfig({
  plugins: [react()],
  define: viteConfig.define ?? {},
  resolve: viteConfig.resolve ?? {},
  test: { setupFiles: ["./vitest.setup.ts"] },
});
