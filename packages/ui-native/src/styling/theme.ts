import { Uniwind, useUniwind } from "uniwind";

export type ThemePreference = "light" | "dark" | "system";

/** Switches every Uniwind class to the light or dark palette, or back to following the system. */
export function setTheme(preference: ThemePreference): void {
  Uniwind.setTheme(preference);
}

/** The theme in effect, for the few things that aren't classes (the status bar, Sonner). */
export function useResolvedTheme(): "light" | "dark" {
  const { theme } = useUniwind();

  return theme === "dark" ? "dark" : "light";
}
