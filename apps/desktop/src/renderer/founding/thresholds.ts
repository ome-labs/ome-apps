// A vault's two thresholds, in words: how many members approve a payment, and how many keepers must answer to read.

export interface Shape {
  approvals: number;
  read: number;
}

export const LIMITS = { approvals: { min: 1, max: 8 }, read: { min: 2, max: 8 } } as const;

/** Why the lobby can't start yet, if it can't. */
export function blocker({ approvals, read }: Shape, members: number): string | undefined {
  if (members < 2) return "Wait for at least one co-founder to join.";
  if (read > members) return `Reading needs ${read} members; ${members} have joined.`;
  if (approvals > members) return `Approving needs ${approvals} members; ${members} have joined.`;
  return undefined;
}

/** "aztec:31337:…" → "Local network". */
export function networkName(network: string): string {
  const chain = network.split(":")[1];
  if (chain === "31337") return "Local network";
  if (chain === "11155111") return "Testnet";
  return "Another network";
}
