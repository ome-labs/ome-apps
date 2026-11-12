import { describe, expect, it } from "vitest";

import { canonicalUrl, pageHead } from "./head.ts";
import { pages } from "./pages.ts";

// Every route file the site has, so a page can't be added without a search entry (or the reverse).
const routeFiles = Object.keys(import.meta.glob("../routes/*.tsx"))
  .map((file) => file.replace("../routes/", "").replace(".tsx", ""))
  .filter((name) => !name.startsWith("__") && name !== "404" && !name.endsWith(".test"));

describe("pages", () => {
  it("has one search entry per route", () => {
    const paths = routeFiles.map((name) => (name === "index" ? "/" : `/${name}`)).toSorted();
    expect(pages.map((page) => page.path).toSorted()).toEqual(paths);
  });

  it.each(pages.map((page) => [page.path, page] as const))(
    "%s has a unique title and a search-sized description",
    (_, page) => {
      expect(page.description.length).toBeGreaterThanOrEqual(70);
      expect(page.description.length).toBeLessThanOrEqual(170);
      expect(pages.filter((other) => other.title === page.title)).toHaveLength(1);
    },
  );
});

describe("pageHead", () => {
  it("gives every page a canonical URL, a description and a share card", () => {
    for (const page of pages) {
      const head = pageHead(page.path);
      const content = (key: string) =>
        head.meta.find((tag) => tag.name === key || tag.property === key)?.content;

      expect(head.links).toEqual([{ rel: "canonical", href: canonicalUrl(page.path) }]);
      expect(content("description")).toBe(page.description);
      expect(content("og:url")).toBe(canonicalUrl(page.path));
      expect(content("og:image")).toBe("https://ome.network/og.png");
      expect(content("twitter:card")).toBe("summary_large_image");
    }
  });

  it("names the site in every title but the home page's own", () => {
    expect(pageHead("/").meta[0]).toEqual({ title: "Ome · The private multisig for Aztec" });
    expect(pageHead("/security").meta[0]).toEqual({ title: "Security · Ome" });
  });

  it("writes structured data as JSON-LD", () => {
    const head = pageHead("/", [{ "@type": "Thing" }]);
    expect(head.scripts).toEqual([{ type: "application/ld+json", children: '{"@type":"Thing"}' }]);
  });
});
