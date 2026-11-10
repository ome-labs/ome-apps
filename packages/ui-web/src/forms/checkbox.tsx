import type { ComponentProps, ReactNode } from "react";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Icon } from "@ome-labs/icons/web";

import { cn } from "../styling/class-names.ts";

export type CheckboxProps = Omit<ComponentProps<typeof BaseCheckbox.Root>, "children"> & {
  label: ReactNode;
};

/** Page 26's checkbox, with its label as part of the hit area. `indeterminate` draws the mixed state. */
export function Checkbox({ label, className, indeterminate, ...props }: CheckboxProps) {
  return (
    // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Base UI renders the control as a button inside the label.
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 type-body-s text-fg has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:text-fg-disabled",
        className,
      )}
    >
      <BaseCheckbox.Root
        indeterminate={indeterminate}
        className={cn(
          "focus-ring flex size-4 shrink-0 items-center justify-center rounded-xs border border-line-strong bg-surface",
          "transition-colors duration-fast ease-standard",
          "data-[checked]:border-transparent data-[checked]:bg-accent data-[indeterminate]:border-transparent data-[indeterminate]:bg-accent",
          "data-[disabled]:border-line data-[disabled]:bg-sunken",
        )}
        {...props}
      >
        <BaseCheckbox.Indicator className="text-on-accent">
          <Icon name={indeterminate ? "minus" : "check"} size={16} className="size-3" />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      {label}
    </label>
  );
}
