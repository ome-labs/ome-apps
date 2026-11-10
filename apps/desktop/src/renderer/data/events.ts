import type { QueryClient } from "@tanstack/react-query";

import { isStale } from "./invalidation.ts";

/** Refetches what each daemon event makes stale; returns the function that stops listening. */
export function followDaemonEvents(queries: QueryClient): () => void {
  return window.ome.onEvent((event) => {
    void queries.invalidateQueries({ predicate: (query) => isStale(event, query.queryKey) });
  });
}
