import { cn } from "@ome-labs/ui-web";

import type { IllustrationArt } from "../art/art-files.ts";
import { PixelArt } from "../art/pixel-art.tsx";
import { HourChip } from "../layout/hour-chip.tsx";
import { Section } from "../layout/section.tsx";

type ChapterProps = {
  id: string;
  hour: string;
  label: string;
  title: string;
  body: string;
  art: IllustrationArt;
  alt: string;
  flip?: boolean;
};

/** A chapter of the story behind the name: words on glass beside one of the brand's scenes. */
export function Chapter({ id, hour, label, title, body, art, alt, flip }: ChapterProps) {
  return (
    <Section hour={hour} labelledBy={id} className="py-[72px] md:py-[110px]">
      <div
        className={cn(
          "mx-auto flex max-w-[1200px] flex-col gap-5 lg:items-center lg:justify-between",
          flip ? "lg:flex-row-reverse" : "lg:flex-row",
        )}
      >
        <div className="lg:w-[540px]">
          <div className="glass-soft flex flex-col gap-4 rounded-[26px] p-5 md:p-[30px]">
            <HourChip hour={hour} label={label} />
            <h2 id={id} className="font-display text-[44px] leading-none md:text-[60px]">
              {title}
            </h2>
            <p className="text-base leading-[1.55] text-white/95 md:text-[17px]">{body}</p>
          </div>
        </div>
        <div className="lg:w-[600px]">
          <figure className="glass-soft rounded-[26px] p-2.5">
            <PixelArt
              illustration={art}
              alt={alt}
              className="aspect-[8/5] h-auto w-full rounded-[18px]"
            />
          </figure>
        </div>
      </div>
    </Section>
  );
}
