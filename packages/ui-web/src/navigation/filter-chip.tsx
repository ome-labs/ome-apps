import type { ComponentProps } from "react";

import { Toggle } from "@base-ui/react/toggle";

import { cn } from "../styling/class-names.ts";

export type FilterChipProps = Omit<ComponentProps<typeof Toggle>, "children"> & {
  label: string;
  count?: number | undefined;
};

/** Page 28's filter: Open · Ready · Done · All on the proposals list. Pressed is the dark, inverse chip. */
export function FilterChip({ label, count, className, ...props }: FilterChipProps) {
  return (
    <Toggle
      className={cn(
        "focus-ring inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 type-label-s text-fg-muted",
        "bg-surface bg-linear-to-b from-brand-white/0 to-canvas/60 shadow-control",
        "transition-[background-color,box-shadow,color,scale] duration-fast ease-standard hover:bg-hover hover:text-fg active:scale-[0.97]",
        // Pressed, the chip turns solid, so it takes the solid controls' lit edge.
        "data-[pressed]:bg-inverse data-[pressed]:bg-none data-[pressed]:text-fg-inverse data-[pressed]:shadow-accent",
        className,
      )}
      {...props}
    >
      {label}
      {count === undefined ? null : <span className="opacity-70">{count}</span>}
    </Toggle>
  );
}
