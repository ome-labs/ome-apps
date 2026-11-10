import type { ProposalView } from "@ome-labs/api";

/** The filters the page offers; `needsMe` is the daemon's "Needs you". */
export type ProposalFilter = "needsMe" | "open" | "ready" | "done" | "all";

const OPEN = new Set(["collecting", "ready", "blocked"]);

const MATCHES: Record<ProposalFilter, (proposal: ProposalView) => boolean> = {
  needsMe: (p) => p.status === "collecting" && !p.approvedByMe && !p.rejectedByMe,
  open: (p) => OPEN.has(p.status),
  ready: (p) => p.status === "ready",
  done: (p) => !OPEN.has(p.status),
  all: () => true,
};

export const FILTERS: { id: ProposalFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "needsMe", label: "Needs you" },
  { id: "open", label: "Open" },
  { id: "ready", label: "Ready" },
  { id: "done", label: "Done" },
];

export function matching(proposals: ProposalView[], filter: ProposalFilter): ProposalView[] {
  return proposals.filter((proposal) => MATCHES[filter](proposal));
}
