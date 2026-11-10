// Launches the built app on fixtures and checks it opens on the Treasury overview with no errors.
import { join } from "node:path";

import { _electron as electron, expect, test } from "@playwright/test";

test("opens on the default vault's overview", async () => {
  const app = await electron.launch({
    args: [join(import.meta.dirname, "..")],
    env: { ...process.env, OME_DESKTOP_SCENARIO: "normal" },
  });
  const errors: string[] = [];
  const page = await app.firstWindow();
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Treasury/ })).toBeVisible();
  await expect(page.getByText("Local network · block 1,210")).toBeVisible();

  // The renderer reaches Node only through the bridge.
  expect(await page.evaluate(() => typeof (globalThis as { require?: unknown }).require)).toBe(
    "undefined",
  );
  expect(
    await page.evaluate(() => typeof (globalThis as { ome?: { call?: unknown } }).ome?.call),
  ).toBe("function");

  await page.screenshot({ path: join(import.meta.dirname, "..", "out", "smoke.png") });
  expect(errors).toEqual([]);
  await app.close();
});
