import { useMemo } from "react";

import { Icon, type IconName } from "@ome-labs/icons/native";
import type { ColorName } from "@ome-labs/tokens";
import { Pressable, type PressableProps } from "react-native";

import { cn } from "../styling/class-names.ts";

export type IconButtonProps = Omit<PressableProps, "children" | "className"> & {
  icon: IconName;
  /** Required: an icon alone has no name for VoiceOver or TalkBack. */
  label: string;
  tone?: ColorName | undefined;
  className?: string | undefined;
};

/** A 44 pt square around a 20 pt icon, so small icons still meet the touch target. */
export function IconButton({
  icon,
  label,
  tone = "fg-muted",
  disabled,
  className,
  ...props
}: IconButtonProps) {
  const state = useMemo(() => ({ disabled: Boolean(disabled) }), [disabled]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={state}
      disabled={disabled}
      className={cn("size-11 items-center justify-center rounded-md active:bg-selected", className)}
      {...props}
    >
      <Icon name={icon} size={20} tone={disabled ? "fg-disabled" : tone} />
    </Pressable>
  );
}
