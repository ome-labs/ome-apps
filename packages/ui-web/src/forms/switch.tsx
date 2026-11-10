import type { ComponentProps, ReactNode } from "react";

import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "../styling/class-names.ts";

export type SwitchProps = Omit<ComponentProps<typeof BaseSwitch.Root>, "children"> & {
  label: ReactNode;
};

/** Page 26's switch, for settings that apply at once (Touch ID, launch at login). */
export function Switch({ label, className, ...props }: SwitchProps) {
  return (
    // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Base UI renders the switch as a button inside the label.
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2.5 type-body-s text-fg has-[[data-disabled]]:text-fg-disabled",
        className,
      )}
    >
      <BaseSwitch.Root
        className={cn(
          // A sunken track with a raised knob riding in it.
          "focus-ring relative flex h-[18px] w-8 shrink-0 rounded-full bg-line-strong p-0.5 shadow-field",
          "transition-[background-color,box-shadow] duration-fast ease-standard data-[checked]:bg-accent data-[disabled]:opacity-50",
        )}
        {...props}
      >
        <BaseSwitch.Thumb className="size-3.5 rounded-full bg-brand-white shadow-control transition-[translate] duration-fast ease-standard data-[checked]:translate-x-3.5" />
      </BaseSwitch.Root>
      {label}
    </label>
  );
}
