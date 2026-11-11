import { describe, expect, it } from "vitest";

import { OmeError } from "../client.ts";
import { FixtureClient } from "./client.ts";
import { OMET, PROPOSALS, USDC, VAULT, sampleHex } from "./sample.ts";
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

    expect(events).toEqual(["node", "keeper", "signer", "vaultUpdated", "keeperEvent"]);
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
      new FixtureClient("normal").call("devices.pair", {} as never),
    ).rejects.toMatchObject({
      kind: "failed",
    });
  });

  it("opens a lobby, and refuses an invite for another network", async () => {
    const client = new FixtureClient("no-vaults");
    const lobby = await client.call("lobby.create", {
      name: "Treasury",
      threshold: 2,
      viewingThreshold: 2,
      members: 3,
    });
    expect(lobby).toMatchObject({
      role: "host",
      status: "open",
      members: [{ name: "Alice", you: true }],
    });
    expect(lobby.invite).toMatch(/^ome-invite:/u);

    await expect(
      client.call("lobby.inspect", { invite: "ome-invite:wrong" }),
    ).resolves.toMatchObject({
      sameNetwork: false,
    });
    await expect(client.call("lobby.join", { invite: "ome-invite:wrong" })).rejects.toMatchObject({
      kind: "invalid",
    });
  });

  it("adds, stops tracking and deploys tokens, with the events the daemon sends", async () => {
    const client = new FixtureClient("normal");
    const events: string[] = [];
    client.subscribe((event) => events.push(event.type));
    const jade = sampleHex("jade.token");

    await expect(client.call("tokens.add", { vault: VAULT, token: jade })).resolves.toMatchObject({
      symbol: "JADE",
    });
    await expect(
      client.call("tokens.add", { vault: VAULT, token: sampleHex("unknown") }),
    ).rejects.toMatchObject({ kind: "invalid" });
    const left = await client.call("tokens.remove", { vault: VAULT, token: jade });
    expect(left.map((token) => token.symbol)).toEqual(["OMET", "USDC"]);
    await expect(client.call("tokens.deployTest", { vault: VAULT })).rejects.toMatchObject({
      kind: "locked",
    });
    await client.call("signer.unlock", { secret: { passphrase: "correct horse" }, ttlSecs: 60 });
    await client.call("tokens.deployTest", { vault: VAULT });
    expect((await client.call("tokens.list", { vault: VAULT })).length).toBe(3);
    expect(events).toEqual(
      expect.arrayContaining(["tokenAdded", "tokenRemoved", "balanceChanged"]),
    );
  });

  it("reads private balances as the scenario allows", async () => {
    const [keeperDown] = await new FixtureClient("keeper-failed").call("tokens.list", {
      vault: VAULT,
    });
    expect(keeperDown?.private).toEqual({ state: "unreadable", answered: 0, needed: 2 });
    const [nodeDown] = await new FixtureClient("node-unreachable").call("tokens.list", {
      vault: VAULT,
    });
    expect(nodeDown?.private.state).toBe("failed");
  });

  it("makes payment links with the token and amount", async () => {
    const client = new FixtureClient("normal");
    const request = await client.call("vault.request", {
      vault: VAULT,
      token: OMET.address,
      amount: "250000000000000000000",
      memo: "Audit",
    });
    expect(request.uri).toMatch(new RegExp(`^ome-pay:${VAULT}\\?v=0&`, "u"));
    expect(request.uri).toContain("amount=250000000000000000000");
    await expect(
      client.call("vault.request", { vault: VAULT, token: sampleHex("not-tracked") }),
    ).rejects.toMatchObject({ kind: "invalid" });
  });

  it("pages activity newest first without repeating an entry, and filters it", async () => {
    const client = new FixtureClient("normal");
    const seen: string[] = [];
    let before: string | undefined;
    for (let page = 0; page < 20; page++) {
      // oxlint-disable-next-line no-await-in-loop
      const result = await client.call("vault.activity", {
        vault: VAULT,
        limit: 25,
        ...(before ? { before } : {}),
      });
      seen.push(...result.items.map((e) => (e.kind === "received" ? e.txHash : e.proposal.id)));
      if (!result.next) break;
      before = result.next;
    }
    expect(seen.length).toBeGreaterThan(50);
    expect(new Set(seen).size).toBe(seen.length);

    const received = await client.call("vault.activity", { vault: VAULT, kinds: ["received"] });
    expect(received.items.every((e) => e.kind === "received")).toBe(true);
    const usdc = await client.call("vault.activity", { vault: VAULT, token: USDC.address });
    expect(usdc.items.every((e) => e.kind === "received" && e.token.symbol === "USDC")).toBe(true);
  });

  it("lists who paid, with the senders a removed member can still recognise", async () => {
    const parties = await new FixtureClient("normal").call("vault.counterparties", {
      vault: VAULT,
    });
    expect(parties.items.some((p) => p.exposed)).toBe(true);
    expect(parties.items.some((p) => !p.exposed)).toBe(true);
    expect(parties.items.find((p) => p.label === "dave")?.received).toBeGreaterThan(5);
  });

  it("shows a payment arriving now at the top, with its events", async () => {
    const client = new FixtureClient("normal");
    const events: string[] = [];
    client.subscribe((event) => events.push(event.type));
    client.receive();
    const [latest] = (await client.call("vault.activity", { vault: VAULT, limit: 1 })).items;
    expect(latest?.kind).toBe("received");
    expect(events).toEqual(["received", "balanceChanged"]);
  });
});
