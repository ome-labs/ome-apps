import type { ReactNode } from "react";

import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";

import displayFont from "@ome-labs/brand/fonts/instrument-serif/InstrumentSerif-Regular.woff2?url";

import { organization, website } from "../seo/structured-data.ts";
import { LakeClock } from "../site/clock.tsx";
import { Footer } from "../site/footer.tsx";
import { Nav } from "../site/nav.tsx";
import { NotFound } from "../site/not-found.tsx";
import { SkyCanvas } from "../sky/sky-canvas.tsx";

import styles from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      // A page's own title replaces this; it's what a path with no page (served 404.html) keeps.
      { title: "Not found | Ome" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1a2a66" },
      { name: "color-scheme", content: "dark" },
      { name: "application-name", content: "Ome" },
      { name: "apple-mobile-web-app-title", content: "Ome" },
      { name: "author", content: "Ome Labs" },
      { name: "publisher", content: "Ome Labs" },
      { name: "format-detection", content: "telephone=no" },
    ],
    links: [
      { rel: "stylesheet", href: styles },
      // The display serif sets every heading, the largest text in the first view: fetch it with the CSS.
      {
        rel: "preload",
        href: displayFont,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      // Served at fixed root paths by vite.config.ts, from the brand's web icons.
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(organization) },
      { type: "application/ld+json", children: JSON.stringify(website) },
    ],
  }),
  shellComponent: Document,
  component: Layout,
  notFoundComponent: NotFound,
});

function Document({ children }: { children: ReactNode }) {
  return (
    // The light token theme for the app panels the site draws (the phone, Aztec app cards); the sky is its own.
    <html lang="en" data-theme="light">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Layout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-night focus:translate-y-0"
      >
        Skip to content
      </a>
      <SkyCanvas page={pathname} />
      <Nav />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <LakeClock key={pathname} />
    </>
  );
}
