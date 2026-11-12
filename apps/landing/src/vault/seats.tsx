import { cn } from "@ome-labs/ui-web";

import { BrandImage } from "../art/brand-image.tsx";
import { people, type Person } from "./people.ts";

const members: readonly Person[] = ["alice", "bob", "charlie", "dana", "eve"];

type SeatsProps = {
  /** An approval stone on each member who signed, or a lit lantern on each keeper that answered. */
  kind: "spend" | "read";
  /** How many of the five take part. */
  lit: number;
  className?: string | undefined;
};

/** Five members, some of them taking part: the threshold as people rather than numbers. */
export function Seats({ kind, lit, className }: SeatsProps) {
  const label =
    kind === "spend"
      ? `${lit} of ${members.length} members approve`
      : `${lit} of ${members.length} members’ keepers answer`;

  return (
    <div className={cn("flex items-center gap-2 md:gap-3", className)}>
      <span className="sr-only">{label}</span>
      {members.map((who, index) => {
        const on = index < lit;

        return (
          <span key={who} aria-hidden className="relative">
            <BrandImage
              avatar={people[who].avatar}
              className={cn(
                "size-12 rounded-full ring-2 transition-[opacity,filter] md:size-16",
                on ? "ring-amber/80" : "opacity-35 ring-white/10 grayscale",
              )}
            />
            {on ? (
              <BrandImage
                object={kind === "spend" ? "approve-stone" : "lantern"}
                className="absolute -right-1.5 -bottom-1.5 size-6 drop-shadow-[0_2px_6px_rgb(5_8_20/0.5)] md:size-8"
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
