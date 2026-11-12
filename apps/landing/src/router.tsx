import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./generated/route-tree.ts";
import { NotFound } from "./site/not-found.tsx";

export function getRouter() {
  return createRouter({
    routeTree,
    // Pages are prerendered and small, so following a hovered link early costs little.
    defaultPreload: "intent",
    scrollRestoration: true,
    // Moving between pages cross-fades through a blur (styles.css), where the browser supports view transitions.
    defaultViewTransition: true,
    defaultNotFoundComponent: NotFound,
  });
}
