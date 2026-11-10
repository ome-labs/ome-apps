import { type ReactNode, useCallback } from "react";

import { ThemeProvider } from "@ome-labs/ui-web";

import type { Preferences } from "../../bridge/contract.ts";

/** The theme the member chose (system by default), remembered by the main process between launches. */
export function AppTheme({
  initial,
  children,
}: {
  initial: Preferences["theme"];
  children: ReactNode;
}) {
  const remember = useCallback(
    (theme: Preferences["theme"]) => void window.ome.preferences.set({ theme }),
    [],
  );
  return (
    <ThemeProvider initial={initial} onChange={remember}>
      {children}
    </ThemeProvider>
  );
}
