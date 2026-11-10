import type { MemberReachability, ProposalStatus, ServiceStatus, StepStatus } from "@ome-labs/api";

import type { Tone } from "./tone.ts";

export type StatusDisplay = {
  label: string;
  /** What it means, in the guide's words, for a tooltip or a legend. */
  meaning: string;
  tone: Tone;
};

// Tones follow the kit's pills (Figma page 31): collecting is amber because it waits on people.
const proposal: Record<ProposalStatus, StatusDisplay> = {
  collecting: { label: "Collecting", meaning: "Gathering approvals", tone: "warning" },
  ready: { label: "Ready", meaning: "Enough approvals; any member can execute", tone: "info" },
  blocked: { label: "Blocked", meaning: "Enough rejections; can't pass", tone: "danger" },
  executed: { label: "Executed", meaning: "Done; has a transaction", tone: "success" },
  cancelled: { label: "Cancelled", meaning: "A cancel proposal spent its nonce", tone: "neutral" },
  expired: { label: "Expired", meaning: "Past its expiry", tone: "neutral" },
  stale: {
    label: "Stale",
    meaning: "Made under an older vault config (members changed)",
    tone: "neutral",
  },
};

const service: Record<ServiceStatus, StatusDisplay> = {
  stopped: { label: "Stopped", meaning: "Not running", tone: "neutral" },
  starting: { label: "Starting", meaning: "Starting up", tone: "info" },
  running: { label: "Running", meaning: "Running", tone: "success" },
  restarting: { label: "Restarting", meaning: "Restarting after a failure", tone: "warning" },
  failed: { label: "Failed", meaning: "Stopped with an error", tone: "danger" },
};

const step: Record<StepStatus, StatusDisplay> = {
  pending: { label: "Pending", meaning: "Not started", tone: "neutral" },
  active: { label: "Active", meaning: "In progress", tone: "info" },
  done: { label: "Done", meaning: "Finished", tone: "success" },
  failed: { label: "Failed", meaning: "Stopped with an error", tone: "danger" },
};

export type Connection = "connected" | "relayed" | "offline";

const connection: Record<Connection, StatusDisplay> = {
  connected: { label: "Connected", meaning: "Reached directly", tone: "success" },
  relayed: { label: "Through relay", meaning: "Reached only through a relay server", tone: "info" },
  offline: { label: "Offline", meaning: "Not reachable now", tone: "neutral" },
};

export const proposalStatuses = Object.keys(proposal) as ProposalStatus[];

export function proposalStatus(status: ProposalStatus): StatusDisplay {
  return proposal[status];
}

/** The keeper's and the daemon's service states. */
export function serviceStatus(status: ServiceStatus): StatusDisplay {
  return service[status];
}

/** A founding or membership-change step. */
export function stepStatus(status: StepStatus): StatusDisplay {
  return step[status];
}

/** How this member reaches another member's keeper. */
export function connectionOf(
  member: Pick<MemberReachability, "connected" | "relayed">,
): Connection {
  if (!member.connected) return "offline";

  return member.relayed ? "relayed" : "connected";
}

export function connectionStatus(state: Connection): StatusDisplay {
  return connection[state];
}
