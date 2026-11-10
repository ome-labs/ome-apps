import { defineConfig } from "@playwright/test";

// The smoke test launches the built app; it runs locally (`pnpm test:smoke`), not in CI.
export default defineConfig({
  testDir: "tests",
  testMatch: "*.smoke.ts",
  timeout: 30_000,
  reporter: "list",
});
