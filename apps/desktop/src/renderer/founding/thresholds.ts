// A vault's two thresholds, in words: how many members approve a payment, and how many keepers must answer to read.

export interface Shape {
  approvals: number;
  read: number;
}

export interface Risk {
  id: string;
  text: string;
  /** Needs a deliberate yes before the lobby starts. */
  confirm: boolean;
}

export const LIMITS = { approvals: { min: 1, max: 8 }, read: { min: 2, max: 8 } } as const;

/** Shapes worth recommending: each survives losing a member and still spends and reads. */
export const PRESETS = [
  { members: 3, approvals: 2, read: 2, survives: "Survives losing any one member." },
  { members: 5, approvals: 3, read: 3, survives: "Survives losing any two." },
] as const;

/** What a choice risks, once the member count is known. */
export function risks({ approvals, read }: Shape, members: number): Risk[] {
  const out: Risk[] = [];
  if (approvals === members) {
    out.push({
      id: "approvals-all",
      text: "Every member must approve every payment. If one member loses their key, nothing can be spent.",
      confirm: true,
    });
  }
  if (read === members) {
    out.push({
      id: "read-all",
      text: "Every member's keeper must answer to read balances. If one goes away for good, the vault can't be read.",
      confirm: true,
    });
  }
  if (approvals === 1) {
    out.push({ id: "approvals-one", text: "Any one member can spend alone.", confirm: false });
  }
  out.push({
    id: "read-past",
    text: `Any ${read} members together, even ones who later leave, could read what arrived while they were members.`,
    confirm: false,
  });
  return out;
}

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
