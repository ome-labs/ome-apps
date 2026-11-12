// The site's pages, their search titles and descriptions. vite.config.ts reads this list for prerendering and the
// sitemap, and each route reads its own entry for its <head>, so a page can't be missing from one of them.

export const siteUrl = "https://ome.network";
export const siteName = "Ome";
/** Between a page's title and the site's name in the tab: "Product | Ome". */
export const titleSeparator = " | ";

/** Terms every page is about; each page adds its own. */
export const siteKeywords = [
  "Ome",
  "private multisig",
  "Aztec",
  "Aztec network",
  "multisig wallet",
  "threshold signatures",
  "privacy",
  "zero-knowledge",
];

export type PagePath = "/" | "/product" | "/how-it-works" | "/security" | "/about" | "/install";

export type Page = {
  path: PagePath;
  /** The tab title, without the site name (the root adds it). */
  title: string;
  description: string;
  /** The sitemap's hint to crawlers, from 0 to 1. */
  priority: number;
  /** The share image's alt text; every page shares one image for now. */
  label: string;
  /** What the page is about, beyond the site's own terms. */
  keywords: readonly string[];
};

export const pages: readonly Page[] = [
  {
    path: "/",
    title: "Ome | The private multisig for Aztec",
    description:
      "Ome is a private multisig for Aztec. Your team approves payments together, and only enough members together can read the balance. Coming to Aztec testnet.",
    priority: 1,
    label: "Home",
    keywords: [
      "Aztec multisig",
      "private treasury",
      "shared vault",
      "team wallet",
      "threshold decryption",
      "DAO treasury privacy",
    ],
  },
  {
    path: "/product",
    title: "Product",
    description:
      "The Ome desktop app, the command line, and the keepers and relays underneath: propose, check on your own device, approve, and change members without moving funds.",
    priority: 0.9,
    label: "Product",
    keywords: [
      "desktop app",
      "command line",
      "keeper",
      "relay",
      "payment approvals",
      "membership changes",
      "Aztec apps",
    ],
  },
  {
    path: "/how-it-works",
    title: "How it works",
    description:
      "How Alice, Bob and Charlie found a private vault on Aztec, pay from it, read its balance with their keepers and change who is in it, step by step.",
    priority: 0.8,
    label: "How it works",
    keywords: [
      "distributed key generation",
      "threshold ECDH",
      "key resharing",
      "viewing key",
      "proposals",
      "private payments",
    ],
  },
  {
    path: "/security",
    title: "Security",
    description:
      "Ome's security model: signing keys sealed on each device, a viewing key that is never assembled, what the network sees, the risks we name, recovery and status.",
    priority: 0.8,
    label: "Security",
    keywords: [
      "security model",
      "threat model",
      "viewing key shares",
      "signing keys",
      "recovery",
      "audit",
    ],
  },
  {
    path: "/about",
    title: "About",
    description:
      "Why Ome is named for the Nahuatl word for two, why a lake, and where the private multisig for Aztec is going next.",
    priority: 0.6,
    label: "About",
    keywords: ["Ome Labs", "Nahuatl", "Lake Texcoco", "roadmap", "open source"],
  },
  {
    path: "/install",
    title: "Install",
    description:
      "Install Ome: the desktop app for your team, the command line for your terminal, and a keeper for a server that stays awake. Coming to Aztec testnet.",
    priority: 0.9,
    label: "Install",
    keywords: ["install Ome", "Mac", "Linux", "Aztec testnet", "keeper server"],
  },
];

export function pageFor(path: PagePath): Page {
  const page = pages.find((entry) => entry.path === path);
  if (!page) throw new Error(`No page entry for ${path}`);

  return page;
}

/** The one share image every page uses for now. */
export const shareImage = {
  path: "/og.png",
  width: 1200,
  height: 630,
  alt: "Ome: a pixel-art dawn over Lake Texcoco, with the wordmark",
} as const;

export function canonicalUrl(path: PagePath): string {
  return path === "/" ? `${siteUrl}/` : `${siteUrl}${path}`;
}
