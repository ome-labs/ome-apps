import type { MemberReachability, ProposalView, TokenInfo } from "@ome-labs/api";

// The guide's sample story (ui-guide §4), shared by the tests here and the kits' stories. Keeper identities and
// peer ids are placeholders: the guide gives none, and no screen shows them in full.

export const omet: TokenInfo = {
  address: "0x48db25675e60f5e24dbb1d20e8b8785778fb7916ccc90a5db56d0791df8f0e6e",
  name: "Ome Test",
  symbol: "OMET",
  decimals: 18,
};

export const treasury = {
  name: "Treasury",
  address: "0x103b470145425638c8644547f39d59f049462c4fbdbc73f32370e01dd681c2c0",
  threshold: 2,
  viewingThreshold: 2,
  members: 3,
} as const;

export const aliases = {
  bob: "0xf941c4735ce50ad8c02af5f5c93ddcff7b407e8280d5db69a176ab61cb7e12b3",
  dave: "0xf461280a4b44f5e076c9b6126eb5151d1f0b2e960584b9a076a2ef18206e688d",
} as const;

const created = 1_794_220_800; // 2026-11-09 10:40 UTC, when the sample vault was founded

export const peers: MemberReachability[] = [
  {
    index: 1,
    name: "Alice",
    identity: "0x01",
    peerId: "12D3KooWAlice",
    you: true,
    connected: false,
    relayed: false,
    lastSeen: null,
    rttMs: null,
  },
  {
    index: 2,
    name: "Bob",
    identity: "0x02",
    peerId: "12D3KooWBob",
    you: false,
    connected: true,
    relayed: false,
    lastSeen: created,
    rttMs: 42,
  },
  {
    index: 3,
    name: "Carol",
    identity: "0x03",
    peerId: "12D3KooWCarol",
    you: false,
    connected: true,
    relayed: true,
    lastSeen: created,
    rttMs: 180,
  },
];

const base = {
  vault: treasury.address,
  threshold: 2,
  members: 3,
  mySlot: 0,
  configVersion: 1,
  currentConfigVersion: 1,
  expiresAt: created + 24 * 3600,
  txNonce: "0x00",
  outerHash: "0x00",
  approvalMessage: "0x00",
  feeMethod: "external",
  calls: [],
  cancelledBy: null,
  execution: null,
} satisfies Partial<ProposalView>;

export const proposals = {
  auditDeposit: {
    ...base,
    id: "0x3eb249d153a0261561843753619e852e85b986a62c8344a7c4152d55a7cae857",
    intent: {
      kind: "transfer",
      token: omet.address,
      to: aliases.dave,
      amount: "250000000000000000000",
      memo: "Audit deposit",
    },
    proposer: { index: 1, name: "Alice" },
    status: "ready",
    approvals: [
      { slot: 0, index: 1, name: "Alice", valid: true, reason: null },
      { slot: 1, index: 2, name: "Bob", valid: true, reason: null },
    ],
    rejections: [],
    approvedByMe: true,
    rejectedByMe: false,
    token: omet,
  },
  designWork: {
    ...base,
    id: "0x335cae45e39eeefa41c875f9a0067945e02c595b78ff42f08831a4b9c3a89850",
    intent: {
      kind: "transfer",
      token: omet.address,
      to: aliases.bob,
      amount: "40000000000000000000",
      memo: "Design work, October",
    },
    proposer: { index: 2, name: "Bob" },
    status: "collecting",
    approvals: [{ slot: 1, index: 2, name: "Bob", valid: true, reason: null }],
    rejections: [],
    approvedByMe: false,
    rejectedByMe: false,
    token: omet,
  },
  tooLarge: {
    ...base,
    id: "0x868c7cc9d6420ae9832b4c24a4867bc3c1248f1072499fe4d42cf4bb49aeb092",
    intent: {
      kind: "transfer",
      token: omet.address,
      // The guide leaves this one unlabelled; Figma (page 38) shows it as 0x7e0a…41d9.
      to: "0x7e0a9c2b5d84f13e6a07b29c4d1e58f3a6b0c7d2e94f1a8b35c6d0e7f2a941d9",
      amount: "900000000000000000000",
      memo: null,
    },
    proposer: { index: 3, name: "Carol" },
    status: "blocked",
    approvals: [],
    rejections: [
      { slot: 0, index: 1, name: "Alice", valid: true, reason: "Too large" },
      { slot: 1, index: 2, name: "Bob", valid: true, reason: null },
    ],
    approvedByMe: false,
    rejectedByMe: true,
    token: omet,
  },
} satisfies Record<string, ProposalView>;
