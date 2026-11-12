import type { ReactNode } from "react";

import type { SkySceneId } from "../sky/scene-edges.ts";
import { HourChip } from "./hour-chip.tsx";
import { SceneBackdrop } from "./scene-backdrop.tsx";
import { Section } from "./section.tsx";

type PageHeroProps = {
  hour: string;
  label: string;
  scene: SkySceneId;
  /** The page's one <h1>; wrap the second phrase in <em> for the italic half. */
  title: ReactNode;
  sub: ReactNode;
  /** Calls to action under the text. */
  actions?: ReactNode;
  /** Dim the whole hero, sky and scene, for a scene too bright to read white type over. */
  dim?: boolean;
};

/** The top of every page but home: its hour, its title and a scene at its foot. */
export function PageHero({ hour, label, scene, title, sub, actions, dim }: PageHeroProps) {
  return (
    <Section
      hour={hour}
      scene={scene}
      plainSky
      labelledBy="page-title"
      className="flex min-h-[calc(200*var(--k))] flex-col items-center pt-[120px] md:min-h-[max(calc(200*var(--k)+180px),100svh)] md:pt-[180px]"
    >
      {dim ? (
        // Even over the whole hero rather than pooled behind the words, and gone by its foot so the next section
        // meets an undimmed sky.
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-[5] bg-[linear-gradient(to_bottom,rgb(8_13_36/0.32)_80%,rgb(8_13_36/0))]"
        />
      ) : null}
      <div className="flex flex-col items-center gap-5 text-center md:gap-[26px]">
        <HourChip hour={hour} label={label} />
        <h1
          id="page-title"
          className="sky-text max-w-[1100px] font-display text-[56px] leading-[0.94] tracking-[-0.01em] text-balance md:text-[clamp(72px,7.8vw,112px)]"
        >
          {title}
        </h1>
        <p className="hero-text max-w-[720px] text-[17px] leading-[1.45] font-medium text-pretty text-white md:text-[21px]">
          {sub}
        </p>
        {actions ? (
          <div className="flex max-w-full flex-col items-center gap-3 md:flex-row">{actions}</div>
        ) : null}
      </div>
      <SceneBackdrop id={scene} />
    </Section>
  );
}
