// What the renderer may ask of the main process. The renderer never reaches the daemon itself: it calls
// `window.ome.call`, and the main process checks the method against this list before passing it on.
import type {
  ContractInstanceInput,
  ContractView,
  DaemonEvent,
  DaemonMethod,
  DaemonParams,
  DaemonResult,
  ErrorKind,
  Hex32,
  NodeStatus,
  SignerStatus,
} from "@ome-labs/api";

/** Methods only the main process uses: the session handshake, the event stream and stopping the daemon. */
type MainOnly = "session.auth" | "events.subscribe" | "daemon.stop";

/** What a connected app calls through the daemon's app page; the member's own app never makes those calls. */
type AppOnly = "apps.call";

/** A daemon method the renderer may call. */
export type RendererMethod = Exclude<DaemonMethod, MainOnly | AppOnly>;

/**
 * Every renderer method, checked at runtime. `satisfies` keeps it complete: a method the daemon adds fails the
 * typecheck here until it is listed.
 */
const ALLOWED = {
  "daemon.info": true,
  status: true,
  "profile.create": true,
  "profile.rename": true,
  "profile.delete": true,
  "config.get": true,
  "config.set": true,
  "relays.set": true,
  "keeper.connect": true,
  "signer.status": true,
  "signer.unlock": true,
  "signer.lock": true,
  "signer.sealingKey": true,
  "signer.changePassphrase": true,
  "node.status": true,
  "fees.status": true,
  "lobby.inspect": true,
  "lobby.create": true,
  "lobby.join": true,
  "lobby.get": true,
  "lobby.list": true,
  "lobby.start": true,
  "lobby.leave": true,
  "lobby.remove": true,
  "lobby.update": true,
  "founding.begin": true,
  "founding.get": true,
  "vault.list": true,
  "vault.details": true,
  "vault.peers": true,
  "vault.audit": true,
  "vault.activity": true,
  "vault.counterparties": true,
  "vault.receiving": true,
  "vault.request": true,
  "vault.alias": true,
  "vault.rename": true,
  "vault.retire": true,
  "vault.use": true,
  "tokens.list": true,
  "tokens.add": true,
  "tokens.remove": true,
  "tokens.deployTest": true,
  "proposals.list": true,
  "proposals.get": true,
  "proposals.preview": true,
  "proposals.create": true,
  "proposals.review": true,
  "proposals.approve": true,
  "proposals.reject": true,
  "proposals.execute": true,
  "proposals.cancel": true,
  "contracts.functions": true,
  "contracts.register": true,
  "contracts.list": true,
  "contracts.remove": true,
  "aztec.aliases": true,
  "aztec.alias": true,
  "membership.request": true,
  "membership.plan": true,
  "membership.begin": true,
  "membership.get": true,
  "membership.list": true,
  "membership.swapSigner": true,
  "devices.pair": true,
  "devices.list": true,
  "devices.revoke": true,
  "devices.enroll": true,
  "devices.forward": true,
  "apps.list": true,
  "apps.allow": true,
  "apps.revoke": true,
} as const satisfies Record<RendererMethod, true>;

export function isRendererMethod(method: unknown): method is RendererMethod {
  return typeof method === "string" && Object.hasOwn(ALLOWED, method);
}

/**
 * Why a call failed: one of the daemon's error kinds, or `unreachable` when no daemon answered at all (it isn't
 * running, or its socket refused us), which the renderer shows as a full-screen state rather than an error.
 */
export type FailureKind = ErrorKind | "unreachable";

/** A failed call, as it crosses from the main process to the renderer (Electron keeps only an Error's message). */
export interface CallFailure {
  kind: FailureKind;
  message: string;
}

/** What crosses IPC for a request: errors travel as data so their kind survives the boundary. */
export type Outcome<T> = { ok: true; value: T } | { ok: false; error: CallFailure };

/** What `ome:call` returns. */
export type CallOutcome<M extends RendererMethod> = Outcome<DaemonResult<M>>;

/** A profile on this computer that was set up: its folder name and the member's name. */
export interface ProfileSummary {
  name: string;
  member: string;
}

/**
 * Which profile the app is on and whether its daemon answers. `choose` comes first: no profile yet (first run) or
 * several to pick from. `setup` is a daemon started for a profile that `profile.create` hasn't made yet.
 */
export type SessionState =
  | { phase: "choose"; profiles: ProfileSummary[] }
  | { phase: "starting"; profile: string }
  | { phase: "setup"; profile: string }
  | { phase: "ready"; profile: string }
  | { phase: "failed"; profile: string; message: string };

/** What the first run checks before it offers to set up: where the home is and whether the programs are there. */
export interface Preflight {
  home: string;
  omed: string | null;
  keeper: string | null;
}

/** Whether this Mac can use Touch ID, and whether the open profile unlocks with it. */
export interface TouchIdState {
  available: boolean;
  enabled: boolean;
}

/** A picture for a profile or a vault: one of the kit's avatars, or an image the member chose (as a data URL). */
export type AvatarChoice = { kind: "art"; id: string } | { kind: "image"; url: string };

/** Whose picture: the open profile's, or one of its vaults'. */
export type AvatarTarget = { kind: "profile" } | { kind: "vault"; vault: string };

/** The open profile's pictures, kept on this computer only. */
export interface Avatars {
  profile: AvatarChoice | null;
  vaults: Record<string, AvatarChoice>;
}

/** The first step of setting up: who the member is and which node their account lives on. */
export interface SetupRequest {
  member: string;
  nodeUrl: string;
}

/** Where the main process gets its answers: the sample data, or the member's daemon. */
export type Source = "fixtures" | "daemon";

/** What the app remembers between launches. The window's size and position are kept by the main process alone. */
export interface Preferences {
  theme: "light" | "dark" | "system";
}

/** The API `src/preload` exposes as `window.ome`. */
export interface OmeBridge {
  /** Resolves with the outcome, never rejects: contextBridge would strip a thrown error down to its message. */
  call<M extends RendererMethod>(method: M, params: DaemonParams<M>): Promise<CallOutcome<M>>;
  onEvent(listener: (event: DaemonEvent) => void): () => void;
  preferences: {
    get(): Promise<Preferences>;
    set(patch: Partial<Preferences>): Promise<Preferences>;
  };
  /**
   * The window's own controls: the app draws its title bar on every platform. macOS keeps its traffic lights inset in
   * it; elsewhere the app draws minimise, maximise and close.
   */
  window: {
    platform: string;
    minimize(): void;
    toggleMaximize(): void;
    close(): void;
  };
  session: {
    state(): Promise<SessionState>;
    onState(listener: (state: SessionState) => void): () => void;
    preflight(): Promise<Preflight>;
    /** Opens a profile that was set up, starting its daemon if it isn't running. */
    open(profile: string): Promise<Outcome<null>>;
    /** Starts a daemon for a new member, points it at the node and says whether the node answers. */
    setup(request: SetupRequest): Promise<Outcome<NodeStatus>>;
    /** Starts the current profile's daemon again after it failed. */
    retry(): Promise<Outcome<null>>;
    /** Leaves the profile for the list of profiles (or the first run). */
    leave(): Promise<Outcome<null>>;
    /** Restarts the profile's daemon, for settings it reads only as it starts. */
    restart(): Promise<Outcome<null>>;
    /** Points the daemon at another node on the profile's network, and restarts it. */
    changeNode(url: string): Promise<Outcome<null>>;
    openLog(which: "daemon" | "keeper"): Promise<Outcome<null>>;
  };
  /** Pictures for the open profile and its vaults, on this computer only; other members don't see them. */
  avatars: {
    get(): Promise<Avatars>;
    /** Every profile's own picture on this computer, by profile name, for the list of profiles. */
    ofProfiles(): Promise<Record<string, AvatarChoice>>;
    setArt(target: AvatarTarget, id: string): Promise<Outcome<Avatars>>;
    /** Asks for an image file; `null` when the member cancels. */
    chooseFile(target: AvatarTarget): Promise<Outcome<Avatars | null>>;
    clear(target: AvatarTarget): Promise<Outcome<Avatars>>;
  };
  /**
   * Contracts a proposal can call. The renderer names an artifact file (from an `aztec-wallet` alias, or one the member
   * chose); the main process reads it and hands it to the daemon, which checks it is the code at the address.
   */
  contracts: {
    /** Asks for an artifact file; `null` when the member cancels. */
    chooseArtifact(): Promise<Outcome<string | null>>;
    register(request: ContractImport): Promise<Outcome<ContractView>>;
  };
  /** This app's version, for About. */
  version: string;
  /**
   * Touch ID for the open profile (macOS). The sealing key it guards stays in the main process: turning it on takes
   * the passphrase once, and unlocking asks for a fingerprint, not the key.
   */
  touchId: {
    state(): Promise<TouchIdState>;
    enable(passphrase: string): Promise<Outcome<null>>;
    disable(): Promise<Outcome<null>>;
    unlock(ttlSecs: number): Promise<Outcome<SignerStatus>>;
  };
  /** Development builds only: pick the data source and the fixture scenario. */
  dev?: {
    get(): Promise<DevState>;
    set(state: Partial<DevState>): Promise<DevState>;
  };
}

/** A contract to register from an artifact file on this computer. */
export interface ContractImport {
  address: Hex32;
  /** Absolute path of the artifact JSON (`aztec compile`'s output, or what `aztec-wallet` keeps). */
  artifactPath: string;
  /** Its deployment, for a contract the node doesn't publish. */
  instance?: ContractInstanceInput | undefined;
}

/** The development switches. */
export interface DevState {
  source: Source;
  scenario: string;
  scenarios: readonly string[];
}

/** IPC channel names. */
export const CHANNELS = {
  call: "ome:call",
  event: "ome:event",
  preferencesGet: "ome:preferences:get",
  preferencesSet: "ome:preferences:set",
  windowMinimize: "ome:window:minimize",
  windowToggleMaximize: "ome:window:toggle-maximize",
  windowClose: "ome:window:close",
  sessionState: "ome:session:state",
  sessionChanged: "ome:session:changed",
  sessionPreflight: "ome:session:preflight",
  sessionOpen: "ome:session:open",
  sessionSetup: "ome:session:setup",
  sessionRetry: "ome:session:retry",
  sessionLeave: "ome:session:leave",
  sessionRestart: "ome:session:restart",
  sessionChangeNode: "ome:session:change-node",
  sessionOpenLog: "ome:session:open-log",
  avatarsGet: "ome:avatars:get",
  avatarsOfProfiles: "ome:avatars:of-profiles",
  avatarsSetArt: "ome:avatars:set-art",
  avatarsChooseFile: "ome:avatars:choose-file",
  avatarsClear: "ome:avatars:clear",
  touchIdState: "ome:touch-id:state",
  touchIdEnable: "ome:touch-id:enable",
  touchIdDisable: "ome:touch-id:disable",
  touchIdUnlock: "ome:touch-id:unlock",
  contractsChooseArtifact: "ome:contracts:choose-artifact",
  contractsRegister: "ome:contracts:register",
  devGet: "ome:dev:get",
  devSet: "ome:dev:set",
} as const;
