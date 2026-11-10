import { describe, expect, it } from "vitest";

import { blocker } from "./thresholds.ts";

const shape = { approvals: 2, read: 2 };

describe("blocker", () => {
  it("starts only with exactly the expected members", () => {
    expect(blocker(shape, 2, 3)).toBe("Waiting for 1 more to join.");
    expect(blocker(shape, 3, 3)).toBeUndefined();
    expect(blocker(shape, 4, 3)).toMatch(/^4 joined, but this vault is for 3\./u);
  });

  it("refuses thresholds the vault's members can't meet", () => {
    expect(blocker({ approvals: 2, read: 3 }, 2, 2)).toBe(
      "Reading needs 3 members; 2 have joined.",
    );
    expect(blocker({ approvals: 3, read: 2 }, 2, 2)).toBe(
      "Approving needs 3 members; 2 have joined.",
    );
  });
});
