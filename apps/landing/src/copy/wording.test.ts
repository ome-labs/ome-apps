import { describe, expect, it } from "vitest";

// The site's words, as written in its source. Ome isn't a fixed-size multisig, so no copy names one ("2-of-3",
// "2-3", "2 of 3"), and nothing shows a price or a fiat value.
const sources = import.meta.glob<string>(
  ["../**/*.{ts,tsx}", "!../**/*.test.{ts,tsx}", "!../generated/**"],
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

describe("the site's copy", () => {
  it("reads every source file", () => {
    expect(Object.keys(sources).length).toBeGreaterThan(30);
  });

  it.each([
    ["a fixed-size multisig", /\b\d(?:-of-|-|–| of )\d\b/],
    ["a price", /[$€£]\s?\d/],
    ["fiat", /\b(?:USD|EUR|GBP)\b/],
  ])("never shows %s", (_, pattern) => {
    const hits = Object.entries(sources).flatMap(([file, text]) =>
      text
        .split("\n")
        // Comments, class names and CSS values aren't copy.
        .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line) && !line.includes("className"))
        .filter((line) => pattern.test(line))
        .map((line) => `${file}: ${line.trim()}`),
    );

    expect(hits).toEqual([]);
  });
});
