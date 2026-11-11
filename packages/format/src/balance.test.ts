import { expect, test } from "vitest";

import { balanceDisplay, isEmptyBalance } from "./balance.ts";

const token = { decimals: 18 };

test("a known balance shows every significant digit and keeps its base units", () => {
  expect(balanceDisplay({ state: "known", amount: "1250000000000000000000" }, token)).toEqual({
    text: "1,250",
    detail: null,
    baseUnits: "1250000000000000000000",
    tone: "neutral",
  });
});

test("an unreadable balance says how many keepers answered", () => {
  expect(balanceDisplay({ state: "unreadable", answered: 1, needed: 2 }, token)).toMatchObject({
    text: "Can't read yet",
    detail: "1 of 2 keepers answered",
    tone: "warning",
  });
});

test("a failed read carries the daemon's reason", () => {
  expect(balanceDisplay({ state: "failed", message: "node unreachable" }, token)).toMatchObject({
    text: "Couldn't read",
    detail: "node unreachable",
    tone: "danger",
  });
});

test("only a known zero is empty", () => {
  expect(isEmptyBalance({ state: "known", amount: "0" })).toBe(true);
  expect(isEmptyBalance({ state: "unreadable", answered: 0, needed: 2 })).toBe(false);
});
