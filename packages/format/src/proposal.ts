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

/** The one-line intent: "Transfer 250 OMET to dave (alias)", "Make 2 contract calls", "Cancel proposal 3eb2". */
export function proposalSummary(
  proposal: Pick<ProposalView, "intent" | "token">,
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

      return `Make ${count} contract ${count === 1 ? "call" : "calls"}`;
    }
    case "cancel": {
      return `Cancel proposal ${shortProposalId(intent.cancels)}`;
    }
  }
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
