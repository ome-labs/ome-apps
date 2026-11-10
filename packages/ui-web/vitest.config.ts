import react from "@vitejs/plugin-react";
import defineConfig from "klarity/vitest/react";

export default defineConfig({
  plugins: [react()],
  test: { setupFiles: ["./vitest.setup.ts"] },
});
