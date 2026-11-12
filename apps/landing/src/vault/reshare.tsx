import { Logo } from "@ome-labs/brand/web";
import { Icon } from "@ome-labs/icons/web";
import { cn } from "@ome-labs/ui-web";
import { motion } from "motion/react";

import { useInView } from "../motion/use-in-view.ts";
import { useLoop } from "../motion/use-loop.ts";
import { people, type Person } from "./people.ts";

const stages: readonly [Stage, ...Stage[]] = [
  { name: "Epoch 1", caption: "Three members, three shares of one viewing key." },
  { name: "Change", caption: "Charlie is removed. Dana is invited." },
  { name: "Reshare", caption: "Alice and Bob re-split the same key for the new group." },
  {
    name: "Epoch 2",
    caption: "Same key, same address, new shares. Charlie’s old share combines with nothing.",
  },
];

const radius = 108;
const centre = { x: 300, y: 236 };

type Stage = { name: string; caption: string };

/** The ring's three shares, held by whoever is in the vault at that stage. */
const slots = [0, 1, 2] as const;

/** Where each member stands around the ring at each stage: angle (degrees), distance from the ring, opacity. */
function place(who: Person, stage: number): { angle: number; out: number; opacity: number } {
  if (who === "charlie")
    return {
      angle: 150,
      out: stage === 0 ? 0 : stage === 1 ? 40 : 90,
      opacity: stage === 0 ? 1 : stage === 1 ? 0.35 : 0,
    };
  if (who === "dana")
    return {
      angle: stage === 0 ? 170 : stage === 1 ? 165 : 150,
      out: stage === 0 ? 90 : stage === 1 ? 40 : 0,
      opacity: stage === 0 ? 0 : stage === 1 ? 0.6 : 1,
    };

  return { angle: who === "alice" ? -90 : 30, out: 0, opacity: 1 };
}

function arc(start: number, end: number): string {
  const point = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    return `${centre.x + Math.cos(radians) * radius} ${centre.y + Math.sin(radians) * radius}`;
  };

  return `M ${point(start)} A ${radius} ${radius} 0 0 1 ${point(end)}`;
}

/**
 * Resharing, as it plays in Figma: the ring of shares around the vault, Charlie drifting off, Dana arriving, the
 * shares turning as Alice and Bob deal new ones; the vault and its address never move. 2.4 s a stage, 3.2 s on
 * the last, while it's on screen; the stage pills choose a stage.
 */
export function Reshare() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [stage, setStage] = useLoop(stages.length, 2600, inView);
  const holders: readonly [Person, Person, Person] =
    stage <= 1 ? ["alice", "bob", "charlie"] : ["alice", "bob", "dana"];
  const current = stages[stage] ?? stages[0];

  return (
    <div
      ref={ref}
      className="glass relative mx-auto w-full max-w-[600px] overflow-hidden rounded-[28px]"
    >
      <p className="z-10 m-4 mb-0 inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 font-mono text-xs md:absolute md:top-5 md:left-5 md:m-0">
        0x1f3a…9c2e
        <Icon name="check" size={16} className="text-ok" />
        <span className="text-ok">same address</span>
      </p>

      {/* The picture repeats the caption below it, which is the text a screen reader gets. */}
      <svg viewBox="0 0 600 470" className="block h-auto w-full" aria-hidden>
        {/* A CSS transition, not motion: an SVG group turns about a point in the drawing's own units only with
            transform-box: view-box, which motion replaces with the group's bounding box. */}
        <g
          className="transition-transform duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
          style={{
            transform: `rotate(${stage >= 2 ? 60 : 0}deg)`,
            transformBox: "view-box",
            transformOrigin: `${centre.x}px ${centre.y}px`,
          }}
        >
          {slots.map((slot) => {
            const who = holders[slot];

            return (
              <motion.path
                key={slot}
                d={arc(slot * 120 + 4 - 90, (slot + 1) * 120 - 4 - 90)}
                fill="none"
                strokeWidth={radius * 0.22}
                animate={{
                  stroke: stage === 2 ? "#9DB4F2" : people[who].colour,
                  opacity: stage === 1 && who === "charlie" ? 0.25 : stage === 2 ? 0.55 : 1,
                }}
                transition={{ duration: 0.8 }}
              />
            );
          })}
        </g>
        {stage === 2 ? (
          <motion.rect
            x={centre.x - 1}
            width={2}
            fill="#F5C98A"
            initial={{ y: centre.y, height: 0, opacity: 0 }}
            animate={{ y: centre.y - radius - 4, height: radius * 2 + 8, opacity: 0.9 }}
            transition={{ duration: 0.9 }}
          />
        ) : null}
        <circle
          cx={centre.x}
          cy={centre.y}
          r={60}
          fill="rgb(11 13 19 / 0.85)"
          stroke="rgb(255 255 255 / 0.15)"
        />
        <foreignObject x={centre.x - 60} y={centre.y - 60} width={120} height={120}>
          <div className="flex size-full flex-col items-center justify-center gap-1">
            <Logo variant="mark" tone="dark" title="" className="h-[30px] w-auto" />
            <span
              className={cn("font-mono text-[11px]", stage === 2 ? "text-amber" : "text-white/85")}
            >
              {stage >= 3 ? "epoch 2" : stage === 2 ? "resharing" : "epoch 1"}
            </span>
          </div>
        </foreignObject>
        {(Object.keys(people) as Person[]).map((who) => {
          const { angle, out, opacity } = place(who, stage);
          const distance = radius + 58 + out;
          const radians = (angle * Math.PI) / 180;

          return (
            <motion.g
              key={who}
              initial={false}
              animate={{
                x: centre.x + Math.cos(radians) * distance,
                y: centre.y + Math.sin(radians) * distance,
                opacity,
              }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <circle r={23} fill={people[who].colour} />
              <text y={8} textAnchor="middle" className="fill-brand-night font-display text-[22px]">
                {people[who].initial}
              </text>
              <text y={42} textAnchor="middle" className="fill-white/90 text-xs font-medium">
                {people[who].name}
              </text>
            </motion.g>
          );
        })}
      </svg>

      <div className="flex flex-col gap-2.5 px-6 pb-6">
        <div className="flex flex-wrap gap-1.5">
          {stages.map((item, index) => (
            <button
              key={item.name}
              type="button"
              aria-pressed={index === stage}
              onClick={() => setStage(index)}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors",
                index === stage
                  ? "bg-white text-brand-night"
                  : "bg-white/10 text-white/80 hover:bg-white/20",
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
        <p className="min-h-[3em] text-sm leading-[1.5] text-white/92 md:text-[15px]">
          {current.caption}
        </p>
      </div>
    </div>
  );
}
