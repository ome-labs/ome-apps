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
        "transition-colors duration-fast ease-standard hover:bg-hover hover:text-fg active:bg-selected",
        "data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-disabled data-[disabled]:hover:bg-transparent",
        variant === "secondary" && "border border-line bg-surface",
        sizes[size],
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={16} className={size === "sm" ? "size-3.5" : undefined} />
    </BaseButton>
  );
}
