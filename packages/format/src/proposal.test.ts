import { describe, expect, test } from "vitest";

import { needsMyVote, proposalSummary, shortProposalId } from "./proposal.ts";
import { aliases, proposals } from "./sample/treasury.ts";

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
    const swap = { to: `0x${"a".repeat(64)}` as const, fn: "swap", args: [] };
    expect(proposalSummary({ intent: { ...calls, calls: [swap] }, token: null })).toBe(
      "Call swap on 0xaaaa…aaaa",
    );
    expect(
      proposalSummary({
        intent: { ...calls, calls: [swap] },
        token: null,
        calls: [{ to: swap.to, toLabel: "AMM" } as never],
      }),
    ).toBe("Call swap on AMM");
    const rotate = { to: `0x${"b".repeat(64)}` as const, fn: "rotate_membership", args: [] };
    expect(proposalSummary({ intent: { ...calls, calls: [rotate] }, token: null })).toBe(
      "Change the vault's members",
    );
    expect(proposalSummary({ intent: { ...calls, calls: [swap, swap] }, token: null })).toBe(
      "Make 2 contract calls",
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
