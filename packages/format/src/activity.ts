// A vault's history as members read it: entries grouped by the day they happened, and a received payment in words.
import type { ActivityEntry } from "@ome-labs/api";

import { shortHex } from "./address.ts";
import { formatTokenAmount } from "./amount.ts";

type DayOptions = {
  locale?: string;
  /** For tests; the viewer's own zone otherwise. */
  timeZone?: string;
};

/** `2026-11-10`: the calendar day of a time, in the time zone the page shows. */
function dayKey(at: number, { timeZone }: DayOptions): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at * 1000);
}

/** "Today", "Yesterday", "10 November", or "10 November 2025" for another year. */
export function dayLabel(at: number, now: number, options: DayOptions = {}): string {
  const key = dayKey(at, options);
  if (key === dayKey(now, options)) return "Today";
  if (key === dayKey(now - 86_400, options)) return "Yesterday";
  const sameYear = key.slice(0, 4) === dayKey(now, options).slice(0, 4);
  return new Intl.DateTimeFormat(options.locale ?? "en-GB", {
    timeZone: options.timeZone,
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(at * 1000);
}

export type DayGroup<T> = { key: string; label: string; items: T[] };

/** Items newest first, grouped by day, keeping their order. */
export function groupByDay<T extends { at: number }>(
  items: readonly T[],
  now: number,
  options: DayOptions = {},
): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const item of items) {
    const key = dayKey(item.at, options);
    const last = groups.at(-1);
    if (last?.key === key) last.items.push(item);
    else groups.push({ key, label: dayLabel(item.at, now, options), items: [item] });
  }
  return groups;
}

/** "Received 1,000 OMET from alice": the sender by name when the member knows one, else the short address. */
export function receivedText(
  entry: Extract<ActivityEntry, { kind: "received" }>,
  name?: string | null,
): string {
  return `Received ${formatTokenAmount(entry.amount, entry.token)} from ${name ?? shortHex(entry.from)}`;
}
