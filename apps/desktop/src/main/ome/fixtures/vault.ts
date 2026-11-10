// The Treasury vault: 3 members, 2 approvals to spend, 2 to read, funded with 1,000 OMET. The 250 OMET to dave is
// approved but not executed yet, so all 1,000 are still there.
import type {
  ActivityEntry,
  AuditView,
  Counterparty,
  MemberReachability,
  TokenBalance,
  VaultDetails,
  VaultSummary,
} from "@ome-labs/api";

import { createdAt, proposals } from "./proposals.ts";
import {
  ACCOUNTS,
  FUNDING_TX,
  MEMBERS,
  OMET,
  VAULT,
  sampleHex,
  samplePeerId,
  samplePoint,
} from "./sample.ts";
import type { Scenario } from "./scenarios.ts";

const HOUR = 3600;

export function vaultSummary(now: number): VaultSummary {
  return {
    address: VAULT,
    name: "Treasury",
    alias: "treasury",
    isDefault: true,
    threshold: 2,
    viewingThreshold: 2,
    members: 3,
    myIndex: 1,
    foundedAt: now - 2 * HOUR,
  };
}

export function vaultDetails(scenario: Scenario, now: number): VaultDetails {
  return {
    summary: vaultSummary(now),
    contract: {
      address: VAULT,
      preaddress: sampleHex("treasury.preaddress"),
      partialAddress: sampleHex("treasury.partial-address"),
      classId: sampleHex("ome-vault.class"),
      salt: sampleHex("treasury.salt"),
      deployer: ACCOUNTS.alice,
      initializationHash: sampleHex("treasury.init"),
      publicKeys: ["npk_m", "ivpk_m", "ovpk_m", "tpk_m"].map((name) => ({
        name,
        key: samplePoint(`treasury.${name}`),
      })),
    },
    config: {
      version: 1,
      threshold: 2,
      viewingThreshold: 2,
      signerCount: 3,
      signerSetCommitment: sampleHex("treasury.signers.1"),
      committeeCommitment: sampleHex("treasury.committee.1"),
      // The alarm scenario: the on-chain config names a committee this keeper does not serve.
      matchesCommittee: scenario !== "alarm",
      readAt: now - 10,
    },
    committee: {
      epoch: 1,
      viewingThreshold: 2,
      groupKey: samplePoint("treasury.group-key"),
      members: MEMBERS.map((m) => ({
        index: m.index,
        name: m.name,
        signerKey: samplePoint(`${m.key}.signer`),
        verificationShare: samplePoint(`treasury.share.${m.index}`),
        identity: sampleHex(`${m.key}.keeper`),
        transport: sampleHex(`${m.key}.transport`),
        peerId: samplePeerId(m.key),
        addresses: [`/ip4/127.0.0.1/udp/${54_010 + m.index * 2}/quic-v1`],
        you: m.you,
      })),
      serving: true,
      keeperStatus: "active",
    },
    founding: {
      session: sampleHex("treasury.dkg"),
      transcript: `0x${sampleHex("treasury.transcript.a").slice(2)}${sampleHex("treasury.transcript.b").slice(2)}`,
      deployTx: sampleHex("treasury.deploy"),
    },
  };
}

export function peers(scenario: Scenario, now: number): MemberReachability[] {
  const offline = scenario === "keeper-failed";
  return [
    {
      index: 1,
      name: "Alice",
      identity: sampleHex("alice.keeper"),
      peerId: samplePeerId("alice"),
      you: true,
      connected: !offline,
      relayed: false,
      lastSeen: now,
      rttMs: null,
    },
    {
      index: 2,
      name: "Bob",
      identity: sampleHex("bob.keeper"),
      peerId: samplePeerId("bob"),
      you: false,
      connected: !offline,
      relayed: false,
      lastSeen: now - 4,
      rttMs: 42,
    },
    {
      index: 3,
      name: "Carol",
      identity: sampleHex("carol.keeper"),
      peerId: samplePeerId("carol"),
      you: false,
      connected: !offline,
      relayed: true,
      lastSeen: now - 9,
      rttMs: 180,
    },
  ];
}

export function tokens(): TokenBalance[] {
  return [{ token: OMET, balance: "1000000000000000000000", error: null }];
}

export function activity(now: number): ActivityEntry[] {
  const proposalEntries: ActivityEntry[] = proposals(now).map((proposal) => ({
    kind: "proposal",
    at: createdAt(proposal),
    proposal,
  }));
  const funded: ActivityEntry = {
    kind: "received",
    at: now - 110 * 60,
    token: OMET,
    from: ACCOUNTS.alice,
    amount: "1000000000000000000000",
    txHash: FUNDING_TX,
    block: 1_182,
  };
  return [...proposalEntries, funded].toSorted((a, b) => b.at - a.at);
}

export function counterparties(now: number): Counterparty[] {
  return [
    {
      address: ACCOUNTS.alice,
      label: "alice",
      received: 1,
      firstAt: now - 110 * 60,
      lastAt: now - 110 * 60,
      exposed: false,
    },
  ];
}

export function audit(now: number): AuditView[] {
  const entry = (
    minutesAgo: number,
    requester: "local" | "bob" | "carol",
    purpose: string,
    points: number,
  ) => ({
    at: now - minutesAgo * 60,
    requester: requester === "local" ? "local" : sampleHex(`${requester}.keeper`),
    requesterName: requester === "local" ? null : requester === "bob" ? "Bob" : "Carol",
    purpose,
    points,
    outcome: "served",
  });
  return [
    entry(2, "bob", "decryption", 4),
    entry(15, "local", "decryption", 2),
    entry(31, "carol", "recipient-tag", 1),
    entry(108, "local", "handshake", 1),
  ];
}
