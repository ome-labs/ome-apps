import type { ThemePreference } from "@ome-labs/ui-web";

const key = "ome-kit:theme";
const choices = new Set<string>(["light", "dark", "system"]);

// Storage can be missing or throw (private windows, blocked site data); the kit then follows the system.
export function storedTheme(): ThemePreference {
  try {
    const value = localStorage.getItem(key);
    return value && choices.has(value) ? (value as ThemePreference) : "system";
  } catch {
    return "system";
  }
}

export function storeTheme(preference: ThemePreference) {
  try {
    localStorage.setItem(key, preference);
  } catch {
    // Not remembered across visits; the choice still applies now.
  }
}
