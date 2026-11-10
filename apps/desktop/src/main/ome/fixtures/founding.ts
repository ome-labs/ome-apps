// A lobby and a founding on the sample data, played out on timers the way real co-founders would: Bob and Carol join a
// lobby Alice opens; when Alice joins someone else's, its host starts it a moment later. Founding walks its six steps.
import type {
  DaemonEvent,
  FoundingState,
  FoundingStepId,
  Hex16,
  Hex32,
  InvitePreview,
  LobbyChangeKind,
  LobbyCreateParams,
  LobbyRemoveParams,
  LobbyUpdateParams,
  LobbyView,
  LobbyViewMember,
  StartLobbyParams,
} from "@ome-labs/api";

import { OmeError } from "../client.ts";
import { ACCOUNTS, VAULT, sampleHex, samplePeerId, samplePoint } from "./sample.ts";

const STEPS: FoundingStepId[] = ["agree", "dkg", "derive", "register", "deploy", "verify"];
const NETWORK = "aztec:31337:1337000001";

const now = () => Math.floor(Date.now() / 1000);
/** The steps with one of them changed. */
function patchStep(
  steps: FoundingState["steps"],
  id: FoundingStepId,
  patch: Partial<FoundingState["steps"][number]>,
): FoundingState["steps"] {
  const next = [...steps];
  const at = next.findIndex((step) => step.id === id);
  const current = next[at];
  if (current) next[at] = { ...current, ...patch };
  return next;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const lobbyId = (label: string) => sampleHex(`lobby:${label}`).slice(0, 34) as Hex16;

function member(index: number, name: string, you: boolean): LobbyViewMember {
  const key = name.toLowerCase();
  return {
    index,
    name,
    account: key in ACCOUNTS ? ACCOUNTS[key as keyof typeof ACCOUNTS] : sampleHex(`${key}.account`),
    signerKey: samplePoint(`${key}.signer`),
    identity: sampleHex(`${key}.identity`),
    peerId: samplePeerId(key),
    addresses: [`/ip4/127.0.0.1/udp/${40_000 + index}/quic-v1`],
    you,
  };
}

/** What an invite looks like: an opaque code a member pastes. "wrong" in it stands for another network's invite. */
function invite(lobby: Hex16): string {
  return `ome-invite:${lobby.slice(2)}${sampleHex(`invite:${lobby}`).slice(2, 58)}`;
}

export class FixtureFounding {
  readonly #lobbies = new Map<Hex16, LobbyView>();
  readonly #foundings = new Map<Hex16, FoundingState>();
  readonly #emit: (event: DaemonEvent) => void;
  readonly #founded: () => void;

  /** `founded` runs when a founding finishes, so the sample profile then has the vault. */
  constructor(emit: (event: DaemonEvent) => void, founded: () => void) {
    this.#emit = emit;
    this.#founded = founded;
  }

  create(params: LobbyCreateParams): LobbyView {
    const id = lobbyId(params.name);
    const view: LobbyView = {
      lobby: id,
      role: "host",
      status: "open",
      name: params.name,
      threshold: params.threshold,
      viewingThreshold: params.viewingThreshold,
      expected: params.members,
      network: NETWORK,
      members: [member(1, "Alice", true)],
      removed: false,
      invite: invite(id),
      session: null,
    };
    this.#lobbies.set(id, view);
    // Co-founders arrive one by one until the lobby is full: Bob, Carol, then Dave and Erin for larger vaults.
    ["Bob", "Carol", "Dave", "Erin", "Frank", "Grace"]
      .slice(0, params.members - 1)
      .forEach((name, at) => this.#later(1800 + at * 2200, () => this.#arrive(id, name)));
    return view;
  }

  inspect(code: string): InvitePreview {
    if (!code.startsWith("ome-invite:")) throw new OmeError("invalid", "That isn't an Ome invite.");
    const sameNetwork = !code.includes("wrong");
    return {
      lobby: lobbyId("Garden fund"),
      name: "Garden fund",
      hostName: "Bob",
      threshold: 2,
      viewingThreshold: 2,
      members: 3,
      network: sameNetwork ? NETWORK : "aztec:11155111:679261766",
      sameNetwork,
      host: { identity: sampleHex("bob.identity"), peerId: samplePeerId("bob"), addresses: [] },
    };
  }

  join(code: string): LobbyView {
    const preview = this.inspect(code);
    if (!preview.sameNetwork) throw new OmeError("invalid", "The invite is for another network.");
    const view: LobbyView = {
      lobby: preview.lobby,
      role: "guest",
      status: "open",
      name: preview.name,
      threshold: preview.threshold,
      viewingThreshold: preview.viewingThreshold,
      expected: preview.members,
      network: preview.network,
      members: [member(1, "Bob", false), member(2, "Alice", true)],
      removed: false,
      invite: null,
      session: null,
    };
    this.#lobbies.set(view.lobby, view);
    // The host starts once a third member arrives.
    this.#later(2500, () => this.#arrive(view.lobby, "Carol"));
    this.#later(5000, () => this.#start(view.lobby, preview.threshold, preview.viewingThreshold));
    return view;
  }

  get(id: Hex16): LobbyView {
    const view = this.#lobbies.get(id);
    if (!view) throw new OmeError("not-found", "No such lobby.");
    return view;
  }

  list(): LobbyView[] {
    return [...this.#lobbies.values()].filter((view) => view.status !== "closed");
  }

  start({ lobby, threshold, viewingThreshold }: StartLobbyParams): LobbyView {
    const view = this.get(lobby);
    if (view.role !== "host") throw new OmeError("invalid", "Only the host starts the lobby.");
    return this.#start(lobby, threshold, viewingThreshold);
  }

  leave(id: Hex16): void {
    const view = this.get(id);
    this.#lobbies.set(id, { ...view, status: "closed" });
    this.#emitLobby(id, "closed");
  }

  /** The host removes a joiner before starting; the rest keep their places, renumbered. */
  remove({ lobby, identity }: LobbyRemoveParams): LobbyView {
    const view = this.#host(lobby);
    const gone = view.members.find((m) => m.identity === identity);
    if (!gone) throw new OmeError("not-found", "That member isn't in the lobby.");
    if (gone.you)
      throw new OmeError("invalid", "The host can't remove themselves; close the lobby instead.");
    const next: LobbyView = {
      ...view,
      members: view.members.filter((m) => m.identity !== identity),
    };
    this.#lobbies.set(lobby, next);
    this.#emitLobby(lobby, "removed", identity);
    return next;
  }

  /** The host changes the lobby's size or thresholds before starting. */
  update({ lobby, members, threshold, viewingThreshold }: LobbyUpdateParams): LobbyView {
    const view = this.#host(lobby);
    const next: LobbyView = {
      ...view,
      expected: members ?? view.expected,
      threshold: threshold ?? view.threshold,
      viewingThreshold: viewingThreshold ?? view.viewingThreshold,
    };
    if (next.expected < next.members.length)
      throw new OmeError("invalid", `${next.members.length} members have already joined.`);
    if (next.threshold > next.expected || next.viewingThreshold > next.expected)
      throw new OmeError("invalid", "A threshold can't be more than the members.");
    this.#lobbies.set(lobby, next);
    this.#emitLobby(lobby, "updated");
    return next;
  }

  #host(lobby: Hex16): LobbyView {
    const view = this.get(lobby);
    if (view.role !== "host") throw new OmeError("invalid", "Only the host changes the lobby.");
    if (view.status !== "open") throw new OmeError("invalid", "The lobby has started.");
    return view;
  }

  begin(id: Hex16): FoundingState {
    const existing = this.#foundings.get(id);
    if (existing && !existing.done) return existing;
    const state: FoundingState = {
      lobby: id,
      steps: STEPS.map((step) => ({
        id: step,
        status: "pending",
        startedAt: null,
        finishedAt: null,
        detail: null,
      })),
      vault: null,
      error: null,
      done: false,
    };
    this.#foundings.set(id, state);
    void this.#run(id);
    return state;
  }

  founding(id: Hex16): FoundingState | null {
    return this.#foundings.get(id) ?? null;
  }

  #arrive(id: Hex16, name: string): void {
    const view = this.#lobbies.get(id);
    if (!view || view.status !== "open" || view.members.some((m) => m.name === name)) return;
    if (view.members.length >= view.expected) return;
    const joined = member(Math.max(...view.members.map((m) => m.index)) + 1, name, false);
    this.#lobbies.set(id, { ...view, members: [...view.members, joined] });
    this.#emitLobby(id, "joined", joined.identity);
  }

  #start(id: Hex16, threshold: number, viewingThreshold: number): LobbyView {
    const view = this.get(id);
    const started: LobbyView = {
      ...view,
      status: "started",
      threshold,
      viewingThreshold,
      session: sampleHex(`session:${id}`),
    };
    this.#lobbies.set(id, started);
    this.#emitLobby(id, "started");
    return started;
  }

  async #run(id: Hex16): Promise<void> {
    // Agree waits for the host to start the lobby, as the real founding does.
    await this.#started(id);
    const names = this.get(id).members.map((m) => m.name);
    const details: Record<FoundingStepId, string | null> = {
      agree: names.join(", "),
      dkg: `${names.length} keepers`,
      derive: VAULT,
      register: null,
      deploy: sampleHex(`deploy:${id}`),
      verify: null,
    };
    await this.#step(id, 0, details);
    this.#set(id, { ...(this.#foundings.get(id) as FoundingState), done: true });
    this.#founded();
  }

  async #started(id: Hex16): Promise<void> {
    if (this.#lobbies.get(id)?.status !== "open") return;
    await wait(300);
    return this.#started(id);
  }

  /** Runs step `index` and the ones after it. */
  async #step(
    id: Hex16,
    index: number,
    details: Record<FoundingStepId, string | null>,
  ): Promise<void> {
    const step = STEPS[index];
    if (!step) return;
    const state = this.#foundings.get(id) as FoundingState;
    this.#set(id, {
      ...state,
      steps: patchStep(state.steps, step, { status: "active", startedAt: now() }),
    });
    await wait(step === "deploy" ? 2200 : 900);
    const active = this.#foundings.get(id) as FoundingState;
    this.#set(id, {
      ...active,
      vault: step === "derive" ? VAULT : active.vault,
      steps: patchStep(active.steps, step, {
        status: "done",
        finishedAt: now(),
        detail: details[step],
      }),
    });
    return this.#step(id, index + 1, details);
  }

  #set(id: Hex16, next: FoundingState): void {
    this.#foundings.set(id, next);
    this.#emit({ type: "founding", founding: next });
  }

  #emitLobby(id: Hex16, kind: LobbyChangeKind, about: Hex32 | null = null): void {
    this.#emit({ type: "lobby", lobby: this.get(id), change: { kind, member: about } });
  }

  #later(ms: number, run: () => void): void {
    setTimeout(run, ms);
  }
}
