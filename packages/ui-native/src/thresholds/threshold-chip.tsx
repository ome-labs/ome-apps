import { approvalsLabel, toReadLabel } from "@ome-labs/format";
import { Icon } from "@ome-labs/icons/native";
import { View } from "react-native";

import { cn } from "../styling/class-names.ts";
import { depth } from "../styling/depth.ts";
import { Text } from "../styling/text.tsx";

export type ThresholdChipProps = {
  kind: "spend" | "read";
  threshold: number;
  members: number;
  className?: string | undefined;
};

/** Page 32's chip: "2 of 3 approvals" with a signature, "2 of 3 to read" with an eye. */
export function ThresholdChip({ kind, threshold, members, className }: ThresholdChipProps) {
  return (
    <View
      className={cn(
        "flex-row items-center gap-1.5 self-start rounded-full bg-surface py-1 pr-2.5 pl-2",
        depth.card,
        className,
      )}
    >
      <Icon name={kind === "spend" ? "signature" : "eye"} size={16} tone="accent-fg" />
      <Text className="type-label-s">
        {kind === "spend" ? approvalsLabel(threshold, members) : toReadLabel(threshold, members)}
      </Text>
    </View>
  );
}
