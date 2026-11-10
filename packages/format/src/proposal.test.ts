import { describe, expect, test } from "vitest";

import { needsMyVote, proposalSummary, shortProposalId } from "./proposal.ts";
import { aliases, omet, peers, proposals, treasury } from "./sample/treasury.ts";
import { connectionOf, connectionStatus, proposalStatus } from "./status.ts";
import { approvalsLabel, toReadLabel, voteProgress } from "./threshold.ts";

describe("proposal", () => {
  test("is referred to by its first 4 hex digits", () => {
    expect(shortProposalId(proposals.auditDeposit.id)).toBe("3eb2");
  });

  test.each([
    [
      proposals.auditDeposit,
      { address: aliases.dave, label: "accounts:dave", source: "aztecWallet" as const },
      "Transfer 250 OMET to dave (alias)",
    ],
    [proposals.designWork, null, "Transfer 40 OMET to 0xf941…12b3"],
    [
      proposals.designWork,
      { address: aliases.bob, label: "Bob", source: "member" as const },
      "Transfer 40 OMET to Bob",
    ],
  ])("summarises %#", (proposal, recipient, expected) => {
    expect(proposalSummary(proposal, recipient)).toBe(expected);
  });

  test("shows base units for a token this member hasn't added", () => {
    expect(proposalSummary({ ...proposals.designWork, token: null })).toBe(
      "Transfer 40000000000000000000 base units of 0x48db…0e6e to 0xf941…12b3",
    );
  });

  test("summarises calls and cancels", () => {
    const cancel = { kind: "cancel" as const, cancels: proposals.tooLarge.id, memo: null };
    const calls = { kind: "calls" as const, calls: [], memo: null };

    expect(proposalSummary({ intent: cancel, token: null })).toBe("Cancel proposal 868c");
    expect(proposalSummary({ intent: { ...calls, calls: [{} as never] }, token: null })).toBe(
      "Make 1 contract call",
    );
  });

  test("needs this member's vote only while collecting and unvoted", () => {
    expect(
      Object.values(proposals)
        .filter(needsMyVote)
        .map((p) => shortProposalId(p.id)),
    ).toEqual(["335c"]);
  });
});

describe("thresholds and votes", () => {
  test("use the CLI's words", () => {
    expect(approvalsLabel(treasury.threshold, treasury.members)).toBe("2 of 3 approvals");
    expect(toReadLabel(treasury.viewingThreshold, treasury.members)).toBe("2 of 3 to read");
  });

  test.each([
    [proposals.designWork, "1 of 2 approvals", 0],
    [proposals.auditDeposit, "2 of 2 approvals", 0],
    [proposals.tooLarge, "1 of 2 approvals", 2],
  ])("progress %#", (proposal, label, rejections) => {
    const progress = voteProgress(proposal);

    expect(progress.label).toBe(label);
    expect(progress.rejections).toBe(rejections);
    expect(progress.rejectionsToBlock).toBe(2);
  });
});

describe("statuses", () => {
  test("take the kit's tones", () => {
    expect(proposalStatus("collecting")).toMatchObject({ label: "Collecting", tone: "warning" });
    expect(proposalStatus("blocked").tone).toBe("danger");
  });

  test("name each member's connection", () => {
    expect(peers.map((peer) => connectionStatus(connectionOf(peer)).label)).toEqual([
      "Offline",
      "Connected",
      "Through relay",
    ]);
  });

  test("never mention a token amount in a status", () => {
    expect(JSON.stringify(proposalStatus("executed"))).not.toContain(omet.symbol);
  });
});
