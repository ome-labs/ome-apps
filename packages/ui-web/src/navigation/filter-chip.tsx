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
        "focus-ring inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 type-label-s text-fg-muted",
        "transition-colors duration-fast ease-standard hover:bg-hover",
        "data-[pressed]:border-transparent data-[pressed]:bg-inverse data-[pressed]:text-fg-inverse",
        className,
      )}
      {...props}
    >
      {label}
      {count === undefined ? null : <span className="opacity-70">{count}</span>}
    </Toggle>
  );
}
