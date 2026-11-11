import { expect, test } from "vitest";

import { planChanges, rotationStepLabel, shapeLine } from "./membership.ts";

const current = { threshold: 2, viewingThreshold: 2, members: ["Alice", "Bob", "Carol"] };

test("describes a committee in one line", () => {
  expect(shapeLine(current)).toBe("3 members · 2 to spend · 2 to read");
});

test("lists what a plan changes", () => {
  expect(
    planChanges({
      current,
      next: { threshold: 3, viewingThreshold: 2, members: ["Alice", "Bob", "Dave", "Erin"] },
    }),
  ).toEqual(["Carol leaves", "Dave and Erin join", "Approvals to spend: 2 → 3 of 4"]);
  expect(planChanges({ current, next: current })).toEqual([]);
});

test("names each rotation step", () => {
  expect(rotationStepLabel("reshare")).toBe("Share the viewing key anew");
});
