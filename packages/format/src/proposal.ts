import type { ProposalView, Recipient } from "@ome-labs/api";

import { shortHex } from "./address.ts";
import { formatTokenAmount } from "./amount.ts";

/** `3eb2`: the first 4 hex digits, how members refer to a proposal in conversation and in the CLI. */
export function shortProposalId(id: string): string {
  return (id.startsWith("0x") ? id.slice(2) : id).slice(0, 4);
}

/** `accounts:dave` → `dave`. `aztec-wallet` aliases carry a kind prefix the member didn't type. */
export function aliasName(label: string): string {
  const colon = label.indexOf(":");

  return colon === -1 ? label : label.slice(colon + 1);
}

/** Who a transfer goes to, in a list row: `dave (alias)`, a member's name, or the short address. */
function recipientName(address: string, recipient?: Recipient | null): string {
  if (!recipient?.label) return shortHex(address);
  if (recipient.source === "aztecWallet") return `${aliasName(recipient.label)} (alias)`;

  return recipient.label;
}

/**
 * The one-line intent: "Transfer 250 OMET to dave (alias)", "Call swap on AMM", "Make 2 contract calls", "Cancel
 * proposal 3eb2". The decoded calls, when given, name a single call's contract.
 */
export function proposalSummary(
  proposal: Pick<ProposalView, "intent" | "token"> & Partial<Pick<ProposalView, "calls">>,
  recipient?: Recipient | null,
): string {
  const { intent, token } = proposal;

  switch (intent.kind) {
    case "transfer": {
      // A token this member hasn't added has no known decimals, so the base units are the only honest number.
      const amount = token
        ? formatTokenAmount(intent.amount, token)
        : `${intent.amount} base units of ${shortHex(intent.token)}`;

      return `Transfer ${amount} to ${recipientName(intent.to, recipient)}`;
    }
    case "calls": {
      const count = intent.calls.length;
      const [only] = intent.calls;
      // A membership change is a call on the vault itself; its memo says what changes.
      if (count === 1 && only?.fn === "rotate_membership") return "Change the vault's members";
      if (count === 1 && only) {
        const label = proposal.calls?.find((call) => call.to === only.to.toLowerCase())?.toLabel;
        return `Call ${only.fn} on ${label ?? shortHex(only.to)}`;
      }

      return `Make ${count} contract calls`;
    }
    case "cancel": {
      return `Cancel proposal ${shortProposalId(intent.cancels)}`;
    }
    case "setThreshold": {
      return `Require ${intent.threshold} ${intent.threshold === 1 ? "approval" : "approvals"} to spend`;
    }
    case "invalidatePending": {
      return "Invalidate every pending proposal";
    }
    case "app": {
      return `Transaction from ${intent.name ?? intent.origin}`;
    }
    case "unknown": {
      return "A proposal from a newer release of Ome";
    }
  }
}

/** The intent's memo, if it has one: a proposal from a newer release has none this release can read. */
export function proposalMemo(intent: ProposalView["intent"]): string | null {
  return intent.kind === "unknown" ? null : intent.memo;
}

export type MyVote = "approved" | "rejected" | "none";

export function myVote(proposal: Pick<ProposalView, "approvedByMe" | "rejectedByMe">): MyVote {
  if (proposal.approvedByMe) return "approved";

  return proposal.rejectedByMe ? "rejected" : "none";
}

/** "Needs you": still collecting and this member hasn't voted. */
export function needsMyVote(
  proposal: Pick<ProposalView, "status" | "approvedByMe" | "rejectedByMe">,
): boolean {
  return proposal.status === "collecting" && myVote(proposal) === "none";
}
