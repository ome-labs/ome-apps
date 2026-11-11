import type { ProposalView } from "@ome-labs/api";
import { proposals } from "@ome-labs/format/sample";
import { describe, expect, it } from "vitest";

import { waitingAcross } from "./waiting.ts";

const treasury = { address: "0x01", name: "Treasury" };
const ops = { address: "0x02", name: "Ops fund" };
const at = (proposal: ProposalView, expiresAt: number, id = proposal.id): ProposalView => ({
  ...proposal,
  id,
  expiresAt,
});

describe("waitingAcross", () => {
  it("keeps what waits on this member, once, soonest to expire first, with its vault", () => {
    const waiting = waitingAcross(
      [treasury, ops],
      [
        [
          at(proposals.designWork, 300),
          at(proposals.auditDeposit, 200),
          at(proposals.tooLarge, 100),
          at(proposals.designWork, 300),
        ],
        [at(proposals.designWork, 150)],
      ],
    );
    expect(waiting.map((w) => [w.vault.name, w.proposal.status, w.proposal.expiresAt])).toEqual([
      ["Ops fund", "collecting", 150],
      ["Treasury", "ready", 200],
      ["Treasury", "collecting", 300],
    ]);
  });

  it("skips vaults whose proposals haven't loaded", () => {
    expect(waitingAcross([treasury], [undefined])).toEqual([]);
  });
});
