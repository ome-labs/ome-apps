// What a member changes about the sample vaults in a session: Treasury's name (for every member, as a signed name the
// keepers share), each vault's alias, which one is the default, and retiring a share once removed. The keeper audit
// log is here too: a few days of other keepers asking this one for points, one of them refused.
import type {
  AuditPage,
  AuditView,
  DaemonEvent,
  Hex32,
  PageParams,
  VaultSummary,
} from "@ome-labs/api";

import { OmeError } from "../client.ts";
import { OPS } from "./ops.ts";
import { VAULT, sampleHex } from "./sample.ts";
import type { Scenario } from "./scenarios.ts";

const ALIAS = /^[a-z0-9_-]{1,32}$/u;

export class FixtureVaultSettings {
  #names = new Map<Hex32, string>();
  #aliases = new Map<Hex32, string>();
  #default: Hex32 = VAULT;
  #retired = new Set<Hex32>();
  readonly #emit: (event: DaemonEvent) => void;

  constructor(emit: (event: DaemonEvent) => void) {
    this.#emit = emit;
  }

  /** The vaults as this session changed them, without any retired. */
  apply(vaults: VaultSummary[]): VaultSummary[] {
    return vaults
      .filter((vault) => !this.#retired.has(vault.address))
      .map((vault) =>
        // `vaults` is built fresh for each call, so it can be changed in place.
        Object.assign(vault, {
          name: this.#names.get(vault.address) ?? vault.name,
          alias: this.#aliases.get(vault.address) ?? vault.alias,
          isDefault: vault.address === this.#default,
        }),
      );
  }

  /** The vault's new name for every member: the daemon signs it and the keepers pass it on. */
  rename(vault: Hex32, name: string, vaults: VaultSummary[]): VaultSummary {
    if (name.trim().length < 1 || name.length > 48)
      throw new OmeError("invalid", "a name is 1 to 48 characters");
    this.#names.set(vault, name.trim());
    this.#emit({ type: "vaultRenamed", vault, name: name.trim(), by: { index: 1, name: "Alice" } });
    const renamed = this.apply(vaults).find((v) => v.address === vault);
    if (!renamed) throw new OmeError("not-found", "No such vault.");
    return renamed;
  }

  alias(vault: Hex32, alias: string, vaults: VaultSummary[]): VaultSummary[] {
    if (!ALIAS.test(alias))
      throw new OmeError("invalid", "an alias is lowercase letters, digits, - and _, at most 32");
    for (const [other, taken] of this.#aliases)
      if (taken === alias && other !== vault)
        throw new OmeError("invalid", `${alias} already names another vault`);
    if (alias === "treasury" && vault !== VAULT)
      throw new OmeError("invalid", "treasury already names another vault");
    this.#aliases.set(vault, alias);
    this.#emit({ type: "vaultUpdated", vault });
    return this.apply(vaults);
  }

  use(vault: Hex32, vaults: VaultSummary[]): VaultSummary[] {
    this.#default = vault;
    this.#emit({ type: "vaultUpdated", vault });
    return this.apply(vaults);
  }

  /**
   * Destroys this member's share: refused while the chain still names the committee it serves, as the keeper refuses.
   * In the `removed` scenario a rotation left Alice out, so it goes through.
   */
  retire(vault: Hex32, scenario: Scenario, vaults: VaultSummary[]): VaultSummary[] {
    if (scenario !== "removed")
      throw new OmeError(
        "invalid",
        "the chain still names the committee this share serves; retiring it would break a working vault",
      );
    this.#retired.add(vault);
    if (this.#default === vault) this.#default = OPS;
    this.#emit({ type: "vaultUpdated", vault });
    return this.apply(vaults);
  }
}

const KEEPERS = {
  local: { requester: "local", requesterName: null },
  bob: { requester: sampleHex("bob.keeper"), requesterName: "Bob" },
  carol: { requester: sampleHex("carol.keeper"), requesterName: "Carol" },
  erin: { requester: sampleHex("erin.keeper"), requesterName: null },
} as const;

/** Three days of requests to this keeper, newest first, paged like the daemon pages them. */
export function auditLog(now: number, { limit = 50, before }: PageParams): AuditPage {
  const purposes = [
    "decryption",
    "decryption",
    "recipient-tag",
    "handshake",
    "sender-tag",
  ] as const;
  const who = ["bob", "local", "carol", "local", "bob", "carol"] as const;
  const items: AuditView[] = [];
  for (let at = 0; at < 140; at++) {
    const keeper = KEEPERS[who[at % who.length] ?? "local"];
    items.push({
      at: now - 120 - at * 1_811,
      ...keeper,
      purpose: purposes[at % purposes.length] ?? "decryption",
      points: 1 + (at % 4),
      outcome: "served",
    });
  }
  // Erin's keeper, removed with her a month ago, still tried once.
  items.splice(7, 0, {
    at: now - 120 - 7 * 1_811 + 300,
    ...KEEPERS.erin,
    purpose: "decryption",
    points: 2,
    outcome: "refused: not in the vault's current committee",
  });
  const start = before === undefined ? 0 : Number(before);
  const page = items.slice(start, start + limit);
  return {
    items: page,
    next: start + page.length < items.length ? String(start + page.length) : null,
  };
}
