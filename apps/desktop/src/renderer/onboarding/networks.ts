// The networks a profile can start on, as `ome init` offers them.
import type { NodeStatus } from "@ome-labs/api";

export const LOCAL_NODE = "http://localhost:8080";
export const TESTNET_NODE = "https://aztec-testnet.drpc.org";

export type NetworkChoice = "local" | "testnet" | "custom";

export const NETWORK_OPTIONS: { value: NetworkChoice; label: string }[] = [
  { value: "local", label: "Local network" },
  { value: "testnet", label: "Testnet" },
  { value: "custom", label: "Another node" },
];

export function isLocal(url: string): boolean {
  return url.includes("localhost") || url.includes("127.0.0.1");
}

/** "Local network · block 1,210": what answered, by its L1 chain. */
export function describeNode(node: NodeStatus): string {
  const network =
    node.l1ChainId === 31_337
      ? "Local network"
      : node.l1ChainId === 11_155_111
        ? "Testnet"
        : "Aztec node";
  return node.blockNumber === null
    ? network
    : `${network} · block ${node.blockNumber.toLocaleString("en-US")}`;
}

/** What to do when the node doesn't answer. */
export function nodeFix(url: string): string {
  return isLocal(url)
    ? "Start one with aztec start --local-network, then try again."
    : "Check the URL, or try again in a moment.";
}
