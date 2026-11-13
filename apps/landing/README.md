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
```

`dist/client` is the whole site: static HTML for each page (with `404.html`), the scripts, styles and images,
`sitemap.xml`, `robots.txt` and the icons. Any static host serves it; there is no server.

## Deploy

Vercel, from this folder: set the project's **Root Directory** to `apps/landing` and leave the framework preset at
"Other"; `vercel.json` does the rest. It installs only this app and the packages it imports, with pnpm 12 (pinned,
since Vercel's own pnpm is older) and `--ignore-scripts`: the root's `lefthook install` fails without a git checkout,
and nothing the site builds needs an install script. It then builds them (`pnpm --filter "@ome-labs/landing..." run
build`) and
publishes `dist/client` with clean URLs, long-lived caching for the hashed `assets/` and security headers. Node 24
comes from `engines` in `package.json`. Vercel serves `404.html` for a path the site doesn't have.

`public/install.sh` is a copy of `ome`'s `scripts/install.sh`, served as plain text with a five-minute cache for
`curl -fsSL https://ome.network/install.sh | sh`. That repository owns it: when it changes there, copy it here again
(it must match the script attached to the release).

## Analytics

PostHog, anonymous and cookieless, through the managed proxy at `t.envoy1084.xyz` into the US project. It loads
on the production deployment only, never in dev or previews, and only when Vercel has `VITE_POSTHOG_TOKEN` (the
project's public token). No cookies or local storage, no person profiles, no IPs kept; Do Not Track and Global
Privacy Control turn it off. `/privacy` says the same to visitors, so change both together. The code is in
`src/analytics`; `events.ts` lists every event and its properties.

| Event                                                                                                                                   | Sent when                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `$pageview`, `$pageleave`                                                                                                               | every route change, and leaving a page                                   |
| `section_viewed` (`section`)                                                                                                            | a section crosses the middle of the screen, once per page view           |
| `outbound_clicked` (`target`, `placement`, `url`)                                                                                       | a link off the site: GitHub, the security advisories, X, the Aztec forum |
| `cta_clicked` (`label`, `placement`, `destination`)                                                                                     | one of the site's pill buttons                                           |
| `install_command_copied`                                                                                                                | the install line's copy button                                           |
| `app_tour_tab_selected`, `privacy_view_switched`, `reshare_stage_selected`, `payment_step_selected`, `faq_opened`, `flow_step_selected` | the page's demos                                                         |
| `menu_opened`, `not_found_viewed` (`path`)                                                                                              | the phone menu; a missing page                                           |
| `$web_vitals`, `$exception`                                                                                                             | page speed, and errors in the site's own code                            |

Every event carries `page_type`, `site_version` (the build's commit) and `viewport` (phone, tablet, desktop).
Visit any page with `?internal=1` to stop counting your own browser, and `?internal=0` to undo it.

### Campaign links

Tag every link to the site that we post, so reports can say where visitors came from. Lowercase snake_case, and only
these values; a new one goes in this table first. The site takes the tags out of the address bar once counted.

| Parameter      | Values                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `utm_source`   | `x`, `github`, `aztec_forum`, `discord`, `telegram`, `farcaster`, `hn`, `reddit`, `newsletter`, `cli`, `desktop`, `docs`, `partner_<name>` |
| `utm_medium`   | `social`, `community`, `readme`, `release`, `email`, `referral`, `in_product`, `talk`                                                      |
| `utm_campaign` | `testnet_launch`, `brand_reveal`, `audit_report`, `release_<version>`, `event_<name>`                                                      |
| `utm_content`  | the post or placement: `<post-slug>`, `bio`, `pinned`, `cta_top`, `cta_bottom`                                                             |

For example, the X bio links to `https://ome.network/?utm_source=x&utm_medium=social&utm_content=bio`, the README to
`?utm_source=github&utm_medium=readme`, and `ome --help` to `?utm_source=cli&utm_medium=in_product`.

## Where things are

```text
src/
  routes/        the pages, one file route each, composed from the folders below
  home/          what only Home shows: the hero, the app tour, the questions
  product/       how-it-works/   security/   about/       what only that page shows
  vault/         the vault explained, shared by pages: thresholds, a payment, resharing, what the network sees
  layout/        a page's frame: sections and their hours, headings, page heroes, the closing
  site/          what every page carries: the header, footer, clock, links, the 404
  seo/           the page list, each page's <head> and the structured data for search
  sky/           the dithered sky painted behind every page
  art/           the brand's scenes, avatars and objects the site uses
  app-preview/   the desktop app's screenshots and the phone app's mock-up
  actions/       buttons and links: the pill link, the install line, the social links
  motion/        the two hooks behind every loop: on screen, and step through
```

## How it's built

- **Pages** are file routes in `src/routes`. Each one sets its `<head>` from `src/seo/pages.ts` (title, description,
  canonical URL, share card) through `pageHead`, and `vite.config.ts` reads the same list to prerender the pages and
  write the sitemap, so a page can't be missing from either.
- **Search**: JSON-LD for the organisation and the site on every page, the app on Home, Product and Install, and the
  questions on Home (`src/seo/structured-data.ts`). The share image is `public/og.png`.
- **The sky** (`src/sky`) is a port of the Figma generator: the hour palette, value-noise clouds, Bayer 8 × 8
  dithering and the scenes pasted in with a dithered fade. A fixed canvas at the art's logical size (320 px across a
  desktop page) repaints only the rows in view as the page scrolls. Sections declare their hour with `data-hour`
  (`layout/section.tsx`); before the canvas runs, or without script, each section shows its hour as a flat colour and
  its scene as a plain image.
- **Motion** follows Figma's motion page, without anything moving as the page scrolls: the app tour's screen blurs
  between tabs, the payment's steps light up as you scroll through them, resharing and the flows loop while on
  screen, the privacy table's values hide under pixel blocks, lanterns breathe and clouds drift. All of it stops for
  `prefers-reduced-motion`, and the loops stop where a reader chooses a step.
- **Scenes** come from `@ome-labs/brand`'s files, named one by one in `src/art/art-files.ts` so the page script
  carries only the scenes the site shows.

## App screens

`src/app-preview/*.webp` are the desktop app in the light theme, on its sample data, at 1280 × 800 (1x and 2x). Retake them
when the app's screens change:

1. `pnpm --filter @ome-labs/desktop browser` and open http://localhost:5199/browser/index.html (scenario `normal`).
2. At a 1280 × 800 window and 2x, capture the vault overview, a collecting proposal, Members and the keeper audit log,
   with the scenario switcher hidden.
3. Save each as `<name>@2x.webp` and a 1280-wide `<name>@1x.webp` (quality around 82).
