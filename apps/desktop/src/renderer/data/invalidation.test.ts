import type { DaemonEvent } from "@ome-labs/api";
import { describe, expect, it } from "vitest";

import { isStale } from "./invalidation.ts";

const VAULT = "0x01";
const OTHER = "0x02";
const signer: DaemonEvent = { type: "signer", signer: { locked: false, unlockedUntil: 1 } };
const activity: DaemonEvent = { type: "vaultUpdated", vault: VAULT };
const contract: DaemonEvent = { type: "contractAvailable", vault: VAULT, classId: "0x03" };

describe("isStale", () => {
  it.each([
    ["a signer change refreshes the status", signer, ["status", {}], true],
    [
      "a signer change leaves vault data alone",
      signer,
      ["proposals.list", { vault: VAULT }],
      false,
    ],
    ["vault activity refreshes that vault", activity, ["proposals.list", { vault: VAULT }], true],
    [
      "vault activity leaves other vaults alone",
      activity,
      ["proposals.list", { vault: OTHER }],
      false,
    ],
    ["vault activity refreshes the vault list", activity, ["vault.list", {}], true],
    ["a new contract refreshes the contract list", contract, ["contracts.list", {}], true],
    ["a new contract leaves the signer alone", contract, ["signer.status", {}], false],
  ] as const)("%s", (_name, event, key, stale) => {
    expect(isStale(event, key)).toBe(stale);
  });
});
