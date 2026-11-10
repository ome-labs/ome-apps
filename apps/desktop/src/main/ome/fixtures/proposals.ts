// The story's three proposals (`@ome-labs/format/sample`) as the daemon would serve them now: created a little while
// ago, with well-formed hashes and the calls the payload decodes to.
import type {
  DecodedCall,
  Effects,
  FeeEstimate,
  Hex32,
  ProposalView,
  Review,
  Simulation,
} from "@ome-labs/api";
import { proposals as story } from "@ome-labs/format/sample";

import type { FixtureContracts } from "./contracts.ts";
import { ACCOUNTS, FEE_PAYER, OMET, VAULT, sampleHex } from "./sample.ts";
import { privateBalance } from "./vault.ts";

const HOUR = 3600;

/** Minutes ago each proposal was made. */
const AGE = { auditDeposit: 90, designWork: 30, tooLarge: 50 } as const;

/** The fee payer's call, then a private OMET transfer from the vault, as the payload encodes it. */
export function transferCalls(
  contracts: FixtureContracts,
  to: Hex32,
  amount: string,
): DecodedCall[] {
  return [
    contracts.feeCall(),
    contracts.decode({
      to: OMET.address,
      fn: "transfer_in_private",
      args: [VAULT, to, amount, "0"],
    }),
  ];
}

/** What a transfer of `amount` OMET does to the vault's private balance. */
export function transferEffects(amount: string): Effects {
  const before = privateBalance(OMET.address) ?? 0n;
  return {
    balances: [
      {
        token: OMET,
        before: before.toString(),
        after: (before - BigInt(amount)).toString(),
        visibility: "private",
      },
    ],
    returns: [],
    notes: { created: 2, nullified: 1 },
    complete: true,
  };
}

/** A fee estimate at the sample node's minimum fees. */
export function feeEstimate(gas: { da: number; l2: number }): FeeEstimate {
  const fee = BigInt(gas.da + gas.l2) * 10_000_000_000n;
  return {
    gas,
    fee: fee.toString(),
    maxFee: ((fee * 3n) / 2n).toString(),
    payer: FEE_PAYER,
  };
}

/** One of the story's proposals, made `AGE` minutes before `now`. */
function served(contracts: FixtureContracts, name: keyof typeof AGE, now: number): ProposalView {
  const proposal = story[name];
  const made = now - AGE[name] * 60;

  return {
    ...proposal,
    createdAt: made,
    expiresAt: made + 24 * HOUR,
    votes: proposal.votes.map((vote, at) => ({ ...vote, at: made + at * 600 })),
    txNonce: sampleHex(`${proposal.id}.nonce`),
    outerHash: sampleHex(`${proposal.id}.outer-hash`),
    approvalMessage: sampleHex(`${proposal.id}.approval-message`),
    calls: transferCalls(contracts, proposal.intent.to, proposal.intent.amount),
  };
}

/** Two that are done, so the list has a history: one paid out yesterday, one left to expire last week. */
function finished(contracts: FixtureContracts, now: number): ProposalView[] {
  const paid = served(contracts, "auditDeposit", now - 26 * HOUR);
  const lapsed = served(contracts, "designWork", now - 7 * 24 * HOUR);
  return [
    {
      ...paid,
      id: sampleHex("proposal.hosting"),
      intent: {
        ...story.auditDeposit.intent,
        amount: "12000000000000000000",
        memo: "Hosting, October",
      },
      calls: transferCalls(contracts, story.auditDeposit.intent.to, "12000000000000000000"),
      status: "executed",
      votes: [
        {
          slot: 0,
          index: 1,
          name: "Alice",
          approve: true,
          valid: true,
          reason: null,
          at: paid.createdAt,
        },
        {
          slot: 2,
          index: 3,
          name: "Carol",
          approve: true,
          valid: true,
          reason: null,
          at: paid.createdAt + 1200,
        },
      ],
      execution: {
        txHash: sampleHex("proposal.hosting.tx"),
        at: now - 25 * HOUR,
        executor: { index: 3, name: "Carol" },
        block: 1_196,
      },
    },
    {
      ...lapsed,
      id: sampleHex("proposal.stickers"),
      intent: { ...story.designWork.intent, amount: "5000000000000000000", memo: "Stickers" },
      calls: transferCalls(contracts, story.designWork.intent.to, "5000000000000000000"),
      status: "expired",
    },
  ];
}

/** Newest first, as `proposals.list` returns them. */
export function proposals(contracts: FixtureContracts, now: number): ProposalView[] {
  return [
    ...(Object.keys(AGE) as (keyof typeof AGE)[]).map((name) => served(contracts, name, now)),
    ...finished(contracts, now),
  ].toSorted((a, b) => b.createdAt - a.createdAt);
}

/** The simulation a review shows: a transfer's effects, or the calls' gas alone. */
export function simulationOf(proposal: ProposalView): Simulation {
  const gas = { da: 1_536, l2: 412_000 };
  const effects =
    proposal.intent.kind === "transfer"
      ? transferEffects(proposal.intent.amount)
      : { balances: [], returns: [], notes: { created: 1, nullified: 1 }, complete: true };
  return { ok: true, gas, error: null, effects, fee: feeEstimate(gas) };
}

/** What `proposals.review` returns: the checks pass, and a known recipient is labelled by an unverified alias. */
export function review(proposal: ProposalView, simulation = simulationOf(proposal)): Review {
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
      : `${proposal.calls.length - 1} call(s)`,
    recipient: transfer
      ? { address: transfer.to, label, source: label ? "aztecWallet" : null }
      : null,
    change: null,
    simulation,
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
