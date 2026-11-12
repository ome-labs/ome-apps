import { createFileRoute } from "@tanstack/react-router";

import { Logo } from "@ome-labs/brand/web";
import { Icon } from "@ome-labs/icons/web";

import { InstallLine } from "../actions/install-line.tsx";
import { PillLink } from "../actions/pill-link.tsx";
import { AppScreen } from "../app-preview/app-screen.tsx";
import { Closing } from "../layout/closing.tsx";
import { HeadBlock } from "../layout/head-block.tsx";
import { PageHero } from "../layout/page-hero.tsx";
import { Section } from "../layout/section.tsx";
import { pageHead } from "../seo/head.ts";
import { application } from "../seo/structured-data.ts";
import { links } from "../site/links.ts";

export const Route = createFileRoute("/install")({
  head: () => pageHead("/install", [application]),
  component: Install,
});

/** Install, desktop app first: it's how most teams will use Ome. The command line and a keeper come with it. */
function Install() {
  return (
    <>
      <PageHero
        hour="5:58 am"
        label="Install"
        scene="welcome"
        title="Install Ome."
        sub="The desktop app is how most teams will use Ome. The command line and a keeper for your server come with it."
        actions={
          <>
            <PillLink to="#desktop-app-title">Get the desktop app</PillLink>
            <PillLink to="/how-it-works" kind="ghost">
              How it works
            </PillLink>
          </>
        }
      />

      <Section
        hour="7:20 am"
        labelledBy="app-section-title"
        className="flex flex-col items-center gap-7 pt-20 pb-[72px] md:gap-12 md:pt-[120px] md:pb-[100px]"
      >
        <HeadBlock
          id="app-section-title"
          hour="7:20 am"
          label="The app"
          title="Start with the desktop app."
        />
        <div className="w-full">
          <article
            aria-labelledby="desktop-app-title"
            className="glass mx-auto flex w-full max-w-[1200px] flex-col gap-6 rounded-[30px] p-5 md:p-10 lg:flex-row lg:items-center lg:gap-12"
          >
            <div className="flex flex-col gap-[18px] lg:w-[440px] lg:shrink-0">
              <div className="flex items-center gap-4">
                <span className="grid size-16 shrink-0 place-items-center rounded-[22%] bg-[linear-gradient(180deg,#5b7fe0,#15224a)] shadow-[0_10px_30px_rgb(5_8_20/0.4)] md:size-[84px]">
                  <Logo variant="mark" tone="dark" title="" className="h-[62%] w-auto" />
                </span>
                <span className="flex flex-col gap-1">
                  <h3
                    id="desktop-app-title"
                    className="scroll-mt-32 font-display text-[32px] leading-none md:text-[40px]"
                  >
                    Ome for Mac
                  </h3>
                </span>
              </div>
              <p className="text-[15px] leading-[1.55] text-white/95 md:text-[17px]">
                Found a vault with your team, approve payments, read the balance and change members,
                on one calm screen. Installs the daemon and your keeper too.
              </p>
              {/* No download until there is a build: the launch is on testnet, announced on X. */}
              <p className="inline-flex items-center gap-2.5 self-start rounded-full bg-amber/14 py-2 pr-4 pl-2.5 text-[15px] font-medium text-amber">
                <Icon name="clock" size={16} />
                Coming soon to Aztec testnet
              </p>
              <PillLink to={links.x} kind="ghost" className="self-start px-3.5 py-[7px] text-sm">
                Hear when it’s out: {links.xHandle}
              </PillLink>
            </div>
            <AppScreen
              id="overview"
              sizes="(min-width: 1024px) 632px, 100vw"
              className="lg:max-w-[632px]"
            />
          </article>
        </div>
      </Section>

      <Section
        hour="9:00 am"
        labelledBy="other-title"
        className="flex flex-col items-center gap-6 pt-[72px] pb-20 md:gap-10 md:pt-[100px] md:pb-[120px]"
      >
        <HeadBlock
          id="other-title"
          hour="9:00 am"
          label="Other ways"
          title="Terminal, or a server."
        />
        <div className="mx-auto grid w-full max-w-[1200px] gap-3.5 md:grid-cols-2 md:gap-6">
          <div className="h-full">
            <article className="glass flex h-full flex-col gap-3.5 rounded-[26px] p-[22px] md:p-8">
              <span className="font-mono text-xs text-amber">command line</span>
              <h3 className="text-[22px] font-semibold">Prefer a terminal?</h3>
              <p className="text-base leading-[1.5] text-white/92">
                One line installs ome, the daemon and your keeper on Mac or Linux.
              </p>
              <InstallLine className="mt-auto self-start" />
            </article>
          </div>
          <div className="h-full">
            <article className="glass flex h-full flex-col gap-3.5 rounded-[26px] p-[22px] md:p-8">
              <span className="font-mono text-xs text-amber">keeper</span>
              <h3 className="text-[22px] font-semibold">Keep your keeper awake.</h3>
              <p className="text-base leading-[1.5] text-white/92">
                Run your keeper on a home server or a small machine that stays on, so the vault can
                read even when your laptop sleeps.
              </p>
              <PillLink to="/product" kind="ghost" className="mt-auto self-start">
                What a keeper does
              </PillLink>
            </article>
          </div>
        </div>
      </Section>

      <Closing hour="12:30 pm" label="Midday" scene="hero-day" title="Then found a vault." />
    </>
  );
}
