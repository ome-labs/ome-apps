import { describe, expect, it } from "vitest";

import { hourOnAxis, isNight, rgbToHex, skyAt } from "./palette.ts";

describe("hourOnAxis", () => {
  it.each([
    ["6:12 am", 6.2],
    ["12:10 pm", 12 + 10 / 60],
    ["8:40 pm", 20 + 40 / 60],
    ["12:30 am", 24.5],
    ["3:20 am", 27 + 20 / 60],
  ])("puts %s at %f", (clock, hour) => {
    expect(hourOnAxis(clock)).toBeCloseTo(hour, 5);
  });

  it("rejects what isn't a clock time", () => {
    expect(() => hourOnAxis("noon")).toThrow();
  });
});

describe("skyAt", () => {
  it("is the palette's colour at one of its hours", () => {
    expect(rgbToHex(skyAt("9:30 am").sky)).toBe("#4466d2");
  });

  it("mixes between two hours", () => {
    const sky = skyAt("10:45 am").sky;
    expect(rgbToHex(sky)).toBe("#486ad4");
  });

  it("holds the first and last colours outside the day", () => {
    expect(skyAt("5:00 am")).toEqual(skyAt("5:24 am"));
  });

  it("shows stars only at night", () => {
    expect(skyAt("12:10 pm").stars).toBe(0);
    expect(skyAt("11:40 pm").stars).toBeGreaterThan(0);
  });
});

describe("isNight", () => {
  it.each([
    ["6:12 am", false],
    ["7:05 pm", false],
    ["8:10 pm", true],
    ["3:20 am", true],
    ["5:41 am", false],
  ])("%s → %s", (clock, night) => {
    expect(isNight(clock)).toBe(night);
  });
});
