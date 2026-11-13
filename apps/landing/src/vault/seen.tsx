import { useState } from "react";

import { Icon } from "@ome-labs/icons/web";
import { cn } from "@ome-labs/ui-web";
import { motion } from "motion/react";

import { track } from "../analytics/client.ts";
import { useInView } from "../motion/use-in-view.ts";
import { useLoop } from "../motion/use-loop.ts";

type Row = { what: string; member: string; where: string; public?: boolean };

const rows: readonly Row[] = [
  {
    what: "Members",
    member: "Alice, Bob, Dana, Eve, Frank",
    where: "private config and signer notes",
  },
  { what: "Spending threshold", member: "3 approvals", where: "private config note" },
  {
    what: "Viewing committee",
    member: "3 keepers · epoch 2",
    where: "a commitment inside the config note",
  },
  { what: "Balance", member: "12,400 USDC", where: "encrypted notes, read through the keepers" },
  {
    what: "Pending proposal",
    member: "Pay dave 250 USDC",
    where: "sealed between keepers; relays hold ciphertext",
  },
  { what: "Approvals", member: "Alice, Bob, Eve", where: "inside the proof’s private inputs" },
  {
    what: "Fee payment",
    member: "sponsored",
    where: "never paid from the vault in public",
    public: true,
  },
  {
    what: "Note hashes",
    member: "random-looking fields",
    where: "public, as on every Aztec transaction",
    public: true,
  },
];

const noiseColours = ["#5B7FE0", "#9DB4F2", "#2C47B4", "#F5C98A", "#1A2A66", "#C4D3F6"];

/** One block of the cover: its colour, and how long after a flip it lands or lifts. */
type Block = { colour: string; delay: number };

/**
 * A value's cover: two rows of blocks about 8 px wide across its text, seeded so they're the same on the server
 * and in the browser.
 */
function coverFor(seed: number, characters: number): { columns: number; blocks: Block[] } {
  // The values are set in 13 px mono, about 7.8 px a character.
  const columns = Math.max(4, Math.ceil((characters * 7.8) / 8));
  let state = seed * 9301 + 49297;

  const blocks = Array.from({ length: columns * 2 }, () => {
    state = (state * 9301 + 49297) % 233280;

    return {
      colour: noiseColours[state % noiseColours.length] ?? "#5B7FE0",
      delay: Math.round((state / 233280) * 420),
    };
  });

  return { columns, blocks };
}

const covers = rows.map((row, index) => coverFor(index + 1, row.member.length));

/**
 * A private value under its cover of blocks. Flipping to the network drops the blocks over the text one at a time
 * at random, and flipping back lifts them the same way, so the value is read out of the noise.
 */
function Covered({
  value,
  covered,
  cover,
}: {
  value: string;
  covered: boolean;
  cover: ReturnType<typeof coverFor>;
}) {
  return (
    <span className="relative inline-flex h-5 items-center">
      <span
        aria-hidden={covered}
        className={cn(
          "font-mono text-[13px] transition-colors delay-200 duration-300",
          covered ? "text-white" : "text-amber",
        )}
      >
        {value}
      </span>
      {covered ? <span className="sr-only">encrypted</span> : null}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 grid grid-rows-2"
        style={{ gridTemplateColumns: `repeat(${cover.columns}, 1fr)` }}
      >
        {cover.blocks.map((block, index) => (
          <span
            // The blocks never reorder; their place in the grid is who they are.
            // oxlint-disable-next-line react/no-array-index-key
            key={index}
            className="transition-opacity duration-75 ease-linear motion-reduce:transition-none"
            style={{
              backgroundColor: block.colour,
              opacity: covered ? 1 : 0,
              transitionDelay: `${block.delay}ms`,
            }}
          />
        ))}
      </span>
    </span>
  );
}

const views = ["The network", "A member"] as const;

/**
 * The same vault as the network sees it and as a member sees it. It flips every 4.5 s on screen until the reader
 * picks a side.
 */
export function Seen() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [chosen, setChosen] = useState<number>();
  const [auto] = useLoop(2, 4500, inView && chosen === undefined);
  const view = chosen ?? auto;
  const network = view === 0;

  return (
    <div
      ref={ref}
      className="glass mx-auto w-full max-w-[1200px] rounded-[28px] px-[18px] pt-[18px] pb-2.5 md:px-9 md:pt-6 md:pb-3.5"
    >
      <div className="flex flex-col items-start gap-3 pb-3.5 md:flex-row md:items-center md:justify-between">
        <h3 className="flex items-center gap-2 font-mono text-xs font-medium tracking-[0.08em] uppercase">
          <Icon
            name={network ? "eye-off" : "eye"}
            size={16}
            className={network ? "text-haze-soft" : "text-amber"}
          />
          {network ? "What the network sees" : "What a member sees"}
        </h3>
        <fieldset className="isolate flex gap-1 rounded-full bg-white/8 p-1">
          <legend className="sr-only">Whose view</legend>
          {views.map((label, index) => (
            <button
              key={label}
              type="button"
              aria-pressed={view === index}
              onClick={() => {
                setChosen(index);
                track("privacy_view_switched", { view: index === 0 ? "network" : "member" });
              }}
              className={cn(
                "relative rounded-full px-3.5 py-[7px] text-[13px] font-medium transition-colors duration-200",
                view === index ? "text-brand-night" : "text-white hover:bg-white/10",
              )}
            >
              {view === index ? (
                <motion.span
                  aria-hidden
                  layoutId="seen-view"
                  transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                  className="absolute inset-0 -z-10 rounded-full bg-white"
                />
              ) : null}
              {label}
            </button>
          ))}
        </fieldset>
      </div>

      <dl>
        {rows.map((row, index) => (
          <div
            key={row.what}
            className="grid gap-1.5 border-t border-white/10 py-3 lg:grid-cols-[220px_300px_1fr] lg:items-center lg:gap-6 lg:py-3.5"
          >
            <dt className="text-sm font-medium">{row.what}</dt>
            <dd className="min-h-5">
              {row.public ? (
                <span className="font-mono text-[13px] text-white/80">{row.member}</span>
              ) : (
                <Covered
                  value={row.member}
                  covered={network}
                  cover={covers[index] ?? coverFor(index + 1, row.member.length)}
                />
              )}
            </dd>
            <dd className="text-[13px] text-white/72 md:text-sm">{row.where}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
