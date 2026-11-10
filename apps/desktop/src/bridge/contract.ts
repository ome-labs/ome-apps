// What the renderer may ask of the main process. The renderer never reaches the daemon itself: it calls
// `window.ome.call`, and the main process checks the method against this list before passing it on.
import type {
  DaemonEvent,
  DaemonMethod,
  DaemonParams,
  DaemonResult,
  ErrorKind,
  NodeStatus,
} from "@ome-labs/api";

/** Methods only the main process uses: the session handshake, the event stream and stopping the daemon. */
type MainOnly = "session.auth" | "events.subscribe" | "daemon.stop";

/** A daemon method the renderer may call. */
export type RendererMethod = Exclude<DaemonMethod, MainOnly>;

/**
 * Every renderer method, checked at runtime. `satisfies` keeps it complete: a method the daemon adds fails the
 * typecheck here until it is listed.
 */
const ALLOWED = {
  "daemon.info": true,
  status: true,
  "profile.create": true,
  "config.get": true,
  "config.set": true,
  "relays.set": true,
  "keeper.connect": true,
  "signer.status": true,
  "signer.unlock": true,
  "signer.lock": true,
  "signer.sealingKey": true,
  "node.status": true,
  "lobby.inspect": true,
  "lobby.create": true,
  "lobby.join": true,
  "lobby.get": true,
  "lobby.list": true,
  "lobby.start": true,
  "lobby.leave": true,
  "founding.begin": true,
  "founding.get": true,
  "vault.list": true,
  "vault.details": true,
  "vault.peers": true,
  "vault.audit": true,
  "vault.activity": true,
  "vault.counterparties": true,
  "vault.alias": true,
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
  };
  /** Development builds only: pick the data source and the fixture scenario. */
  dev?: {
    get(): Promise<DevState>;
    set(state: Partial<DevState>): Promise<DevState>;
  };
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
  devGet: "ome:dev:get",
  devSet: "ome:dev:set",
} as const;
