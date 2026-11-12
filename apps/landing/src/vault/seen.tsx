import { useState } from "react";

import { Icon } from "@ome-labs/icons/web";
import { cn } from "@ome-labs/ui-web";
import { AnimatePresence, motion } from "motion/react";

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

type Block = { at: number; colour: string; width: number; opacity: number };

/** A row's random-looking blocks, seeded so they're the same on the server and in the browser. */
function noiseBlocks(seed: number): Block[] {
  let state = seed * 9301 + 49297;
  let at = 0;

  return Array.from({ length: 6 + ((seed * 3) % 7) }, () => {
    state = (state * 9301 + 49297) % 233280;
    const block = {
      at,
      colour: noiseColours[state % noiseColours.length] ?? "#5B7FE0",
      width: 6 + (state % 3) * 4,
      opacity: 0.55 + (state % 4) * 0.1,
    };
    at += block.width;

    return block;
  });
}

const noise = rows.map((_, index) => noiseBlocks(index + 1));

/** What the network has instead of a value. */
function Noise({ blocks }: { blocks: readonly Block[] }) {
  return (
    <span className="flex h-3.5 items-center">
      <span className="sr-only">encrypted</span>
      {blocks.map((block) => (
        <span
          key={block.at}
          aria-hidden
          className="h-3.5"
          style={{ width: block.width, backgroundColor: block.colour, opacity: block.opacity }}
        />
      ))}
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
        <fieldset className="flex gap-1 rounded-full bg-white/8 p-1">
          <legend className="sr-only">Whose view</legend>
          {views.map((label, index) => (
            <button
              key={label}
              type="button"
              aria-pressed={view === index}
              onClick={() => setChosen(index)}
              className={cn(
                "rounded-full px-3.5 py-[7px] text-[13px] font-medium transition-colors duration-200",
                view === index ? "bg-white text-brand-night" : "text-white hover:bg-white/10",
              )}
            >
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
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={network && !row.public ? "hidden" : "shown"}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="block"
                >
                  {network && !row.public ? (
                    <Noise blocks={noise[index] ?? []} />
                  ) : (
                    <span
                      className={cn(
                        "font-mono text-[13px]",
                        row.public ? "text-white/80" : network ? "text-white" : "text-amber",
                      )}
                    >
                      {row.member}
                    </span>
                  )}
                </motion.span>
              </AnimatePresence>
            </dd>
            <dd className="text-[13px] text-white/72 md:text-sm">{row.where}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
