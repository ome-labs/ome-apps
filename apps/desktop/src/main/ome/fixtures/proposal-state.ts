// The proposals as they change in a session: votes, an execution that walks its phases, and cancels. The sample
// member is Alice in slot 0; her votes need the signer unlocked, as the daemon's do. Previews simulate transfers and
// contract calls the way the daemon reports them: effects, a fee estimate, or a typed failure.
import type {
  AbiValue,
  DaemonEvent,
  DecodedAuthwit,
  DecodedCall,
  Effects,
  ExecutionPhase,
  Hex32,
  Intent,
  IntentCall,
  ProposalFilter,
  ProposalPage,
  ProposalPreview,
  ProposalView,
  ProposeParams,
  Review,
  SimulationError,
  Vote,
} from "@ome-labs/api";

import { OmeError } from "../client.ts";
import type { FixtureContracts } from "./contracts.ts";
import { feeEstimate, proposals, review, transferCalls, transferEffects } from "./proposals.ts";
import { AMM, OMET, USDC, VAULT, sampleHex } from "./sample.ts";
import { privateBalance } from "./vault.ts";

const ME = { slot: 0, index: 1, name: "Alice" };
const OPEN = new Set(["collecting", "ready", "blocked"]);
const PHASES: ExecutionPhase[] = ["rebuilding", "proving", "sending", "mined"];
/** The daemon's limits (`daemon.info.limits`). */
const MAX_CALLS = 4;
const MAX_AUTHWITS = 4;
const MAX_SUMMARY_BYTES = 4096;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => Math.floor(Date.now() / 1000);

const vote = (approve: boolean, reason: string | null = null): Vote => ({
  ...ME,
  approve,
  valid: true,
  reason,
  at: now(),
});

/** Where a proposal stands once its votes change. */
function settle(proposal: ProposalView): ProposalView {
  if (!OPEN.has(proposal.status)) return proposal;
  const approvals = proposal.votes.filter((v) => v.approve).length;
  const left = proposal.members - proposal.votes.filter((v) => !v.approve).length;
  const status =
    approvals >= proposal.threshold
      ? "ready"
      : left < proposal.threshold
        ? "blocked"
        : "collecting";
  return { ...proposal, status };
}

function matches(proposal: ProposalView, filter: ProposalFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "open":
      return OPEN.has(proposal.status);
    case "ready":
      return proposal.status === "ready";
    case "done":
      return !OPEN.has(proposal.status);
    case "needsMe":
      return proposal.status === "collecting" && !proposal.approvedByMe && !proposal.rejectedByMe;
  }
}

const add = (map: Map<Hex32, bigint>, token: Hex32, amount: bigint) =>
  map.set(token, (map.get(token) ?? 0n) + amount);
const text = (value: AbiValue | undefined) => (typeof value === "string" ? value : "0");

const failed = (failure: SimulationError["failure"], message: string): SimulationError => ({
  failure,
  message,
});

export class FixtureProposals {
  #list: ProposalView[];
  readonly #contracts: FixtureContracts;
  readonly #emit: (event: DaemonEvent) => void;
  readonly #unlocked: () => boolean;

  constructor(
    contracts: FixtureContracts,
    emit: (event: DaemonEvent) => void,
    unlocked: () => boolean,
  ) {
    this.#contracts = contracts;
    this.#list = proposals(contracts, now());
    this.#emit = emit;
    this.#unlocked = unlocked;
  }

  all(): ProposalView[] {
    return this.#list;
  }

  list(filter: ProposalFilter = "all", limit = 50): ProposalPage {
    return { items: this.#list.filter((p) => matches(p, filter)).slice(0, limit), next: null };
  }

  get(id: Hex32): ProposalView {
    const found = this.#list.find((proposal) => proposal.id === id);
    if (!found) throw new OmeError("not-found", "No such proposal.");
    return found;
  }

  review(id: Hex32): Review {
    const proposal = this.get(id);
    if (proposal.intent.kind !== "calls") return review(proposal);
    const { error, effects, gas } = this.#simulateCalls(proposal.intent.calls, proposal.authwits);
    return review(proposal, {
      ok: error === null,
      gas,
      error,
      effects,
      fee: gas ? feeEstimate(gas) : null,
    });
  }

  /** A dry run, as `proposals.preview` answers it. Invalid input throws, as the daemon's does. */
  preview(intent: Intent): ProposalPreview {
    const fee = this.#contracts.feeCall();
    switch (intent.kind) {
      case "transfer": {
        const calls = transferCalls(this.#contracts, intent.to, intent.amount);
        const held = privateBalance(intent.token);
        if (held === null) {
          return this.#failed(
            calls,
            [],
            failed(
              { kind: "insufficientBalance", token: null, contract: intent.token },
              "the vault holds none of this token",
            ),
          );
        }
        if (BigInt(intent.amount) > held) {
          return this.#failed(
            calls,
            [],
            failed(
              { kind: "insufficientBalance", token: OMET, contract: intent.token },
              "Assertion failed: Balance too low 'subtracted > 0'",
            ),
          );
        }
        const gas = { da: 1_536, l2: 412_000 };
        return {
          ok: true,
          calls,
          authwits: [],
          gas,
          error: null,
          effects: transferEffects(intent.amount),
          fee: feeEstimate(gas),
        };
      }
      case "calls": {
        if (intent.calls.length < 1 || intent.calls.length > MAX_CALLS)
          throw new OmeError("invalid", `a proposal makes 1 to ${MAX_CALLS} calls besides its fee`);
        if ((intent.authwits ?? []).length > MAX_AUTHWITS)
          throw new OmeError("invalid", `a proposal grants at most ${MAX_AUTHWITS} authwits`);
        const calls = [fee, ...intent.calls.map((call) => this.#contracts.decode(call))];
        const authwits = (intent.authwits ?? []).map((authwit) => this.#authwit(authwit));
        const { error, effects, gas } = this.#simulateCalls(intent.calls, authwits);
        if (error) return this.#failed(calls, authwits, error);
        return {
          ok: true,
          calls,
          authwits,
          gas,
          error: null,
          effects,
          fee: gas ? feeEstimate(gas) : null,
        };
      }
      case "setThreshold":
      case "invalidatePending":
      case "cancel": {
        const gas = { da: 1_024, l2: 280_000 };
        return {
          ok: true,
          calls: [fee],
          authwits: [],
          gas,
          error: null,
          effects: {
            balances: [],
            returns: [],
            notes: { created: 1, nullified: 1 },
            complete: true,
          },
          fee: feeEstimate(gas),
        };
      }
      case "app":
        throw new OmeError("invalid", "an app's transaction is proposed through its connection");
      case "unknown":
        throw new OmeError("invalid", "unknown intent");
    }
  }

  /** A new proposal, with the proposer's approval already on it. */
  create({ intent, expiresInHours }: ProposeParams): ProposalView {
    this.#signer();
    const summary = new TextEncoder().encode(JSON.stringify(intent)).length;
    if (summary > MAX_SUMMARY_BYTES)
      throw new OmeError(
        "invalid",
        `the proposal's description is ${summary} bytes; a proposal carries at most ${MAX_SUMMARY_BYTES}`,
      );
    const preview = this.preview(intent);
    if (!preview.ok)
      throw new OmeError("failed", preview.error?.message ?? "The simulation failed.");
    const template = this.#list[0] as ProposalView;
    const made = now();
    const id = sampleHex(`proposal:${made}:${JSON.stringify(intent)}`);
    const proposal: ProposalView = settle({
      ...template,
      id,
      intent,
      proposer: { index: ME.index, name: ME.name },
      status: "collecting",
      votes: [vote(true)],
      approvedByMe: true,
      rejectedByMe: false,
      createdAt: made,
      expiresAt: made + expiresInHours * 3600,
      txNonce: sampleHex(`${id}.nonce`),
      outerHash: sampleHex(`${id}.outer-hash`),
      approvalMessage: sampleHex(`${id}.approval-message`),
      calls: preview.calls,
      authwits: preview.authwits,
      token: intent.kind === "transfer" && intent.token === OMET.address ? OMET : null,
      execution: null,
      executing: null,
      cancelledBy: null,
    });
    this.#list = [proposal, ...this.#list];
    this.#emit({
      type: "proposalCreated",
      vault: VAULT,
      proposal: id,
      summary: JSON.stringify(intent),
      by: { index: ME.index, name: ME.name },
    });
    this.#changed();
    return proposal;
  }

  approve(id: Hex32): ProposalView {
    const proposal = this.#open(id);
    this.#signer();
    if (proposal.approvedByMe) return proposal;
    return this.#voted(
      settle({
        ...proposal,
        votes: [...proposal.votes.filter((v) => v.slot !== ME.slot), vote(true)].toSorted(
          (a, b) => a.slot - b.slot,
        ),
        approvedByMe: true,
        rejectedByMe: false,
      }),
      true,
      null,
    );
  }

  reject(id: Hex32, reason: string | undefined): ProposalView {
    const proposal = this.#open(id);
    this.#signer();
    if (proposal.approvedByMe) {
      throw new OmeError("invalid", "You approved this proposal; an approval can't be taken back.");
    }
    if (proposal.rejectedByMe) return proposal;
    const why = reason?.trim() || null;
    return this.#voted(
      settle({
        ...proposal,
        votes: [...proposal.votes, vote(false, why)].toSorted((a, b) => a.slot - b.slot),
        rejectedByMe: true,
      }),
      false,
      why,
    );
  }

  /** Starts the execution and answers at once; its phases arrive as `execution` events, as the daemon's do. */
  execute(id: Hex32): ProposalView {
    const proposal = this.get(id);
    if (proposal.status !== "ready") {
      throw new OmeError("invalid", "Only a proposal with enough approvals can be executed.");
    }
    if (proposal.executing) return proposal;
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
      votes: [vote(true)],
      approvedByMe: true,
      rejectedByMe: false,
      createdAt: made,
      expiresAt: made + 24 * 3600,
      calls: [this.#contracts.feeCall()],
      authwits: [],
      token: null,
      execution: null,
      executing: null,
      cancelledBy: id,
    });
    this.#list = [
      cancel,
      ...this.#list.map((p) => (p.id === id ? { ...p, cancelledBy: cancel.id } : p)),
    ];
    this.#changed();
    return cancel;
  }

  /**
   * The simulation of contract calls on the sample state: OMET and USDC transfers spend the vault's balance, and an
   * AMM swap needs an authwit for the AMM to pull `amount_in` of `token_in` from the vault.
   */
  #simulateCalls(
    calls: IntentCall[],
    authwits: DecodedAuthwit[],
  ): {
    error: SimulationError | null;
    effects: Effects | null;
    gas: { da: number; l2: number } | null;
  } {
    const spent = new Map<Hex32, bigint>();
    const gained = new Map<Hex32, bigint>();
    const used = new Set<number>();

    for (const call of calls) {
      const to = call.to.toLowerCase() as Hex32;
      if ((to === OMET.address || to === USDC.address) && call.fn !== "transfer_to_private") {
        if (text(call.args[0]).toLowerCase() === VAULT) add(spent, to, BigInt(text(call.args[2])));
      }
      if (to === AMM && call.fn.startsWith("swap_")) {
        const tokenIn = text(call.args[0]).toLowerCase() as Hex32;
        const tokenOut = text(call.args[1]).toLowerCase() as Hex32;
        const exactIn = call.fn === "swap_exact_tokens_for_tokens";
        const amountIn = BigInt(text(call.args[exactIn ? 2 : 3]));
        const amountOut = BigInt(text(call.args[exactIn ? 3 : 2]));
        const nonce = text(call.args[4]);
        const authwit = authwits.findIndex(
          (a) =>
            a.caller === AMM &&
            a.call.to === tokenIn &&
            a.call.fn === "transfer_to_public" &&
            String(a.call.args[0]?.value).toLowerCase() === VAULT &&
            BigInt(String(a.call.args[2]?.value ?? "0")) >= amountIn &&
            String(a.call.args[3]?.value) === nonce,
        );
        if (authwit === -1) {
          return {
            error: failed(
              { kind: "authwitRequired", contract: tokenIn },
              `Unknown auth witness for message hash ${sampleHex(`authwit:${tokenIn}:${amountIn}`)}`,
            ),
            effects: null,
            gas: null,
          };
        }
        used.add(authwit);
        add(spent, tokenIn, amountIn);
        add(gained, tokenOut, amountOut);
      }
    }

    const unused = authwits.findIndex((_, at) => !used.has(at));
    if (unused !== -1) {
      return {
        error: failed(
          {
            kind: "unusedAuthwit",
            index: unused,
            contract: (authwits[unused] as DecodedAuthwit).caller,
          },
          "the transaction never asks for this authwit",
        ),
        effects: null,
        gas: null,
      };
    }

    for (const [token, amount] of spent) {
      const held = privateBalance(token);
      if (held === null || amount > held) {
        const info = token === OMET.address ? OMET : token === USDC.address ? USDC : null;
        return {
          error: failed(
            { kind: "insufficientBalance", token: info, contract: token },
            "Assertion failed: Balance too low 'subtracted > 0'",
          ),
          effects: null,
          gas: null,
        };
      }
    }

    const tokens = [...new Set([...spent.keys(), ...gained.keys()])];
    const effects: Effects = {
      balances: tokens.map((token) => {
        const info = token === USDC.address ? USDC : OMET;
        const before = privateBalance(token) ?? 0n;
        return {
          token: info,
          before: before.toString(),
          after: (before - (spent.get(token) ?? 0n) + (gained.get(token) ?? 0n)).toString(),
          visibility: "private",
        };
      }),
      returns: [],
      notes: { created: 1 + calls.length * 2, nullified: 1 + spent.size },
      complete: privateBalance(USDC.address) !== null || !gained.has(USDC.address),
    };
    return {
      error: null,
      effects,
      gas: { da: 1_024 + calls.length * 512, l2: 280_000 * calls.length },
    };
  }

  #authwit({ caller, call }: { caller: Hex32; call: IntentCall }): DecodedAuthwit {
    const decoded: DecodedCall = this.#contracts.decode(call);
    if (decoded.kind !== "private")
      throw new OmeError(
        "invalid",
        `${call.fn} is not a private function; a private authwit authorizes a private call`,
      );
    const lower = caller.toLowerCase() as Hex32;
    return {
      caller: lower,
      callerLabel: lower === AMM ? "AMM" : null,
      call: decoded,
      messageHash: sampleHex(`authwit:${lower}:${JSON.stringify(call)}`),
      approvalMessage: sampleHex(`authwit-approval:${lower}:${JSON.stringify(call)}`),
    };
  }

  #failed(
    calls: DecodedCall[],
    authwits: DecodedAuthwit[],
    error: SimulationError,
  ): ProposalPreview {
    return { ok: false, calls, authwits, gas: null, error, effects: null, fee: null };
  }

  /** Reports phase `index` and the ones after it, then marks the proposal executed. */
  async #run(id: Hex32, index = 0): Promise<void> {
    const txHash = sampleHex(`${id}.tx`);
    const phase = PHASES[index];
    const me = { index: ME.index, name: ME.name };
    if (phase) {
      const proposal = this.get(id);
      this.#set({ ...proposal, executing: { member: me, phase, since: now(), mine: true } });
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
      executing: null,
      execution: { txHash, at: now(), executor: me, block: 1_214 },
    });
    this.#emit({
      type: "proposalExecuted",
      vault: VAULT,
      proposal: id,
      summary: JSON.stringify(proposal.intent),
      txHash,
      by: me,
    });
  }

  #voted(next: ProposalView, approve: boolean, reason: string | null): ProposalView {
    this.#set(next);
    this.#emit({
      type: "proposalVoted",
      vault: VAULT,
      proposal: next.id,
      summary: JSON.stringify(next.intent),
      by: { index: ME.index, name: ME.name },
      approve,
      reason,
    });
    return next;
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
    this.#emit({ type: "vaultUpdated", vault: VAULT });
  }
}
