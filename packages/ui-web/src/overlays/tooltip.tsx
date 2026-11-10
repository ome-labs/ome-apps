import type { ReactElement, ReactNode } from "react";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

import { cn } from "../styling/class-names.ts";

export type TooltipProps = {
  content: ReactNode;
  /** The element that shows the tooltip; it must be focusable so keyboard users can read it too. */
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right" | undefined;
  mono?: boolean | undefined;
};

/** Page 37's tooltip: inverse, small, for full values and the meaning of an icon. Wrap the app in `TooltipProvider`. */
export function Tooltip({ content, children, side = "top", mono }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={6} className="z-50">
          <BaseTooltip.Popup
            className={cn(
              "max-w-[min(90vw,32rem)] rounded-sm bg-inverse px-2 py-[5px] text-fg-inverse shadow-2 [overflow-wrap:anywhere]",
              "origin-[var(--transform-origin)] transition-[opacity,scale] duration-base ease-standard",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
              // Moving between tooltips shouldn't replay the entrance.
              "data-[instant]:transition-none",
              mono ? "type-mono-s" : "type-label-s",
            )}
          >
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

export const TooltipProvider = BaseTooltip.Provider;
