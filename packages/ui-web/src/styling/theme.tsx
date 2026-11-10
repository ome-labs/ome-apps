import { createContext, use, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "system";

type ThemeContext = {
  preference: ThemePreference;
  /** The theme in effect after resolving `system`. */
  resolved: "light" | "dark";
  setPreference: (preference: ThemePreference) => void;
};

const Context = createContext<ThemeContext | null>(null);
const darkQuery = "(prefers-color-scheme: dark)";

type ThemeProviderProps = {
  children: ReactNode;
  /** Where the app keeps the member's choice; the provider only reads it once. */
  initial?: ThemePreference | undefined;
  onChange?: (preference: ThemePreference) => void | undefined;
};

/**
 * Sets `data-theme` on the document so the token CSS switches palettes. With `system` the attribute is
 * removed and the stylesheet follows `prefers-color-scheme` on its own, so there is no flash before React runs.
 */
export function ThemeProvider({ children, initial = "system", onChange }: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState(initial);
  const [systemDark, setSystemDark] = useState(
    () => globalThis.matchMedia?.(darkQuery).matches ?? false,
  );

  useEffect(() => {
    const media = globalThis.matchMedia?.(darkQuery);
    if (!media) return;

    const update = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (preference === "system") root.removeAttribute("data-theme");
    else root.dataset.theme = preference;
  }, [preference]);

  const value = useMemo<ThemeContext>(
    () => ({
      preference,
      resolved: preference === "system" ? (systemDark ? "dark" : "light") : preference,
      setPreference: (next) => {
        setPreferenceState(next);
        onChange?.(next);
      },
    }),
    [preference, systemDark, onChange],
  );

  return <Context value={value}>{children}</Context>;
}

export function useTheme(): ThemeContext {
  const context = use(Context);
  if (!context) throw new Error("useTheme needs a ThemeProvider above it.");

  return context;
}
