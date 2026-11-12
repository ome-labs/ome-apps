import type { ReactNode } from "react";

import { HourChip } from "../layout/hour-chip.tsx";
import { Reveal } from "../layout/reveal.tsx";
import { SceneBackdrop } from "../layout/scene-backdrop.tsx";
import { Section } from "../layout/section.tsx";
import type { SkySceneId } from "../sky/scene-edges.ts";

type PageHeroProps = {
  hour: string;
  label: string;
  scene: SkySceneId;
  /** The page's one <h1>; wrap the second phrase in <em> for the italic half. */
  title: ReactNode;
  sub: ReactNode;
  /** Calls to action under the text. */
  actions?: ReactNode;
};

/** The top of every page but home: its hour, its title and a scene at its foot. */
export function PageHero({ hour, label, scene, title, sub, actions }: PageHeroProps) {
  return (
    <Section
      hour={hour}
      scene={scene}
      labelledBy="page-title"
      className="flex min-h-[calc(200*var(--k))] flex-col items-center pt-[120px] md:min-h-[max(calc(200*var(--k)+180px),100svh)] md:pt-[180px]"
    >
      <span
        aria-hidden
        className="scrim pointer-events-none absolute top-0 [--scrim:0.58] left-1/2 -z-[5] h-[560px] w-[min(1300px,160vw)] -translate-x-1/2 md:top-10 md:h-[640px]"
      />
      <div className="flex flex-col items-center gap-5 text-center md:gap-[26px]">
        <Reveal>
          <HourChip hour={hour} label={label} />
        </Reveal>
        <Reveal delay={80}>
          <h1
            id="page-title"
            className="sky-text max-w-[1100px] font-display text-[56px] leading-[0.94] tracking-[-0.01em] text-balance md:text-[clamp(72px,7.8vw,112px)] [&_em]:text-brand-sun"
          >
            {title}
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="sky-text max-w-[720px] text-[17px] leading-[1.45] text-pretty text-white/95 md:text-[21px]">
            {sub}
          </p>
        </Reveal>
        {actions ? (
          <Reveal delay={240} className="flex max-w-full flex-col items-center gap-3 md:flex-row">
            {actions}
          </Reveal>
        ) : null}
      </div>
      <SceneBackdrop id={scene} />
    </Section>
  );
}
