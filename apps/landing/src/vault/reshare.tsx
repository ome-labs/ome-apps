import { Icon } from "@ome-labs/icons/web";
import { cn } from "@ome-labs/ui-web";
import { AnimatePresence, motion } from "motion/react";

import { BrandImage } from "../art/brand-image.tsx";
import { useInView } from "../motion/use-in-view.ts";
import { useLoop } from "../motion/use-loop.ts";
import { people, type Person } from "./people.ts";

const stages: readonly [Stage, ...Stage[]] = [
  {
    name: "Day 1",
    caption: "Alice, Bob and Charlie each hold a piece of the key that reads the vault.",
  },
  {
    name: "Charlie leaves",
    caption: "The team removes Charlie and invites Dana, approved like any payment.",
  },
  {
    name: "Re-split",
    caption: "Alice and Bob gather their pieces and split the same key again for the new team.",
  },
  {
    name: "After",
    caption: "Dana holds a fresh piece. Charlie’s old one no longer opens anything.",
  },
];

type Stage = { name: string; caption: string };

/** The drawing's own units; the box keeps this aspect, so percentages and the lines' units agree. */
const width = 600;
const height = 460;
const centre = { x: 300, y: 250 };
const ring = 165;

type Spot = { angle: number; distance: number; opacity: number; tag?: string };

/**
 * Where each member stands around the vault at each stage. While the change is pending, Charlie steps out to the
 * left and Dana waits below his place, far enough apart that neither covers the other's name.
 */
function spot(who: Person, stage: number): Spot {
  if (who === "charlie") {
    if (stage === 0) return { angle: 150, distance: ring, opacity: 1 };
    if (stage === 1) return { angle: 180, distance: ring + 40, opacity: 0.5, tag: "leaves" };
    return { angle: 190, distance: ring + 120, opacity: 0 };
  }
  if (who === "dana") {
    if (stage === 0) return { angle: 130, distance: ring + 120, opacity: 0 };
    if (stage === 1) return { angle: 130, distance: ring + 15, opacity: 0.8, tag: "joins" };
    return { angle: 150, distance: ring, opacity: 1 };
  }

  return { angle: who === "alice" ? -90 : 30, distance: ring, opacity: 1 };
}

/** A point `along` the way from the vault out to a spot (1 is the spot itself). */
function at({ angle, distance }: Spot, along = 1) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: centre.x + Math.cos(radians) * distance * along,
    y: centre.y + Math.sin(radians) * distance * along,
  };
}

const percent = ({ x, y }: { x: number; y: number }) => ({
  left: `${(x / width) * 100}%`,
  top: `${(y / height) * 100}%`,
});

const members: readonly Person[] = ["alice", "bob", "charlie", "dana"];
const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Resharing: the members around the vault, each holding a share. Charlie drifts off and Dana arrives; Alice and
 * Bob's shares gather into the vault and come back out as new ones, dealt to the new group. The vault and its
 * address never move. 2.6 s a stage while it's on screen; the stage pills choose a stage.
 */
export function Reshare() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [stage, setStage] = useLoop(stages.length, 2600, inView);
  const current = stages[stage] ?? stages[0];
  const epoch = stage >= 3 ? 2 : 1;
  const holders: readonly Person[] =
    stage <= 1
      ? ["alice", "bob", "charlie"]
      : stage === 2
        ? ["alice", "bob"]
        : ["alice", "bob", "dana"];

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[600px] overflow-hidden rounded-[28px] border border-white/12 bg-[rgb(12_20_52/0.86)] shadow-[0_16px_48px_rgb(5_8_20/0.35)] backdrop-blur-xl"
    >
      {/* Lake light pooled behind the vault, in place of whatever sky the glass would let through. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 aspect-[600/460] bg-[radial-gradient(circle_at_50%_54%,rgb(91_127_224/0.28),transparent_62%)]"
      />
      {/* The picture repeats the caption below it, which is the text a screen reader gets. */}
      <div aria-hidden className="relative aspect-[600/460] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 size-full">
          {members.map((who) => {
            const place = spot(who, stage);
            const end = at(place);

            return (
              <motion.line
                key={who}
                x1={centre.x}
                y1={centre.y}
                initial={false}
                animate={{ x2: end.x, y2: end.y, opacity: place.opacity * 0.5 }}
                transition={{ duration: 0.9, ease }}
                stroke="#c4d3f6"
                strokeWidth={2}
                strokeDasharray={place.tag ? "4 6" : undefined}
              />
            );
          })}
        </svg>

        {/* The vault, which never moves; a ring goes out from it while the key is reshared. */}
        <div
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
          style={percent(centre)}
        >
          <span className="relative flex">
            {stage === 2 ? (
              <motion.span
                className="absolute inset-0 rounded-2xl border-2 border-amber md:rounded-3xl"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
              />
            ) : null}
            <BrandImage
              avatar="lantern-tower"
              className={cn(
                "relative size-14 rounded-2xl ring-2 transition-[box-shadow] duration-500 md:size-24 md:rounded-3xl",
                stage === 2 ? "ring-amber shadow-[0_0_40px_rgb(245_201_138/0.5)]" : "ring-white/25",
              )}
            />
          </span>
          <span
            className={cn(
              "rounded-full bg-deep/80 px-2.5 py-0.5 text-xs font-medium",
              stage === 2 ? "text-amber" : "text-white/85",
            )}
          >
            {stage === 2 ? "re-splitting" : "Treasury"}
          </span>
        </div>

        {/* Each holder's share, partway along their line; reshared ones gather in the vault and are dealt anew. */}
        <AnimatePresence initial={false}>
          {holders.map((who) => {
            const place = spot(who, stage);
            const position = stage === 2 ? centre : at(place, 0.58);

            return (
              <motion.span
                key={`${who}-${epoch}`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                initial={{ ...percent(centre), opacity: 0, scale: 0.4 }}
                animate={{
                  ...percent(position),
                  opacity: stage === 2 ? 0 : place.opacity,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.9, ease }}
              >
                <span
                  className={cn(
                    "flex rounded-full bg-deep p-1 ring-2",
                    epoch === 2 ? "ring-amber" : "ring-white/30",
                  )}
                >
                  <BrandImage object="share" className="size-5 md:size-7" />
                </span>
              </motion.span>
            );
          })}
        </AnimatePresence>

        {members.map((who) => {
          const place = spot(who, stage);

          return (
            <motion.div
              key={who}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
              initial={false}
              animate={{ ...percent(at(place)), opacity: place.opacity }}
              transition={{ duration: 0.9, ease }}
            >
              <BrandImage
                avatar={people[who].avatar}
                className={cn(
                  "size-11 rounded-full ring-2 md:size-16",
                  place.tag ? "ring-white/45" : "ring-white/25",
                )}
              />
              <span className="rounded-full bg-deep/85 px-2 text-xs font-medium text-white/92 md:text-[13px]">
                {people[who].name}
                {place.tag ? (
                  <span className={place.tag === "joins" ? "text-amber" : "text-white/60"}>
                    {" "}
                    {place.tag}
                  </span>
                ) : null}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="relative flex flex-col items-center gap-3 px-6 pb-7 text-center">
        <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs">
          <Icon name="check" size={16} className="text-ok" />
          <span className="text-ok">Same address the whole time</span>
          <span className="font-mono text-white/60">0x1f3a…9c2e</span>
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {stages.map((item, index) => (
            <button
              key={item.name}
              type="button"
              aria-pressed={index === stage}
              onClick={() => setStage(index)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                index === stage
                  ? "bg-white text-brand-night"
                  : "bg-white/10 text-white/80 hover:bg-white/20",
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
        <p className="min-h-[3em] max-w-[440px] text-sm leading-[1.5] text-pretty text-white/92 md:text-[15px]">
          {current.caption}
        </p>
      </div>
    </div>
  );
}
