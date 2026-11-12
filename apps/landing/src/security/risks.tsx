import { Reveal } from "../layout/reveal.tsx";

// The thresholds the app warns about. k is approvals to spend, t is keepers to read, n is members; these are the
// CLI's own risk names, never a recommended setup.
const risks = [
  ["t = n", "Losing any one keeper makes the vault unreadable for good."],
  ["k = n", "Losing any one signing key stops all spending for good."],
  ["k = 1", "Any one member can spend alone."],
  [
    "t = 2, 3+ members",
    "Any two members, including two who later leave, could read what arrived while they were members.",
  ],
] as const;

/** The risky thresholds, named: a formula in amber and what it costs. */
export function Risks() {
  return (
    <Reveal className="w-full">
      <dl className="glass mx-auto w-full max-w-[1200px] rounded-[26px] px-5 py-2 md:px-9">
        {risks.map(([formula, meaning]) => (
          <div
            key={formula}
            className="flex flex-col gap-1.5 border-t border-white/12 py-5 first:border-t-0 md:flex-row md:gap-12"
          >
            <dt className="font-mono text-base font-medium text-amber md:w-[260px] md:shrink-0 md:text-lg">
              {formula}
            </dt>
            <dd className="text-[15px] leading-[1.5] text-white/95 md:text-[17px]">{meaning}</dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}
