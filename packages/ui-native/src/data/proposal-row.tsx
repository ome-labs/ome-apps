import type { ProposalView, Recipient } from "@ome-labs/api";
import { formatExpiry, myVote, proposalSummary, shortProposalId } from "@ome-labs/format";
import { Icon } from "@ome-labs/icons/native";
import { Pressable, View } from "react-native";

import { StatusBadge } from "../status/status-badge.tsx";
import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";
import { VoteProgress } from "../thresholds/vote-progress.tsx";

const voteWords = { approved: "You approved", rejected: "You rejected", none: null } as const;
const open = new Set(["collecting", "ready", "blocked"]);

export type ProposalRowProps = {
  proposal: ProposalView;
  recipient?: Recipient | null | undefined;
  /** Unix seconds, for the expiry. */
  now: number;
  onPress?: (() => void) | undefined;
  className?: string | undefined;
};

/** Page 38's proposal row, stacked for a phone: id and status, the intent, votes, expiry and my vote. */
export function ProposalRow({ proposal, recipient, now, onPress, className }: ProposalRowProps) {
  const vote = voteWords[myVote(proposal)];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Opens the proposal"
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-3 bg-surface px-4 py-3 active:bg-selected",
        className,
      )}
    >
      <View className="flex-1 gap-1.5">
        <View className="flex-row items-center gap-2">
          <Text className="type-mono-s text-fg-subtle">{shortProposalId(proposal.id)}</Text>
          <StatusBadge kind="proposal" status={proposal.status} />
        </View>
        <Text numberOfLines={2} className="type-label-m">
          {proposalSummary(proposal, recipient)}
        </Text>
        <Text className="type-caption text-fg-subtle">
          {[
            `from ${proposal.proposer.name}`,
            open.has(proposal.status) ? formatExpiry(proposal.expiresAt, now) : null,
            vote,
          ]
            .filter(Boolean)
            .join(" · ")}
        </Text>
        <VoteProgress proposal={proposal} />
      </View>
      <Icon name="chevron-right" size={20} tone="fg-subtle" />
    </Pressable>
  );
}
