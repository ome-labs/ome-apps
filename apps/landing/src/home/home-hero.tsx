import type { CSSProperties } from "react";

import { SceneBackdrop } from "../layout/scene-backdrop.tsx";
import { Section } from "../layout/section.tsx";

/** Dawn on the lake: the wordmark and what Ome is. */
export function HomeHero() {
  return (
    <Section
      hour="6:12 am"
      scene="hero-dawn"
      labelledBy="hero-title"
      className="flex min-h-[calc(200*var(--k))] flex-col items-center pt-[130px] md:min-h-[calc(200*var(--k)+260px)] md:pt-[170px]"
    >
      <span
        aria-hidden
        className="scrim pointer-events-none absolute top-[60px] [--scrim:0.36] left-1/2 -z-[5] h-[700px] w-[min(1300px,140vw)] -translate-x-1/2"
      />
      <div className="flex flex-col items-center gap-[18px] text-center md:gap-[22px]">
        <p
          lang="nah"
          className="load-in glass-soft inline-flex items-center gap-2.5 rounded-full px-3.5 py-[7px] font-mono text-[13px]"
        >
          ōme
          <span className="text-amber">oh·meh</span>
          <span lang="en" className="text-white/75">
            Nahuatl for “two”
          </span>
        </p>
        <h1
          id="hero-title"
          className="sky-text font-display text-[150px] select-none leading-[0.86] tracking-[-0.02em] md:text-[clamp(180px,19.5vw,280px)]"
        >
          {/* Each letter rises in on its own beat; together they still read as one word. */}
          {["O", "m", "e"].map((letter, index) => (
            <span
              key={letter}
              className="load-in inline-block"
              style={{ "--load-delay": `${140 + index * 90}ms` } as CSSProperties}
            >
              {letter}
            </span>
          ))}
          <span className="sr-only">: the private multisig for Aztec</span>
        </h1>
        <p className="load-in sky-text max-w-[900px] text-[19px] leading-[1.3] font-medium tracking-[-0.01em] text-balance [--load-delay:520ms] md:text-[26px]">
          The private multisig for Aztec. <br className="md:hidden" />
          Spend together. See together.
        </p>
      </div>
      <SceneBackdrop id="hero-dawn" />
    </Section>
  );
}
