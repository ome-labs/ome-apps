import { useEffect } from "react";

import { tokens } from "@ome-labs/tokens";
import { Root as SwitchRoot, Thumb as SwitchThumb } from "@rn-primitives/switch";
import { Pressable } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { cn } from "../styling/class-names.ts";
import { depth } from "../styling/depth.ts";
import { Text } from "../styling/text.tsx";

export type SwitchProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean | undefined;
  className?: string | undefined;
};

const travel = 20;
const easeInOut = Easing.bezier(...tokens.motion.easing.standard);

/**
 * Page 26's switch, in a 44 pt row with its label, for settings that apply at once. The thumb is a raised control
 * sliding in a sunken track; with Reduce Motion it moves without the slide.
 */
export function Switch({ label, checked, onCheckedChange, disabled, className }: SwitchProps) {
  const offset = useSharedValue(checked ? travel : 0);

  useEffect(() => {
    offset.set(
      withTiming(checked ? travel : 0, {
        duration: tokens.motion.duration.fast,
        easing: easeInOut,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [checked, offset]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));

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
          disabled ? "opacity-50" : depth.field,
        )}
      >
        <Animated.View style={thumb}>
          <SwitchThumb
            className={cn("size-6 rounded-full bg-brand-white", !disabled && depth.control)}
          />
        </Animated.View>
      </SwitchRoot>
    </Pressable>
  );
}
