import { createFileRoute } from "@tanstack/react-router";

import { Chapter } from "../about/chapter.tsx";
import { PillLink } from "../actions/pill-link.tsx";
import { Closing } from "../layout/closing.tsx";
import { HeadBlock } from "../layout/head-block.tsx";
import { PageHero } from "../layout/page-hero.tsx";
import { Section } from "../layout/section.tsx";
import { pageHead } from "../seo/head.ts";
import { links } from "../site/links.ts";

export const Route = createFileRoute("/about")({
  head: () => pageHead("/about"),
  component: About,
});

const road = [
  [
    "Now",
    "Building in the open",
    "The desktop app, the command line, keepers and relays, with the code on GitHub.",
  ],
  [
    "Launch",
    "Aztec testnet",
    "The desktop app and CLI for Mac and Linux, with a keeper for every member.",
  ],
  ["After", "Phone app", "Approvals from your phone, and reads while members are offline."],
  ["Then", "Audit, then mainnet", "An external audit first. Mainnet only after it."],
] as const;

/** Why a lake, what the name means, and where Ome is going. */
function About() {
  return (
    <>
      <PageHero
        hour="6:40 am"
        label="About"
        scene="alliance"
        title={
          <>
            Why <em>a lake.</em>
          </>
        }
        sub="Tenochtitlan was built on a lake and ruled by an alliance. Ome works the same way."
      />

      <Chapter
        id="water-title"
        hour="9:15 am"
        label="I. Built on water"
        title="Built on water."
        body="The Mexica built Tenochtitlan on islands in Lake Texcoco, linked by causeways and farmed on chinampas. Much of what held the city up was below the surface."
        art="chinampas"
        alt="Pixel art of chinampas: narrow farmed islands between canals on a bright lake."
      />
      <Chapter
        id="together-title"
        hour="1:30 pm"
        label="II. Ruled together"
        title="Ruled together."
        body="From 1428 the Triple Alliance of Tenochtitlan, Texcoco and Tlacopan shared power. No single city acted alone."
        art="causeway"
        alt="Pixel art of a causeway crossing the lake towards the city."
        flip
      />
      <Chapter
        id="two-title"
        hour="6:20 pm"
        label="III. Ome means two"
        title="Ōme means two."
        body="Said oh-meh. In Nahuatl, ōme is “two”. The mark is a sun above the horizon and its reflection below: what members see, and what stays private."
        art="ome-two"
        alt="Pixel art of the sun above the horizon and its reflection in the water below."
      />

      <Section
        hour="8:30 pm"
        labelledBy="road-title"
        className="flex flex-col items-center gap-6 py-[72px] md:gap-10 md:pt-[110px] md:pb-[120px]"
      >
        <HeadBlock
          id="road-title"
          hour="8:30 pm"
          label="Where it’s going"
          title="Slow, careful, in the open."
        />
        <div className="w-full">
          <ol className="glass mx-auto w-full max-w-[1200px] rounded-[26px] px-5 py-2 md:px-9">
            {road.map(([when, what, detail]) => (
              <li
                key={when}
                className="flex flex-col gap-1.5 border-t border-white/12 py-[22px] first:border-t-0 md:flex-row md:items-baseline md:gap-10"
              >
                <span className="font-mono text-[13px] font-medium text-amber md:w-40 md:shrink-0">
                  {when}
                </span>
                <span className="text-lg font-semibold md:w-[300px] md:shrink-0 md:text-xl">
                  {what}
                </span>
                <span className="text-[15px] leading-[1.5] text-white/92 md:text-base">
                  {detail}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section
        hour="11:45 pm"
        labelledBy="thanks-title"
        className="flex flex-col items-center gap-5 pt-[72px] pb-24 md:gap-7 md:pt-[100px] md:pb-[150px]"
      >
        <HeadBlock
          id="thanks-title"
          hour="11:45 pm"
          label="Thanks"
          title="Standing on good research."
          sub="Wonderland’s research on a multisig for Aztec mapped the problem: spending is easy to share, reading isn’t. Ome builds the threshold-sharing option and adds resharing."
        />
        <PillLink to={links.research} kind="ghost">
          Read “On an Aztec multisig”
        </PillLink>
      </Section>

      <Closing
        hour="5:41 am"
        label="First light"
        scene="starting"
        title="Found a vault together."
      />
    </>
  );
}
