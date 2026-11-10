import { useEffect } from "react";

import type { StepStatus } from "@ome-labs/api";
import { stepStatus } from "@ome-labs/format";
import { Icon, type IconName } from "@ome-labs/icons/native";
import { tokens } from "@ome-labs/tokens";
import { View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";
import { toneClasses } from "../styling/tones.ts";

const icons: Record<StepStatus, IconName> = {
  pending: "clock",
  active: "loader",
  done: "check",
  failed: "x",
};

export type StepRowProps = {
  status: StepStatus;
  label: string;
  detail?: string | undefined;
  /** Elapsed time, already formatted. The kit shows real time, never a percentage. */
  time?: string | undefined;
  className?: string | undefined;
};

/** Page 33's step: badge, the step and its detail, and its time. The active badge turns slowly. */
export function StepRow({ status, label, detail, time, className }: StepRowProps) {
  const display = stepStatus(status);
  const tone = toneClasses[display.tone];
  const turn = useSharedValue(0);

  useEffect(() => {
    if (status !== "active") return;

    // Reduce Motion stops the spin; the step list still says which step is running.
    turn.value = withRepeat(
      withTiming(360, {
        duration: tokens.motion.duration.scene * 2,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.System,
      }),
      -1,
    );
    return () => cancelAnimation(turn);
  }, [status, turn]);

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));

  return (
    <View
      accessible
      accessibilityLabel={[label, display.label, detail, time].filter(Boolean).join(", ")}
      className={cn("min-h-11 flex-row items-center gap-3 py-2.5", className)}
    >
      <View
        className={cn(
          "size-7 items-center justify-center rounded-full",
          tone.fill,
          // The running step is ringed in the accent; the others carry their tone's hairline.
          status === "active" ? "border border-accent" : tone.edge,
        )}
      >
        <Animated.View style={spin}>
          <Icon name={icons[status]} size={16} tone={display.tone} />
        </Animated.View>
      </View>
      <View className="flex-1 gap-0.5">
        <Text className={cn("type-label-m", status === "pending" && "text-fg-subtle")}>
          {label}
        </Text>
        {detail ? (
          <Text
            className={cn("type-caption", status === "failed" ? "text-danger" : "text-fg-subtle")}
          >
            {detail}
          </Text>
        ) : null}
      </View>
      <Text className="type-mono-s text-fg-subtle">
        {time ?? (status === "pending" ? "—" : "")}
      </Text>
    </View>
  );
}
