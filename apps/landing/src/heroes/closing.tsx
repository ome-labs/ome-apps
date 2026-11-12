import { InstallLine } from "../actions/install-line.tsx";
import { PillLink } from "../actions/pill-link.tsx";
import { HourChip } from "../layout/hour-chip.tsx";
import { Reveal } from "../layout/reveal.tsx";
import { SceneBackdrop } from "../layout/scene-backdrop.tsx";
import { Section } from "../layout/section.tsx";
import { links } from "../site/links.ts";
import type { SkySceneId } from "../sky/scene-edges.ts";

type ClosingProps = {
  hour: string;
  label: string;
  scene: SkySceneId;
  title: string;
  sub?: string;
};

/** The last hour of a page: one line, the install, and where to go next, over a scene. */
export function Closing({ hour, label, scene, title, sub }: ClosingProps) {
  return (
    <Section
      hour={hour}
      scene={scene}
      labelledBy="closing-title"
      className="flex min-h-[calc(200*var(--k))] flex-col items-center pt-[110px] md:min-h-[calc(200*var(--k)+180px)] md:pt-[170px]"
    >
      <span
        aria-hidden
        className="scrim pointer-events-none absolute top-0 [--scrim:0.5] left-1/2 -z-[5] h-[560px] w-[min(1300px,160vw)] -translate-x-1/2 md:top-10"
      />
      <Reveal className="flex flex-col items-center gap-5 text-center md:gap-6">
        <HourChip hour={hour} label={label} />
        <h2
          id="closing-title"
          className="sky-text max-w-[1100px] font-display text-[56px] leading-[0.95] text-balance md:text-[clamp(72px,8.4vw,120px)]"
        >
          {title}
        </h2>
        {sub ? <p className="sky-text text-base text-white/95 md:text-xl">{sub}</p> : null}
        <InstallLine />
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-2.5">
          <PillLink to="/how-it-works" kind="ghost" className="px-3.5 py-[7px] text-sm">
            How it works
          </PillLink>
          <PillLink to={links.github} kind="ghost" className="px-3.5 py-[7px] text-sm">
            GitHub
          </PillLink>
          <PillLink to={links.x} kind="ghost" className="px-3.5 py-[7px] text-sm">
            Follow {links.xHandle}
          </PillLink>
        </div>
      </Reveal>
      <SceneBackdrop id={scene} />
    </Section>
  );
}
