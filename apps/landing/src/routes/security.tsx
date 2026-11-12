import { createFileRoute } from "@tanstack/react-router";

import { PillLink } from "../actions/pill-link.tsx";
import { Closing } from "../layout/closing.tsx";
import { HeadBlock } from "../layout/head-block.tsx";
import { PageHero } from "../layout/page-hero.tsx";
import { CardRow, SceneCard } from "../layout/scene-card.tsx";
import { Section } from "../layout/section.tsx";
import { Risks } from "../security/risks.tsx";
import { pageHead } from "../seo/head.ts";
import { links } from "../site/links.ts";
import { Seen } from "../vault/seen.tsx";

export const Route = createFileRoute("/security")({
  head: () => pageHead("/security"),
  component: Security,
});

const keys = [
  {
    scene: "locked",
    tag: "to spend",
    title: "Signing keys",
    body: "Each member’s own key, sealed on their device with a passphrase. Enough of them must approve, and the proof checks it.",
  },
  {
    scene: "key-generation",
    tag: "to read",
    title: "The viewing key",
    body: "Split across members’ keepers and never assembled. Reading needs enough of them to answer, and each answer is logged.",
  },
  {
    scene: "vault-founded",
    tag: "to keep",
    title: "The vault",
    body: "Its address never changes. Members change by resharing the key, never by moving funds.",
  },
] as const;

const recovery = [
  {
    scene: "devices",
    title: "Lost a device",
    body: "Swap that member’s signer. The vault and the other members are untouched.",
  },
  {
    scene: "removed",
    title: "Lost a keeper",
    body: "The others remove the member while enough keepers still answer, then add them back.",
  },
  {
    scene: "starting",
    tag: "planned",
    title: "A recovery keeper",
    body: "A keeper that can help read but never sign. Planned, not built yet.",
  },
] as const;

/** One night, dusk to first light: the model, what leaks, the risks we name, recovery and status. */
function Security() {
  return (
    <>
      <PageHero
        hour="7:05 pm"
        label="Security"
        scene="hero-dusk"
        title={
          <>
            Private by <em>construction.</em>
          </>
        }
        sub="Approvals are checked inside the proof. Reading needs enough keepers. Nothing is ever backed up in one place."
      />

      <Section
        hour="8:10 pm"
        labelledBy="model-title"
        className="flex flex-col items-center gap-7 py-20 md:gap-[52px] md:pt-[120px] md:pb-[130px]"
      >
        <HeadBlock
          id="model-title"
          hour="8:10 pm"
          label="The model"
          title="Three keys, three jobs."
        />
        <CardRow columns={3}>
          {keys.map((card) => (
            <SceneCard key={card.title} {...card} />
          ))}
        </CardRow>
      </Section>

      <Section
        hour="9:30 pm"
        labelledBy="seen-title"
        className="flex flex-col items-center gap-6 pt-[72px] pb-20 md:gap-11 md:pt-[110px] md:pb-[130px]"
      >
        <HeadBlock
          id="seen-title"
          hour="9:30 pm"
          label="What leaks"
          title={
            <>
              What the network sees, <em>and what it never does.</em>
            </>
          }
          sub="Signers, thresholds and the committee are never written to public storage. Fees are paid by a fee-paying contract, never by the vault in public."
        />
        <div className="w-full">
          <Seen />
        </div>
      </Section>

      <Section
        hour="11:00 pm"
        labelledBy="risks-title"
        className="flex flex-col items-center gap-6 pt-[72px] pb-20 md:gap-11 md:pt-[110px] md:pb-[130px]"
      >
        <HeadBlock
          id="risks-title"
          hour="11:00 pm"
          label="Risks we name"
          title="The app tells you when a threshold is risky."
          sub="k is how many approvals it takes to spend, t how many keepers it takes to read, n how many members there are."
        />
        <Risks />
      </Section>

      <Section
        hour="1:30 am"
        labelledBy="recovery-title"
        className="flex flex-col items-center gap-6 pt-[72px] pb-20 md:gap-11 md:pt-[110px] md:pb-[130px]"
      >
        <HeadBlock
          id="recovery-title"
          hour="1:30 am"
          label="Recovery"
          title="No share backups. Two ways back."
        />
        <CardRow columns={3}>
          {recovery.map((card) => (
            <SceneCard key={card.title} {...card} />
          ))}
        </CardRow>
      </Section>

      <Section
        hour="3:40 am"
        labelledBy="status-title"
        className="flex flex-col items-center gap-6 pt-[72px] pb-24 md:gap-8 md:pt-[110px] md:pb-[150px]"
      >
        <HeadBlock
          id="status-title"
          hour="3:40 am"
          label="Status"
          title="Testnet first. Audit before mainnet."
          sub="Ome launches on Aztec testnet and stays off mainnet until an external audit is done. Found a security issue? Report it privately through GitHub’s security advisories, never in a public issue."
        />
        <PillLink to={links.advisories}>Report a vulnerability</PillLink>
      </Section>

      <Closing hour="5:41 am" label="First light" scene="starting" title="Read how it works." />
    </>
  );
}
