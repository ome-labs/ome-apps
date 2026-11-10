// Launches the built app on fixtures and checks it opens on the Treasury overview, that ⌘K and the unlock sheet work,
// and that nothing logs an error.
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { _electron as electron, expect, test } from "@playwright/test";

test("opens on the default vault's overview", async () => {
  const app = await electron.launch({
    args: [join(import.meta.dirname, "..")],
    env: {
      ...process.env,
      OME_DESKTOP_SCENARIO: "normal",
      OME_DESKTOP_USER_DATA: mkdtempSync(join(tmpdir(), "ome-desktop-smoke-")),
    },
  });
  const errors: string[] = [];
  const page = await app.firstWindow();
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await expect(page.getByRole("link", { name: "Overview" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("button", { name: /Treasury/ })).toBeVisible();
  await expect(page.getByText("Local network · block 1,210")).toBeVisible();

  const mod = process.platform === "darwin" ? "Meta" : "Control";
  await page.keyboard.press(`${mod}+k`);
  await page.getByRole("combobox").fill("activity");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name: "Activity" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page
    .getByRole("button", { name: /Unlock/ })
    .first()
    .click();
  await page.getByLabel("Passphrase").fill("wrong");
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("The passphrase doesn't unseal this profile's signer."),
  ).toBeVisible();
  await page.getByLabel("Passphrase").fill("correct horse");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeHidden();

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
