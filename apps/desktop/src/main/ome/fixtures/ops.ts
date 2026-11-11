// A second vault in the sample profile, Ops fund, so Home shows several vaults and a "needs you" across them: the
// same three members, USDC only, and one transfer Bob proposed that waits for Alice. Read-only: its pages show, and
// writes say so.
import type {
  DaemonParams,
  DaemonResult,
  Hex32,
  ProposalView,
  TokenBalance,
  VaultSummary,
} from "@ome-labs/api";
import { proposals as story } from "@ome-labs/format/sample";

import type { RendererMethod } from "../../../bridge/contract.ts";
import { OmeError } from "../client.ts";
import type { FixtureContracts } from "./contracts.ts";
import { review, transferCalls } from "./proposals.ts";
import { ACCOUNTS, USDC, sampleHex } from "./sample.ts";
import type { Scenario } from "./scenarios.ts";
import { peers, vaultDetails } from "./vault.ts";

export const OPS = sampleHex("ops.vault");

export function opsSummary(now: number): VaultSummary {
  return {
    address: OPS,
    name: "Ops fund",
    alias: "ops",
    isDefault: false,
    threshold: 2,
    viewingThreshold: 2,
    members: 3,
    myIndex: 1,
    foundedAt: now - 9 * 86_400,
    counts: { open: 1, ready: 0, needsMe: 1 },
  };
}

function opsProposal(contracts: FixtureContracts, now: number): ProposalView {
  const made = now - 3 * 3600;
  const id = sampleHex("ops.proposal.contractor");
  return {
    ...story.designWork,
    id,
    vault: OPS,
    intent: {
      kind: "transfer",
      token: USDC.address,
      to: ACCOUNTS.dave,
      amount: "300000000",
      memo: "Contractor, November",
    },
    proposer: { index: 2, name: "Bob" },
    status: "collecting",
    votes: [{ slot: 1, index: 2, name: "Bob", approve: true, valid: true, reason: null, at: made }],
    approvedByMe: false,
    rejectedByMe: false,
    createdAt: made,
    expiresAt: made + 72 * 3600,
    txNonce: sampleHex(`${id}.nonce`),
    outerHash: sampleHex(`${id}.outer-hash`),
    approvalMessage: sampleHex(`${id}.approval-message`),
    calls: [contracts.feeCall(), ...transferCalls(contracts, ACCOUNTS.dave, "300000000").slice(1)],
    token: USDC,
  };
}

export class FixtureOps {
  readonly #contracts: FixtureContracts;

  constructor(contracts: FixtureContracts) {
    this.#contracts = contracts;
  }

  /** Answers a call about Ops fund, or says the fixtures only show it. */
  call<M extends RendererMethod>(
    method: M,
    params: DaemonParams<M>,
    scenario: Scenario,
    now: number,
  ): DaemonResult<M> {
    const proposal = opsProposal(this.#contracts, now);
    const tokens: TokenBalance[] = [
      {
        token: USDC,
        private: { state: "known", amount: "4800000000" },
        public: { state: "known", amount: "0" },
      },
    ];
    const answers: Partial<Record<RendererMethod, () => unknown>> = {
      "vault.details": () => {
        const details = vaultDetails(scenario, now);
        return {
          ...details,
          summary: opsSummary(now),
          contract: { ...details.contract, address: OPS },
        };
      },
      "vault.peers": () => peers(scenario, now),
      "tokens.list": () => tokens,
      "proposals.list": () => {
        const filter = (params as DaemonParams<"proposals.list">).filter ?? "all";
        const shown = filter === "ready" || filter === "done" ? [] : [proposal];
        return { items: shown, next: null };
      },
      "proposals.get": () => proposal,
      "proposals.review": () => ({ ...review(proposal), vaultName: "Ops fund" }),
      "vault.activity": () => ({
        items: [{ kind: "proposal", at: proposal.createdAt, proposal }],
        next: null,
      }),
      "vault.counterparties": () => ({ items: [], next: null }),
      "vault.receiving": () => ({ handshakes: true, senders: 3, lastReceivedAt: null }),
      "membership.list": () => [],
    };
    const answer = answers[method];
    if (!answer)
      throw new OmeError(
        "failed",
        `The fixtures show Ops fund's pages but don't simulate ${method} on it.`,
      );
    return answer() as DaemonResult<M>;
  }
}

/** The vault a call is about, when its params name one. */
export function vaultOf(params: unknown): Hex32 | undefined {
  return typeof params === "object" && params !== null && "vault" in params
    ? ((params as { vault: unknown }).vault as Hex32)
    : undefined;
}
