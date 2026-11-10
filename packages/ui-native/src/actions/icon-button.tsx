import { useMemo } from "react";

import { Icon, type IconName } from "@ome-labs/icons/native";
import type { ColorName } from "@ome-labs/tokens";
import { Pressable, type PressableProps } from "react-native";
import { createAnimatedComponent } from "react-native-reanimated";

import { usePressScale } from "../motion/press-scale.ts";
import { cn } from "../styling/class-names.ts";

const AnimatedPressable = createAnimatedComponent(Pressable);

export type IconButtonProps = Omit<PressableProps, "children" | "className"> & {
  icon: IconName;
  /** Required: an icon alone has no name for VoiceOver or TalkBack. */
  label: string;
  tone?: ColorName | undefined;
  className?: string | undefined;
};

/**
 * A 44 pt square around a 20 pt icon, so small icons still meet the touch target. It has no surface at rest, so the
 * press shows as a fill that sinks slightly under the finger.
 */
export function IconButton({
  icon,
  label,
  tone = "fg-muted",
  disabled,
  className,
  onPressIn,
  onPressOut,
  style,
  ...props
}: IconButtonProps) {
  const state = useMemo(() => ({ disabled: Boolean(disabled) }), [disabled]);
  const press = usePressScale(onPressIn, onPressOut);
  // A style function can't be merged with an animated style; such a button keeps its own style and skips the scale.
  const pressStyle = useMemo(
    () => (typeof style === "function" ? style : [press.style, style]),
    [press.style, style],
  );

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={state}
      disabled={disabled}
      className={cn("size-11 items-center justify-center rounded-md active:bg-selected", className)}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={pressStyle}
      {...props}
    >
      <Icon name={icon} size={20} tone={disabled ? "fg-disabled" : tone} />
    </AnimatedPressable>
  );
}
