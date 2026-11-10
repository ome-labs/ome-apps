import type { ReactNode } from "react";

import type { Tone } from "@ome-labs/format";
import { Icon, type IconName } from "@ome-labs/icons/web";

import { cn } from "../styling/class-names.ts";
import { toneClasses } from "../styling/tones.ts";

export type StatusChipProps = {
  /** An icon, or a dot when the state is simply "fine". */
  icon?: IconName | undefined;
  tone?: Tone | "accent" | undefined;
  children: ReactNode;
  className?: string | undefined;
};

/** The top bar's rounded chips for node, keeper and signer. Without a tone the chip is quiet and outlined. */
export function StatusChip({ icon, tone, children, className }: StatusChipProps) {
  const colours = tone ? toneClasses[tone] : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 type-label-s whitespace-nowrap",
        colours
          ? [colours.fill, colours.text]
          : "border border-line-subtle bg-sunken text-fg-muted",
        className,
      )}
    >
      {icon ? (
        <Icon name={icon} size={16} className="size-3.5" />
      ) : (
        <span aria-hidden className={cn("size-1.5 rounded-full", colours?.dot ?? "bg-success")} />
      )}
      {children}
    </span>
  );
}
