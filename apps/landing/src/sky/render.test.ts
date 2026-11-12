import { describe, expect, it } from "vitest";

import { interpolateRows } from "./field.ts";
import { paintSky, threshold } from "./render.ts";

const flat = { sky: [100, 120, 200], cloud: [255, 255, 255], clouds: 0, stars: 0 } as const;

function image(width: number, height: number) {
  return {
    width,
    height,
    data: new Uint8ClampedArray(width * height * 4),
    colorSpace: "srgb",
  } as ImageData;
}

describe("paintSky", () => {
  const rows = interpolateRows([{ row: 0, colour: flat }], 64);
  const frame = {
    width: 8,
    rows,
    noise: new Float32Array(8 * 64),
    scenes: [],
    moons: [],
    drift: 0,
  };

  it("dithers a clear sky to the colour levels around it, by the page row", () => {
    const target = image(8, 8);
    paintSky(target, 0, frame);

    for (let i = 0; i < target.data.length; i += 4) {
      expect([90, 108]).toContain(target.data[i]);
      expect(target.data[i + 3]).toBe(255);
    }
  });

  it("keeps the pattern fixed to the page, so scrolling doesn't make it shimmer", () => {
    const top = image(8, 16);
    const lower = image(8, 8);
    paintSky(top, 0, frame);
    paintSky(lower, 8, frame);

    expect(Array.from(lower.data)).toEqual(Array.from(top.data.subarray(8 * 8 * 4)));
  });

  it("dissolves a scene's top rows in through the dither", () => {
    const pixels = new Uint8ClampedArray(8 * 46 * 4).fill(7);
    const target = image(8, 46);
    paintSky(target, 0, {
      ...frame,
      scenes: [{ row: 0, column: 0, width: 8, height: 46, pixels }],
    });

    const shown = (row: number) =>
      [...Array(8).keys()].filter((x) => target.data[(row * 8 + x) * 4] === 7).length;
    expect(shown(0)).toBe(0);
    expect(shown(45)).toBeGreaterThan(shown(5));
    expect(threshold(0, 0)).toBe(0);
  });
});
