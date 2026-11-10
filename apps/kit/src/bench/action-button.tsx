import type { MouseEvent, ReactNode } from "react";

import type { IconName } from "@ome-labs/icons/web";
import { IconButton, Tooltip, cn } from "@ome-labs/ui-web";

/** A small icon action with a tooltip naming it, for copy and download controls on tiles. */
export function ActionButton({
  label,
  icon,
  onClick,
  className,
}: {
  label: string;
  icon: IconName;
  onClick: () => void;
  className?: string | undefined;
}) {
  return (
    <Tooltip content={label}>
      <IconButton
        icon={icon}
        label={label}
        size="sm"
        onClick={(event: MouseEvent) => {
          // Tiles are often buttons themselves; the action shouldn't also trigger the tile.
          event.stopPropagation();
          onClick();
        }}
        className={cn("text-fg-muted hover:text-fg", className)}
      />
    </Tooltip>
  );
}

/** A row of actions that fades in on hover and stays visible for keyboard focus and touch. */
export function ActionRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5 transition-opacity duration-fast",
        "[@media(hover:hover)]:opacity-60 [@media(hover:hover)]:group-focus-within/tile:opacity-100 [@media(hover:hover)]:group-hover/tile:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
