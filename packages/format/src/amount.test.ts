import { describe, expect, test } from "vitest";

import { formatAmount, formatTokenAmount, formatWithBaseUnits, parseAmount } from "./amount.ts";
import { omet } from "./sample/treasury.ts";

describe("formatAmount", () => {
  test.each([
    ["1000000000000000000000", 18, "1,000"],
    ["250000000000000000000", 18, "250"],
    ["500000000000000000", 18, "0.5"],
    ["1", 18, "0.000000000000000001"],
    ["123456789012345678901234567890", 18, "123,456,789,012.34567890123456789"],
    ["0", 18, "0"],
    ["1050", 2, "10.5"],
    ["7", 0, "7"],
  ])("%s with %i decimals is %s, never rounded", (amount, decimals, expected) => {
    expect(formatAmount(amount, decimals)).toBe(expected);
  });

  test("groups and separates for the locale", () => {
    expect(formatAmount("1234500000000000000000", 18, { locale: "de" })).toBe("1.234,5");
  });

  test("refuses anything but a base-unit integer", () => {
    expect(() => formatAmount("1.5", 18)).toThrow(TypeError);
  });
});

test("writes the token line and the review line", () => {
  expect(formatTokenAmount("250000000000000000000", omet)).toBe("250 OMET");
  expect(formatWithBaseUnits("250000000000000000000", omet)).toBe(
    "250 OMET (250000000000000000000 base units)",
  );
});

describe("parseAmount", () => {
  test.each([
    ["250", { ok: true, amount: "250000000000000000000" }],
    ["1,000.5", { ok: true, amount: "1000500000000000000000" }],
    [".5", { ok: true, amount: "500000000000000000" }],
    ["0.000000000000000001", { ok: true, amount: "1" }],
    ["", { ok: false, error: "empty" }],
    ["abc", { ok: false, error: "not-a-number" }],
    ["1.2.3", { ok: false, error: "not-a-number" }],
    ["-5", { ok: false, error: "not-a-number" }],
    ["0.0000000000000000001", { ok: false, error: "too-many-decimals" }],
    ["0.00", { ok: false, error: "zero" }],
  ])("%j", (input, expected) => {
    expect(parseAmount(input, 18)).toEqual(expected);
  });

  test("round-trips with formatAmount", () => {
    const parsed = parseAmount("123,456.789", 18);

    expect(parsed.ok && formatAmount(parsed.amount, 18)).toBe("123,456.789");
  });
});
