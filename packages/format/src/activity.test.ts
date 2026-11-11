import { expect, test } from "vitest";

import { dayLabel, groupByDay, receivedText } from "./activity.ts";
import { aliases, omet } from "./sample/treasury.ts";

const zone = { timeZone: "UTC" };
// 2026-11-11 12:00 UTC.
const now = 1_794_398_400;

test("labels days relative to today, with the year only when it differs", () => {
  expect(dayLabel(now - 3600, now, zone)).toBe("Today");
  expect(dayLabel(now - 86_400, now, zone)).toBe("Yesterday");
  expect(dayLabel(now - 2 * 86_400, now, zone)).toBe("9 November");
  expect(dayLabel(now - 400 * 86_400, now, zone)).toBe("7 October 2025");
});

test("groups entries by day in their order", () => {
  const items = [now - 60, now - 7200, now - 86_400, now - 3 * 86_400].map((at) => ({ at }));
  expect(groupByDay(items, now, zone).map((g) => [g.label, g.items.length])).toEqual([
    ["Today", 2],
    ["Yesterday", 1],
    ["8 November", 1],
  ]);
});

test("names the sender of a payment when known", () => {
  const entry = {
    kind: "received" as const,
    at: now,
    token: omet,
    from: aliases.dave,
    amount: "1000000000000000000000",
    txHash: "0x01",
    block: 1182,
  };
  expect(receivedText(entry, "dave")).toBe("Received 1,000 OMET from dave");
  expect(receivedText(entry)).toBe("Received 1,000 OMET from 0xf461…688d");
});
