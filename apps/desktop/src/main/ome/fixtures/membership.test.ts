import { describe, expect, it } from "vitest";

import { FixtureClient } from "./client.ts";
import { SAMPLE_JOIN } from "./membership.ts";
import { VAULT } from "./sample.ts";

const base = { vault: VAULT, remove: [], add: [], threshold: 2, viewingThreshold: 2 };
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("membership changes on the fixtures", () => {
  it("checks a plan against the rules a rotation keeps", async () => {
    const client = new FixtureClient("normal");
    const plan = await client.call("membership.plan", {
      ...base,
      remove: [3],
      add: [SAMPLE_JOIN.dave],
    });
    expect(plan.failure).toBeNull();
    expect(plan.next.members).toEqual(["Alice", "Bob", "Dave"]);
    expect(plan.joiners.map((j) => j.name)).toEqual(["Dave"]);
    expect(plan.dealers).toEqual([1, 2]);
    expect(plan.share).toMatch(/^ome-rotation-v0:/u);

    expect((await client.call("membership.plan", { ...base, remove: [2, 3] })).failure).toMatch(
      /must stay/u,
    );
    expect((await client.call("membership.plan", { ...base, threshold: 4 })).failure).toMatch(
      /spending threshold/u,
    );
    await expect(
      client.call("membership.plan", { ...base, add: ["not a request"] }),
    ).rejects.toMatchObject({ kind: "invalid" });
  });

  it("runs a change through its proposal to the new roster", async () => {
    const client = new FixtureClient("normal");
    await client.call("signer.unlock", { secret: { passphrase: "correct horse" }, ttlSecs: 600 });
    const plan = await client.call("membership.plan", {
      ...base,
      remove: [3],
      add: [SAMPLE_JOIN.dave],
    });
    const started = await client.call("membership.begin", { plan: plan.share });
    expect(started.steps.map((s) => s.id)).toEqual([
      "reshare",
      "propose",
      "approve",
      "execute",
      "activate",
    ]);

    await wait(3200);
    const proposed = await client.call("membership.get", { vault: VAULT, id: plan.id });
    expect(proposed?.proposal).toBeTruthy();
    const id = proposed?.proposal ?? "0x";
    await client.call("proposals.approve", { vault: VAULT, id });
    await wait(2700);
    expect((await client.call("proposals.get", { vault: VAULT, id })).status).toBe("ready");
    await client.call("proposals.execute", { vault: VAULT, id });
    await wait(6500);

    const done = await client.call("membership.get", { vault: VAULT, id: plan.id });
    expect(done?.done).toBe(true);
    const members = (await client.call("vault.details", { vault: VAULT })).committee.members;
    expect(members.map((m) => m.name)).toEqual(["Alice", "Bob", "Dave"]);
  }, 20_000);

  it("refuses a plan that removes this member, and makes a join request", async () => {
    const client = new FixtureClient("normal");
    const plan = await client.call("membership.plan", { ...base, remove: [1] });
    await expect(client.call("membership.begin", { plan: plan.share })).rejects.toMatchObject({
      kind: "invalid",
    });
    expect((await client.call("membership.request", {})).request).toMatch(/^ome-join-v0:/u);
  });
});
