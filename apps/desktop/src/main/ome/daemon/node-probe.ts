// Asking an Aztec node which network it's on before the daemon is pointed at it. A profile belongs to one network for
// life (its account, vaults and wallet data live there), so a node on another network is refused up front.
import { OmeError } from "../client.ts";

const LOCAL_CHAIN = 31_337;
const TIMEOUT_MS = 8_000;

import type { NetworkIdentity } from "../../preferences.ts";

export type NodeIdentity = NetworkIdentity;

/** The network a node reports (`node_getNodeInfo`), or `not-ready` when nothing answers there. */
export async function probeNode(url: string): Promise<NodeIdentity> {
  let info: { l1ChainId?: unknown; rollupVersion?: unknown } | undefined;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "node_getNodeInfo", params: [] }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    info = ((await response.json()) as { result?: typeof info }).result;
  } catch {
    throw new OmeError("not-ready", `No Aztec node answers at ${url}.`);
  }
  const l1ChainId = Number(info?.l1ChainId);
  const rollupVersion = Number(info?.rollupVersion);
  if (!Number.isFinite(l1ChainId) || !Number.isFinite(rollupVersion)) {
    throw new OmeError("invalid", `${url} answers, but not as an Aztec node.`);
  }
  return { l1ChainId, rollupVersion };
}

const networkName = (chain: number | null) =>
  chain === LOCAL_CHAIN ? "the local network" : chain === 11_155_111 ? "Testnet" : `chain ${chain}`;

/**
 * Whether a node is on the profile's network: the same L1 chain, and on anything but a local network the same rollup
 * (a local network's rollup version changes with each start).
 */
export function assertSameNetwork(current: NodeIdentity | undefined, next: NodeIdentity): void {
  if (!current) {
    throw new OmeError(
      "not-ready",
      "This profile's network isn't known yet: its node hasn't answered since the app started. Try again when it does.",
    );
  }
  const sameChain = current.l1ChainId === next.l1ChainId;
  const sameRollup = next.l1ChainId === LOCAL_CHAIN || current.rollupVersion === next.rollupVersion;
  if (sameChain && !sameRollup) {
    throw new OmeError(
      "invalid",
      `That node runs another rollup on ${networkName(next.l1ChainId)} than this profile's. Set up another profile to use it.`,
    );
  }
  if (!sameChain) {
    throw new OmeError(
      "invalid",
      `That node is on ${networkName(next.l1ChainId)}; this profile is on ${networkName(current.l1ChainId)}. ` +
        "Set up another profile to use it.",
    );
  }
}
