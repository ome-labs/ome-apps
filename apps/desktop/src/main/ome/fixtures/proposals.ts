// The guide's three proposals: 3eb2 (executed payment to dave), 335c (Bob's, waiting for a second approval) and 868c
// (Carol's, blocked by two rejections).
import type { DecodedCall, Hex32, ProposalView, Review, Vote } from "@ome-labs/api";

import { ACCOUNTS, FEE_PAYER, OMET, PROPOSALS, TXS, VAULT, omet, sampleHex } from "./sample.ts";

const HOUR = 3600;

/** A private token transfer as the payload encodes it, followed by the fee payer's call (the vault never pays). */
function transferCalls(to: Hex32, whole: bigint): DecodedCall[] {
  return [
    { to: OMET.address, toLabel: "OMET", fn: "transfer", args: [to, omet(whole)], isStatic: false },
    {
      to: FEE_PAYER,
      toLabel: "SponsoredFPC",
      fn: "sponsor_unconditionally",
      args: [],
      isStatic: false,
    },
  ];
}

function vote(slot: number, name: string, reason: string | null = null): Vote {
  return { slot, index: slot + 1, name, valid: true, reason };
}

function base(id: Hex32, createdAt: number) {
  return {
    id,
    vault: VAULT,
    threshold: 2,
    members: 3,
    mySlot: 0,
    configVersion: 1,
    currentConfigVersion: 1,
    expiresAt: createdAt + 24 * HOUR,
    txNonce: sampleHex(`${id}.nonce`),
    outerHash: sampleHex(`${id}.outer-hash`),
    approvalMessage: sampleHex(`${id}.approval-message`),
    feeMethod: "external",
    token: OMET,
    cancelledBy: null,
  };
}

export function proposals(now: number): ProposalView[] {
  const auditAt = now - 90 * 60;
  const designAt = now - 30 * 60;
  const largeAt = now - 50 * 60;
  return [
    {
      ...base(PROPOSALS.design, designAt),
      intent: {
        kind: "transfer",
        token: OMET.address,
        to: ACCOUNTS.bob,
        amount: omet(40n),
        memo: "Design work, October",
      },
      proposer: { index: 2, name: "Bob" },
      status: "collecting",
      approvals: [vote(1, "Bob")],
      rejections: [],
      approvedByMe: false,
      rejectedByMe: false,
      calls: transferCalls(ACCOUNTS.bob, 40n),
      execution: null,
    },
    {
      ...base(PROPOSALS.large, largeAt),
      intent: {
        kind: "transfer",
        token: OMET.address,
        to: sampleHex("unknown.recipient"),
        amount: omet(900n),
        memo: null,
      },
      proposer: { index: 3, name: "Carol" },
      status: "blocked",
      approvals: [vote(2, "Carol")],
      rejections: [vote(0, "Alice", "Too large"), vote(1, "Bob")],
      approvedByMe: false,
      rejectedByMe: true,
      calls: transferCalls(sampleHex("unknown.recipient"), 900n),
      execution: null,
    },
    {
      ...base(PROPOSALS.audit, auditAt),
      intent: {
        kind: "transfer",
        token: OMET.address,
        to: ACCOUNTS.dave,
        amount: omet(250n),
        memo: "Audit deposit",
      },
      proposer: { index: 1, name: "Alice" },
      status: "executed",
      approvals: [vote(0, "Alice"), vote(1, "Bob")],
      rejections: [],
      approvedByMe: true,
      rejectedByMe: false,
      calls: transferCalls(ACCOUNTS.dave, 250n),
      execution: { txHash: TXS.auditExecuted, at: now - 60 * 60 },
    },
  ];
}

/** What `proposals.review` returns for a proposal: the checks pass, the recipient's label is an unverified alias. */
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
