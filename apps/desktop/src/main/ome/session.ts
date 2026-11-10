// The app's session: which profile it's on, whether that profile's daemon answers, and the calls and events of that
// daemon. Two implementations: `daemon/session.ts` (the member's `omed`) and `fixtures/session.ts` (sample data).
import type { ContractView, NodeStatus, SignerStatus } from "@ome-labs/api";

import type {
  ContractImport,
  Preflight,
  SessionState,
  SetupRequest,
  TouchIdState,
} from "../../bridge/contract.ts";
import type { OmeClient } from "./client.ts";

export interface AppSession extends OmeClient {
  state(): SessionState;
  /** Calls `listener` on every change of state; returns the function that stops it. */
  onState(listener: (state: SessionState) => void): () => void;
  preflight(): Promise<Preflight>;
  /** Picks the profile to open at launch: the one last opened, or the only one; else the list. */
  boot(): Promise<void>;
  open(profile: string): Promise<void>;
  setup(request: SetupRequest): Promise<NodeStatus>;
  retry(): Promise<void>;
  leave(): Promise<void>;
  /** Where this profile's on-computer state is keyed: its folder, or a fixed name on the fixtures. */
  profileKey(): string | undefined;
  touchId(): Promise<TouchIdState>;
  /** Derives the sealing key from the passphrase (`signer.sealingKey`) and keeps it behind Touch ID. */
  enableTouchId(passphrase: string): Promise<void>;
  disableTouchId(): Promise<void>;
  /** Asks for Touch ID, then unlocks the signer with the kept key. */
  unlockWithTouchId(ttlSecs: number): Promise<SignerStatus>;
  /** Stops and starts the profile's daemon, for settings it reads only as it starts (proving, relays). */
  restart(): Promise<void>;
  /** Points the daemon at another node on the same network, then restarts it to use it. */
  changeNode(url: string): Promise<void>;
  /** Opens the daemon's or the keeper's log in the system's viewer. */
  openLog(which: "daemon" | "keeper"): Promise<void>;
  /** Reads an artifact file and registers the contract at its address with the daemon. */
  registerContract(request: ContractImport): Promise<ContractView>;
}
