import { defineConfig } from "vitest/config";

// Fast unit tests only; the Electron smoke test (`*.smoke.ts`) runs through Playwright.
export default defineConfig({
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
