// The Treasury vault: 3 members, 2 approvals to spend, 2 to read, funded with 1,000 OMET. The 250 OMET to dave is
// approved but not executed yet, so all 1,000 are still there.
import type {
  AuditPage,
  AuditView,
  MemberReachability,
  TokenBalance,
  VaultDetails,
  VaultSummary,
} from "@ome-labs/api";

import {
  ACCOUNTS,
  MEMBERS,
  OMET,
  USDC,
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
    counts: { open: 2, ready: 1, needsMe: 1 },
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
      protocolVersion: 0,
      viewingThreshold: 2,
      groupKey: samplePoint("treasury.group-key"),
      members: MEMBERS.map((m) => ({
        index: m.index,
        name: m.name,
        account: ACCOUNTS[m.key],
        signerKey: samplePoint(`${m.key}.signer`),
        verificationShare: samplePoint(`treasury.share.${m.index}`),
        identity: sampleHex(`${m.key}.keeper`),
        transport: sampleHex(`${m.key}.transport`),
        peerId: samplePeerId(m.key),
        addresses: [`/ip4/127.0.0.1/udp/${54_010 + m.index * 2}/quic-v1`],
        // Carol hasn't updated yet, so the Members page has a release to flag.
        release: m.key === "carol" ? "0.2.0" : "0.3.0",
        you: m.you,
      })),
      // The removed scenario: a rotation left this member out, and its keeper destroyed its share.
      serving: scenario !== "removed",
      keeperStatus: scenario === "removed" ? "removed" : "active",
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
      account: ACCOUNTS.alice,
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
      account: ACCOUNTS.bob,
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
      account: ACCOUNTS.carol,
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

/** What the vault holds of each token: 1,000 OMET in private notes, 25 public, and USDC it can't read yet. */
export function tokens(): TokenBalance[] {
  return [
    {
      token: OMET,
      private: { state: "known", amount: "1000000000000000000000" },
      public: { state: "known", amount: "25000000000000000000" },
    },
    {
      token: USDC,
      private: { state: "unreadable", answered: 1, needed: 2 },
      public: { state: "known", amount: "0" },
    },
  ];
}

/** The vault's private balance of `token`, when it is known. */
export function privateBalance(token: string): bigint | null {
  const entry = tokens().find((t) => t.token.address === token);
  return entry?.private.state === "known" ? BigInt(entry.private.amount) : null;
}

export function audit(now: number, limit = 50): AuditPage {
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
  const items: AuditView[] = [
    entry(2, "bob", "decryption", 4),
    entry(15, "local", "decryption", 2),
    entry(31, "carol", "recipient-tag", 1),
    entry(108, "local", "handshake", 1),
  ];
  return { items: items.slice(0, limit), next: null };
}
