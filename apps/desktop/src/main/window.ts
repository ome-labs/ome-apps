import { join } from "node:path";

import { app, BrowserWindow, screen, type Rectangle } from "electron";

import { saveWindowBounds, windowBounds } from "./preferences.ts";

/** The saved bounds, if they still fall on a connected display (a monitor may have been unplugged since). */
function restoredBounds(): Partial<Rectangle> {
  const saved = windowBounds();
  if (!saved) return {};

  const visible = screen.getAllDisplays().some(({ workArea }) => {
    const overlapX =
      Math.min(saved.x + saved.width, workArea.x + workArea.width) - Math.max(saved.x, workArea.x);
    const overlapY =
      Math.min(saved.y + saved.height, workArea.y + workArea.height) -
      Math.max(saved.y, workArea.y);
    return overlapX > 100 && overlapY > 100;
  });
  return visible ? saved : { width: saved.width, height: saved.height };
}

/** The main window, sandboxed and isolated, its only access to Node being the preload's bridge. */
export function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    ...restoredBounds(),
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
  window.on("close", () => {
    if (!window.isMinimized() && !window.isFullScreen()) saveWindowBounds(window.getNormalBounds());
  });

  const dev = process.env["ELECTRON_RENDERER_URL"];
  if (!app.isPackaged && dev) void window.loadURL(dev);
  else void window.loadURL("app://ome/index.html");
  return window;
}
