import { createFileRoute } from "@tanstack/react-router";

import { Icon } from "@ome-labs/icons/web";

import { ComingSoon } from "../actions/coming-soon.tsx";
import { PillLink } from "../actions/pill-link.tsx";
import { PhoneApproval } from "../app-preview/phone-approval.tsx";
import { Closing } from "../layout/closing.tsx";
import { HeadBlock } from "../layout/head-block.tsx";
import { PageHero } from "../layout/page-hero.tsx";
import { CardRow, SceneCard } from "../layout/scene-card.tsx";
import { Section } from "../layout/section.tsx";
import { AppFlow } from "../product/app-flow.tsx";
import { FeatureRow, type Feature } from "../product/feature-row.tsx";
import { Terminal } from "../product/terminal.tsx";
import { pageHead } from "../seo/head.ts";
import { application } from "../seo/structured-data.ts";
import { links } from "../site/links.ts";

export const Route = createFileRoute("/product")({
  head: () => pageHead("/product", [application]),
  component: Product,
});

const parts = [
  {
    scene: "vault-founded",
    tag: "Ome",
    title: "The desktop app",
    body: "Where your team works: proposals, approvals, balances, members and vault health.",
  },
  {
    scene: "proving",
    tag: "omed",
    title: "Your daemon",
    body: "Runs on your machine. Holds the wallet and the sealed signer, and does the proving.",
  },
  {
    scene: "keeper",
    tag: "ome-keeper",
    title: "Your keeper",
    body: "Holds your share of the viewing key and answers read requests, with a log of each one.",
  },
  {
    scene: "relay",
    tag: "network",
    title: "Relays",
    body: "Pass encrypted traffic between keepers and keep sealed mailboxes for 7 days. They never see a key.",
  },
] as const;

const features: readonly Feature[] = [
  {
    hour: "11:20 am",
    label: "The app",
    title: "Know what needs you.",
    body: "One screen for a shared vault: what’s waiting for your approval, the balance, and whether the vault can still read.",
    screen: "overview",
    points: ["Needs you, first", "Balances read through the keepers", "Health you can see"],
  },
  {
    hour: "12:40 pm",
    label: "Review",
    title: "See exactly what you sign.",
    body: "Your own device rebuilds every proposal and runs the checks before you approve. No blind signing.",
    screen: "review",
    flip: true,
    points: [
      "What happens, in plain words",
      "Checks run on your machine",
      "The exact message you sign",
    ],
  },
  {
    hour: "2:05 pm",
    label: "Members",
    title: "Change members without moving funds.",
    body: "Add or remove people at any time. The key is reshared, the address stays, and the contract checks the new committee.",
    screen: "members",
    points: ["Every member’s keeper, at a glance", "Approved like any payment"],
  },
  {
    hour: "3:30 pm",
    label: "Keepers",
    title: "Every read, on the record.",
    body: "Each keeper keeps an audit log of the requests it answered, and you can read it in the app.",
    screen: "audit",
    flip: true,
  },
];

const phone = [
  "Proposals wait in a sealed mailbox",
  "Rebuilt and checked on the phone",
  "Face ID to approve",
];

/** What Ome is made of: the desktop app first, the command line beside it, the phone app next. */
function Product() {
  return (
    <>
      <PageHero
        hour="9:30 am"
        label="Product"
        scene="hero-day"
        dim
        title={
          <>
            The private multisig, <em>built to be used.</em>
          </>
        }
        sub="A calm desktop app for your team, a command line for the terminal, and keepers and relays doing the private work underneath."
        actions={
          <>
            <PillLink to={links.x}>Follow {links.xHandle} for launch</PillLink>
            <PillLink to="/how-it-works" kind="ghost">
              How it works
            </PillLink>
          </>
        }
      />

      <Section
        hour="10:40 am"
        labelledBy="parts-title"
        className="flex flex-col items-center gap-7 py-20 md:gap-14 md:pt-[120px] md:pb-[140px]"
      >
        <HeadBlock
          id="parts-title"
          hour="10:40 am"
          label="What runs where"
          title="Four parts. One job each."
          sub="Your signing key never leaves your device. Your share of the viewing key never leaves your keeper."
        />
        <CardRow columns={4}>
          {parts.map((part) => (
            <SceneCard key={part.title} {...part} />
          ))}
        </CardRow>
      </Section>

      {features.map((feature) => (
        <FeatureRow key={feature.screen} feature={feature} id={`feature-${feature.screen}`} />
      ))}

      <Section
        hour="4:40 pm"
        labelledBy="terminal-title"
        className="py-[72px] md:py-[110px] md:pb-[130px]"
      >
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="flex flex-col items-start gap-5 lg:w-[440px] lg:shrink-0">
            <HeadBlock
              id="terminal-title"
              hour="4:40 pm"
              label="Command line"
              align="start"
              size="m"
              title="Prefer a terminal? So does Ome."
              sub="Everything the app does, the CLI does too: found a vault, propose, approve and check its health. Same daemon underneath."
            />
            <ComingSoon />
          </div>
          <div className="w-full lg:max-w-[680px]">
            <Terminal />
          </div>
        </div>
      </Section>

      <Section
        hour="5:50 pm"
        labelledBy="phone-title"
        className="py-[72px] md:py-[110px] md:pb-[130px]"
      >
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-6 lg:w-[520px]">
            <HeadBlock
              id="phone-title"
              hour="5:50 pm"
              label="Coming soon"
              align="start"
              size="m"
              title="Approve from your phone."
              sub="Move your signing key to your phone and approve from anywhere. It never holds your share of the viewing key: phones are great at one signature, not at staying awake at 3 am."
            />
            <ul className="flex flex-col gap-2.5">
              {phone.map((line) => (
                <li key={line} className="sky-text flex items-center gap-2.5 text-base">
                  <Icon name="check" size={16} className="text-ok" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center lg:w-[520px]">
            <PhoneApproval />
          </div>
        </div>
      </Section>

      <Section
        hour="7:10 pm"
        labelledBy="apps-title"
        className="flex flex-col items-center gap-7 pt-[72px] pb-24 md:gap-[52px] md:pt-[110px] md:pb-[150px]"
      >
        <HeadBlock
          id="apps-title"
          hour="7:10 pm"
          label="Aztec apps"
          title="Apps can ask. Your team decides."
          sub="Any Aztec app can send the vault a transaction. It arrives as a proposal, and nothing moves until enough members approve."
        />
        <AppFlow />
      </Section>

      <Closing hour="9:20 pm" label="Night" scene="hero-night" title="Be there when it lands." />
    </>
  );
}
