// Ome desktop: the main process.
import { join } from "node:path";

import { app, BrowserWindow } from "electron";

import { CHANNELS } from "../shared/contract.ts";
import { registerIpc } from "./ipc.ts";
import { registerScheme, serveRenderer } from "./protocol.ts";
import { denyPermissions, enforceSecurity } from "./security.ts";
import { forwardEvents } from "./sources.ts";
import { createWindow } from "./window.ts";

// One instance per user: a second launch focuses the first window.
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
