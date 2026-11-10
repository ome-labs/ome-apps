import type { ReadingHealth } from "@ome-labs/format";
import { View } from "react-native";

import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";
import { toneClasses } from "../styling/tones.ts";

export type HealthMeterProps = {
  /** From `readingHealth` in `@ome-labs/format`. */
  health: ReadingHealth;
  className?: string | undefined;
};

/** Page 32's meter for "Can this vault still read?". */
export function HealthMeter({ health, className }: HealthMeterProps) {
  const tone = toneClasses[health.tone];
  // Fixed segments: their position is their identity.
  const segments = Array.from({ length: health.members }, (_, position) => ({
    key: `keeper-${position + 1}`,
    filled: position < health.answering,
  }));

  return (
    <View accessible accessibilityLabel={health.label} className={cn("gap-2", className)}>
      <View className="flex-row gap-1">
        {segments.map(({ key, filled }) => (
          <View key={key} className={cn("h-2 w-7 rounded-full", filled ? tone.dot : "bg-line")} />
        ))}
      </View>
      <Text className={cn("type-label-s", tone.text)}>{health.label}</Text>
    </View>
  );
}
