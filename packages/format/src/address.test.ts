import { expect, test } from "vitest";

import { isHex16, isHex32, shortHex } from "./address.ts";
import { treasury } from "./sample/treasury.ts";

test.each([
  [treasury.address, "0x103b…c2c0"],
  ["0xcd043027c1d5f5df2bd9abdabc192fec", "0xcd04…2fec"],
  ["0x1234", "0x1234"],
])("shortens %s to %s", (value, expected) => {
  expect(shortHex(value)).toBe(expected);
});

test.each([
  [treasury.address, true, false],
  ["0xcd043027c1d5f5df2bd9abdabc192fec", false, true],
  [treasury.address.slice(0, -1), false, false],
  [`0x${"g".repeat(64)}`, false, false],
  [treasury.address.slice(2), false, false],
])("%s: Hex32 %s, Hex16 %s", (value, hex32, hex16) => {
  expect(isHex32(value)).toBe(hex32);
  expect(isHex16(value)).toBe(hex16);
});
