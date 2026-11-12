import { createFileRoute } from "@tanstack/react-router";

import { Icon } from "@ome-labs/icons/web";

import { PillLink } from "../actions/pill-link.tsx";
import { AppTour } from "../home/app-tour.tsx";
import { FaqList } from "../home/faq-list.tsx";
import { faq } from "../home/faq.ts";
import { HomeHero } from "../home/home-hero.tsx";
import { Closing } from "../layout/closing.tsx";
import { HeadBlock } from "../layout/head-block.tsx";
import { LanternGlow, SceneBackdrop, nightLanterns } from "../layout/scene-backdrop.tsx";
import { Section } from "../layout/section.tsx";
import { pageHead } from "../seo/head.ts";
import { application, faqPage } from "../seo/structured-data.ts";
import { PaymentSteps } from "../vault/payment-steps.tsx";
import { Questions } from "../vault/questions.tsx";
import { Reshare } from "../vault/reshare.tsx";
import { Seen } from "../vault/seen.tsx";

export const Route = createFileRoute("/")({
  head: () => pageHead("/", [application, faqPage(faq)]),
  component: Home,
});

const membership = [
  "No funds move, no new address",
  "A removed member’s share stops working",
  "Approved like any payment",
];

const watch = [
  ["7 days", "sealed mailboxes at relays"],
  ["every minute", "keepers sync"],
  ["nothing else", "relays see ciphertext and peer ids"],
] as const;

/** One day on the lake, dawn to first light: what Ome is, hour by hour. */
function Home() {
  return (
    <>
      <HomeHero />

      <Section
        hour="9:04 am"
        labelledBy="app-title"
        className="flex flex-col items-center gap-8 py-24 md:gap-14 md:py-[140px]"
      >
        <HeadBlock
          id="app-title"
          hour="9:04 am"
          label="The app"
          title="Everything happens below the surface."
          sub="A calm desktop app for a shared vault. Your machine does the private work: proving, signing and talking to your team’s keepers."
        />
        <AppTour />
      </Section>

      <Section
        hour="12:10 pm"
        labelledBy="questions-title"
        className="flex flex-col items-center gap-6 pt-20 pb-22 md:gap-14 md:pt-[100px] md:pb-[140px]"
      >
        <HeadBlock
          id="questions-title"
          hour="12:10 pm"
          label="Two questions"
          title={
            <>
              A multisig answers one question. <em>Ome answers two.</em>
            </>
          }
        />
        <Questions />
      </Section>

      <Section
        hour="2:31 pm"
        labelledBy="payment-title"
        className="flex flex-col items-center gap-7 pt-20 pb-22 md:gap-14 md:pt-[100px] md:pb-[140px]"
      >
        <HeadBlock
          id="payment-title"
          hour="2:31 pm"
          label="A payment"
          title="Enough of you approve. Nobody else learns who."
          sub="Propose, check on your own device, approve, prove. The chain sees a valid proof and nothing else."
        />
        <PaymentSteps />
      </Section>

      <Section
        hour="5:02 pm"
        labelledBy="members-title"
        className="pt-20 pb-24 md:pt-[100px] md:pb-40"
      >
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 lg:flex-row lg:justify-between lg:gap-16">
          <div className="flex flex-col gap-7 lg:w-[500px]">
            <HeadBlock
              id="members-title"
              hour="5:02 pm"
              label="Membership"
              align="start"
              size="m"
              title="Members change. The vault stays."
              sub="When someone leaves, the members who stay re-split the same viewing key among themselves. The address never changes and funds never move. The contract checks the new committee on chain."
            />
            <ul className="flex flex-col gap-2.5">
              {membership.map((line) => (
                <li key={line} className="sky-text flex items-center gap-2.5 text-base">
                  <Icon name="check" size={16} className="text-ok" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full lg:w-[600px]">
            <Reshare />
          </div>
        </div>
      </Section>

      <Section
        hour="8:40 pm"
        scene="hero-night"
        labelledBy="night-title"
        className="flex min-h-[calc(200*var(--k)+110px)] flex-col items-center gap-5 pt-[110px] md:min-h-[calc(200*var(--k)+180px)] md:gap-8 md:pt-[150px]"
      >
        <HeadBlock
          id="night-title"
          hour="8:40 pm"
          label="Night watch"
          title="The day ends. Your keepers keep watch."
          sub="Teams are rarely online together. Proposals and votes wait in sealed mailboxes at relays, and every member’s keeper syncs every minute."
        />
        <ul className="flex flex-wrap justify-center gap-2 md:gap-3">
          {watch.map(([value, what]) => (
            <li
              key={value}
              className="glass-soft flex gap-2 rounded-full px-4 py-2 font-mono text-[13px]"
            >
              <span className="text-amber">{value}</span>
              <span className="text-white/92">{what}</span>
            </li>
          ))}
        </ul>
        <SceneBackdrop id="hero-night">
          {nightLanterns.map(([x, y], index) => (
            <LanternGlow key={x} x={x} y={y} delay={index * 700} />
          ))}
        </SceneBackdrop>
      </Section>

      <Section
        hour="11:40 pm"
        moon
        labelledBy="privacy-title"
        className="flex flex-col items-center gap-6 pt-[110px] pb-22 md:gap-12 md:pt-[150px] md:pb-[140px]"
      >
        <HeadBlock
          id="privacy-title"
          hour="11:40 pm"
          label="Privacy"
          title={
            <>
              What the network sees, <em>and what it never does.</em>
            </>
          }
          sub="Flip the view. Members, thresholds, balances and proposals stay encrypted. The chain sees proofs and random-looking hashes."
        />
        <div className="w-full">
          <Seen />
        </div>
      </Section>

      <Section hour="3:20 am" labelledBy="faq-title" className="pt-20 pb-24 md:pt-[120px] md:pb-40">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 lg:flex-row lg:justify-between lg:gap-16">
          <div className="flex flex-col items-start gap-7 lg:w-[380px]">
            <HeadBlock
              id="faq-title"
              hour="3:20 am"
              label="Questions"
              align="start"
              size="m"
              title="Questions people ask."
              sub="Short answers here. The long ones arrive with the launch."
            />
            <div className="max-lg:hidden">
              <PillLink to="/how-it-works">Read how it works</PillLink>
            </div>
          </div>
          <div className="w-full lg:w-[760px]">
            <FaqList />
          </div>
        </div>
      </Section>

      <Closing
        hour="5:41 am"
        label="First light"
        scene="starting"
        title={
          <>
            Your team’s treasury, <em>finally private.</em>
          </>
        }
        sub="Ome is coming to Aztec testnet. Follow along to hear when it lands."
      />
    </>
  );
}
