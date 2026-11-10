// The daemon-wide state of each scenario: profile, settings, node, keeper, signer.
import type {
  KeeperState,
  NodeStatus,
  Profile,
  Settings,
  SignerStatus,
  Status,
} from "@ome-labs/api";

import {
  ACCOUNTS,
  FEE_PAYER,
  NODE_URL,
  VAULT,
  sampleHex,
  samplePeerId,
  samplePoint,
} from "./sample.ts";
import type { Scenario } from "./scenarios.ts";
import { vaultSummary } from "./vault.ts";

const BLOCK = 1_210;

function profile(now: number): Profile {
  return {
    name: "Alice",
    signerKey: samplePoint("alice.signer"),
    account: ACCOUNTS.alice,
    createdAt: now - 3 * 3600,
  };
}

export function settings(): Settings {
  return {
    nodeUrl: NODE_URL,
    relays: [],
    proverEnabled: false,
    unlockTimeoutSecs: 3600,
    feePayerSalt: `0x${"0".repeat(64)}`,
    remoteKeeper: null,
    aztecWalletDir: null,
    aztecWalletSync: false,
    appsEnabled: true,
    updateCheck: true,
  };
}

export function node(scenario: Scenario, now: number): NodeStatus {
  if (scenario === "node-unreachable") {
    return {
      url: NODE_URL,
      reachable: false,
      nodeVersion: null,
      l1ChainId: null,
      rollupVersion: null,
      blockNumber: null,
      syncedBlock: null,
      checkedAt: now - 5,
      error: `fetch failed: connect ECONNREFUSED 127.0.0.1:8080`,
    };
  }
  return {
    url: NODE_URL,
    reachable: true,
    nodeVersion: "6.0.0",
    l1ChainId: 31_337,
    rollupVersion: 1_337_000_001,
    blockNumber: BLOCK,
    syncedBlock: scenario === "syncing" ? BLOCK - 6 : BLOCK,
    checkedAt: now - 5,
    error: null,
  };
}

export function keeper(scenario: Scenario): KeeperState {
  if (scenario === "keeper-failed") {
    return {
      status: "failed",
      identity: null,
      peerId: null,
      addresses: [],
      version: "0.3.0",
      error: "ome-keeper exited with code 1: the data directory is locked by another keeper",
      remote: null,
    };
  }
  return {
    status: "running",
    identity: sampleHex("alice.keeper"),
    peerId: samplePeerId("alice"),
    addresses: ["/ip4/127.0.0.1/udp/54012/quic-v1", "/ip4/127.0.0.1/tcp/54013"],
    version: "0.3.0",
    error: null,
    remote: null,
  };
}

export function signer(
  scenario: Scenario,
  now: number,
  unlockedUntil: number | null,
): SignerStatus {
  if (scenario === "locked" || unlockedUntil === null || unlockedUntil <= now) {
    return { locked: true, unlockedUntil: null };
  }
  return { locked: false, unlockedUntil };
}

export function status(scenario: Scenario, now: number, unlockedUntil: number | null): Status {
  const hasProfile = scenario !== "no-profile";
  const hasVaults = hasProfile && scenario !== "no-vaults";
  return {
    profile: hasProfile ? profile(now) : null,
    settings: settings(),
    keeper: keeper(scenario),
    node: node(scenario, now),
    signer: signer(scenario, now, unlockedUntil),
    vaults: hasVaults ? [vaultSummary(now)] : [],
    defaultVault: hasVaults ? VAULT : null,
    fees: hasProfile
      ? {
          payer: FEE_PAYER,
          kind: "sponsored",
          feeJuice: null,
          healthy: scenario !== "node-unreachable",
        }
      : null,
    newerRelease: null,
  };
}
