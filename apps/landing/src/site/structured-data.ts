import { links } from "./links.ts";
import { siteName, siteUrl } from "./pages.ts";

// schema.org descriptions for search engines, as JSON-LD. Only facts that hold before launch: no prices, ratings,
// download URLs or release dates.

export const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "Ome Labs",
  url: siteUrl,
  logo: `${siteUrl}/icon-512.png`,
  sameAs: [links.github, links.x],
};

export const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: siteName,
  alternateName: "ōme",
  url: `${siteUrl}/`,
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
  operatingSystem: "macOS, Linux",
  url: `${siteUrl}/install`,
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
