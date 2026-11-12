import { Icon } from "@ome-labs/icons/web";
import { cn } from "@ome-labs/ui-web";

import { HourChip } from "../layout/hour-chip.tsx";
import { Reveal } from "../layout/reveal.tsx";
import { Section } from "../layout/section.tsx";
import { AppScreen, type ScreenId } from "../screens/app-screen.tsx";

export type Feature = {
  hour: string;
  label: string;
  title: string;
  body: string;
  screen: ScreenId;
  points?: readonly string[];
  /** The screen on the left. */
  flip?: boolean;
};

/** One thing the app does: a glass panel of words beside the app screen that does it. */
export function FeatureRow({ feature, id }: { feature: Feature; id: string }) {
  return (
    <Section hour={feature.hour} labelledBy={id} className="py-[72px] md:px-8 md:py-[110px]">
      <div
        className={cn(
          "mx-auto flex max-w-[1200px] flex-col gap-6 lg:items-center lg:justify-between lg:gap-10",
          feature.flip ? "lg:flex-row-reverse" : "lg:flex-row",
        )}
      >
        <Reveal className="lg:w-[456px] lg:shrink-0">
          <div className="flex flex-col gap-4 lg:glass-soft lg:rounded-[26px] lg:p-7">
            <HourChip hour={feature.hour} label={feature.label} />
            <h2
              id={id}
              className="sky-text font-display text-[40px] leading-[1.02] text-balance md:text-[52px]"
            >
              {feature.title}
            </h2>
            <p className="sky-text text-base leading-[1.55] text-white/95 md:text-[17px]">
              {feature.body}
            </p>
            {feature.points ? (
              <ul className="flex flex-col gap-2">
                {feature.points.map((point) => (
                  <li key={point} className="flex items-center gap-2.5 text-[15px]">
                    <Icon name="check" size={16} className="text-ok" />
                    {point}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Reveal>
        <Reveal delay={120} className="w-full lg:max-w-[680px]">
          <AppScreen id={feature.screen} sizes="(min-width: 1024px) 680px, 100vw" />
        </Reveal>
      </div>
    </Section>
  );
}
