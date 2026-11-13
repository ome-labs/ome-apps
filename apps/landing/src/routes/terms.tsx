import { createFileRoute, Link } from "@tanstack/react-router";

import { LegalPage, type LegalSection } from "../legal/legal-page.tsx";
import { pageHead } from "../seo/head.ts";
import { links } from "../site/links.ts";

export const Route = createFileRoute("/terms")({
  head: () => pageHead("/terms"),
  component: Terms,
});

const sections: readonly LegalSection[] = [
  {
    id: "what",
    title: "What these terms cover",
    body: (
      <p>
        These terms cover this website, ome.network, and the relay Ome Labs will run for Aztec
        testnet. The Ome software itself is open source under the{" "}
        <a href="https://www.apache.org/licenses/LICENSE-2.0" rel="noreferrer">
          Apache License 2.0
        </a>
        , and that licence, not these terms, governs how you may use, copy and change it. By using
        the site or the relay, you agree to these terms.
      </p>
    ),
  },
  {
    id: "testnet",
    title: "Testnet only, not audited",
    body: (
      <>
        <p>
          Ome runs on Aztec testnet and refuses mainnet. It hasn’t had an external audit yet, so it
          may have bugs that lose or lock funds. Use testnet funds only, and don’t keep anything in
          a vault you couldn’t afford to lose.
        </p>
        <p>
          The <Link to="/security">security page</Link> describes the design, the risks we know of,
          and what recovery can and can’t do.
        </p>
      </>
    ),
  },
  {
    id: "custody",
    title: "Your keys, your vault",
    body: (
      <>
        <p>
          Ome is self-custodial software. You and your fellow members hold every key; Ome Labs never
          holds your keys, your shares of a vault’s viewing key, or your funds, and has no way to
          move, freeze, recover or reverse anything in a vault.
        </p>
        <p>You are responsible for:</p>
        <ul>
          <li>keeping your devices, passphrases and keepers safe;</li>
          <li>
            choosing thresholds your team can live with: if too many members lose their keys or
            keepers, nobody can read or spend from the vault, and nobody can help;
          </li>
          <li>checking each payment on your own device before you approve it.</li>
        </ul>
      </>
    ),
  },
  {
    id: "use",
    title: "Using Ome lawfully",
    body: (
      <p>
        You agree not to use the site, the relay or the software for anything illegal where you or
        your counterparties are, including money laundering, sanctions evasion or financing harm,
        and not to attack, overload or interfere with the relay or the site. Privacy is the point of
        Ome; it doesn’t put you above the law that applies to you.
      </p>
    ),
  },
  {
    id: "relay",
    title: "The testnet relay",
    body: (
      <p>
        The relay isn’t running yet; it opens with the testnet launch. Once it does, it is offered
        as is, for free, for testing. It may be slow, go down, change or close at any time, without
        notice, and messages waiting in it may be lost. Run your own relay if you depend on one
        being there.
      </p>
    ),
  },
  {
    id: "advice",
    title: "No advice",
    body: (
      <p>
        Nothing on this site is financial, investment, legal or tax advice, and nothing here is an
        offer of any token or financial product. Ome is a tool for holding and approving payments
        together; what you do with it is your decision.
      </p>
    ),
  },
  {
    id: "content",
    title: "This website’s content",
    body: (
      <p>
        The text, illustrations and the Ome name and logo on this site belong to Ome Labs. You may
        link to and quote the site, but not use the name or logo in a way that suggests we endorse
        you or your product. Links to other sites are for convenience; we don’t control them.
      </p>
    ),
  },
  {
    id: "warranty",
    title: "No warranty, limited liability",
    body: (
      <>
        <p>
          The site, the relay and the software are provided “as is” and “as available”, without
          warranties of any kind, express or implied, including fitness for a particular purpose,
          security or uninterrupted operation.
        </p>
        <p>
          To the fullest extent the law allows, Ome Labs and its contributors are not liable for any
          loss of funds, keys, data or profits, or any indirect or consequential loss, arising from
          your use of the site, the relay or the software.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: (
      <p>
        We may update these terms as Ome changes, especially before any mainnet release; the date at
        the top shows when they last changed. How we handle data is on the{" "}
        <Link to="/privacy">privacy page</Link>. Questions go to{" "}
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

/** The terms for the website and the testnet relay; the software's own licence is Apache 2.0. */
function Terms() {
  return (
    <LegalPage
      hour="3:00 pm"
      label="Terms"
      title="Terms"
      updated="13 November 2026"
      summary={
        <p>
          The short version: Ome is free, open-source, self-custodial software in testing. You hold
          your keys, we can’t recover them, it isn’t audited yet, and you use it at your own risk.
        </p>
      }
      sections={sections}
    />
  );
}
