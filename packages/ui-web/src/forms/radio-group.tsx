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
              // Empty, a small well; chosen, a lit accent bead with a white centre.
              "focus-ring flex size-4 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface shadow-field",
              "transition-[background-color,border-color,box-shadow,scale] duration-fast ease-standard active:scale-90",
              "data-[checked]:border-transparent data-[checked]:bg-accent data-[checked]:bg-linear-to-b data-[checked]:from-brand-white/15 data-[checked]:to-brand-white/0 data-[checked]:shadow-accent",
              "data-[disabled]:scale-100 data-[disabled]:border-line data-[disabled]:bg-sunken data-[disabled]:bg-none data-[disabled]:shadow-none",
            )}
          >
            <Radio.Indicator
              className={cn(
                "size-1.5 rounded-full bg-brand-white transition-[opacity,scale] duration-fast ease-standard",
                "data-[starting-style]:scale-50 data-[starting-style]:opacity-0 data-[disabled]:bg-fg-disabled",
              )}
            />
          </Radio.Root>
          {option.label}
        </label>
      ))}
    </BaseRadioGroup>
  );
}
