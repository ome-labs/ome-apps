import react from "@vitejs/plugin-react";
import defineConfig from "klarity/vitest/react";

import viteConfig from "./vite.config.ts";

export default defineConfig({
  plugins: [react()],
  // The scenes' glob reads the brand folder through the app's alias; the Start plugin itself isn't needed here.
  resolve: viteConfig.resolve ?? {},
  test: { setupFiles: ["./vitest.setup.ts"] },
});
