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
      OME_DESKTOP_SOURCE: "fixtures",
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

  const mod = process.platform === "darwin" ? "Meta" : "Control";
  await page.keyboard.press(`${mod}+k`);
  await page.getByRole("combobox").fill("activity");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name: "Activity" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.getByRole("button", { name: /Alice/ }).click();
  await page.getByRole("menuitem", { name: "Unlock…" }).click();
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

test("sets up a profile from the first run, with Touch ID", async () => {
  const app = await electron.launch({
    args: [join(import.meta.dirname, "..")],
    env: {
      ...process.env,
      OME_DESKTOP_SOURCE: "fixtures",
      OME_DESKTOP_SCENARIO: "no-profile",
      OME_DESKTOP_USER_DATA: mkdtempSync(join(tmpdir(), "ome-desktop-smoke-")),
    },
  });
  const page = await app.firstWindow();

  await page.getByRole("button", { name: "Set up Ome" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Enter your name.")).toBeVisible();
  await page.getByLabel("Your name").fill("Alice");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Passphrase", { exact: true }).fill("correct horse");
  await page.getByLabel("Passphrase again").fill("correct horses");
  await page.getByRole("button", { name: "Create profile" }).click();
  await expect(page.getByText("This doesn't match.")).toBeVisible();
  await page.getByLabel("Passphrase again").fill("correct horse");
  await page.getByRole("button", { name: "Create profile" }).click();

  // The fixtures offer Touch ID everywhere and simulate the fingerprint.
  await expect(page.getByRole("heading", { name: "Unlock with Touch ID" })).toBeVisible();
  await page.getByRole("button", { name: "Use Touch ID" }).click();
  await expect(page.getByRole("button", { name: /Alice/ })).toBeVisible();

  await page.getByRole("button", { name: /Alice/ }).click();
  await page.getByRole("menuitem", { name: "Unlock…" }).click();
  await page.getByRole("button", { name: /Touch ID/ }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByRole("button", { name: /Alice/ }).click();
  await expect(page.getByRole("menuitem", { name: "Lock now" })).toBeVisible();
  await app.close();
});

test("changes settings", async () => {
  const app = await electron.launch({
    args: [join(import.meta.dirname, "..")],
    env: {
      ...process.env,
      OME_DESKTOP_SOURCE: "fixtures",
      OME_DESKTOP_USER_DATA: mkdtempSync(join(tmpdir(), "ome-desktop-smoke-")),
    },
  });
  const page = await app.firstWindow();
  await expect(page.getByRole("button", { name: /Alice/ })).toBeVisible();

  // ⌘, opens the first settings page.
  await page.keyboard.press(`${process.platform === "darwin" ? "Meta" : "Control"}+,`);
  await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();

  const settings = page.getByRole("navigation", { name: "Settings" });
  await settings.getByRole("link", { name: "Signer" }).click();
  await page.getByRole("combobox", { name: "Longest unlock" }).click();
  await page.getByRole("option", { name: "4 hours", exact: true }).click();
  await expect(page.getByText("Unlocking now lasts up to 4 hours")).toBeVisible();

  // Relays are read as the daemon starts, so adding one offers a restart.
  await settings.getByRole("link", { name: "Relays" }).click();
  await page
    .getByLabel("Multiaddr")
    .fill("/dns4/relay.example/udp/4001/quic-v1/p2p/12D3KooWEKh8XXYWo");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText(/take effect when Ome's daemon restarts/)).toBeVisible();
  await app.close();
});

test("goes back to the profiles from setting up another member", async () => {
  const app = await electron.launch({
    args: [join(import.meta.dirname, "..")],
    env: {
      ...process.env,
      OME_DESKTOP_SOURCE: "fixtures",
      OME_DESKTOP_USER_DATA: mkdtempSync(join(tmpdir(), "ome-desktop-smoke-")),
    },
  });
  const page = await app.firstWindow();
  await expect(page.getByRole("button", { name: /Alice/ })).toBeVisible();
  await page.keyboard.press(`${process.platform === "darwin" ? "Meta" : "Control"}+,`);
  await page.getByRole("button", { name: "Switch" }).click();
  await page.getByRole("button", { name: "Set up another member" }).click();

  // Past the profile step, the setup has started a daemon; going back leaves it.
  await page.getByRole("button", { name: "Set up Ome" }).click();
  await page.getByLabel("Your name").fill("Bob");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Back to profiles" }).click();
  await expect(page.getByRole("heading", { name: "Who's using Ome?" })).toBeVisible();
  await page.getByRole("button", { name: /Alice/ }).click();
  await expect(page.getByRole("link", { name: "Overview" })).toBeVisible();
  await app.close();
});

test("starts a member without a vault on Home", async () => {
  const app = await electron.launch({
    args: [join(import.meta.dirname, "..")],
    env: {
      ...process.env,
      OME_DESKTOP_SOURCE: "fixtures",
      OME_DESKTOP_SCENARIO: "no-vaults",
      OME_DESKTOP_USER_DATA: mkdtempSync(join(tmpdir(), "ome-desktop-smoke-")),
    },
  });
  const page = await app.firstWindow();
  await expect(page.getByRole("heading", { name: "Welcome, Alice" })).toBeVisible();
  await expect(page.getByText("No vaults yet")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create vault" })).toBeVisible();
  await app.close();
});

test("creates a vault: lobby, start and founding", async () => {
  const app = await electron.launch({
    args: [join(import.meta.dirname, "..")],
    env: {
      ...process.env,
      OME_DESKTOP_SOURCE: "fixtures",
      OME_DESKTOP_SCENARIO: "no-vaults",
      OME_DESKTOP_USER_DATA: mkdtempSync(join(tmpdir(), "ome-desktop-smoke-")),
    },
  });
  const page = await app.firstWindow();
  await page.getByRole("button", { name: "Create vault" }).click();
  await page.getByRole("button", { name: "Open lobby" }).click();
  await expect(page.getByText("Name the vault.")).toBeVisible();
  await page.getByLabel("Vault name").fill("Treasury");
  await page.getByRole("button", { name: "Open lobby" }).click();

  // The sample co-founders join on their own; Start waits for them.
  await expect(page.getByText("Carol")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByRole("heading", { name: "Founding Treasury" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Treasury is ready" })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByRole("button", { name: "Open Treasury" })).toBeVisible();
  await app.close();
});
