import type { Tone } from "@ome-labs/format";
import { View } from "react-native";

import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";
import { toneClasses } from "../styling/tones.ts";

export type TagProps = {
  tone?: Tone | "accent" | undefined;
  children: string;
  className?: string | undefined;
};

/** Page 29's tag: "You", "2 rejected", "alias, unverified". */
export function Tag({ tone = "neutral", children, className }: TagProps) {
  const colours = toneClasses[tone];

  return (
    <View className={cn("self-start rounded-xs px-1.5 py-0.5", colours.fill, className)}>
      <Text className={cn("type-label-s", colours.text)}>{children}</Text>
    </View>
  );
}
