import type { ComponentType } from "react";

import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from "@tanstack/react-router";

import { ExamplesPage } from "./bench/examples-page.tsx";
import { exampleLoaders } from "./examples/catalog.ts";
import { AvatarsPage } from "./pages/avatars.tsx";
import { ColourPage } from "./pages/colour.tsx";
import { DepthPage } from "./pages/depth.tsx";
import { IconsPage } from "./pages/icons.tsx";
import { IllustrationsPage } from "./pages/illustrations.tsx";
import { LogoPage } from "./pages/logo.tsx";
import { MotionPage } from "./pages/motion.tsx";
import { NotFound } from "./pages/not-found.tsx";
import { OverviewPage } from "./pages/overview.tsx";
import { ScenesPage } from "./pages/scenes.tsx";
import { StateObjectsPage } from "./pages/state-objects.tsx";
import { TexturesObjectsPage } from "./pages/textures-objects.tsx";
import { TypographyPage } from "./pages/typography.tsx";
import { Shell } from "./shell/shell.tsx";
import { ThemedPage } from "./theme/theme-frame.tsx";

const root = createRootRoute({ component: Shell, notFoundComponent: NotFound });

/** A page that the header's Split view can draw in both themes. */
function themed(Page: ComponentType) {
  return function Themed() {
    return (
      <ThemedPage>
        <Page />
      </ThemedPage>
    );
  };
}

const pages: [string, ComponentType][] = [
  ["/", OverviewPage],
  ["/foundations/colour", ColourPage],
  ["/foundations/typography", TypographyPage],
  ["/foundations/depth", DepthPage],
  ["/foundations/motion", MotionPage],
  ["/brand/logo", LogoPage],
  ["/brand/icons", IconsPage],
  ["/brand/illustrations", IllustrationsPage],
  ["/brand/scenes", ScenesPage],
  ["/brand/avatars", AvatarsPage],
  ["/brand/state-objects", StateObjectsPage],
  ["/brand/textures-objects", TexturesObjectsPage],
];

const examplePages = Object.entries(exampleLoaders).map(([key, load]) =>
  createRoute({
    getParentRoute: () => root,
    path: `/components/${key}`,
    component: lazyRouteComponent(async () => {
      const set = await load();
      return { default: themed(() => <ExamplesPage set={set} />) };
    }),
  }),
);

const tree = root.addChildren([
  ...pages.map(([path, Page]) =>
    createRoute({ getParentRoute: () => root, path, component: themed(Page) }),
  ),
  ...examplePages,
]);

export const router = createRouter({ routeTree: tree, scrollRestoration: true });
