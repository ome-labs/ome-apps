import { describe, expect, it } from "vitest";

import { OmeError } from "../client.ts";
import { FixtureClient } from "./client.ts";
import { PROPOSALS, VAULT } from "./sample.ts";
import { SCENARIOS } from "./scenarios.ts";

describe("FixtureClient", () => {
  const answering = SCENARIOS.filter((scenario) => scenario !== "daemon-down");

  it.each(answering)("answers status in the %s scenario", async (scenario) => {
    const status = await new FixtureClient(scenario).call("status", {});

    expect(status.profile === null).toBe(scenario === "no-profile");
    expect(status.vaults.length === 0).toBe(scenario === "no-profile" || scenario === "no-vaults");
    expect(status.node.reachable).toBe(scenario !== "node-unreachable");
    expect(status.signer.locked).toBe(true);
  });

  it("fails every call as unreachable when the daemon is down", async () => {
    await expect(new FixtureClient("daemon-down").call("status", {})).rejects.toMatchObject({
      kind: "unreachable",
    });
  });

  it("tells the shell what changed when the scenario switches", async () => {
    const client = new FixtureClient("normal");
    const events: string[] = [];
    client.subscribe((event) => events.push(event.type));

    client.setScenario("alarm");

    expect(events).toEqual(["node", "keeper", "signer", "vaultActivity", "keeperEvent"]);
  });

  it("unlocks with a passphrase and refuses the wrong one", async () => {
    const client = new FixtureClient("normal");

    await expect(
      client.call("signer.unlock", { secret: { passphrase: "wrong" }, ttlSecs: 60 }),
    ).rejects.toMatchObject({ kind: "auth" });
    const unlocked = await client.call("signer.unlock", {
      secret: { passphrase: "sample" },
      ttlSecs: 60,
    });

    expect(unlocked.locked).toBe(false);
  });

  it("knows the guide's proposals and nothing else", async () => {
    const client = new FixtureClient("normal");

    const review = await client.call("proposals.review", { vault: VAULT, id: PROPOSALS.design });
    expect(review.recipient?.label).toBe("bob");
    await expect(
      client.call("proposals.get", { vault: VAULT, id: `0x${"0".repeat(64)}` }),
    ).rejects.toBeInstanceOf(OmeError);
  });

  it("says which methods it doesn't simulate yet", async () => {
    await expect(
      new FixtureClient("normal").call("lobby.inspect", { invite: "x" }),
    ).rejects.toMatchObject({
      kind: "failed",
    });
  });
});
