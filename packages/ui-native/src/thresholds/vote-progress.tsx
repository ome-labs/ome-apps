import type { ProposalView } from "@ome-labs/api";
import { voteProgress } from "@ome-labs/format";
import { View } from "react-native";

import { Tag } from "../status/tag.tsx";
import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";

export type VoteProgressProps = {
  proposal: Pick<ProposalView, "approvals" | "rejections" | "threshold" | "members">;
  className?: string | undefined;
};

/** Page 32's vote progress: a segment per approval needed, the count, and rejections if any. */
export function VoteProgress({ proposal, className }: VoteProgressProps) {
  const progress = voteProgress(proposal);
  // Fixed segments: their position is their identity.
  const segments = Array.from({ length: progress.needed }, (_, position) => ({
    key: `approval-${position + 1}`,
    filled: position < progress.approvals,
  }));

  return (
    <View
      accessible
      accessibilityLabel={
        progress.rejections > 0
          ? `${progress.label}, ${progress.rejections} rejected`
          : progress.label
      }
      className={cn("flex-row items-center gap-2", className)}
    >
      <View className="flex-row gap-[3px]">
        {segments.map(({ key, filled }) => (
          <View
            key={key}
            className={cn("h-1.5 w-[18px] rounded-full", filled ? "bg-accent" : "bg-line")}
          />
        ))}
      </View>
      <Text className="type-label-s text-fg-muted">{progress.label}</Text>
      {progress.rejections > 0 ? (
        <Tag tone="danger">{`${progress.rejections} rejected`}</Tag>
      ) : null}
    </View>
  );
}
