import { createFileRoute } from "@tanstack/react-router";

import { FlowPlayer } from "../flows/flow-player.tsx";
import { flows } from "../flows/flows.ts";
import { Closing } from "../heroes/closing.tsx";
import { PageHero } from "../heroes/page-hero.tsx";
import { HeadBlock } from "../layout/head-block.tsx";
import { Reveal } from "../layout/reveal.tsx";
import { Section } from "../layout/section.tsx";
import { pageHead } from "../site/head.ts";

export const Route = createFileRoute("/how-it-works")({
  head: () => pageHead("/how-it-works"),
  component: HowItWorks,
});

/** Noon to night: one vault founded, paid from, read and changed, each as four steps that play. */
function HowItWorks() {
  return (
    <>
      <PageHero
        hour="11:02 am"
        label="How it works"
        scene="chinampas"
        title="How Ome works."
        sub="Alice, Bob and Charlie share a vault called Treasury. Here is how they found it, pay from it, read it and change who’s in it."
      />

      {flows.map((flow) => (
        <Section
          key={flow.key}
          hour={flow.hour}
          labelledBy={`${flow.key}-title`}
          className="flex flex-col items-center gap-6 pt-[72px] pb-20 md:gap-11 md:pt-[110px] md:pb-[130px]"
        >
          <HeadBlock
            id={`${flow.key}-title`}
            hour={flow.hour}
            label={flow.label}
            title={flow.title}
            sub={flow.sub}
          />
          <Reveal delay={120} className="w-full">
            <FlowPlayer flow={flow} />
          </Reveal>
        </Section>
      ))}

      <Closing hour="9:20 pm" label="Night" scene="hero-night" title="Found one with your team." />
    </>
  );
}
