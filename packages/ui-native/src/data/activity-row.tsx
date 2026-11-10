import type { ActivityEntry } from "@ome-labs/api";
import {
  formatCount,
  formatTokenAmount,
  proposalSummary,
  shortHex,
  shortProposalId,
  timeAgo,
} from "@ome-labs/format";
import { Icon } from "@ome-labs/icons/native";
import { View } from "react-native";

import { StatusBadge } from "../status/status-badge.tsx";
import { cn } from "../styling/class-names.ts";
import { discBevel } from "../styling/depth.ts";
import { Text } from "../styling/text.tsx";

export type ActivityRowProps = {
  entry: ActivityEntry;
  now: number;
  /** Names for senders this member knows (members' accounts), by lower-case address. */
  names?: Record<string, string> | undefined;
  className?: string | undefined;
};

/** Page 38's activity: transfers this member's daemon decrypted, and proposals. */
export function ActivityRow({ entry, now, names, className }: ActivityRowProps) {
  const received = entry.kind === "received";
  const sender = received ? names?.[entry.from.toLowerCase()] : undefined;
  const line = received
    ? `Received ${formatTokenAmount(entry.amount, entry.token)} from ${shortHex(entry.from)}${sender ? ` (${sender})` : ""}`
    : `${proposalSummary(entry.proposal)} · ${shortProposalId(entry.proposal.id)}`;

  return (
    <View className={cn("min-h-11 flex-row items-center gap-3 px-4 py-3", className)}>
      <View
        style={discBevel}
        className={cn(
          "size-8 items-center justify-center rounded-full",
          received ? "bg-success-subtle" : "bg-accent-subtle",
        )}
      >
        <Icon
          name={received ? "receive" : "send"}
          size={16}
          tone={received ? "success" : "accent-fg"}
        />
      </View>
      <View className="flex-1 gap-1">
        <Text className="type-body-s">{line}</Text>
        <Text className="type-caption text-fg-subtle">
          {received
            ? `${timeAgo(entry.at, now)} · block ${formatCount(entry.block)}`
            : timeAgo(entry.at, now)}
        </Text>
      </View>
      {received ? null : <StatusBadge kind="proposal" status={entry.proposal.status} />}
    </View>
  );
}
