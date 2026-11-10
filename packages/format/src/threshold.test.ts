import { describe, expect, test } from "vitest";

import { proposals, treasury } from "./sample/treasury.ts";
import { approvalsLabel, toReadLabel, voteProgress } from "./threshold.ts";

describe("thresholds and votes", () => {
  test("use the CLI's words", () => {
    expect(approvalsLabel(treasury.threshold, treasury.members)).toBe("2 of 3 approvals");
    expect(toReadLabel(treasury.viewingThreshold, treasury.members)).toBe("2 of 3 to read");
  });

  test.each([
    [proposals.designWork, "1 of 2 approvals", 0],
    [proposals.auditDeposit, "2 of 2 approvals", 0],
    [proposals.tooLarge, "0 of 2 approvals", 2],
  ])("progress %#", (proposal, label, rejections) => {
    const progress = voteProgress(proposal);

    expect(progress.label).toBe(label);
    expect(progress.rejections).toBe(rejections);
    expect(progress.rejectionsToBlock).toBe(2);
  });
});
