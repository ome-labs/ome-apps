import type { Review } from "@ome-labs/api";
import { proposals } from "@ome-labs/format/sample";

export { aliases, omet, peers, proposals, treasury } from "@ome-labs/format/sample";

/** The kit's clock: 2026-11-09 12:40 UTC, two hours after the sample vault was founded. */
export const now = 1_794_228_000;

export const daveAlias = {
  address: "0xf461280a4b44f5e076c9b6126eb5151d1f0b2e960584b9a076a2ef18206e688d",
  label: "accounts:dave",
  source: "aztecWallet" as const,
};

/** Bob reviewing 3eb2 on his phone after Alice approved. The signed message is sample-shaped. */
export const review: Review = {
  proposal: {
    ...proposals.auditDeposit,
    status: "collecting",
    approvals: proposals.auditDeposit.approvals.slice(0, 1),
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
  recipient: daveAlias,
  simulation: { ok: true, gas: { da: 1536, l2: 412_800 }, error: null },
  signs: {
    message: "0x2b9f0e7c41d35a86f1c2e4b8d7a9036c5e1f4a2b8c7d6e5f4a3b2c1d0e9f8a7b",
    formula: 'Poseidon2("ome.approval.v0", [vault, outer hash, 1, deadline])',
  },
  rejects: {
    message: "0x0c4d8e2f6a1b3c5d7e9f0a2b4c6d8e0f1a3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d",
    formula: 'Poseidon2("ome.rejection.v0", [vault, outer hash, 1, deadline])',
  },
};
