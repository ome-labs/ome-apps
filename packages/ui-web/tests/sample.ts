import type { Review } from "@ome-labs/api";
import { aliases, proposals } from "@ome-labs/format/sample";

export { aliases, omet, peers, proposals, treasury } from "@ome-labs/format/sample";

/** The tests' clock: 2026-11-09 12:40 UTC, two hours after the sample vault was founded. */
export const now = 1_794_228_000;

/** Bob reviewing 3eb2 after Alice approved. The signed messages are sample-shaped, like the guide's ids. */
export const reviewOfAuditDeposit: Review = {
  proposal: {
    ...proposals.auditDeposit,
    status: "collecting",
    votes: proposals.auditDeposit.votes.slice(0, 1),
    approvedByMe: false,
  },
  vaultName: "Treasury",
  myName: "Bob",
  checks: {
    rebuilt: true,
    outerHash: proposals.auditDeposit.outerHash,
    configCurrent: true,
    notExpired: true,
    failure: null,
  },
  action: "transfer 250 OMET (250000000000000000000 base units)",
  recipient: { address: aliases.dave, label: "accounts:dave", source: "aztecWallet" },
  change: null,
  simulation: {
    ok: true,
    gas: { da: 1536, l2: 412_800 },
    error: null,
    effects: null,
    fee: null,
  },
  signs: {
    message: "0x2b9f0e7c41d35a86f1c2e4b8d7a9036c5e1f4a2b8c7d6e5f4a3b2c1d0e9f8a7b",
    formula: 'Poseidon2("ome.approval.v0", [vault, outer hash, 1, deadline])',
  },
  rejects: {
    message: "0x0c4d8e2f6a1b3c5d7e9f0a2b4c6d8e0f1a3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d",
    formula: 'Poseidon2("ome.rejection.v0", [vault, outer hash, 1, deadline])',
  },
};
