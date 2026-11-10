import { useMemo } from "react";

import { Icon, type IconName } from "@ome-labs/icons/native";
import { cva, type VariantProps } from "class-variance-authority";
import { Pressable, type PressableProps } from "react-native";
import { createAnimatedComponent } from "react-native-reanimated";

import { usePressScale } from "../motion/press-scale.ts";
import { cn } from "../styling/class-names.ts";
import { depth } from "../styling/depth.ts";
import { Text, TextClassContext } from "../styling/text.tsx";

const AnimatedPressable = createAnimatedComponent(Pressable);

// Page 24's styles, sized for touch: every button is at least 44 pt tall, the iOS minimum target. Solid buttons
// carry the accent shadow and secondary ones the control shadow (its ring replaces the border); both sink into an
// inset shadow while held. Disabled buttons sit flat in the sunken fill.
const button = cva("flex-row items-center justify-center gap-2 rounded-md", {
  variants: {
    variant: {
      primary: "bg-accent active:bg-accent-pressed",
      secondary: "bg-surface active:bg-selected",
      ghost: "active:bg-selected",
      danger: "bg-danger-solid active:opacity-90",
    },
    size: { md: "h-11 px-4", lg: "h-12 px-5" },
    disabled: { true: "bg-sunken active:bg-sunken" },
    wide: { true: "self-stretch" },
  },
  compoundVariants: [
    { variant: ["primary", "danger"], disabled: false, className: [depth.accent, depth.pressed] },
    { variant: "secondary", disabled: false, className: [depth.control, depth.pressed] },
    { variant: "ghost", disabled: true, className: "bg-transparent" },
  ],
  defaultVariants: { variant: "secondary", size: "md" },
});

const label = cva("type-label-m", {
  variants: {
    variant: {
      primary: "text-on-accent",
      secondary: "text-fg",
      ghost: "text-fg",
      danger: "text-on-accent",
    },
    disabled: { true: "text-fg-disabled" },
  },
  defaultVariants: { variant: "secondary" },
});

const iconTone = {
  primary: "on-accent",
  secondary: "fg",
  ghost: "fg",
  danger: "on-accent",
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
  onPressIn,
  onPressOut,
  style,
  ...props
}: ButtonProps) {
  const off = Boolean(disabled);
  const state = useMemo(() => ({ disabled: off }), [off]);
  const press = usePressScale(onPressIn, onPressOut);
  // A style function can't be merged with an animated style; such a button keeps its own style and skips the scale.
  const pressStyle = useMemo(
    () => (typeof style === "function" ? style : [press.style, style]),
    [press.style, style],
  );

  return (
    <TextClassContext value={label({ variant, disabled: off })}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityState={state}
        disabled={off}
        className={cn(button({ variant, size, wide, disabled: off }), className)}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={pressStyle}
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
      </AnimatedPressable>
    </TextClassContext>
  );
}
