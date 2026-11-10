import type { ReactNode } from "react";

import type { Tone } from "@ome-labs/format";

import { cn } from "../styling/class-names.ts";
import { toneClasses } from "../styling/tones.ts";

export type TagProps = {
  tone?: Tone | "accent" | undefined;
  children: ReactNode;
  className?: string | undefined;
};

/** Page 29's tag: a small square label beside a value ("You", "2 rejected", "alias, unverified"). */
export function Tag({ tone = "neutral", children, className }: TagProps) {
  const colours = toneClasses[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs px-1.5 py-0.5 type-label-s whitespace-nowrap inset-ring inset-ring-current/15",
        colours.fill,
        colours.text,
        className,
      )}
    >
      {children}
    </span>
  );
}
