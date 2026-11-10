import { describe, expect, test } from "vitest";

import { matches, pageEntries } from "./search-entries.ts";

const titles = (query: string) =>
  pageEntries.filter((entry) => matches(entry, query)).map((entry) => entry.title);

describe("search", () => {
  test("every word must match, in any order and case", () => {
    expect(titles("ICONS app")).toEqual(["Logo & app icons"]);
  });

  test("matches descriptions and groups too", () => {
    expect(titles("shadows")).toEqual(["Depth & spacing"]);
    expect(titles("brand")).toContain("Illustrations");
  });

  test("every page has a unique route", () => {
    expect(new Set(pageEntries.map((entry) => entry.to)).size).toBe(pageEntries.length);
  });
});
