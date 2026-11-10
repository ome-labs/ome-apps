import { tokens } from "@ome-labs/tokens";
import type { GestureResponderEvent } from "react-native";
import {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const pressedScale = 0.97;
const easeOut = Easing.bezier(...tokens.motion.easing.emphasized);

type PressHandler = ((event: GestureResponderEvent) => void) | null | undefined;

/**
 * Press feedback for a pressable: it sinks to 97 % the moment a finger lands and settles back on release, on the UI
 * thread. Reduce Motion skips the scale; the pressed fill and inset shadow still show the press. The caller's own
 * `onPressIn` / `onPressOut` still run.
 */
export function usePressScale(onPressIn: PressHandler, onPressOut: PressHandler) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return {
    style,
    onPressIn: (event: GestureResponderEvent) => {
      scale.set(
        withTiming(pressedScale, {
          duration: 100,
          easing: easeOut,
          reduceMotion: ReduceMotion.System,
        }),
      );
      onPressIn?.(event);
    },
    onPressOut: (event: GestureResponderEvent) => {
      scale.set(
        withTiming(1, {
          duration: tokens.motion.duration.fast,
          easing: easeOut,
          reduceMotion: ReduceMotion.System,
        }),
      );
      onPressOut?.(event);
    },
  };
}
