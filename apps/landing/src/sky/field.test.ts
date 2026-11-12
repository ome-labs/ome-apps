import { describe, expect, it } from "vitest";

import { interpolateRows } from "./field.ts";
import type { SkyColour } from "./palette.ts";

const black: SkyColour = { sky: [0, 0, 0], cloud: [0, 0, 0], clouds: 0, stars: 0 };
const white: SkyColour = { sky: [200, 100, 50], cloud: [255, 255, 255], clouds: 1, stars: 0.1 };

describe("interpolateRows", () => {
  const rows = interpolateRows(
    [
      { row: 10, colour: white },
      { row: 0, colour: black },
    ],
    21,
  );

  it("runs linearly between keys, in row order whatever order they came in", () => {
    expect(Array.from(rows.sky.subarray(5 * 3, 5 * 3 + 3))).toEqual([100, 50, 25]);
    expect(rows.clouds[5]).toBeCloseTo(0.5);
  });

  it("holds the last key past the end", () => {
    expect(Array.from(rows.sky.subarray(20 * 3, 20 * 3 + 3))).toEqual([200, 100, 50]);
    expect(rows.stars[20]).toBeCloseTo(0.1);
  });
});
