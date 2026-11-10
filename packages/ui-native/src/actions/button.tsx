import { useMemo } from "react";

import { Icon, type IconName } from "@ome-labs/icons/native";
import { cva, type VariantProps } from "class-variance-authority";
import { Pressable, type PressableProps } from "react-native";

import { cn } from "../styling/class-names.ts";
import { Text, TextClassContext } from "../styling/text.tsx";

// Page 24's styles, sized for touch: every button is at least 44 pt tall, the iOS minimum target.
const button = cva("flex-row items-center justify-center gap-2 rounded-md", {
  variants: {
    variant: {
      primary: "bg-accent active:bg-accent-pressed",
      secondary: "border border-line bg-surface active:bg-selected",
      ghost: "active:bg-selected",
      danger: "bg-danger-solid active:opacity-80",
    },
    size: { md: "h-11 px-4", lg: "h-12 px-5" },
    disabled: { true: "border-transparent bg-sunken active:bg-sunken" },
    wide: { true: "self-stretch" },
  },
  compoundVariants: [{ variant: "ghost", disabled: true, className: "bg-transparent" }],
  defaultVariants: { variant: "secondary", size: "md" },
});

const label = cva("type-label-m", {
  variants: {
    variant: {
      primary: "text-on-accent",
      secondary: "text-fg",
      ghost: "text-fg",
      danger: "text-fg-inverse",
    },
    disabled: { true: "text-fg-disabled" },
  },
  defaultVariants: { variant: "secondary" },
});

const iconTone = {
  primary: "on-accent",
  secondary: "fg",
  ghost: "fg",
  danger: "fg-inverse",
} as const;

export type ButtonProps = Omit<PressableProps, "children" | "className"> &
  Omit<VariantProps<typeof button>, "disabled"> & {
    children: string;
    icon?: IconName | undefined;
    className?: string | undefined;
  };

export function Button({
  variant = "secondary",
  size,
  wide,
  icon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const off = Boolean(disabled);
  const state = useMemo(() => ({ disabled: off }), [off]);

  return (
    <TextClassContext value={label({ variant, disabled: off })}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={state}
        disabled={off}
        className={cn(button({ variant, size, wide, disabled: off }), className)}
        {...props}
      >
        {icon ? (
          <Icon
            name={icon}
            size={20}
            tone={off ? "fg-disabled" : iconTone[variant ?? "secondary"]}
          />
        ) : null}
        <Text>{children}</Text>
      </Pressable>
    </TextClassContext>
  );
}
