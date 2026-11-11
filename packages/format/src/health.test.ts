import { expect, test } from "vitest";

import { readingHealth, riskRemedy, thresholdRisks, vaultHealth } from "./health.ts";
import { peers } from "./sample/treasury.ts";

const [alice, bob, carol] = peers as [(typeof peers)[0], (typeof peers)[0], (typeof peers)[0]];
const onlyBob = [alice, bob, { ...carol, connected: false }];

test.each([
  [true, peers, "3 of 3 keepers answering · can lose 1", "success"],
  [false, peers, "2 of 3 · no spare", "warning"],
  [false, onlyBob, "1 of 3 · can't read now", "danger"],
])("reading health %#", (serving, members, label, tone) => {
  const health = readingHealth({ peers: members, serving, viewingThreshold: 2 });

  expect(health.label).toBe(label);
  expect(health.tone).toBe(tone);
  expect(health.canRead).toBe(tone !== "danger");
});

test.each([
  [{ threshold: 2, viewingThreshold: 2, members: 3 }, ["pair-can-read"]],
  [
    { threshold: 2, viewingThreshold: 2, members: 2 },
    ["unreadable-on-any-loss", "frozen-on-any-loss"],
  ],
  [{ threshold: 1, viewingThreshold: 3, members: 5 }, ["single-spender"]],
  [{ threshold: 3, viewingThreshold: 3, members: 5 }, []],
])("threshold risks for %j", (shape, expected) => {
  expect(thresholdRisks(shape).map((risk) => risk.id)).toEqual(expected);
});

test("words the risks exactly as the guide does", () => {
  expect(thresholdRisks({ threshold: 2, viewingThreshold: 2, members: 2 })[0]?.text).toBe(
    "Losing any one keeper makes the vault unreadable for good.",
  );
});

test("names the most serious health state first", () => {
  // In the sample all three keepers answer: Bob directly, Carol through a relay.
  const reading = readingHealth({ peers, serving: true, viewingThreshold: 2 });
  expect(vaultHealth({ reading, serving: false, matchesCommittee: false }).state).toBe("removed");
  expect(vaultHealth({ reading, serving: true, matchesCommittee: false }).state).toBe("mismatch");
  expect(vaultHealth({ reading, serving: true, matchesCommittee: true })).toMatchObject({
    state: "healthy",
    detail: expect.stringContaining("one keeper can go offline"),
  });
  const tight = readingHealth({ peers, serving: true, viewingThreshold: 3 });
  expect(vaultHealth({ reading: tight, serving: true, matchesCommittee: true })).toMatchObject({
    state: "no-spare",
    tone: "warning",
  });
  // Carol's keeper drops out.
  const carolOffline = peers.filter((peer) => peer.name !== "Carol");
  const short = readingHealth({ peers: carolOffline, serving: true, viewingThreshold: 3 });
  expect(vaultHealth({ reading: short, serving: true, matchesCommittee: null }).state).toBe(
    "unreadable",
  );
});

test("every risk has a remedy", () => {
  const risks = thresholdRisks({ threshold: 1, viewingThreshold: 2, members: 3 });
  for (const risk of [
    ...risks,
    ...thresholdRisks({ threshold: 2, viewingThreshold: 2, members: 2 }),
  ])
    expect(riskRemedy(risk.id).length).toBeGreaterThan(20);
});
