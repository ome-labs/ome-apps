// The networks a profile can start on, as `ome init` offers them.
export const LOCAL_NODE = "http://localhost:8080";
export const TESTNET_NODE = "https://aztec-testnet.drpc.org";

export type NetworkChoice = "testnet" | "local";

export const NETWORK_OPTIONS: { value: NetworkChoice; label: string }[] = [
  { value: "testnet", label: "Testnet" },
  { value: "local", label: "Local network" },
];

export const NODE_URLS: Record<NetworkChoice, string> = {
  testnet: TESTNET_NODE,
  local: LOCAL_NODE,
};

export function isLocal(url: string): boolean {
  return url.includes("localhost") || url.includes("127.0.0.1");
}

/** What to do when the node doesn't answer. */
export function nodeFix(url: string): string {
  return isLocal(url)
    ? "Start one with aztec start --local-network, then try again."
    : "Check the URL, or try again in a moment.";
}
