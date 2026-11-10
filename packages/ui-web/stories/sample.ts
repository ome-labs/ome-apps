import type { ActivityEntry, Review } from "@ome-labs/api";
import { proposals } from "@ome-labs/format/sample";

export { aliases, omet, peers, proposals, treasury } from "@ome-labs/format/sample";

/** The stories' clock: 2026-11-09 12:40 UTC, two hours after the sample vault was founded. */
export const now = 1_794_228_000;

export const daveAlias = {
  address: "0xf461280a4b44f5e076c9b6126eb5151d1f0b2e960584b9a076a2ef18206e688d",
  label: "accounts:dave",
  source: "aztecWallet" as const,
};

/** Bob reviewing 3eb2 after Alice approved. The signed messages are sample-shaped, like the guide's ids. */
export const reviewOfAuditDeposit: Review = {
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

export const activity: ActivityEntry[] = [
  {
    kind: "proposal",
    at: now - 12 * 60,
    proposal: { ...proposals.auditDeposit, status: "executed" },
  },
  {
    kind: "received",
    at: now - 2 * 3600,
    token: proposals.auditDeposit.token,
    from: "0x51d85d773ad9865e0173d205de87e4dcb016caa9755277583b6815f8aa640d31",
    amount: "1000000000000000000000",
    txHash: "0xf1ac958104443f60cd437bf3c758411c6e2e01c5f70194d83735020805015338",
    block: 1182,
  },
];

export const aliceAccount = "0x51d85d773ad9865e0173d205de87e4dcb016caa9755277583b6815f8aa640d31";
export const executedTx = "0x1ddb736662524cc456ff38ad57cd64ceb0fbd4251d8ed55f27dbb76c5dbdd23c";
export const inviteCode = "ome-invite-v0:0xcd043027c1d5f5df2bd9abdabc192fec";
