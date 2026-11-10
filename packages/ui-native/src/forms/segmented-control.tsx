import { Item, Root } from "@rn-primitives/toggle-group";

import { cn } from "../styling/class-names.ts";
import { depth } from "../styling/depth.ts";
import { Text } from "../styling/text.tsx";

export type SegmentedControlProps<Value extends string> = {
  options: { value: Value; label: string }[];
  value: Value;
  onValueChange: (value: Value) => void;
  label: string;
  className?: string | undefined;
};

/** Page 27's segmented control, full width with 40 pt segments: a sunken track with the chosen segment raised in it. */
export function SegmentedControl<Value extends string>({
  options,
  value,
  onValueChange,
  label,
  className,
}: SegmentedControlProps<Value>) {
  return (
    <Root
      type="single"
      value={value}
      // A segmented control always has a choice; pressing the selected segment keeps it.
      onValueChange={(next) => {
        if (next) onValueChange(next as Value);
      }}
      accessibilityLabel={label}
      className={cn("flex-row gap-0.5 rounded-md bg-sunken p-0.5", depth.field, className)}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Item
            key={option.value}
            value={option.value}
            accessibilityLabel={option.label}
            className={cn(
              "h-10 flex-1 items-center justify-center rounded-sm",
              selected ? ["bg-surface", depth.control] : "active:bg-line-subtle",
            )}
          >
            <Text className={cn("type-label-m", selected ? "text-fg" : "text-fg-muted")}>
              {option.label}
            </Text>
          </Item>
        );
      })}
    </Root>
  );
}
