// The proposals as they change in a session: votes, an execution that walks its phases, and cancels. The sample
// member is Alice in slot 0; her votes need the signer unlocked, as the daemon's do.
import type { DaemonEvent, ExecutionPhase, Hex32, ProposalView, Review } from "@ome-labs/api";

import { OmeError } from "../client.ts";
import { proposals, review } from "./proposals.ts";
import { VAULT, sampleHex } from "./sample.ts";

const ME = { slot: 0, index: 1, name: "Alice", valid: true, reason: null };
const OPEN = new Set(["collecting", "ready", "blocked"]);
const PHASES: ExecutionPhase[] = ["rebuilding", "proving", "sending", "mined"];
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => Math.floor(Date.now() / 1000);

/** Where a proposal stands once its votes change. */
function settle(proposal: ProposalView): ProposalView {
  if (!OPEN.has(proposal.status)) return proposal;
  const approvals = proposal.approvals.length;
  const left = proposal.members - proposal.rejections.length;
  const status =
    approvals >= proposal.threshold
      ? "ready"
      : left < proposal.threshold
        ? "blocked"
        : "collecting";
  return { ...proposal, status };
}

export class FixtureProposals {
  #list: ProposalView[] = proposals(now());
  readonly #emit: (event: DaemonEvent) => void;
  readonly #unlocked: () => boolean;

  constructor(emit: (event: DaemonEvent) => void, unlocked: () => boolean) {
    this.#emit = emit;
    this.#unlocked = unlocked;
  }

  list(): ProposalView[] {
    return this.#list;
  }

  get(id: Hex32): ProposalView {
    const found = this.#list.find((proposal) => proposal.id === id);
    if (!found) throw new OmeError("not-found", "No such proposal.");
    return found;
  }

  review(id: Hex32): Review {
    return review(this.get(id));
  }

  approve(id: Hex32): ProposalView {
    const proposal = this.#open(id);
    this.#signer();
    if (proposal.approvedByMe) return proposal;
    return this.#set(
      settle({
        ...proposal,
        approvals: [...proposal.approvals, ME].toSorted((a, b) => a.slot - b.slot),
        rejections: proposal.rejections.filter((vote) => vote.slot !== ME.slot),
        approvedByMe: true,
        rejectedByMe: false,
      }),
    );
  }

  reject(id: Hex32, reason: string | undefined): ProposalView {
    const proposal = this.#open(id);
    this.#signer();
    if (proposal.approvedByMe) {
      throw new OmeError("invalid", "You approved this proposal; an approval can't be taken back.");
    }
    if (proposal.rejectedByMe) return proposal;
    return this.#set(
      settle({
        ...proposal,
        rejections: [...proposal.rejections, { ...ME, reason: reason?.trim() || null }],
        rejectedByMe: true,
      }),
    );
  }

  /** Starts the execution and answers at once; its phases arrive as `execution` events, as the daemon's do. */
  execute(id: Hex32): ProposalView {
    const proposal = this.get(id);
    if (proposal.status !== "ready") {
      throw new OmeError("invalid", "Only a proposal with enough approvals can be executed.");
    }
    void this.#run(id);
    return proposal;
  }

  /** A cancel is a proposal of its own, that the members approve like any other. */
  cancel(id: Hex32): ProposalView {
    const target = this.#open(id);
    this.#signer();
    if (target.cancelledBy) return this.get(target.cancelledBy);
    const made = now();
    const cancel: ProposalView = settle({
      ...target,
      id: sampleHex(`cancel:${id}`),
      intent: { kind: "cancel", cancels: id, memo: null },
      proposer: { index: ME.index, name: ME.name },
      status: "collecting",
      approvals: [ME],
      rejections: [],
      approvedByMe: true,
      rejectedByMe: false,
      expiresAt: made + 24 * 3600,
      calls: [],
      token: null,
      execution: null,
      cancelledBy: id,
    });
    this.#list = [
      cancel,
      ...this.#list.map((p) => (p.id === id ? { ...p, cancelledBy: cancel.id } : p)),
    ];
    this.#changed();
    return cancel;
  }

  /** Reports phase `index` and the ones after it, then marks the proposal executed. */
  async #run(id: Hex32, index = 0): Promise<void> {
    const txHash = sampleHex(`${id}.tx`);
    const phase = PHASES[index];
    if (phase) {
      this.#emit({
        type: "execution",
        execution: {
          vault: VAULT,
          proposal: id,
          phase,
          error: null,
          txHash: phase === "sending" || phase === "mined" ? txHash : null,
        },
      });
      if (phase !== "mined") await wait(phase === "proving" ? 2400 : 900);
      return this.#run(id, index + 1);
    }
    const proposal = this.get(id);
    this.#set({
      ...proposal,
      status: "executed",
      execution: { txHash, at: now() },
    });
  }

  #open(id: Hex32): ProposalView {
    const proposal = this.get(id);
    if (!OPEN.has(proposal.status)) throw new OmeError("invalid", "This proposal is closed.");
    return proposal;
  }

  #signer(): void {
    if (!this.#unlocked()) throw new OmeError("locked", "The signer is locked.");
  }

  #set(next: ProposalView): ProposalView {
    this.#list = this.#list.map((proposal) => (proposal.id === next.id ? next : proposal));
    this.#changed();
    return next;
  }

  #changed(): void {
    this.#emit({ type: "vaultActivity", vault: VAULT });
  }
}
