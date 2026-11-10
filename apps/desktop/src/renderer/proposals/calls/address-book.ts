// Addresses the member can pick instead of pasting: the vault itself, its members' accounts, the contracts this
// member can call, and `aztec-wallet`'s aliases. Members are trusted names; aliases are only what this computer says.
import { useMemo } from "react";

import type { Hex32 } from "@ome-labs/api";

import { useOme } from "../../data/ome.ts";

export type AddressKind = "vault" | "member" | "contract" | "alias";

export type KnownAddress = {
  address: Hex32;
  name: string;
  kind: AddressKind;
};

const ADDRESS = /^0x[0-9a-fA-F]{64}$/u;

export function useAddressBook(vault: Hex32): KnownAddress[] {
  const details = useOme("vault.details", { vault });
  const tokens = useOme("tokens.list", { vault });
  const contracts = useOme("contracts.list", {});
  const aliases = useOme("aztec.aliases", {});

  return useMemo(() => {
    const book: KnownAddress[] = [];
    const add = (entry: KnownAddress) => {
      if (!book.some((known) => known.address === entry.address)) book.push(entry);
    };
    if (details.data) add({ address: vault, name: details.data.summary.name, kind: "vault" });
    for (const member of details.data?.committee.members ?? []) {
      if (member.account)
        add({ address: member.account.toLowerCase() as Hex32, name: member.name, kind: "member" });
    }
    // A token is better known by its symbol than by its artifact's name ("Token").
    for (const { token } of tokens.data ?? [])
      add({ address: token.address, name: token.symbol, kind: "contract" });
    for (const contract of contracts.data ?? []) {
      if (contract.source !== "vault")
        add({ address: contract.address, name: contract.name, kind: "contract" });
    }
    for (const alias of aliases.data ?? []) {
      const [type, name] = alias.key.split(":", 2);
      if ((type === "accounts" || type === "contracts") && name && ADDRESS.test(alias.value))
        add({ address: alias.value.toLowerCase() as Hex32, name, kind: "alias" });
    }
    return book;
  }, [aliases.data, contracts.data, details.data, tokens.data, vault]);
}

/** What an address is called in the book, if anything. */
export function nameIn(book: KnownAddress[], address: string): KnownAddress | undefined {
  const lower = address.trim().toLowerCase();
  return book.find((entry) => entry.address === lower);
}
