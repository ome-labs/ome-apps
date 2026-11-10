import type { AbiType } from "@ome-labs/api";
import { describe, expect, it } from "vitest";

import { emptyArg, readArg, toBaseUnits } from "./abi.ts";

const address: AbiType = {
  kind: "struct",
  path: "aztec::protocol_types::address::aztec_address::AztecAddress",
  fields: [{ name: "inner", type: { kind: "field" } }],
  known: "aztecAddress",
};
const u8: AbiType = { kind: "integer", signed: false, width: 8 };
const ADDRESS = `0x${"Ab".repeat(32)}`;

describe("readArg", () => {
  it("reads numbers in decimal or hex, and refuses ones out of range", () => {
    expect(readArg(u8, "255", "n")).toEqual({ ok: true, value: "255" });
    expect(readArg(u8, "0xff", "n")).toEqual({ ok: true, value: "255" });
    expect(readArg(u8, "1_000", "n")).toMatchObject({
      ok: false,
      errors: { n: "u8 is from 0 to 255" },
    });
    expect(readArg({ kind: "integer", signed: true, width: 8 }, "-128", "n")).toEqual({
      ok: true,
      value: "-128",
    });
    expect(readArg({ kind: "field" }, "1.5", "f")).toMatchObject({ ok: false, missing: false });
  });

  it("says an empty field is missing, not wrong", () => {
    expect(readArg(u8, "", "n")).toEqual({ ok: false, missing: true, errors: { n: "Required" } });
  });

  it("reads an address as lower-case hex", () => {
    expect(readArg(address, ` ${ADDRESS} `, "to")).toEqual({
      ok: true,
      value: ADDRESS.toLowerCase(),
    });
    expect(readArg(address, "0x1234", "to")).toMatchObject({
      ok: false,
      errors: { to: "An Aztec address is 0x and 64 hex" },
    });
  });

  it("reads arrays and structs field by field, naming the path of each error", () => {
    const route: AbiType = { kind: "array", length: 2, item: address };
    expect(readArg(route, [ADDRESS, "0x12"], "route")).toMatchObject({
      ok: false,
      errors: { "route[1]": "An Aztec address is 0x and 64 hex" },
    });
    const config: AbiType = {
      kind: "struct",
      path: "amm::Config",
      fields: [
        { name: "fee", type: u8 },
        { name: "open", type: { kind: "boolean" } },
      ],
    };
    expect(readArg(config, { fee: "3", open: true }, "config")).toEqual({
      ok: true,
      value: { fee: "3", open: true },
    });
    expect(emptyArg(config)).toEqual({ fee: "", open: false });
  });
});

describe("toBaseUnits", () => {
  it("scales whole units by the token's decimals, exactly", () => {
    expect(toBaseUnits("2.5", 18)).toBe("2500000000000000000");
    expect(toBaseUnits("245", 6)).toBe("245000000");
    expect(toBaseUnits("0.0000001", 6)).toBeUndefined();
    expect(toBaseUnits("abc", 6)).toBeUndefined();
  });
});
