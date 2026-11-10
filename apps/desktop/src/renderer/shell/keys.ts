// The app's keyboard shortcuts. ⌘ on macOS stands for Ctrl on Linux and Windows, in matching and on keycaps.
import { useEffect } from "react";

const MAC = navigator.platform.startsWith("Mac");

/** The primary modifier as a keycap: ⌘ or Ctrl. */
export const MOD = MAC ? "⌘" : "Ctrl";

export interface Shortcut {
  /** `KeyboardEvent.key`, lower case for letters. */
  key: string;
  /** Needs the primary modifier. Plain keys don't fire while typing in a field. */
  mod: boolean;
  label: string;
  run: () => void;
}

/** The keycaps a shortcut shows: `["⌘", "K"]`, `["?"]`. */
export function keycaps(shortcut: Pick<Shortcut, "key" | "mod">): string[] {
  const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  return shortcut.mod ? [MOD, key] : [key];
}

function typing(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/** Runs the first shortcut a key press matches, anywhere in the window. */
export function useShortcuts(shortcuts: readonly Shortcut[]): void {
  useEffect(() => {
    const press = (event: KeyboardEvent): void => {
      const mod = MAC ? event.metaKey : event.ctrlKey;
      if (event.altKey || (MAC ? event.ctrlKey : event.metaKey)) return;

      const match = shortcuts.find(
        (shortcut) =>
          shortcut.key === event.key.toLowerCase() &&
          shortcut.mod === mod &&
          (shortcut.mod || !typing(event.target)),
      );
      if (!match) return;
      event.preventDefault();
      match.run();
    };
    window.addEventListener("keydown", press);
    return () => window.removeEventListener("keydown", press);
  }, [shortcuts]);
}
