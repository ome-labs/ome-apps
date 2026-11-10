import type { ReactElement, ReactNode } from "react";

import { Popover as BasePopover } from "@base-ui/react/popover";

import { cn } from "../styling/class-names.ts";

export type PopoverProps = {
  trigger: ReactElement;
  title?: string | undefined;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right" | undefined;
  className?: string | undefined;
};

/** A raised panel anchored to its trigger, for details that don't need a dialog (a member's keeper, a pill's meaning). */
export function Popover({ trigger, title, children, side = "bottom", className }: PopoverProps) {
  return (
    <BasePopover.Root>
      <BasePopover.Trigger render={trigger} />
      <BasePopover.Portal>
        <BasePopover.Positioner side={side} sideOffset={6} className="z-50">
          <BasePopover.Popup
            className={cn(
              "flex max-w-80 flex-col gap-2 rounded-lg bg-raised p-4 shadow-2 outline-none",
              "origin-[var(--transform-origin)] transition-[opacity,scale] duration-base ease-standard",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
              className,
            )}
          >
            {title ? (
              <BasePopover.Title className="type-heading-s text-fg">{title}</BasePopover.Title>
            ) : null}
            <div className="type-body-s text-fg-muted">{children}</div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
