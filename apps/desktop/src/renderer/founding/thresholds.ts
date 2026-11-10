// A vault's two thresholds, in words: how many members approve a payment, and how many keepers must answer to read.

export interface Shape {
  approvals: number;
  read: number;
}

export const LIMITS = {
  members: { min: 2, max: 8 },
  approvals: { min: 1, max: 8 },
  read: { min: 2, max: 8 },
} as const;

/**
 * Why the lobby can't start yet, if it can't. With the planned member count, exactly that many must have joined: the
 * vault is founded with whoever is on the roster, so an extra joiner would quietly widen it. Without it (a lobby
 * opened elsewhere), only the thresholds are checked.
 */
export function blocker(
  { approvals, read }: Shape,
  joined: number,
  planned?: number,
): string | undefined {
  if (planned !== undefined) {
    if (joined > planned) {
      return `${joined} joined, but this vault is for ${planned}. Cancel the lobby and start again with a new invite.`;
    }
    if (joined < planned) {
      const missing = planned - joined;
      return `Waiting for ${missing} more to join.`;
    }
    return undefined;
  }
  if (joined < 2) return "Wait for at least one co-founder to join.";
  if (read > joined) return `Reading needs ${read} members; ${joined} have joined.`;
  if (approvals > joined) return `Approving needs ${approvals} members; ${joined} have joined.`;
  return undefined;
}

/** "aztec:31337:…" → "Local network". */
export function networkName(network: string): string {
  const chain = network.split(":")[1];
  if (chain === "31337") return "Local network";
  if (chain === "11155111") return "Testnet";
  return "Another network";
}
