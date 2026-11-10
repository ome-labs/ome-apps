import { useEffect } from "react";

import { tokens } from "@ome-labs/tokens";
import { Root as SwitchRoot, Thumb as SwitchThumb } from "@rn-primitives/switch";
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";

export type SwitchProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean | undefined;
  className?: string | undefined;
};

const travel = 20;

/** Page 26's switch, in a 44 pt row with its label, for settings that apply at once. */
export function Switch({ label, checked, onCheckedChange, disabled, className }: SwitchProps) {
  const offset = useSharedValue(checked ? travel : 0);

  useEffect(() => {
    offset.value = withTiming(checked ? travel : 0, { duration: tokens.motion.duration.fast });
  }, [checked, offset]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <Pressable
      accessible={false}
      disabled={disabled}
      onPress={() => onCheckedChange(!checked)}
      className={cn("min-h-11 flex-row items-center justify-between gap-3", className)}
    >
      <Text className={cn("flex-1", disabled && "text-fg-disabled")}>{label}</Text>
      <SwitchRoot
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled ?? false}
        accessibilityLabel={label}
        className={cn(
          "h-7 w-12 justify-center rounded-full p-0.5",
          checked ? "bg-accent" : "bg-line-strong",
          disabled && "opacity-50",
        )}
      >
        <Animated.View style={thumb}>
          <SwitchThumb className="size-6 rounded-full bg-brand-white shadow-1" />
        </Animated.View>
      </SwitchRoot>
    </Pressable>
  );
}
