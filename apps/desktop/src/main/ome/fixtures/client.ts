// Answers the renderer from the sample data, in the chosen scenario. Reads are simulated; the writes the screens built
// so far need (the signer, settings, founding, proposals) change state; every other write fails with a clear message
// until a screen needs it simulated.
import type { DaemonEvent, DaemonParams, DaemonResult, Hex32, Settings } from "@ome-labs/api";

import type { RendererMethod } from "../../../bridge/contract.ts";
import { type OmeClient, OmeError } from "../client.ts";
import { FixtureContracts, aztecAliases } from "./contracts.ts";
import { FixtureFounding } from "./founding.ts";
import { FixtureHistory } from "./history.ts";
import { FixtureMembership, detailsWithRoster, peersWithRoster, withRoster } from "./membership.ts";
import { FixtureOps, OPS, vaultOf } from "./ops.ts";
import { FixtureProposals } from "./proposal-state.ts";
import { VAULT } from "./sample.ts";
import type { Scenario } from "./scenarios.ts";
import { keeper, node, settings, signer, status } from "./status.ts";
import { FixtureTokens } from "./tokens.ts";
import { FixtureVaultSettings, auditLog } from "./vault-settings.ts";
import { peers, vaultDetails } from "./vault.ts";

type Handlers = { [M in RendererMethod]?: (params: DaemonParams<M>) => DaemonResult<M> };

const now = () => Math.floor(Date.now() / 1000);

/** What a member changes about any vault, Ops fund included: answered by the shared settings, not its fixture. */
const SETTINGS = new Set<RendererMethod>(["vault.alias", "vault.use", "vault.rename"]);

export class FixtureClient implements OmeClient {
  #scenario: Scenario;
  #unlockedUntil: number | null = null;
  /** Settings changes stay for the session, so the settings page can be tried on the sample data. */
  #settings: Settings = settings();
  readonly #listeners = new Set<(event: DaemonEvent) => void>();
  /** A founded vault makes this a profile with Treasury, as the sample story has it. */
  readonly #contracts = new FixtureContracts();
  readonly #tokens = new FixtureTokens((event) => this.#emit(event));
  readonly #history = new FixtureHistory(now(), (event) => this.#emit(event));
  readonly #ops = new FixtureOps(this.#contracts);
  readonly #vaultSettings = new FixtureVaultSettings((event) => this.#emit(event));
  readonly #proposals = new FixtureProposals(
    this.#contracts,
    (event) => this.#emit(event),
    () => this.#unlocked(),
  );
  readonly #membership = new FixtureMembership(this.#proposals, (event) => this.#emit(event));
  readonly #founding = new FixtureFounding(
    (event) => this.#emit(event),
    () => this.setScenario("normal"),
  );

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
    this.#emit({ type: "vaultUpdated", vault: VAULT });
    if (scenario === "removed") {
      this.#emit({ type: "keeperEvent", event: { type: "removed", vault: VAULT } });
    }
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
    if (this.#scenario === "daemon-down") {
      throw new OmeError("unreachable", "Ome's daemon isn't running for this profile.");
    }

    if (
      vaultOf(params) === OPS &&
      !SETTINGS.has(method) &&
      this.#scenario !== "no-vaults" &&
      this.#scenario !== "no-profile"
    ) {
      const answer = this.#ops.call(method, params, this.#scenario, now());
      // Its name, alias and default are this session's, like Treasury's.
      if (method !== "vault.details") return answer;
      const summary = this.#vaults().find((v) => v.address === OPS);
      return {
        ...(answer as DaemonResult<"vault.details">),
        ...(summary ? { summary } : {}),
      } as DaemonResult<M>;
    }
    const handler = this.#handlers[method] as
      | ((params: DaemonParams<M>) => DaemonResult<M>)
      | undefined;
    if (!handler) {
      throw new OmeError("failed", `The fixtures don't simulate ${method} yet.`);
    }
    return handler(params);
  }

  /** A payment arriving now, for designing live updates (`window.ome.dev.set({ receive: true })`) and tests. */
  receive(): void {
    this.#history.receive(now());
  }

  subscribe(listener: (event: DaemonEvent) => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #emit(event: DaemonEvent): void {
    for (const listener of this.#listeners) listener(event);
  }

  #unlocked(): boolean {
    return (
      this.#unlockedUntil !== null && this.#unlockedUntil > now() && this.#scenario !== "locked"
    );
  }

  /** The sample vaults before this session's changes. */
  #baseVaults() {
    return status(this.#scenario, now(), this.#unlockedUntil).vaults;
  }

  /** The vaults as the member sees them now: renamed, aliased, the default, without a retired one. */
  #vaults() {
    const roster = this.#membership.roster();
    return this.#vaultSettings.apply(this.#baseVaults()).map((v) => withRoster(v, roster));
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
      version: "0.3.0",
      pid: 4242,
      profile: "alice",
      profileDir: "~/.ome/profiles/alice",
      startedAt: now() - 3 * 3600,
      node: settings().nodeUrl,
      limits: {
        maxCalls: 4,
        maxAuthwits: 4,
        maxSummaryBytes: 4096,
        maxArtifactBytes: 32 << 20,
        memoChars: 280,
        minExpiryHours: 1,
        maxExpiryHours: 720,
      },
      capabilities: ["authwits", "apps", "capabilities"],
    }),
    status: () => {
      const base = status(this.#scenario, now(), this.#unlockedUntil);
      const vaults = this.#vaults();
      return {
        ...base,
        settings: this.#settings,
        vaults,
        defaultVault: vaults.find((v) => v.isDefault)?.address ?? vaults[0]?.address ?? null,
      };
    },
    "config.get": () => this.#settings,
    "config.set": (patch) => {
      const defined = Object.entries(patch).filter(([, value]) => value !== undefined);
      this.#settings = { ...this.#settings, ...Object.fromEntries(defined) };
      return this.#settings;
    },
    "relays.set": ({ relays }) => {
      this.#settings = { ...this.#settings, relays };
      return this.#settings;
    },
    "keeper.connect": ({ remote }) => {
      this.#settings = {
        ...this.#settings,
        remoteKeeper: remote ? { address: remote.address, fingerprint: remote.fingerprint } : null,
      };
      return { ...keeper(this.#scenario), remote: remote?.address ?? null };
    },
    "profile.create": ({ passphrase }) => {
      if (passphrase.length < 8)
        throw new OmeError("invalid", "The passphrase needs at least 8 characters.");
      this.setScenario("no-vaults");
      return status(this.#scenario, now(), this.#unlockedUntil);
    },
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
    "signer.sealingKey": ({ passphrase }) => {
      if (passphrase === "wrong") {
        throw new OmeError("auth", "The passphrase doesn't unseal this profile's signer.");
      }
      return { key: `0x${"5e".repeat(32)}` as Hex32 };
    },
    "signer.lock": () => {
      this.#unlockedUntil = null;
      const next = signer(this.#scenario, now(), null);
      this.#emit({ type: "signer", signer: next });
      return next;
    },
    "vault.list": () => this.#vaults(),
    "vault.details": ({ vault }) => {
      this.#vault(vault);
      const details = detailsWithRoster(
        vaultDetails(this.#scenario, now()),
        this.#membership.roster(),
      );
      const summary = this.#vaults().find((v) => v.address === vault) ?? details.summary;
      return { ...details, summary };
    },
    "vault.rename": ({ vault, name }) => {
      if (vault !== OPS) this.#vault(vault);
      return this.#vaultSettings.rename(vault, name, this.#baseVaults());
    },
    "vault.alias": ({ vault, alias }) =>
      this.#vaultSettings.alias(vault, alias, this.#baseVaults()),
    "vault.use": ({ vault }) => this.#vaultSettings.use(vault, this.#baseVaults()),
    "vault.retire": ({ vault }) => (
      this.#vault(vault),
      this.#vaultSettings.retire(vault, this.#scenario, this.#baseVaults())
    ),
    "vault.peers": ({ vault }) => (
      this.#vault(vault),
      peersWithRoster(peers(this.#scenario, now()), this.#membership.roster(), now())
    ),
    "vault.activity": (params) => (
      this.#vault(params.vault),
      this.#history.activity(this.#proposals.all(), params)
    ),
    "vault.counterparties": (params) => (
      this.#vault(params.vault),
      this.#history.counterparties(now(), params)
    ),
    "vault.audit": (params) => (this.#vault(params.vault), auditLog(now(), params)),
    "tokens.list": ({ vault }) => (this.#vault(vault), this.#tokens.list(this.#scenario)),
    "tokens.add": ({ vault, token, deployment }) => (
      this.#vault(vault),
      this.#tokens.add(token, deployment)
    ),
    "tokens.remove": ({ vault, token }) => (this.#vault(vault), this.#tokens.remove(token)),
    "tokens.deployTest": ({ vault }) => {
      this.#vault(vault);
      if (!this.#unlocked()) throw new OmeError("locked", "The signer is locked.");
      return this.#tokens.deployTest(this.#scenario);
    },
    "vault.receiving": ({ vault }) => (
      this.#vault(vault),
      this.#tokens.receiving(this.#history.lastReceivedAt())
    ),
    "vault.request": (params) => (this.#vault(params.vault), this.#tokens.request(params)),
    "proposals.list": ({ vault, filter, limit }) => (
      this.#vault(vault),
      this.#proposals.list(filter, limit)
    ),
    "proposals.get": ({ vault, id }) => (this.#vault(vault), this.#proposals.get(id)),
    "proposals.review": ({ vault, id }) => (this.#vault(vault), this.#proposals.review(id)),
    "proposals.approve": ({ vault, id }) => (this.#vault(vault), this.#proposals.approve(id)),
    "proposals.reject": ({ vault, id, reason }) => (
      this.#vault(vault),
      this.#proposals.reject(id, reason)
    ),
    "proposals.execute": ({ vault, id }) => (this.#vault(vault), this.#proposals.execute(id)),
    "proposals.cancel": ({ vault, id }) => (this.#vault(vault), this.#proposals.cancel(id)),
    "proposals.preview": ({ vault, intent }) => (
      this.#vault(vault),
      this.#proposals.preview(intent)
    ),
    "proposals.create": (params) => (this.#vault(params.vault), this.#proposals.create(params)),
    "aztec.aliases": () => aztecAliases(),
    "contracts.list": () => this.#contracts.list(),
    "contracts.functions": ({ contract, includeUtility }) =>
      this.#contracts.functions(contract.toLowerCase() as Hex32, includeUtility ?? false),
    "contracts.register": ({ address }) => {
      const view = this.#contracts.register(address.toLowerCase() as Hex32);
      this.#emit({ type: "contractAvailable", vault: VAULT, classId: view.classId });
      return view;
    },
    "contracts.remove": ({ contract }) => (
      this.#contracts.remove(contract.toLowerCase() as Hex32),
      null
    ),
    "devices.list": () => [],
    "lobby.list": () => this.#founding.list(),
    "lobby.create": (params) => this.#founding.create(params),
    "lobby.inspect": ({ invite }) => this.#founding.inspect(invite),
    "lobby.join": ({ invite }) => this.#founding.join(invite),
    "lobby.get": ({ lobby }) => this.#founding.get(lobby),
    "lobby.start": (params) => this.#founding.start(params),
    "lobby.leave": ({ lobby }) => (this.#founding.leave(lobby), null),
    "lobby.remove": (params) => this.#founding.remove(params),
    "lobby.update": (params) => this.#founding.update(params),
    "founding.begin": ({ lobby }) => this.#founding.begin(lobby),
    "founding.get": ({ lobby }) => this.#founding.founding(lobby),
    "membership.list": ({ vault }) => (this.#vault(vault), this.#membership.list()),
    "membership.request": () => this.#membership.request(),
    "membership.plan": (params) => (this.#vault(params.vault), this.#membership.plan(params)),
    "membership.begin": ({ plan }) => this.#membership.begin(plan),
    "membership.get": ({ id }) => this.#membership.get(id),
  };
}
