import type { Review } from "@ome-labs/api";
import { expect, test } from "vitest";

import { canApprove, reviewChecks } from "./review.ts";
import { aliases } from "./sample/treasury.ts";

const passing: Pick<Review, "checks" | "simulation" | "recipient"> = {
  checks: {
    rebuilt: true,
    outerHash: "0x00",
    configCurrent: true,
    notExpired: true,
    failure: null,
  },
  simulation: { ok: true, gas: { da: 1536, l2: 412_800 }, error: null },
  recipient: { address: aliases.dave, label: "accounts:dave", source: "aztecWallet" },
};

test("lists the checks in the CLI's order and flags an alias", () => {
  expect(reviewChecks(passing).map((check) => [check.state, check.label])).toEqual([
    ["pass", "Payload rebuilt and matches"],
    ["pass", "Made under the current config"],
    ["pass", "Not expired"],
    ["pass", "Simulation ok (1,536 DA gas, 412,800 L2 gas)"],
    ["warning", "Recipient label is an unverified alias"],
  ]);
  expect(canApprove(passing)).toBe(true);
});

test("a failed check blocks approval; a failed simulation only warns", () => {
  const stale = { ...passing, checks: { ...passing.checks, configCurrent: false } };
  const unsimulated = { ...passing, simulation: { ok: false, gas: null, error: "out of gas" } };

  expect(canApprove(stale)).toBe(false);
  expect(canApprove(unsimulated)).toBe(true);
  expect(reviewChecks(unsimulated)[3]).toMatchObject({
    state: "warning",
    label: "Simulation failed: out of gas",
  });
});

test("a member recipient needs no warning; an unlabelled one does", () => {
  const member = {
    ...passing,
    recipient: { address: aliases.bob, label: "Bob", source: "member" as const },
  };
  const unlabelled = { ...passing, recipient: { address: aliases.bob, label: null, source: null } };

  expect(reviewChecks(member)).toHaveLength(4);
  expect(reviewChecks(unlabelled).at(-1)?.label).toBe("Recipient has no label");
});
