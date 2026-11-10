// The story's three proposals (`@ome-labs/format/sample`) as the daemon would serve them now: created a little while
// ago, with well-formed hashes and the calls the payload decodes to.
import type { DecodedCall, Hex32, ProposalView, Review } from "@ome-labs/api";
import { proposals as story } from "@ome-labs/format/sample";

import { ACCOUNTS, FEE_PAYER, OMET, sampleHex } from "./sample.ts";

const HOUR = 3600;

/** Minutes ago each proposal was made. */
const AGE = { auditDeposit: 90, designWork: 30, tooLarge: 50 } as const;

/** A private token transfer as the payload encodes it, followed by the fee payer's call (the vault never pays). */
function transferCalls(to: Hex32, amount: string): DecodedCall[] {
  return [
    { to: OMET.address, toLabel: "OMET", fn: "transfer", args: [to, amount], isStatic: false },
    {
      to: FEE_PAYER,
      toLabel: "SponsoredFPC",
      fn: "sponsor_unconditionally",
      args: [],
      isStatic: false,
    },
  ];
}

/** One of the story's proposals, made `AGE` minutes before `now`. */
function served(name: keyof typeof AGE, now: number): ProposalView {
  const proposal = story[name];
  const made = now - AGE[name] * 60;

  return {
    ...proposal,
    expiresAt: made + 24 * HOUR,
    txNonce: sampleHex(`${proposal.id}.nonce`),
    outerHash: sampleHex(`${proposal.id}.outer-hash`),
    approvalMessage: sampleHex(`${proposal.id}.approval-message`),
    calls: transferCalls(proposal.intent.to, proposal.intent.amount),
  };
}

/** Two that are done, so the list has a history: one paid out yesterday, one left to expire last week. */
function finished(now: number): ProposalView[] {
  const paid = served("auditDeposit", now - 26 * HOUR);
  const lapsed = served("designWork", now - 7 * 24 * HOUR);
  return [
    {
      ...paid,
      id: sampleHex("proposal.hosting"),
      intent: {
        ...story.auditDeposit.intent,
        amount: "12000000000000000000",
        memo: "Hosting, October",
      },
      calls: transferCalls(story.auditDeposit.intent.to, "12000000000000000000"),
      status: "executed",
      approvals: [
        { slot: 0, index: 1, name: "Alice", valid: true, reason: null },
        { slot: 2, index: 3, name: "Carol", valid: true, reason: null },
      ],
      execution: { txHash: sampleHex("proposal.hosting.tx"), at: now - 25 * HOUR },
    },
    {
      ...lapsed,
      id: sampleHex("proposal.stickers"),
      intent: { ...story.designWork.intent, amount: "5000000000000000000", memo: "Stickers" },
      calls: transferCalls(story.designWork.intent.to, "5000000000000000000"),
      status: "expired",
    },
  ];
}

/** Newest first, as `proposals.list` returns them. */
export function proposals(now: number): ProposalView[] {
  return [
    ...(Object.keys(AGE) as (keyof typeof AGE)[]).map((name) => served(name, now)),
    ...finished(now),
  ].toSorted((a, b) => b.expiresAt - a.expiresAt);
}

/** When a proposal was made: its expiry minus the default 24-hour window. */
export function createdAt(proposal: ProposalView): number {
  return proposal.expiresAt - 24 * HOUR;
}

/** What `proposals.review` returns: the checks pass, and a known recipient is labelled by an unverified alias. */
export function review(proposal: ProposalView): Review {
  const transfer = proposal.intent.kind === "transfer" ? proposal.intent : null;
  const label =
    transfer?.to === ACCOUNTS.bob ? "bob" : transfer?.to === ACCOUNTS.dave ? "dave" : null;

  return {
    proposal,
    vaultName: "Treasury",
    myName: "Alice",
    checks: {
      rebuilt: true,
      outerHash: proposal.outerHash,
      configCurrent: proposal.configVersion === proposal.currentConfigVersion,
      notExpired: proposal.status !== "expired",
      failure: null,
    },
    action: transfer
      ? `transfer ${transfer.amount} base units of OMET`
      : `${proposal.calls.length} call(s)`,
    recipient: transfer
      ? { address: transfer.to, label, source: label ? "aztecWallet" : null }
      : null,
    simulation: { ok: true, gas: { da: 1_536, l2: 412_000 }, error: null },
    signs: {
      message: proposal.approvalMessage,
      formula: 'Poseidon2("ome.approval.v0", [vault, outerHash, configVersion, expiresAt])',
    },
    rejects: {
      message: sampleHex(`${proposal.id}.rejection-message`),
      formula: 'Poseidon2("ome.rejection.v0", [vault, id_hi, id_lo])',
    },
  };
}
