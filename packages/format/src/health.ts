import type { MemberReachability } from "@ome-labs/api";

import type { Tone } from "./tone.ts";

type ReadingInput = {
  /** Every member's reachability, this member included. */
  peers: Pick<MemberReachability, "you" | "connected">[];
  /** Whether this member's own keeper holds its share and is serving (`committee.serving`). */
  serving: boolean;
  viewingThreshold: number;
};

export type ReadingHealth = {
  answering: number;
  needed: number;
  members: number;
  /** Keepers that can drop out before the vault can't read: `answering − needed`. Negative when it can't read now. */
  spare: number;
  canRead: boolean;
  tone: Tone;
  /** "3 of 3 keepers answering · can lose 1", "2 of 3 · no spare", "1 of 3 · can't read now". */
  label: string;
};

/** "Can this vault still read?": answering keepers against the viewing threshold. */
export function readingHealth({ peers, serving, viewingThreshold }: ReadingInput): ReadingHealth {
  const members = peers.length;
  const answering = (serving ? 1 : 0) + peers.filter((peer) => !peer.you && peer.connected).length;
  const spare = answering - viewingThreshold;

  const base = { answering, needed: viewingThreshold, members, spare, canRead: spare >= 0 };
  if (spare > 0)
    return {
      ...base,
      tone: "success",
      label: `${answering} of ${members} keepers answering · can lose ${spare}`,
    };
  if (spare === 0)
    return { ...base, tone: "warning", label: `${answering} of ${members} · no spare` };
  return { ...base, tone: "danger", label: `${answering} of ${members} · can't read now` };
}

export type ThresholdRisk = {
  id: "unreadable-on-any-loss" | "frozen-on-any-loss" | "single-spender" | "pair-can-read";
  text: string;
};

type Shape = {
  /** Approvals to spend. */
  threshold: number;
  /** Members to read. */
  viewingThreshold: number;
  members: number;
};

/** The guide's four threshold risks, in its exact words, for those that apply to this shape. */
export function thresholdRisks({ threshold, viewingThreshold, members }: Shape): ThresholdRisk[] {
  const risks: ThresholdRisk[] = [];

  if (viewingThreshold === members) {
    risks.push({
      id: "unreadable-on-any-loss",
      text: "Losing any one keeper makes the vault unreadable for good.",
    });
  }
  if (threshold === members) {
    risks.push({
      id: "frozen-on-any-loss",
      text: "Losing any one signing key stops all spending for good.",
    });
  }
  if (threshold === 1) {
    risks.push({ id: "single-spender", text: "Any one member can spend alone." });
  }
  if (viewingThreshold === 2 && members >= 3) {
    risks.push({
      id: "pair-can-read",
      text: "Any two members, including two who later leave, could read what arrived while they were members.",
    });
  }

  return risks;
}

/** What a member can do about each risk, in the guide's recovery terms. */
export function riskRemedy(id: ThresholdRisk["id"]): string {
  switch (id) {
    case "unreadable-on-any-loss":
      return "Add a member, or lower the members needed to read, so one lost keeper leaves enough to read.";
    case "frozen-on-any-loss":
      return "Lower the approvals to spend below the member count, so one lost key doesn't freeze the vault.";
    case "single-spender":
      return "Raise the approvals to spend to at least 2, so no one member can move funds alone.";
    case "pair-can-read":
      return "Raise the members needed to read to 3 or more, so two members can't read on their own.";
  }
}

export type VaultHealthState = "removed" | "mismatch" | "unreadable" | "no-spare" | "healthy";

export type VaultHealth = {
  state: VaultHealthState;
  tone: Tone;
  /** One line for the page and the overview: "Healthy", "Can't read new payments now". */
  title: string;
  /** What it means and what to do. */
  detail: string;
};

type VaultHealthInput = {
  reading: ReadingHealth;
  /** Whether this member's keeper still serves the vault (`committee.serving`). */
  serving: boolean;
  /** Whether the on-chain config names this committee; null before it was read. */
  matchesCommittee: boolean | null;
};

/** The vault's health in one state, most serious first. */
export function vaultHealth({ reading, serving, matchesCommittee }: VaultHealthInput): VaultHealth {
  if (!serving) {
    return {
      state: "removed",
      tone: "danger",
      title: "Your keeper no longer serves this vault",
      detail:
        "A membership change left this member out, and the keeper destroyed its share. The other members' vault keeps working without you.",
    };
  }
  if (matchesCommittee === false) {
    return {
      state: "mismatch",
      tone: "danger",
      title: "The vault on chain names a committee your keeper can't verify",
      detail:
        "Your keeper won't serve it until this is understood. Check with the other members before approving anything.",
    };
  }
  if (!reading.canRead) {
    return {
      state: "unreadable",
      tone: "danger",
      title: "Can't read new payments now",
      detail: `${reading.answering} of the ${reading.needed} keepers needed are answering. Payments still arrive, and show once enough keepers are back online.`,
    };
  }
  if (reading.spare === 0) {
    return {
      state: "no-spare",
      tone: "warning",
      title: "Reading works, with no keeper to spare",
      detail: "If one more keeper goes offline, the vault can't read new payments until it's back.",
    };
  }
  return {
    state: "healthy",
    tone: "success",
    title: "Healthy",
    detail: `Every check passes, and ${reading.spare === 1 ? "one keeper" : `${reading.spare} keepers`} can go offline without losing reading.`,
  };
}
