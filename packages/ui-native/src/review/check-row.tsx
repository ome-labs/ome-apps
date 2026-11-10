import type { CheckState } from "@ome-labs/format";
import { Icon, type IconName } from "@ome-labs/icons/native";
import type { ColorName } from "@ome-labs/tokens";
import { View } from "react-native";

import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";

const marks: Record<CheckState, { icon: IconName; tone: ColorName; word: string }> = {
  pass: { icon: "check-circle", tone: "success", word: "Passed" },
  warning: { icon: "alert-triangle", tone: "warning", word: "Warning" },
  fail: { icon: "x-circle", tone: "danger", word: "Failed" },
};

export type CheckRowProps = {
  state: CheckState;
  label: string;
  className?: string | undefined;
};

/** Page 34's check: an icon for the result, then what was checked. */
export function CheckRow({ state, label, className }: CheckRowProps) {
  const mark = marks[state];

  return (
    <View
      accessible
      accessibilityLabel={`${mark.word}: ${label}`}
      className={cn("flex-row items-center gap-2.5 py-2", className)}
    >
      <Icon name={mark.icon} size={20} tone={mark.tone} />
      <Text className="flex-1 type-body-s">{label}</Text>
    </View>
  );
}
