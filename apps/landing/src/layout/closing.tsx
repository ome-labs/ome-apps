import type { ReactNode } from "react";

import { PillLink } from "../actions/pill-link.tsx";
import { SocialLinks } from "../actions/social-links.tsx";
import type { SkySceneId } from "../sky/scene-edges.ts";
import { HourChip } from "./hour-chip.tsx";
import { SceneBackdrop } from "./scene-backdrop.tsx";
import { Section } from "./section.tsx";

type ClosingProps = {
  hour: string;
  label: string;
  scene: SkySceneId;
  /** The last line; wrap its second phrase in <em> for the sunlit half. */
  title: ReactNode;
  sub?: string;
};

/** The last hour of a page: one line, then where to read on or follow along, over a scene. */
export function Closing({ hour, label, scene, title, sub }: ClosingProps) {
  return (
    <Section
      hour={hour}
      scene={scene}
      labelledBy="closing-title"
      className="flex min-h-[calc(200*var(--k))] flex-col items-center pt-[140px] md:min-h-[calc(200*var(--k)+220px)] md:pt-[220px]"
    >
      <span
        aria-hidden
        className="scrim pointer-events-none absolute top-0 [--scrim:0.5] left-1/2 -z-[5] h-[560px] w-[min(1300px,160vw)] -translate-x-1/2 md:top-10"
      />
      <div className="flex flex-col items-center gap-5 text-center md:gap-6">
        <HourChip hour={hour} label={label} />
        <h2
          id="closing-title"
          className="sky-text max-w-[1100px] font-display [&_em]:sun-text text-[56px] leading-[0.95] text-balance md:text-[clamp(72px,8.4vw,120px)]"
        >
          {title}
        </h2>
        {sub ? <p className="sky-text text-base text-white/95 md:text-xl">{sub}</p> : null}
        <div className="flex flex-col items-center gap-2.5 md:flex-row">
          <PillLink to="/how-it-works">How it works</PillLink>
          <SocialLinks />
        </div>
      </div>
      <SceneBackdrop id={scene} />
    </Section>
  );
}
