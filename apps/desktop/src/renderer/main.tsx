import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";

import { followDaemonEvents } from "./data/events.ts";
import { router } from "./router.tsx";

// The daemon's events say when data changed, so queries don't refetch on focus or on a timer.
const queries = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: Number.POSITIVE_INFINITY, retry: false },
  },
});
followDaemonEvents(queries);

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queries}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
