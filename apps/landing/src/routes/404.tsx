import { createFileRoute } from "@tanstack/react-router";

import { siteName, titleSeparator } from "../seo/pages.ts";
import { NotFound } from "../site/not-found.tsx";

// Prerendered to /404.html, which static hosts serve for any path they don't have. Client-side misses render the
// same page through the router's notFoundComponent.
export const Route = createFileRoute("/404")({
  head: () => ({
    meta: [
      { title: `Not found${titleSeparator}${siteName}` },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: NotFound,
});
