import type { ReactNode } from "react";

import { HourChip } from "../layout/hour-chip.tsx";
import { Section } from "../layout/section.tsx";

export type LegalSection = {
  /** The anchor and the heading's id: /privacy#analytics. */
  id: string;
  title: string;
  body: ReactNode;
};

type LegalPageProps = {
  hour: string;
  label: string;
  title: string;
  /** The day the text last changed, as people read it: "13 November 2026". */
  updated: string;
  /** The page in a sentence or two, before the sections. */
  summary: ReactNode;
  sections: readonly LegalSection[];
};

/**
 * A page of terms to read rather than a story to scroll: no scene, its hour and date at the top, then the text on
 * one glass column with a heading per section, each linkable.
 */
export function LegalPage({ hour, label, title, updated, summary, sections }: LegalPageProps) {
  return (
    <Section
      hour={hour}
      labelledBy="page-title"
      className="flex flex-col items-center gap-8 pt-[120px] pb-24 md:gap-12 md:pt-[170px] md:pb-[150px]"
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <HourChip hour={hour} label={label} />
        <h1
          id="page-title"
          className="sky-text font-display text-[56px] leading-[0.94] tracking-[-0.01em] md:text-[clamp(72px,7.8vw,104px)]"
        >
          {title}
        </h1>
        <p className="sky-text font-mono text-xs text-white/80">Last updated {updated}</p>
      </div>

      <article className="glass w-full max-w-[820px] rounded-[28px] px-6 py-8 md:px-12 md:py-12">
        <div className="text-[17px] leading-[1.65] text-pretty text-white/95 md:text-lg">
          {summary}
        </div>

        <nav aria-label="On this page" className="mt-8 border-t border-white/12 pt-6">
          <ol className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="rounded-sm text-sm text-white/75 transition-colors hover:text-white"
                >
                  <span className="mr-2 font-mono text-haze-soft">{index + 1}</span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {sections.map((section) => (
          <section
            key={section.id}
            aria-labelledby={section.id}
            className="mt-10 border-t border-white/12 pt-8 first-of-type:mt-8"
          >
            <h2 id={section.id} className="scroll-mt-28 text-[22px] font-semibold md:text-2xl">
              {section.title}
            </h2>
            <div className="legal-prose mt-4 flex flex-col gap-4 text-base leading-[1.65] text-white/88">
              {section.body}
            </div>
          </section>
        ))}
      </article>
    </Section>
  );
}
