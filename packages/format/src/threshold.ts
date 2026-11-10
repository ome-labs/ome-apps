import type { ProposalView } from "@ome-labs/api";

/** "2 of 3 approvals": the spending threshold, in the CLI's words. */
export function approvalsLabel(threshold: number, members: number): string {
  return `${threshold} of ${members} approvals`;
}

/** "2 of 3 to read": the viewing threshold. */
export function toReadLabel(viewingThreshold: number, members: number): string {
  return `${viewingThreshold} of ${members} to read`;
}

export type VoteProgress = {
  approvals: number;
  needed: number;
  rejections: number;
  /** Rejections that block it: once fewer than `needed` members are left who could approve. */
  rejectionsToBlock: number;
  /** "1 of 2 approvals". */
  label: string;
};

/** How far a proposal is from passing, and from being blocked. */
export function voteProgress(
  proposal: Pick<ProposalView, "approvals" | "rejections" | "threshold" | "members">,
): VoteProgress {
  const approvals = proposal.approvals.filter((vote) => vote.valid).length;
  const rejections = proposal.rejections.filter((vote) => vote.valid).length;

  return {
    approvals,
    needed: proposal.threshold,
    rejections,
    rejectionsToBlock: proposal.members - proposal.threshold + 1,
    label: approvalsLabel(approvals, proposal.threshold),
  };
}
