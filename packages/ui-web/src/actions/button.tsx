import type { ComponentProps } from "react";

import { Button as BaseButton } from "@base-ui/react/button";
import { Icon, type IconName } from "@ome-labs/icons/web";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../styling/class-names.ts";

// Page 24: four styles, three sizes. Hover and pressed come from the pointer; disabled is a sunken fill
// rather than a faded one, so it stays legible.
const button = cva(
  [
    "focus-ring inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md",
    "transition-colors duration-fast ease-standard",
    "data-[disabled]:cursor-not-allowed data-[disabled]:bg-sunken data-[disabled]:text-fg-disabled data-[disabled]:border-transparent",
  ],
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-pressed",
        secondary: "border border-line bg-surface text-fg hover:bg-hover active:bg-selected",
        ghost: "text-fg hover:bg-hover active:bg-selected data-[disabled]:bg-transparent",
        danger: "bg-danger-solid text-fg-inverse hover:opacity-90 active:opacity-80",
      },
      size: {
        sm: "h-control-sm px-2.5 type-label-s",
        md: "h-control-md px-3 type-label-m",
        lg: "h-control-lg px-4 type-label-m",
      },
      wide: { true: "w-full" },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export type ButtonProps = ComponentProps<typeof BaseButton> &
  VariantProps<typeof button> & {
    icon?: IconName | undefined;
  };

export function Button({ variant, size, wide, icon, className, children, ...props }: ButtonProps) {
  return (
    <BaseButton className={cn(button({ variant, size, wide }), className)} {...props}>
      {icon ? (
        <Icon name={icon} size={16} className={size === "sm" ? "size-3.5" : undefined} />
      ) : null}
      {children}
    </BaseButton>
  );
}
