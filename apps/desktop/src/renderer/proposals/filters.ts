import type { ProposalStatus, ProposalView } from "@ome-labs/api";

export type ProposalFilter = "open" | "ready" | "done" | "all";

const MATCHES: Record<ProposalFilter, (status: ProposalStatus) => boolean> = {
  open: (status) => status === "collecting" || status === "ready" || status === "blocked",
  ready: (status) => status === "ready",
  done: (status) =>
    status === "executed" || status === "cancelled" || status === "expired" || status === "stale",
  all: () => true,
};

export const FILTERS: { id: ProposalFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "ready", label: "Ready" },
  { id: "done", label: "Done" },
];

export function matching(proposals: ProposalView[], filter: ProposalFilter): ProposalView[] {
  return proposals.filter((proposal) => MATCHES[filter](proposal.status));
}
