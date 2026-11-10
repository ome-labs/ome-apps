import { join } from "node:path";

import { app, BrowserWindow } from "electron";

/** The main window, sandboxed and isolated, its only access to Node being the preload's bridge. */
export function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    show: false,
    title: "Ome",
    webPreferences: {
      preload: join(import.meta.dirname, "../preload/index.cjs"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      spellcheck: false,
    },
  });
  window.once("ready-to-show", () => window.show());

  const dev = process.env["ELECTRON_RENDERER_URL"];
  if (!app.isPackaged && dev) void window.loadURL(dev);
  else void window.loadURL("app://ome/index.html");
  return window;
}
