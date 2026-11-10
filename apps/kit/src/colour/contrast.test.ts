import { describe, expect, test } from "vitest";

import { contrast, grade } from "./contrast.ts";

describe("contrast", () => {
  test.each([
    ["#000000", "#FFFFFF", 21, "AA"],
    ["#FFFFFF", "#FFFFFF", 1, "Fails"],
    ["#767676", "#FFFFFF", 4.54, "AA"],
    ["#949494", "#FFFFFF", 3.03, "AA large"],
  ])("%s on %s is %d : 1", (foreground, background, ratio, verdict) => {
    expect(contrast(foreground, background)).toBeCloseTo(ratio, 2);
    expect(grade(contrast(foreground, background))).toBe(verdict);
  });
});
