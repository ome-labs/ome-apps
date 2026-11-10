// The main process's view of a member's daemon. Two implementations: `fixtures/` (sample data and scenarios, for
// building screens without a daemon) and, later, `daemon/` (the real socket client).
import type { DaemonEvent, DaemonParams, DaemonResult } from "@ome-labs/api";

import type { FailureKind, RendererMethod } from "../../bridge/contract.ts";

export interface OmeClient {
  call<M extends RendererMethod>(method: M, params: DaemonParams<M>): Promise<DaemonResult<M>>;
  /** Streams daemon events; returns the function that stops them. */
  subscribe(listener: (event: DaemonEvent) => void): () => void;
}

/** A failure with the daemon's error kind, so the renderer can treat `locked` differently from `not-found`. */
export class OmeError extends Error {
  constructor(
    readonly kind: FailureKind,
    message: string,
  ) {
    super(message);
  }
}
