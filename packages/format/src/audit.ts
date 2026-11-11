// The keeper audit log in a member's words: what a keeper's request to this one was for, and how it ended.
import type { AuditView } from "@ome-labs/api";

import { shortHex } from "./address.ts";
import type { Tone } from "./tone.ts";

const PURPOSES: Record<string, string> = {
  decryption: "Reading a payment or balance",
  handshake: "Recognising a new sender",
  "recipient-tag": "Finding notes sent to the vault",
  "sender-tag": "Finding notes the vault sent",
};

/** "Reading a payment or balance"; a purpose this release doesn't know shows as the keeper named it. */
export function auditPurpose(purpose: string): string {
  return PURPOSES[purpose] ?? purpose;
}

/** Who asked: "You" for this member's own daemon, the member's name, or the short keeper identity. */
export function auditRequester(entry: Pick<AuditView, "requester" | "requesterName">): string {
  if (entry.requester === "local") return "You";
  return entry.requesterName ?? `Keeper ${shortHex(entry.requester)}`;
}

/** "Served", or the keeper's reason for refusing, with the tone it shows in. */
export function auditOutcome(outcome: string): { text: string; tone: Tone; refused: boolean } {
  if (outcome === "served") return { text: "Served", tone: "success", refused: false };
  const reason = outcome.replace(/^refused:?\s*/u, "");
  return { text: reason ? `Refused: ${reason}` : "Refused", tone: "danger", refused: true };
}
