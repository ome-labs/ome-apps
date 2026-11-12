import { createFileRoute } from "@tanstack/react-router";

import { NotFound } from "../site/not-found.tsx";
import { siteName } from "../site/pages.ts";

// Prerendered to /404.html, which static hosts serve for any path they don't have. Client-side misses render the
// same page through the router's notFoundComponent.
export const Route = createFileRoute("/404")({
  head: () => ({
    meta: [{ title: `Not found · ${siteName}` }, { name: "robots", content: "noindex" }],
  }),
  component: NotFound,
});
