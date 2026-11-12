import { links } from "../site/links.ts";
import { canonicalUrl, pageFor, shareImage, siteName, siteUrl, type PagePath } from "./pages.ts";

// schema.org descriptions for search engines, as JSON-LD. Only facts that hold before launch: no prices, ratings,
// download URLs or release dates.

export const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "Ome Labs",
  url: siteUrl,
  logo: `${siteUrl}/icon-512.png`,
  description: "Ome Labs builds Ome, the private multisig for Aztec.",
  sameAs: [links.github, links.x],
};

export const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: siteName,
  alternateName: "ōme",
  url: `${siteUrl}/`,
  description: "The private multisig for Aztec.",
  publisher: { "@id": `${siteUrl}/#organization` },
  inLanguage: "en",
};

export const application = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${siteUrl}/#app`,
  name: siteName,
  description:
    "A private multisig for Aztec: members approve payments together, and only enough of them together can read the vault.",
  applicationCategory: "FinanceApplication",
  applicationSubCategory: "Multisig wallet",
  operatingSystem: "macOS, Linux",
  url: `${siteUrl}/install`,
  image: `${siteUrl}${shareImage.path}`,
  isAccessibleForFree: true,
  license: "https://www.apache.org/licenses/LICENSE-2.0",
  sameAs: [links.repo],
  publisher: { "@id": `${siteUrl}/#organization` },
};

export function faqPage(questions: readonly { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

/** The page itself, tied to the site and the share image. */
export function webPage(path: PagePath) {
  const page = pageFor(path);
  const url = canonicalUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    keywords: page.keywords.join(", "),
    inLanguage: "en",
    isPartOf: { "@id": `${siteUrl}/#website` },
    primaryImageOfPage: { "@type": "ImageObject", url: `${siteUrl}${shareImage.path}` },
  };
}

/** Home, then the page: the trail search shows under the result. */
export function breadcrumbs(path: PagePath) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: siteName, item: canonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: pageFor(path).label, item: canonicalUrl(path) },
    ],
  };
}
