import type { AbiType, ContractFunction, Hex32 } from "@ome-labs/api";
import { describe, expect, it } from "vitest";

import { moved, newAuthwit, newCall, readCalls, summaryBytes, withFunction } from "./composer.ts";

const address: AbiType = {
  kind: "struct",
  path: "aztec::protocol_types::address::aztec_address::AztecAddress",
  fields: [{ name: "inner", type: { kind: "field" } }],
  known: "aztecAddress",
};
const u128: AbiType = { kind: "integer", signed: false, width: 128 };

const TOKEN = `0x${"1".repeat(64)}` as Hex32;
const AMM = `0x${"2".repeat(64)}` as Hex32;
const VAULT = `0x${"3".repeat(64)}`;

const transfer: ContractFunction = {
  name: "transfer_to_public",
  selector: "0x01",
  kind: "private",
  isStatic: false,
  params: [
    { name: "from", type: address },
    { name: "amount", type: u128 },
  ],
  returns: [],
};
const mint: ContractFunction = { ...transfer, name: "mint_to_public", kind: "public" };
const swap: ContractFunction = {
  ...transfer,
  name: "swap",
  params: [{ name: "amount_in", type: u128 }],
};
const functionsOf = (contract: Hex32) =>
  contract === TOKEN ? [transfer, mint] : contract === AMM ? [swap] : undefined;

describe("readCalls", () => {
  it("waits for every field before it makes an intent", () => {
    const call = { ...withFunction({ ...newCall(), contract: AMM }, swap) };
    expect(readCalls({ calls: [call], authwits: [] }, "", functionsOf)).toMatchObject({
      intent: undefined,
      complete: false,
      errors: {},
    });
  });

  it("makes a calls intent with its authwits and memo", () => {
    const call = { ...withFunction({ ...newCall(), contract: AMM }, swap), args: ["250"] };
    const authwit = newAuthwit();
    const pull = {
      ...withFunction({ ...authwit.call, contract: TOKEN }, transfer),
      args: [VAULT, "250"],
    };
    const read = readCalls(
      { calls: [call], authwits: [{ ...authwit, caller: AMM, call: pull }] },
      " Swap ",
      functionsOf,
    );
    expect(read.intent).toEqual({
      kind: "calls",
      calls: [{ to: AMM, fn: "swap", args: ["250"] }],
      authwits: [
        { caller: AMM, call: { to: TOKEN, fn: "transfer_to_public", args: [VAULT, "250"] } },
      ],
      memo: "Swap",
    });
    expect(summaryBytes(read.intent as NonNullable<typeof read.intent>)).toBeGreaterThan(100);
  });

  it("refuses an authwit for a public function, on that function's field", () => {
    const authwit = newAuthwit();
    const call = {
      ...withFunction({ ...authwit.call, contract: TOKEN }, mint),
      args: [VAULT, "1"],
    };
    const read = readCalls(
      { calls: [], authwits: [{ ...authwit, caller: AMM, call }] },
      "",
      functionsOf,
    );
    expect(read.errors[`${call.key}.fn`]).toBe("An authwit allows a private call only");
    expect(read.intent).toBeUndefined();
  });

  it("puts an argument's error on its own field", () => {
    const call = {
      ...withFunction({ ...newCall(), contract: TOKEN }, transfer),
      args: ["0x12", "1"],
    };
    expect(readCalls({ calls: [call], authwits: [] }, "", functionsOf).errors).toEqual({
      [`${call.key}.from`]: "An Aztec address is 0x and 64 hex",
    });
  });
});

describe("moved", () => {
  it("moves one item and leaves the ends alone", () => {
    expect(moved(["a", "b", "c"], 0, 1)).toEqual(["b", "a", "c"]);
    expect(moved(["a", "b", "c"], 0, -1)).toEqual(["a", "b", "c"]);
  });
});
