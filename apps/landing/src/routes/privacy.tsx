import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, type LegalSection } from "../legal/legal-page.tsx";
import { pageHead } from "../seo/head.ts";
import { links } from "../site/links.ts";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("/privacy"),
  component: Privacy,
});

const sections: readonly LegalSection[] = [
  {
    id: "website",
    title: "What this website counts",
    body: (
      <>
        <p>
          To learn which pages help and which links people follow, the site counts visits with
          PostHog, an analytics service. It counts:
        </p>
        <ul>
          <li>which pages are opened, from which site or campaign link, and for how long;</li>
          <li>which parts of a page scroll into view;</li>
          <li>
            which of the site’s own controls are used: the app tour’s tabs, the privacy view, the
            resharing and payment steps, a question in the FAQ, the menu, and copying the install
            line;
          </li>
          <li>which links to GitHub, X or the Aztec forum are clicked;</li>
          <li>how fast pages load, and errors in the site’s own code;</li>
          <li>a rough screen size (phone, tablet or desktop), the browser and operating system.</li>
        </ul>
        <p>
          Every value comes from a fixed list. Nothing you type or select is sent, and nothing about
          a vault is: the site never sees one.
        </p>
      </>
    ),
  },
  {
    id: "anonymous",
    title: "How it stays anonymous",
    body: (
      <ul>
        <li>
          <strong>No cookies, no local storage.</strong> The site stores nothing in your browser to
          recognise you later.
        </li>
        <li>
          <strong>No profiles.</strong> Visits aren’t joined into a history of one person. To count
          unique visitors in a day, PostHog uses a hash that changes every day and can’t be turned
          back into who you are.
        </li>
        <li>
          <strong>No IP addresses kept.</strong> They’re discarded before anything is stored, so
          there is no location either.
        </li>
        <li>
          <strong>Through our own address.</strong> Your browser sends the counts to{" "}
          <code>t.envoy1084.xyz</code>, which passes them to PostHog’s servers in the United States.
          It doesn’t talk to PostHog directly.
        </li>
        <li>
          <strong>Never on preview sites.</strong> Only ome.network counts anything.
        </li>
      </ul>
    ),
  },
  {
    id: "opt-out",
    title: "Not being counted",
    body: (
      <>
        <p>
          Turn on <strong>Global Privacy Control</strong> or <strong>Do Not Track</strong> in your
          browser and the analytics never loads. Ad and tracker blockers work too. The site works
          the same either way.
        </p>
      </>
    ),
  },
  {
    id: "software",
    title: "The Ome software",
    body: (
      <>
        <p>
          Ome itself, the command line, the daemon and the keeper, runs on your devices and reports
          nothing to us. Your signing key stays on your device, your share of a vault’s viewing key
          stays with your keeper, and we never receive a key, a share, a balance or a payment.
        </p>
        <p>
          When Ome launches on Aztec testnet we will run one relay, which keepers on different
          networks use to reach each other. Like any server it will see the network address of
          whoever connects, their peer ids, and the size and timing of the encrypted messages it
          forwards and keeps in sealed mailboxes. It can’t read them. You can run your own relay
          instead.
        </p>
        <p>
          If the desktop or phone app ever offers usage statistics, they will be off until you turn
          them on, will never include anything about a vault, and this page will list them first.
        </p>
      </>
    ),
  },
  {
    id: "others",
    title: "Others involved",
    body: (
      <ul>
        <li>
          <strong>Vercel</strong> hosts this website. Like any web host it handles your requests,
          including your IP address, to deliver the pages.
        </li>
        <li>
          <strong>PostHog</strong> stores the anonymous counts described above.
        </li>
        <li>
          Links to <strong>GitHub</strong>, <strong>X</strong> and the <strong>Aztec forum</strong>{" "}
          take you to their sites, under their own privacy policies.
        </li>
      </ul>
    ),
  },
  {
    id: "never",
    title: "What we don’t do",
    body: (
      <p>
        No accounts, no sign-up forms, no email lists, no advertising, no fingerprinting, no session
        recordings, and we don’t sell or share data with anyone for their own use.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes and questions",
    body: (
      <p>
        When this changes, the date at the top changes with it. Questions go to{" "}
        <a href={links.github} rel="noreferrer">
          Ome Labs on GitHub
        </a>{" "}
        or{" "}
        <a href={links.x} rel="noreferrer">
          {links.xHandle}
        </a>
        .
      </p>
    ),
  },
];

/** What the website counts and how it stays anonymous, and what the software never sends. */
function Privacy() {
  return (
    <LegalPage
      hour="1:00 pm"
      label="Privacy"
      title="Privacy"
      updated="13 November 2026"
      summary={
        <p>
          Ome is built so that nobody, including us, can see what’s in a vault. This website holds
          itself to the same idea: it counts visits without cookies and without knowing who you are,
          and the Ome software reports nothing to us at all.
        </p>
      }
      sections={sections}
    />
  );
}
