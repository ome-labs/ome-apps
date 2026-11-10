import type { ComponentProps } from "react";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";

import { cn } from "../styling/class-names.ts";

export type RadioOption<Value extends string> = { value: Value; label: string; disabled?: boolean };

export type RadioGroupProps<Value extends string> = Omit<
  ComponentProps<typeof BaseRadioGroup>,
  "children" | "onValueChange"
> & {
  options: RadioOption<Value>[];
  onValueChange?: (value: Value) => void | undefined;
};

/** Page 26's radios: a vertical list where arrow keys move the choice. */
export function RadioGroup<Value extends string>({
  options,
  onValueChange,
  className,
  ...props
}: RadioGroupProps<Value>) {
  return (
    <BaseRadioGroup
      className={cn("flex flex-col gap-2", className)}
      onValueChange={(value) => onValueChange?.(value as Value)}
      {...props}
    >
      {options.map((option) => (
        // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Base UI renders the radio as a button inside the label.
        <label
          key={option.value}
          className="inline-flex cursor-pointer items-center gap-2 type-body-s text-fg has-[[data-disabled]]:text-fg-disabled"
        >
          <Radio.Root
            value={option.value}
            disabled={option.disabled}
            className={cn(
              "focus-ring flex size-4 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface",
              "transition-[border-width,border-color] duration-fast ease-standard",
              "data-[checked]:border-[5px] data-[checked]:border-accent data-[disabled]:bg-sunken",
            )}
          />
          {option.label}
        </label>
      ))}
    </BaseRadioGroup>
  );
}
