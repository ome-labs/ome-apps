// The app's session: which profile it's on, whether that profile's daemon answers, and the calls and events of that
// daemon. Two implementations: `daemon/session.ts` (the member's `omed`) and `fixtures/session.ts` (sample data).
import type { NodeStatus } from "@ome-labs/api";

import type { Preflight, SessionState, SetupRequest } from "../../bridge/contract.ts";
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
}
