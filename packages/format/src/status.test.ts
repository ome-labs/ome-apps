import { describe, expect, test } from "vitest";

import { omet, peers } from "./sample/treasury.ts";
import { connectionOf, connectionStatus, proposalStatus } from "./status.ts";

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
