import { useMemo } from "react";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";

import { cn } from "../styling/class-names.ts";

export type SegmentedControlProps<Value extends string> = {
  options: { value: Value; label: string }[];
  value: Value;
  onValueChange: (value: Value) => void;
  "aria-label": string;
  className?: string | undefined;
};

/** Page 27's segmented control: one of a few short choices, such as how long to stay unlocked. */
export function SegmentedControl<Value extends string>({
  options,
  value,
  onValueChange,
  className,
  ...props
}: SegmentedControlProps<Value>) {
  const pressed = useMemo(() => [value], [value]);

  return (
    <ToggleGroup
      value={pressed}
      // A segmented control always has a choice, so pressing the selected segment again keeps it.
      onValueChange={(next) => {
        const [picked] = next;
        if (picked) onValueChange(picked as Value);
      }}
      aria-label={props["aria-label"]}
      // A sunken track; the chosen segment is a raised thumb sitting in it.
      className={cn("inline-flex gap-0.5 rounded-md bg-sunken p-0.5 shadow-field", className)}
    >
      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          className={cn(
            "focus-ring rounded-sm px-3 py-[5px] type-label-s text-fg-muted",
            "transition-[background-color,box-shadow,color] duration-fast ease-standard",
            "hover:text-fg data-[pressed]:bg-raised data-[pressed]:text-fg data-[pressed]:shadow-control",
          )}
        >
          {option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}
