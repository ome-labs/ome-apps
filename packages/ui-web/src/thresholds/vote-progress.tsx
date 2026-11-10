import type { ProposalView } from "@ome-labs/api";
import { voteProgress } from "@ome-labs/format";

import { Tag } from "../status/tag.tsx";
import { cn } from "../styling/class-names.ts";

export type VoteProgressProps = {
  proposal: Pick<ProposalView, "approvals" | "rejections" | "threshold" | "members">;
  className?: string | undefined;
};

/** Page 32's vote progress: one segment per approval needed, then the count, then rejections if any. */
export function VoteProgress({ proposal, className }: VoteProgressProps) {
  const progress = voteProgress(proposal);
  // Fixed segments: their position is their identity.
  const segments = Array.from({ length: progress.needed }, (_, position) => ({
    key: `approval-${position + 1}`,
    filled: position < progress.approvals,
  }));

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span aria-hidden className="flex gap-[3px]">
        {segments.map(({ key, filled }) => (
          <span
            key={key}
            className={cn(
              "h-1.5 w-[18px] rounded-full transition-colors duration-base ease-standard",
              // Empty slots are grooves; a vote fills one with a lit bead.
              filled
                ? "bg-accent bg-linear-to-b from-brand-white/25 to-brand-white/0"
                : "bg-line shadow-field",
            )}
          />
        ))}
      </span>
      <span className="type-label-s text-fg-muted whitespace-nowrap">{progress.label}</span>
      {progress.rejections > 0 ? <Tag tone="danger">{progress.rejections} rejected</Tag> : null}
    </span>
  );
}
