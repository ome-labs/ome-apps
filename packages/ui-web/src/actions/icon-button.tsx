import type { ComponentProps } from "react";

import { Button as BaseButton } from "@base-ui/react/button";
import { Icon, type IconName } from "@ome-labs/icons/web";

import { cn } from "../styling/class-names.ts";

const sizes = { sm: "size-control-sm", md: "size-control-md", lg: "size-control-lg" } as const;

export type IconButtonProps = Omit<ComponentProps<typeof BaseButton>, "children"> & {
  icon: IconName;
  /** Required: an icon alone has no name for a screen reader. */
  label: string;
  variant?: "ghost" | "secondary" | undefined;
  size?: keyof typeof sizes | undefined;
};

export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  className,
  ...props
}: IconButtonProps) {
  return (
    <BaseButton
      aria-label={label}
      className={cn(
        "focus-ring inline-flex shrink-0 items-center justify-center rounded-md text-fg-muted",
        "transition-[background-color,box-shadow,color,scale] duration-fast ease-standard",
        "hover:bg-hover hover:text-fg active:scale-95 active:bg-selected",
        "data-[disabled]:cursor-not-allowed data-[disabled]:scale-100 data-[disabled]:text-fg-disabled data-[disabled]:hover:bg-transparent",
        // The same raised face as a secondary `Button`, sinking while held.
        variant === "secondary" && [
          "bg-surface bg-linear-to-b from-brand-white/0 to-canvas/60 shadow-control",
          "active:bg-sunken active:shadow-pressed active:ring-1 active:ring-line",
          "data-[disabled]:bg-sunken data-[disabled]:bg-none data-[disabled]:shadow-none data-[disabled]:hover:bg-sunken",
        ],
        sizes[size],
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={16} className={size === "sm" ? "size-3.5" : undefined} />
    </BaseButton>
  );
}
