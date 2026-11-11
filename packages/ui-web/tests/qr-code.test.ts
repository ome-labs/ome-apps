import { describe, expect, test } from "vitest";

import { fitsQrCode } from "../src/index.ts";

describe("fitsQrCode", () => {
  test("takes an address and a join request", () => {
    expect(fitsQrCode(`0x${"ab".repeat(32)}`)).toBe(true);
    expect(fitsQrCode(`ome-join-v0:${"a".repeat(900)}`)).toBe(true);
  });

  test("refuses what no code at error correction H holds", () => {
    // A real three-member membership change plan is about 5.5 KB.
    expect(fitsQrCode(`ome-rotation-v0:${"a".repeat(5500)}`)).toBe(false);
  });
});
