import { pageFor, siteName, siteUrl, type PagePath } from "./pages.ts";

// What each route puts in <head>: the title, the description, the canonical URL and the share card. TanStack
// Start dedupes meta by name and property, so a page's tags replace the root's defaults.

export const shareImage = { path: "/og.png", width: 1200, height: 630 } as const;

type Meta = Record<string, string>;
type HeadLink = { rel: string; href: string };
type HeadScript = { type: string; children: string };

export function canonicalUrl(path: PagePath): string {
  return path === "/" ? `${siteUrl}/` : `${siteUrl}${path}`;
}

export function pageHead(path: PagePath, structuredData: readonly object[] = []) {
  const page = pageFor(path);
  const title = path === "/" ? page.title : `${page.title} · ${siteName}`;
  const url = canonicalUrl(path);
  const image = `${siteUrl}${shareImage.path}`;

  const meta: Meta[] = [
    { title },
    { name: "description", content: page.description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: title },
    { property: "og:description", content: page.description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: String(shareImage.width) },
    { property: "og:image:height", content: String(shareImage.height) },
    {
      property: "og:image:alt",
      content: "Ome: a pixel-art dawn over Lake Texcoco, with the wordmark",
    },
    { property: "og:locale", content: "en_US" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@ome_labs" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: page.description },
    { name: "twitter:image", content: image },
  ];
  const links: HeadLink[] = [{ rel: "canonical", href: url }];
  const scripts: HeadScript[] = structuredData.map((data) => ({
    type: "application/ld+json",
    children: JSON.stringify(data),
  }));

  return { meta, links, scripts };
}
