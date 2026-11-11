// Membership changes on the sample vault, played out the way the daemon runs them: a join request, a plan checked
// against the same rules, then reshare → propose → approve → execute → activate. The propose step puts a real
// `rotate_membership` proposal in the list, which the member approves and executes from its page; once it lands, the
// roster changes. A plan pasted from another vault takes this member in as a newcomer.
import type {
  CommitteeMember,
  CommitteeShape,
  DaemonEvent,
  Hex32,
  Joiner,
  MembershipParams,
  MemberReachability,
  MembershipPlan,
  RotationState,
  RotationStepId,
  VaultDetails,
  VaultSummary,
} from "@ome-labs/api";

import { OmeError } from "../client.ts";
import type { FixtureProposals } from "./proposal-state.ts";
import { ACCOUNTS, MEMBERS, VAULT, sampleHex, samplePeerId, samplePoint } from "./sample.ts";

const JOIN = "ome-join-v0:";
const PLAN = "ome-rotation-v0:";
const STEPS: RotationStepId[] = ["reshare", "propose", "approve", "execute", "activate"];
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Text as base64url and back, in Node and in a browser alike (the fixtures run in both). */
const toBase64Url = (text: string) =>
  btoa(String.fromCodePoint(...new TextEncoder().encode(text)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
const fromBase64Url = (text: string) =>
  new TextDecoder().decode(
    Uint8Array.from(
      atob(text.replaceAll("-", "+").replaceAll("_", "/")),
      (char) => char.codePointAt(0) ?? 0,
    ),
  );

/** Join requests the fixtures know, by the newcomer they come from; others are read as "Newcomer". */
export const SAMPLE_JOIN = {
  dave: `${JOIN}ZGF2ZS1rZWVwZXItMDE0ZmE3YzJkOWU1YjhhMw`,
  erin: `${JOIN}ZXJpbi1rZWVwZXItN2I2MWQwOWYzYzJlNDhh`,
} as const;

/** The sample vault's members now: who is in it, and its thresholds. */
export type Roster = {
  members: { index: number; name: string; key: string; you: boolean; account: Hex32 }[];
  threshold: number;
  viewingThreshold: number;
  epoch: number;
};

export const initialRoster = (): Roster => ({
  members: MEMBERS.map((m) => ({
    index: m.index,
    name: m.name,
    key: m.key,
    you: m.you,
    account: ACCOUNTS[m.key],
  })),
  threshold: 2,
  viewingThreshold: 2,
  epoch: 1,
});

type Encoded = {
  id: Hex32;
  vault: Hex32;
  remove: number[];
  joiners: string[];
  threshold: number;
  viewingThreshold: number;
};

function joinerOf(request: string): Joiner {
  if (!request.startsWith(JOIN) || request.length < JOIN.length + 16)
    throw new OmeError("invalid", "not an Ome join request");
  const name =
    request === SAMPLE_JOIN.dave ? "Dave" : request === SAMPLE_JOIN.erin ? "Erin" : "Newcomer";
  const key = name.toLowerCase();
  return {
    name,
    account: name === "Dave" ? ACCOUNTS.dave : sampleHex(`${key}.account`),
    signerKey: samplePoint(`${key}.signer`),
    keeper: {
      identity: sampleHex(`${key}.keeper`),
      transport: sampleHex(`${key}.transport`),
      addresses: [`/ip4/127.0.0.1/udp/${54_100 + name.length}/quic-v1`],
    },
  };
}

export class FixtureMembership {
  #roster = initialRoster();
  readonly #rotations = new Map<Hex32, RotationState>();
  readonly #encoded = new Map<Hex32, Encoded>();
  /** The proposal each rotation waits on, and the rotation by its proposal. */
  readonly #byProposal = new Map<Hex32, Hex32>();
  readonly #emit: (event: DaemonEvent) => void;
  readonly #proposals: FixtureProposals;

  constructor(proposals: FixtureProposals, emit: (event: DaemonEvent) => void) {
    this.#proposals = proposals;
    this.#emit = emit;
    proposals.onExecuted((id) => {
      const rotation = this.#byProposal.get(id);
      if (rotation) void this.#land(rotation);
    });
  }

  roster(): Roster {
    return this.#roster;
  }

  /** This member's join request, to send to a member of the vault they're joining. */
  request(): { request: string } {
    return { request: `${JOIN}${toBase64Url("alice-keeper-5f2e8a1c")}` };
  }

  plan({ vault, remove, add, threshold, viewingThreshold }: MembershipParams): MembershipPlan {
    if (vault !== VAULT) throw new OmeError("not-found", "No such vault.");
    const roster = this.#roster;
    for (const index of remove)
      if (!roster.members.some((m) => m.index === index))
        throw new OmeError("invalid", `no member ${index} in this vault`);
    const joiners = add.map(joinerOf);
    for (const joiner of joiners)
      if (roster.members.some((m) => m.name === joiner.name))
        throw new OmeError("invalid", `${joiner.name}'s keeper is already a member`);
    const staying = roster.members.filter((m) => !remove.includes(m.index));
    const n = staying.length + joiners.length;
    let failure: string | null = null;
    if (staying.length < roster.viewingThreshold)
      failure = `at least ${roster.viewingThreshold} members must stay to reshare the viewing key`;
    else if (threshold < 1 || threshold > n) failure = `the spending threshold must be 1 to ${n}`;
    else if (viewingThreshold < 2 || viewingThreshold > n)
      failure = `the viewing threshold must be 2 to ${n}`;
    const withinRemovalLimit = remove.length <= roster.viewingThreshold - 1;
    if (!failure && !withinRemovalLimit)
      failure = `at most ${roster.viewingThreshold - 1} members can leave in one rotation`;

    const id = sampleHex(
      `rotation:${remove.join(",")}:${add.join(",")}:${threshold}:${viewingThreshold}:${Date.now()}`,
    );
    const encoded: Encoded = { id, vault, remove, joiners: add, threshold, viewingThreshold };
    this.#encoded.set(id, encoded);
    const current: CommitteeShape = {
      threshold: roster.threshold,
      viewingThreshold: roster.viewingThreshold,
      members: roster.members.map((m) => m.name),
    };
    return {
      id,
      vault,
      current,
      next: {
        threshold,
        viewingThreshold,
        members: [...staying.map((m) => m.name), ...joiners.map((j) => j.name)],
      },
      dealers: staying.slice(0, roster.viewingThreshold).map((m) => m.index),
      joiners,
      withinRemovalLimit,
      failure,
      share: `${PLAN}${toBase64Url(JSON.stringify(encoded))}`,
    };
  }

  /** Takes part in a rotation from its plan; its steps report as `rotation` events. */
  begin(share: string): RotationState {
    if (!share.startsWith(PLAN)) throw new OmeError("invalid", "not an Ome rotation plan");
    let encoded: Encoded;
    try {
      encoded = JSON.parse(fromBase64Url(share.slice(PLAN.length))) as Encoded;
    } catch {
      throw new OmeError("invalid", "the rotation plan does not decode");
    }
    const existing = this.#rotations.get(encoded.id);
    if (existing) return existing;
    const joining = encoded.vault !== VAULT;
    if (!joining && encoded.remove.includes(1))
      throw new OmeError("invalid", "this member leaves in the rotation and has nothing to run");
    const plan = joining
      ? this.#newcomerPlan(encoded, share)
      : this.plan({ ...encoded, add: encoded.joiners });
    const state: RotationState = {
      plan: { ...plan, id: encoded.id, share },
      steps: STEPS.map((id) => ({ id, status: "pending", detail: null })),
      session: sampleHex(`${encoded.id}.session`),
      proposal: null,
      error: null,
      done: false,
    };
    if (plan.failure) throw new OmeError("invalid", plan.failure);
    this.#rotations.set(encoded.id, state);
    void this.#run(encoded.id, joining);
    return state;
  }

  get(id: Hex32): RotationState | null {
    return this.#rotations.get(id) ?? null;
  }

  list(): RotationState[] {
    return [...this.#rotations.values()];
  }

  /** A plan from another vault's member, taking this member in: the fixtures' "Garden fund". */
  #newcomerPlan(encoded: Encoded, share: string): MembershipPlan {
    return {
      id: encoded.id,
      vault: encoded.vault,
      current: { threshold: 2, viewingThreshold: 2, members: ["Bob", "Carol", "Dave"] },
      next: { threshold: 2, viewingThreshold: 2, members: ["Bob", "Carol", "Dave", "Alice"] },
      dealers: [1, 2],
      joiners: [joinerOf(this.request().request)],
      withinRemovalLimit: true,
      failure: null,
      share,
    };
  }

  #mark(
    id: Hex32,
    step: RotationStepId,
    status: "active" | "done" | "failed",
    detail: string | null = null,
  ): void {
    const state = this.#rotations.get(id);
    if (!state) return;
    const next: RotationState = {
      ...state,
      steps: state.steps.map((s) =>
        s.id === step ? { id: s.id, status, detail: detail ?? s.detail } : s,
      ),
    };
    this.#rotations.set(id, next);
    this.#emit({ type: "rotation", rotation: next });
  }

  #update(id: Hex32, patch: Partial<RotationState>): void {
    const state = this.#rotations.get(id);
    if (!state) return;
    const next = { ...state, ...patch };
    this.#rotations.set(id, next);
    this.#emit({ type: "rotation", rotation: next });
  }

  async #run(id: Hex32, joining: boolean): Promise<void> {
    this.#mark(id, "reshare", "active", "the dealers' keepers are dealing new shares");
    await wait(2000);
    this.#mark(id, "reshare", "done", "every keeper holds its new share");
    if (joining) {
      // A newcomer waits for the members' proposal to land, then activates.
      this.#mark(id, "propose", "done", "proposed by a member");
      this.#mark(id, "approve", "active", "waiting for the members to approve");
      await wait(3000);
      this.#mark(id, "approve", "done");
      this.#mark(id, "execute", "done", "executed by a member");
      await this.#activate(id);
      return;
    }
    this.#mark(id, "propose", "active");
    await wait(800);
    const plan = this.#rotations.get(id)?.plan;
    const memo = plan
      ? `Members: ${plan.next.members.join(", ")} · ${plan.next.threshold} of ${plan.next.members.length} to spend`
      : "Change members";
    const proposal = this.#proposals.addRotation(memo);
    this.#byProposal.set(proposal.id, id);
    this.#update(id, { proposal: proposal.id });
    this.#mark(id, "propose", "done", proposal.id);
    this.#mark(id, "approve", "active", "approve the proposal to continue");
  }

  /** The proposal landed: the steps finish and the roster becomes the plan's. */
  async #land(id: Hex32): Promise<void> {
    this.#mark(id, "approve", "done");
    this.#mark(id, "execute", "done");
    const encoded = this.#encoded.get(id);
    if (encoded) {
      const joiners = encoded.joiners.map(joinerOf);
      const staying = this.#roster.members.filter((m) => !encoded.remove.includes(m.index));
      let next = Math.max(...this.#roster.members.map((m) => m.index));
      this.#roster = {
        members: [
          ...staying,
          ...joiners.map((j) => ({
            index: (next += 1),
            name: j.name,
            key: j.name.toLowerCase(),
            you: false,
            account: j.account,
          })),
        ],
        threshold: encoded.threshold,
        viewingThreshold: encoded.viewingThreshold,
        epoch: this.#roster.epoch + 1,
      };
    }
    await this.#activate(id);
    this.#emit({ type: "configChanged", vault: VAULT, version: this.#roster.epoch });
    this.#emit({ type: "memberChanged", vault: VAULT });
    if (encoded && encoded.remove.length > 0)
      this.#emit({ type: "handshakeAdvised", vault: VAULT, counterparties: 4 });
  }

  async #activate(id: Hex32): Promise<void> {
    this.#mark(id, "activate", "active", "the keepers switch to the new committee");
    await wait(1200);
    this.#mark(id, "activate", "done");
    this.#update(id, { done: true });
  }
}

/** The sample vault's summary with the roster's size and thresholds. */
export function withRoster(summary: VaultSummary, roster: Roster): VaultSummary {
  if (summary.address !== VAULT) return summary;
  return {
    ...summary,
    members: roster.members.length,
    threshold: roster.threshold,
    viewingThreshold: roster.viewingThreshold,
  };
}

function committeeMember(member: Roster["members"][number]): CommitteeMember {
  return {
    index: member.index,
    name: member.name,
    account: member.account,
    signerKey: samplePoint(`${member.key}.signer`),
    verificationShare: samplePoint(`treasury.share.${member.index}`),
    identity: sampleHex(`${member.key}.keeper`),
    transport: sampleHex(`${member.key}.transport`),
    peerId: samplePeerId(member.key),
    addresses: [`/ip4/127.0.0.1/udp/${54_010 + member.index * 2}/quic-v1`],
    release: "0.3.0",
    you: member.you,
  };
}

/** The sample vault's details with the roster's members, thresholds and committee epoch. */
export function detailsWithRoster(details: VaultDetails, roster: Roster): VaultDetails {
  const known = new Map(details.committee.members.map((m) => [m.index, m]));
  return {
    ...details,
    summary: withRoster(details.summary, roster),
    config: details.config
      ? {
          ...details.config,
          threshold: roster.threshold,
          viewingThreshold: roster.viewingThreshold,
          signerCount: roster.members.length,
          version: roster.epoch,
        }
      : null,
    committee: {
      ...details.committee,
      epoch: roster.epoch,
      viewingThreshold: roster.viewingThreshold,
      members: roster.members.map((m) => known.get(m.index) ?? committeeMember(m)),
    },
  };
}

/** Reachability for the roster's members: a newcomer's keeper connects like the others. */
export function peersWithRoster(
  peers: MemberReachability[],
  roster: Roster,
  now: number,
): MemberReachability[] {
  const known = new Map(peers.map((p) => [p.index, p]));
  return roster.members.map(
    (m) =>
      known.get(m.index) ?? {
        index: m.index,
        name: m.name,
        account: m.account,
        identity: sampleHex(`${m.key}.keeper`),
        peerId: samplePeerId(m.key),
        you: false,
        connected: true,
        relayed: false,
        lastSeen: now - 3,
        rttMs: 64,
      },
  );
}
