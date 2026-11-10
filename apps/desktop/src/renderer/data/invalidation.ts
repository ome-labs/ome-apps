// Which cached queries a daemon event makes stale. Kept separate from React so it can be tested on its own.
import type { DaemonEvent } from "@ome-labs/api";

/** Methods whose results come from the daemon's own state rather than a vault. */
const DAEMON_WIDE = new Set([
  "status",
  "signer.status",
  "node.status",
  "daemon.info",
  "vault.list",
]);

/** Whether a query keyed `[method, params]` should refetch after `event`. */
export function isStale(event: DaemonEvent, key: readonly unknown[]): boolean {
  const [method, params] = key;
  switch (event.type) {
    case "signer":
    case "node":
    case "keeper":
      return typeof method === "string" && DAEMON_WIDE.has(method);
    case "vaultActivity":
      return vaultOf(params) === event.vault || method === "vault.list";
    default:
      // Lobbies, foundings, rotations, executions and keeper reports touch many views; refetch everything.
      return true;
  }
}

function vaultOf(params: unknown): unknown {
  return typeof params === "object" && params !== null && "vault" in params
    ? params.vault
    : undefined;
}
