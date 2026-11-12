import { links } from "../site/links.ts";
import {
  canonicalUrl,
  pageFor,
  shareImage,
  siteKeywords,
  siteName,
  siteUrl,
  titleSeparator,
  type PagePath,
} from "./pages.ts";
import { breadcrumbs, webPage } from "./structured-data.ts";

// What each route puts in <head>: the title, the description, keywords, the canonical URL, the share card and the
// page's structured data. TanStack Start dedupes meta by name and property, so a page's tags replace the root's.

type Meta = Record<string, string>;
type HeadLink = { rel: string; href: string };
type HeadScript = { type: string; children: string };

export function pageHead(path: PagePath, structuredData: readonly object[] = []) {
  const page = pageFor(path);
  const title = path === "/" ? page.title : `${page.title}${titleSeparator}${siteName}`;
  const url = canonicalUrl(path);
  const image = `${siteUrl}${shareImage.path}`;

  const meta: Meta[] = [
    { title },
    { name: "description", content: page.description },
    { name: "keywords", content: [...siteKeywords, ...page.keywords].join(", ") },
    // Let search show the large share image and full snippets.
    { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: title },
    { property: "og:description", content: page.description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: String(shareImage.width) },
    { property: "og:image:height", content: String(shareImage.height) },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:alt", content: shareImage.alt },
    { property: "og:locale", content: "en_US" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: links.xHandle },
    { name: "twitter:creator", content: links.xHandle },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: page.description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: shareImage.alt },
  ];
  const headLinks: HeadLink[] = [{ rel: "canonical", href: url }];
  const pageData = path === "/" ? [webPage(path)] : [webPage(path), breadcrumbs(path)];
  const scripts: HeadScript[] = [...pageData, ...structuredData].map((data) => ({
    type: "application/ld+json",
    children: JSON.stringify(data),
  }));

  return { meta, links: headLinks, scripts };
}
