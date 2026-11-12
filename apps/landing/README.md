# Ome website

[ome.network](https://ome.network): what Ome is, how it works, its security model, the story behind the name, and how
to install it. Built with TanStack Start, React, Tailwind and the kit's packages (`@ome-labs/ui-web`, `brand`, `icons`,
`tokens`), from the Figma website pages (63–69).

Every page is one day on Lake Texcoco, from dawn at the top to first light at the bottom: each section shows an hour,
and a dithered pixel sky behind the page moves through the day as you scroll.

## Run it

```sh
pnpm --filter @ome-labs/landing dev        # http://localhost:3002, with hot reload
pnpm --filter @ome-labs/landing build      # prerenders every page into dist/client
pnpm --filter @ome-labs/landing preview    # serves the build
pnpm --filter @ome-labs/landing test
```

`dist/client` is the whole site: static HTML for each page (with `404.html`), the scripts, styles and images,
`sitemap.xml`, `robots.txt` and the icons. Any static host serves it; there is no server.

## How it's built

- **Pages** are file routes in `src/routes`. Each one sets its `<head>` from `src/site/pages.ts` (title, description,
  canonical URL, share card) through `pageHead`, and `vite.config.ts` reads the same list to prerender the pages and
  write the sitemap, so a page can't be missing from either. A test checks every route has an entry.
- **Search**: JSON-LD for the organisation and the site on every page, the app on Home, Product and Install, and the
  questions on Home (`src/site/structured-data.ts`). The share image is `public/og.png`.
- **The sky** (`src/sky`) is a port of the Figma generator: the hour palette, value-noise clouds, Bayer 8 × 8
  dithering and the scenes pasted in with a dithered fade. A fixed canvas at the art's logical size (320 px across a
  desktop page) repaints only the rows in view as the page scrolls. Sections declare their hour with `data-hour`
  (`layout/section.tsx`); before the canvas runs, or without script, each section shows its hour as a flat colour and
  its scene as a plain image.
- **Motion** follows Figma's motion page: content rises into view, the app tour advances every 6 s, resharing and the
  flows loop while on screen, lanterns breathe and clouds drift. All of it stops for `prefers-reduced-motion`, and
  the loops stop where a reader chooses a step.
- **Scenes** come from `@ome-labs/brand`'s files, named one by one in `src/art/art-files.ts` so the page script
  carries only the scenes the site shows.

## App screens

`src/screens/*.webp` are the desktop app in the light theme, on its sample data, at 1280 × 800 (1x and 2x). Retake them
when the app's screens change:

1. `pnpm --filter @ome-labs/desktop browser` and open http://localhost:5199/browser/index.html (scenario `normal`).
2. At a 1280 × 800 window and 2x, capture the vault overview, a collecting proposal, Members and the keeper audit log,
   with the scenario switcher hidden.
3. Save each as `<name>@2x.webp` and a 1280-wide `<name>@1x.webp` (quality around 82).
