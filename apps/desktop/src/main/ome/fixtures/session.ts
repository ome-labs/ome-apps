// The session on the sample data: one profile (Alice's) in the chosen scenario. "no-profile" starts at the first run
// and "daemon-down" at the failed daemon; setting up a profile moves to "no-vaults", as a new member would be.
import type { DaemonEvent, DaemonParams, DaemonResult, NodeStatus } from "@ome-labs/api";

import type {
  Preflight,
  RendererMethod,
  SessionState,
  SetupRequest,
} from "../../../bridge/contract.ts";
import type { AppSession } from "../session.ts";
import { FixtureClient } from "./client.ts";
import type { Scenario } from "./scenarios.ts";
import { node } from "./status.ts";

const PROFILE = "alice";

function stateFor(scenario: Scenario): SessionState {
  if (scenario === "no-profile") return { phase: "choose", profiles: [] };
  if (scenario === "daemon-down") {
    return {
      phase: "failed",
      profile: PROFILE,
      message: "The daemon stopped while starting (exit 1).",
    };
  }
  return { phase: "ready", profile: PROFILE };
}

export class FixtureSession implements AppSession {
  readonly client: FixtureClient;
  #state: SessionState;
  readonly #listeners = new Set<(state: SessionState) => void>();

  constructor(scenario: Scenario) {
    this.client = new FixtureClient(scenario);
    this.#state = stateFor(scenario);
  }

  /** Switches scenario, moving the session to the state it starts in. */
  setScenario(scenario: Scenario): void {
    this.client.setScenario(scenario);
    this.#set(stateFor(scenario));
  }

  state(): SessionState {
    return this.#state;
  }

  onState(listener: (state: SessionState) => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  async preflight(): Promise<Preflight> {
    return { home: "~/.ome", omed: "~/.ome/bin/omed", keeper: "~/.ome/bin/ome-keeper" };
  }

  async boot(): Promise<void> {}

  async open(profile: string): Promise<void> {
    this.#set({ phase: "ready", profile });
  }

  async setup(_request: SetupRequest): Promise<NodeStatus> {
    this.#set({ phase: "setup", profile: PROFILE });
    return node(this.client.scenario, Math.floor(Date.now() / 1000));
  }

  async retry(): Promise<void> {
    this.setScenario("normal");
  }

  async leave(): Promise<void> {
    this.#set({ phase: "choose", profiles: [{ name: PROFILE, member: "Alice" }] });
  }

  call<M extends RendererMethod>(method: M, params: DaemonParams<M>): Promise<DaemonResult<M>> {
    return this.client.call(method, params);
  }

  subscribe(listener: (event: DaemonEvent) => void): () => void {
    return this.client.subscribe(listener);
  }

  #set(state: SessionState): void {
    this.#state = state;
    for (const listener of this.#listeners) listener(state);
  }
}
