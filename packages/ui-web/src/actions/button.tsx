import type { ComponentProps } from "react";

import { Button as BaseButton } from "@base-ui/react/button";
import { Icon, type IconName } from "@ome-labs/icons/web";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../styling/class-names.ts";

// Page 24: four styles, three sizes. Solid buttons are lit from above: a faint white wash over the fill and a
// lit top edge (`shadow-accent`); secondary sits on the surface with its own ring (`shadow-control`). Held
// down, a button sinks: the drop shadow turns into an inset one and it shrinks a hair. Disabled is a sunken,
// flat fill rather than a faded one, so it stays legible and plainly can't be pressed.
const button = cva(
  [
    "focus-ring inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md",
    "transition-[background-color,box-shadow,scale] duration-fast ease-standard active:scale-[0.98]",
    "data-[disabled]:cursor-not-allowed data-[disabled]:scale-100 data-[disabled]:bg-sunken data-[disabled]:bg-none data-[disabled]:text-fg-disabled data-[disabled]:shadow-none",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-accent bg-linear-to-b from-brand-white/6 to-brand-white/0 text-on-accent shadow-accent",
          "hover:bg-[color-mix(in_oklab,var(--color-accent),white_6%)] active:bg-accent-pressed active:shadow-pressed",
        ],
        secondary: [
          "bg-surface text-fg shadow-control",
          "hover:bg-hover active:bg-sunken active:shadow-pressed",
        ],
        ghost: "text-fg hover:bg-hover active:bg-selected data-[disabled]:bg-transparent",
        danger: [
          "bg-danger-solid bg-linear-to-b from-brand-white/6 to-brand-white/0 text-on-accent shadow-accent",
          "hover:bg-[color-mix(in_oklab,var(--color-danger-solid),white_6%)]",
          "active:bg-[color-mix(in_oklab,var(--color-danger-solid),black_10%)] active:shadow-pressed",
        ],
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
    /**
     * Its action is running: a spinner replaces the icon and clicks are ignored, but the button keeps its colour
     * (unlike `disabled`), so it reads as working rather than unavailable. Keep the label short: "Creating…".
     */
    pending?: boolean | undefined;
  };

export function Button({
  variant,
  size,
  wide,
  icon,
  pending,
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const iconClass = size === "sm" ? "size-3.5" : undefined;
  return (
    <BaseButton
      className={cn(
        button({ variant, size, wide }),
        pending && "cursor-progress active:scale-100",
        className,
      )}
      aria-busy={pending ? true : undefined}
      onClick={pending ? (event) => event.preventDefault() : onClick}
      {...props}
    >
      {pending ? (
        <Icon name="loader" size={16} className={cn("motion-safe:animate-spin", iconClass)} />
      ) : icon ? (
        <Icon name={icon} size={16} className={iconClass} />
      ) : null}
      {children}
    </BaseButton>
  );
}
