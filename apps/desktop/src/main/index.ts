// Ome desktop: the main process.
import { join } from "node:path";

import { app, BrowserWindow } from "electron";

import { CHANNELS } from "../bridge/contract.ts";
import { registerIpc } from "./ipc.ts";
import { registerScheme, serveRenderer } from "./protocol.ts";
import { denyPermissions, enforceSecurity } from "./security.ts";
import { forwardEvents } from "./sources.ts";
import { createWindow } from "./window.ts";

// Tests run beside the member's own copy with their own data folder, which also gives them their own lock.
const testData = process.env["OME_DESKTOP_USER_DATA"];
if (testData) app.setPath("userData", testData);

// One instance per data folder: a second launch focuses the first window.
if (!app.requestSingleInstanceLock()) app.quit();

registerScheme();
enforceSecurity();

function open(): void {
  const window = createWindow();
  const stop = forwardEvents((event) => window.webContents.send(CHANNELS.event, event));
  window.on("closed", stop);
}

app.on("second-instance", () => {
  const [window] = BrowserWindow.getAllWindows();
  if (window?.isMinimized()) window.restore();
  window?.focus();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// An event, not `await app.whenReady()`: Electron fires "ready" only after this ES module has finished loading.
app.on("ready", () => {
  denyPermissions();
  serveRenderer(join(import.meta.dirname, "../renderer"));
  registerIpc();
  open();
});

// macOS keeps the app running without windows; the dock icon reopens one.
app.on("activate", () => {
  if (app.isReady() && BrowserWindow.getAllWindows().length === 0) open();
});
