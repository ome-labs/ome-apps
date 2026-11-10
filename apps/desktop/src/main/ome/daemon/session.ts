import { join } from "node:path";

// The session on the member's own daemon: opens a profile (starting its `omed` when it isn't running), sets up a new
// one the way `ome init` does, forwards calls and events, and starts the daemon again if it goes away.
import type {
  ContractView,
  DaemonEvent,
  DaemonParams,
  DaemonResult,
  NodeStatus,
  SignerStatus,
} from "@ome-labs/api";
import { shell } from "electron";

import type {
  ContractImport,
  Preflight,
  RendererMethod,
  SessionState,
  SetupRequest,
  TouchIdState,
} from "../../../bridge/contract.ts";
import { readArtifact } from "../../contracts.ts";
import { knownNetwork, lastProfile, rememberNetwork, rememberProfile } from "../../preferences.ts";
import { OmeError } from "../client.ts";
import type { AppSession } from "../session.ts";
import type { DaemonConnection } from "./connection.ts";
import { listProfiles, omeHome, profileDir, profileNameFor } from "./home.ts";
import { keeperPath, omedPath, restart, start } from "./launch.ts";
import { assertSameNetwork, probeNode } from "./node-probe.ts";
import {
  authenticate,
  forgetSealingKey,
  readSealingKey,
  storeSealingKey,
  touchIdAvailable,
  touchIdEnabled,
} from "./touch-id.ts";

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));

export class DaemonSession implements AppSession {
  #state: SessionState = { phase: "choose", profiles: [] };
  #connection: DaemonConnection | undefined;
  readonly #stateListeners = new Set<(state: SessionState) => void>();
  readonly #eventListeners = new Set<(event: DaemonEvent) => void>();

  state(): SessionState {
    return this.#state;
  }

  onState(listener: (state: SessionState) => void): () => void {
    this.#stateListeners.add(listener);
    return () => this.#stateListeners.delete(listener);
  }

  async preflight(): Promise<Preflight> {
    return { home: omeHome(), omed: omedPath() ?? null, keeper: keeperPath() ?? null };
  }

  async boot(): Promise<void> {
    const profiles = await listProfiles();
    const last = lastProfile();
    const pick =
      profiles.find((p) => p.name === last) ?? (profiles.length === 1 ? profiles[0] : undefined);
    if (pick) await this.open(pick.name);
    else this.#set({ phase: "choose", profiles });
  }

  async open(profile: string): Promise<void> {
    // The setup's daemon is this profile's: `profile.create` just made it, so keep the session.
    if (this.#connection && this.#profile() === profile) {
      this.#set({ phase: "ready", profile });
      rememberProfile(profile);
      return;
    }
    this.#drop();
    this.#set({ phase: "starting", profile });
    try {
      this.#attach(await start(profile));
      this.#set({ phase: "ready", profile });
      rememberProfile(profile);
    } catch (error) {
      this.#set({ phase: "failed", profile, message: message(error) });
    }
  }

  async setup({ member, nodeUrl }: SetupRequest): Promise<NodeStatus> {
    const profile = profileNameFor(member);
    const taken = (await listProfiles()).find((p) => p.name === profile);
    if (taken) {
      throw new OmeError(
        "invalid",
        `${taken.member} already has a profile on this computer. Open it from the list, or use another name.`,
      );
    }
    if (this.#profile() !== profile || this.#state.phase !== "setup") {
      this.#drop();
      this.#set({ phase: "setup", profile });
    }

    try {
      let connection = this.#connection ?? (await start(profile));
      // The daemon reads the node URL as it starts, so a new one needs a restart.
      const info = await connection.call("daemon.info", {});
      if (info.node !== nodeUrl) {
        await connection.call("config.set", { nodeUrl });
        if (connection === this.#connection) this.#connection = undefined;
        connection = await restart(profile, connection);
      }
      if (connection !== this.#connection) this.#attach(connection);
      return await connection.call("node.status", {});
    } catch (error) {
      if (!this.#connection) this.#set({ phase: "choose", profiles: await listProfiles() });
      throw error;
    }
  }

  async retry(): Promise<void> {
    const profile = this.#profile();
    if (profile) await this.open(profile);
  }

  async leave(): Promise<void> {
    // The daemon keeps running, as it does when the CLI exits: other apps and the keeper may rely on it.
    this.#drop();
    this.#set({ phase: "choose", profiles: await listProfiles() });
  }

  profileKey(): string | undefined {
    const profile = this.#profile();
    return profile ? profileDir(profile) : undefined;
  }

  async touchId(): Promise<TouchIdState> {
    const profile = this.#profile();
    return {
      available: touchIdAvailable(),
      enabled: profile !== undefined && touchIdEnabled(profileDir(profile)),
    };
  }

  async enableTouchId(passphrase: string): Promise<void> {
    const profile = this.#openProfile();
    await authenticate("turn on Touch ID for Ome");
    const { key } = await this.call("signer.sealingKey", { passphrase });
    await storeSealingKey(profileDir(profile), key);
  }

  async disableTouchId(): Promise<void> {
    await forgetSealingKey(profileDir(this.#openProfile()));
  }

  async unlockWithTouchId(ttlSecs: number): Promise<SignerStatus> {
    const profile = this.#openProfile();
    const key = await readSealingKey(profileDir(profile), `unlock Ome profile ${profile}`);
    return this.call("signer.unlock", { secret: { key }, ttlSecs });
  }

  async restart(): Promise<void> {
    const profile = this.#openProfile();
    const connection = this.#connection;
    // Detached first, so its closing isn't taken for the daemon going away.
    this.#connection = undefined;
    this.#set({ phase: "starting", profile });
    try {
      this.#attach(await restart(profile, connection as DaemonConnection));
      this.#set({ phase: "ready", profile });
    } catch (error) {
      this.#set({ phase: "failed", profile, message: message(error) });
    }
  }

  async changeNode(url: string): Promise<void> {
    const dir = profileDir(this.#openProfile());
    const next = await probeNode(url);
    const node = await this.call("node.status", {});
    assertSameNetwork(
      node.l1ChainId === null || node.rollupVersion === null
        ? knownNetwork(dir)
        : { l1ChainId: node.l1ChainId, rollupVersion: node.rollupVersion },
      next,
    );
    await this.call("config.set", { nodeUrl: url });
    await this.restart();
  }

  async openLog(which: "daemon" | "keeper"): Promise<void> {
    const failure = await shell.openPath(join(profileDir(this.#openProfile()), `${which}.log`));
    if (failure) throw new OmeError("failed", `The ${which} log couldn't be opened: ${failure}`);
  }

  async registerContract({
    address,
    artifactPath,
    instance,
  }: ContractImport): Promise<ContractView> {
    const artifact = await readArtifact(artifactPath);
    return this.call("contracts.register", {
      address,
      artifact,
      ...(instance ? { instance } : {}),
    });
  }

  async call<M extends RendererMethod>(
    method: M,
    params: DaemonParams<M>,
  ): Promise<DaemonResult<M>> {
    if (!this.#connection) throw new OmeError("unreachable", "No profile is open.");
    const result = await this.#connection.call(method, params);
    this.#noteNetwork(method, result);
    return result;
  }

  subscribe(listener: (event: DaemonEvent) => void): () => void {
    this.#eventListeners.add(listener);
    return () => this.#eventListeners.delete(listener);
  }

  /** Remembers the network whenever the node answers, so a later node change can be checked while it's down. */
  #noteNetwork(method: string, result: unknown): void {
    const node =
      method === "node.status"
        ? (result as NodeStatus)
        : method === "status"
          ? (result as { node: NodeStatus }).node
          : undefined;
    const profile = this.#profile();
    if (!node?.reachable || node.l1ChainId === null || node.rollupVersion === null || !profile)
      return;
    rememberNetwork(profileDir(profile), {
      l1ChainId: node.l1ChainId,
      rollupVersion: node.rollupVersion,
    });
  }

  /** The profile whose daemon answers now, set up or being set up. */
  #openProfile(): string {
    const profile = this.#profile();
    if (!profile || !this.#connection) throw new OmeError("not-ready", "No profile is open.");
    return profile;
  }

  #profile(): string | undefined {
    return this.#state.phase === "choose" ? undefined : this.#state.profile;
  }

  #set(state: SessionState): void {
    this.#state = state;
    for (const listener of this.#stateListeners) listener(state);
  }

  #attach(connection: DaemonConnection): void {
    this.#connection = connection;
    void connection
      .subscribe((event) => {
        for (const listener of this.#eventListeners) listener(event);
      })
      .catch(() => undefined);
    void connection.closed.then(() => this.#lost(connection));
  }

  /** The daemon went away (it stopped, or the CLI restarted it): start it again, as the CLI would. */
  #lost(connection: DaemonConnection): void {
    if (connection !== this.#connection) return;
    this.#connection = undefined;
    const profile = this.#profile();
    if (profile && this.#state.phase === "ready") void this.open(profile);
  }

  #drop(): void {
    const connection = this.#connection;
    this.#connection = undefined;
    connection?.close();
  }
}
