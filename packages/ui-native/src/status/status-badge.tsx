import type { ProposalStatus, ServiceStatus, StepStatus } from "@ome-labs/api";
import {
  connectionStatus,
  proposalStatus,
  serviceStatus,
  stepStatus,
  type Connection,
} from "@ome-labs/format";
import { View } from "react-native";

import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";
import { toneClasses } from "../styling/tones.ts";

export type StatusBadgeProps = (
  | { kind: "proposal"; status: ProposalStatus }
  | { kind: "service"; status: ServiceStatus }
  | { kind: "step"; status: StepStatus }
  | { kind: "connection"; status: Connection }
) & { className?: string | undefined };

/** Page 29's pill, from the daemon's status, worded and coloured as on the desktop. */
export function StatusBadge(props: StatusBadgeProps) {
  const display = describe(props);
  const tone = toneClasses[display.tone];

  return (
    <View
      accessible
      accessibilityLabel={`${display.label}: ${display.meaning}`}
      className={cn(
        // Padding is 1 pt short of the 4/10/8 grid to make room for the tone's edge.
        "flex-row items-center gap-1.5 self-start rounded-full py-[3px] pr-[9px] pl-[7px]",
        tone.fill,
        tone.edge,
        props.className,
      )}
    >
      <View className={cn("size-1.5 rounded-full", tone.dot)} />
      <Text className={cn("type-label-s", tone.text)}>{display.label}</Text>
    </View>
  );
}

function describe(props: StatusBadgeProps) {
  switch (props.kind) {
    case "proposal": {
      return proposalStatus(props.status);
    }
    case "service": {
      return serviceStatus(props.status);
    }
    case "step": {
      return stepStatus(props.status);
    }
    case "connection": {
      return connectionStatus(props.status);
    }
  }
}
