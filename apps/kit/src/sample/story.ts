// The guide's sample story from @ome-labs/format (Treasury, Alice, Bob and Carol, OMET, proposals 3eb2, 335c and
// 868c), plus the few values the kit's examples add on top of it: Bob's review of 3eb2, recent activity, an invite.
import type { AbiType, ActivityEntry, DecodedCall, Review, TokenInfo } from "@ome-labs/api";
import { aliases, omet, proposals, treasury } from "@ome-labs/format/sample";

export { aliases, omet, peers, proposals, treasury } from "@ome-labs/format/sample";

/** The examples' clock: 2026-11-09 12:40 UTC, two hours after the sample vault was founded. */
export const now = 1_794_228_000;

export const daveAlias = {
  address: aliases.dave,
  label: "accounts:dave",
  source: "aztecWallet" as const,
};

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
  recipient: daveAlias,
  change: null,
  simulation: {
    ok: true,
    gas: { da: 1536, l2: 412_800 },
    error: null,
    effects: {
      balances: [
        {
          token: omet,
          before: "1000000000000000000000",
          after: "750000000000000000000",
          visibility: "private",
        },
      ],
      returns: [],
      notes: { created: 2, nullified: 1 },
      complete: true,
    },
    fee: {
      gas: { da: 1536, l2: 412_800 },
      fee: "4143360000000000",
      maxFee: "6215040000000000",
      payer: "0x0b27c5a4e1f0d8c3b6a9e2f5d4c7b0a3e6f9d2c5b8a1e4f7d0c3b6a9e2f5d4c7",
    },
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

export const aliceAccount = "0x51d85d773ad9865e0173d205de87e4dcb016caa9755277583b6815f8aa640d31";

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
    from: aliceAccount,
    amount: "1000000000000000000000",
    txHash: "0xf1ac958104443f60cd437bf3c758411c6e2e01c5f70194d83735020805015338",
    block: 1182,
  },
];

export const executedTx = "0x1ddb736662524cc456ff38ad57cd64ceb0fbd4251d8ed55f27dbb76c5dbdd23c";
export const inviteCode = "ome-invite-v0:0xcd043027c1d5f5df2bd9abdabc192fec";

/** How long the signer stays unlocked: the choices the unlock sheet offers. */
export const unlockOptions: { value: "5" | "15" | "60"; label: string }[] = [
  { value: "5", label: "5 min" },
  { value: "15", label: "15 min" },
  { value: "60", label: "1 h" },
];

const address: AbiType = {
  kind: "struct",
  path: "aztec::protocol_types::address::aztec_address::AztecAddress",
  fields: [{ name: "inner", type: { kind: "field" } }],
  known: "aztecAddress",
};
const u128: AbiType = { kind: "integer", signed: false, width: 128 };
const field: AbiType = { kind: "field" };

const usdc: TokenInfo = {
  address: "0x2c6f0a9b4e7d1c3f5a8b0e2d4c6f8a1b3d5e7f9a0c2e4b6d8f0a1c3e5b7d9f1a",
  name: "USD Coin",
  symbol: "USDC",
  decimals: 6,
  standard: true,
};
const amm = "0x5d3a8f1c6b9e2d4a7c0f3b6e9d2a5c8f1b4e7a0d3c6f9b2e5a8d1c4f7b0e3a6d";

const swapCall: DecodedCall = {
  to: amm,
  toLabel: "AMM",
  fn: "swap_exact_tokens_for_tokens",
  selector: "0x1f3a7c9e",
  kind: "private",
  args: [
    { name: "token_in", type: address, value: omet.address, display: "OMET" },
    { name: "token_out", type: address, value: usdc.address, display: "USDC" },
    { name: "amount_in", type: u128, value: "250000000000000000000", display: "250 OMET" },
    { name: "amount_out_min", type: u128, value: "245000000", display: "245 USDC" },
    { name: "authwit_nonce", type: field, value: "0x2a", display: null },
  ],
  isStatic: false,
  decoded: true,
};

/** Alice proposed swapping 250 OMET for at least 245 USDC; the AMM may pull the OMET once. */
export const reviewOfSwap: Review = {
  ...reviewOfAuditDeposit,
  proposal: {
    ...reviewOfAuditDeposit.proposal,
    intent: {
      kind: "calls",
      calls: [
        {
          to: amm,
          fn: "swap_exact_tokens_for_tokens",
          args: [omet.address, usdc.address, "250000000000000000000", "245000000", "0x2a"],
        },
      ],
      memo: "Swap half the OMET for USDC",
    },
    token: null,
    calls: [
      {
        to: "0x0b27c5a4e1f0d8c3b6a9e2f5d4c7b0a3e6f9d2c5b8a1e4f7d0c3b6a9e2f5d4c7",
        toLabel: "SponsoredFPC",
        fn: "sponsor_unconditionally",
        selector: "0x7a1c0f3e",
        kind: "private",
        args: [],
        isStatic: false,
        decoded: true,
      },
      swapCall,
    ],
    authwits: [
      {
        caller: amm,
        callerLabel: "AMM",
        call: {
          to: omet.address,
          toLabel: "OMET",
          fn: "transfer_to_public",
          selector: "0x9c4e2a17",
          kind: "private",
          args: [
            { name: "from", type: address, value: treasury.address, display: "Treasury" },
            { name: "to", type: address, value: amm, display: "AMM" },
            { name: "amount", type: u128, value: "250000000000000000000", display: "250 OMET" },
            { name: "authwit_nonce", type: field, value: "0x2a", display: null },
          ],
          isStatic: false,
          decoded: true,
        },
        messageHash: "0x14f2b7d0a9c3e6f1b4d7a0c3e6f9b2d5a8c1e4f7b0d3a6c9e2f5b8d1a4c7e0f3",
        approvalMessage: "0x0e6a9d2c5f8b1e4a7d0c3f6b9e2a5d8c1f4b7e0a3d6c9f2b5e8a1d4c7f0b3e6a",
      },
    ],
  },
  action: "1 call",
  recipient: null,
  simulation: {
    ...reviewOfAuditDeposit.simulation,
    effects: {
      balances: [
        {
          token: omet,
          before: "1000000000000000000000",
          after: "750000000000000000000",
          visibility: "private",
        },
        { token: usdc, before: "0", after: "247180000", visibility: "private" },
      ],
      returns: [],
      notes: { created: 4, nullified: 2 },
      complete: true,
    },
  },
};
