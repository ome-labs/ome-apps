import defineConfig from "klarity/vitest/react";

export default defineConfig({ test: { setupFiles: ["./vitest.setup.ts"] } });
