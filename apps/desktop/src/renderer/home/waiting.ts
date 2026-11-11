// What waits on this member across every vault: proposals still collecting that they haven't voted on, and proposals
// ready for anyone to execute, each once, soonest to expire first, with the vault it belongs to.
import type { ProposalView, VaultSummary } from "@ome-labs/api";

export type Waiting = { vault: Pick<VaultSummary, "address" | "name">; proposal: ProposalView };

export function waitingAcross(
  vaults: readonly Pick<VaultSummary, "address" | "name">[],
  lists: readonly (readonly ProposalView[] | undefined)[],
): Waiting[] {
  const seen = new Set<string>();
  const waiting: Waiting[] = [];
  for (const [at, vault] of vaults.entries()) {
    for (const proposal of lists[at] ?? []) {
      const key = `${vault.address}:${proposal.id}`;
      const waits =
        proposal.status === "ready" ||
        (proposal.status === "collecting" && !proposal.approvedByMe && !proposal.rejectedByMe);
      if (!waits || seen.has(key)) continue;
      seen.add(key);
      waiting.push({ vault, proposal });
    }
  }
  return waiting.toSorted((a, b) => a.proposal.expiresAt - b.proposal.expiresAt);
}
