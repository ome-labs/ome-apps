import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";

import { Toaster } from "@ome-labs/ui-web";

import { followDaemonEvents } from "./data/events.ts";
import { router } from "./router.tsx";
import { AppTheme } from "./theme/app-theme.tsx";

// The daemon's events say when data changed, so queries don't refetch on focus or on a timer.
const queries = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: Number.POSITIVE_INFINITY, retry: false },
  },
});
followDaemonEvents(queries);

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root");

// The theme is read before the first paint, so the window doesn't flash light before turning dark.
const { theme } = await window.ome.preferences.get();

createRoot(root).render(
  <StrictMode>
    <AppTheme initial={theme}>
      <QueryClientProvider client={queries}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </AppTheme>
  </StrictMode>,
);
