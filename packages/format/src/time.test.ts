import { expect, test } from "vitest";

import { formatAbsoluteTime, formatDuration, formatExpiry, timeAgo } from "./time.ts";

const now = 1_794_220_800;
const minute = 60;
const hour = 3600;

test.each([
  [now - 20, "just now"],
  [now - 5 * minute, "5m ago"],
  [now - 2 * hour - 59 * minute, "2h ago"],
  [now - 3 * 24 * hour, "3d ago"],
  [now + 60, "just now"],
])("timeAgo(%i) is %s", (at, expected) => {
  expect(timeAgo(at, now)).toBe(expected);
});

test.each([
  [5 * hour + 12 * minute + 59, "5h 12m"],
  [12 * minute, "12m"],
  [30, "under 1m"],
  [26 * hour + 30 * minute, "1d 2h"],
])("formatDuration(%i) is %s", (seconds, expected) => {
  expect(formatDuration(seconds)).toBe(expected);
});

test.each([
  [now + 5 * hour + 12 * minute, "expires in 5h 12m"],
  [now - 2 * hour, "expired 2h ago"],
])("formatExpiry(%i) is %s", (at, expected) => {
  expect(formatExpiry(at, now)).toBe(expected);
});

test("writes absolute times in the given zone", () => {
  expect(formatAbsoluteTime(now, { timeZone: "UTC" })).toBe("Nov 9, 2026, 10:40 AM");
});
