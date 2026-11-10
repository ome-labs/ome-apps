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
