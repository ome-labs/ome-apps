// Answers the renderer from the sample data, in the chosen scenario. Reads are simulated; the few writes the shell
// needs (unlocking and locking the signer) change state; every other write fails with a clear message until a screen
// needs it simulated.
import type { DaemonEvent, DaemonParams, DaemonResult, Hex32 } from "@ome-labs/api";

import type { RendererMethod } from "../../../shared/contract.ts";
import { type OmeClient, OmeError } from "../client.ts";
import { proposals, review } from "./proposals.ts";
import { ACCOUNTS, VAULT } from "./sample.ts";
import type { Scenario } from "./scenarios.ts";
import { keeper, node, settings, signer, status } from "./status.ts";
import { activity, audit, counterparties, peers, tokens, vaultDetails } from "./vault.ts";

type Handlers = { [M in RendererMethod]?: (params: DaemonParams<M>) => DaemonResult<M> };

const now = () => Math.floor(Date.now() / 1000);

export class FixtureClient implements OmeClient {
  #scenario: Scenario;
  #unlockedUntil: number | null = null;
  readonly #listeners = new Set<(event: DaemonEvent) => void>();

  constructor(scenario: Scenario) {
    this.#scenario = scenario;
  }

  get scenario(): Scenario {
    return this.#scenario;
  }

  /** Switches scenario and tells subscribers everything the shell redraws changed. */
  setScenario(scenario: Scenario): void {
    this.#scenario = scenario;
    this.#emit({ type: "node", node: node(scenario, now()) });
    this.#emit({ type: "keeper", keeper: keeper(scenario) });
    this.#emit({ type: "signer", signer: signer(scenario, now(), this.#unlockedUntil) });
    this.#emit({ type: "vaultActivity", vault: VAULT });
    if (scenario === "alarm") {
      this.#emit({
        type: "keeperEvent",
        event: {
          type: "configMismatch",
          vault: VAULT,
          version: 2,
          reason: "the committee commitment names keepers this keeper has no share for",
        },
      });
    }
  }

  async call<M extends RendererMethod>(
    method: M,
    params: DaemonParams<M>,
  ): Promise<DaemonResult<M>> {
    const handler = this.#handlers[method] as
      | ((params: DaemonParams<M>) => DaemonResult<M>)
      | undefined;
    if (!handler) {
      throw new OmeError("failed", `The fixtures don't simulate ${method} yet.`);
    }
    return handler(params);
  }

  subscribe(listener: (event: DaemonEvent) => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #emit(event: DaemonEvent): void {
    for (const listener of this.#listeners) listener(event);
  }

  /** The vault a request names must be Treasury, and the profile must have it. */
  #vault(address: Hex32): void {
    if (this.#scenario === "no-profile")
      throw new OmeError("not-ready", "No profile is set up yet.");
    if (this.#scenario === "no-vaults" || address !== VAULT)
      throw new OmeError("not-found", "No such vault.");
  }

  readonly #handlers: Handlers = {
    "daemon.info": () => ({
      apiVersion: 0,
      version: "0.1.0",
      pid: 4242,
      profile: "alice",
      profileDir: "~/.ome/profiles/alice",
      startedAt: now() - 3 * 3600,
      node: settings().nodeUrl,
    }),
    status: () => status(this.#scenario, now(), this.#unlockedUntil),
    "config.get": () => settings(),
    "node.status": () => node(this.#scenario, now()),
    "signer.status": () => signer(this.#scenario, now(), this.#unlockedUntil),
    "signer.unlock": ({ secret, ttlSecs }) => {
      // "wrong" stands for a passphrase that doesn't unseal the signer, so the error state can be designed.
      if ("passphrase" in secret && secret.passphrase === "wrong") {
        throw new OmeError("auth", "The passphrase doesn't unseal this profile's signer.");
      }
      this.#unlockedUntil = now() + ttlSecs;
      const next = signer("normal", now(), this.#unlockedUntil);
      this.#emit({ type: "signer", signer: next });
      return next;
    },
    "signer.lock": () => {
      this.#unlockedUntil = null;
      const next = signer(this.#scenario, now(), null);
      this.#emit({ type: "signer", signer: next });
      return next;
    },
    "vault.list": () => status(this.#scenario, now(), this.#unlockedUntil).vaults,
    "vault.details": ({ vault }) => (this.#vault(vault), vaultDetails(this.#scenario, now())),
    "vault.peers": ({ vault }) => (this.#vault(vault), peers(this.#scenario, now())),
    "vault.activity": ({ vault }) => (this.#vault(vault), activity(now())),
    "vault.counterparties": ({ vault }) => (this.#vault(vault), counterparties(now())),
    "vault.audit": ({ vault, limit }) => (this.#vault(vault), audit(now()).slice(0, limit)),
    "tokens.list": ({ vault }) => (this.#vault(vault), tokens()),
    "proposals.list": ({ vault }) => (this.#vault(vault), proposals(now())),
    "proposals.get": ({ vault, id }) => (this.#vault(vault), this.#proposal(id)),
    "proposals.review": ({ vault, id }) => (this.#vault(vault), review(this.#proposal(id))),
    "aztec.aliases": () => [
      { key: "accounts:alice", value: ACCOUNTS.alice },
      { key: "accounts:bob", value: ACCOUNTS.bob },
      { key: "accounts:dave", value: ACCOUNTS.dave },
    ],
    "devices.list": () => [],
    "lobby.list": () => [],
    "membership.list": ({ vault }) => (this.#vault(vault), []),
  };

  #proposal(id: Hex32) {
    const found = proposals(now()).find((p) => p.id === id);
    if (!found) throw new OmeError("not-found", "No such proposal.");
    return found;
  }
}
