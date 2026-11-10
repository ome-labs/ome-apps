// What the app remembers between launches, in one JSON file in the user-data folder. A missing or unreadable file
// means the defaults: nothing here is worth failing a launch over.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { app, type Rectangle } from "electron";

import type { Preferences } from "../bridge/contract.ts";

type Stored = Preferences & { window?: Rectangle | undefined };

const DEFAULTS: Stored = { theme: "system" };
const THEMES = new Set(["light", "dark", "system"]);

const file = () => join(app.getPath("userData"), "preferences.json");

function read(): Stored {
  try {
    const stored = JSON.parse(readFileSync(file(), "utf8")) as Partial<Stored>;
    return {
      theme: THEMES.has(stored.theme ?? "") ? (stored.theme as Stored["theme"]) : DEFAULTS.theme,
      window: stored.window,
    };
  } catch {
    return DEFAULTS;
  }
}

function write(next: Stored): Stored {
  writeFileSync(file(), JSON.stringify(next, null, 2));
  return next;
}

export function preferences(): Preferences {
  return { theme: read().theme };
}

/** Changes what the renderer may change; anything else in the patch is ignored. */
export function setPreferences(patch: Partial<Preferences>): Preferences {
  const current = read();
  const theme = patch.theme !== undefined && THEMES.has(patch.theme) ? patch.theme : current.theme;
  write({ ...current, theme });
  return { theme };
}

export function windowBounds(): Rectangle | undefined {
  return read().window;
}

export function saveWindowBounds(bounds: Rectangle): void {
  write({ ...read(), window: bounds });
}
