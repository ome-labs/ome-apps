import { readingHealth } from "@ome-labs/format";
import { HealthMeter, ThresholdChip, VoteProgress } from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";
import { peers, proposals, treasury } from "../sample/story.ts";

export function Chips() {
  return (
    <div className="flex flex-wrap gap-2">
      <ThresholdChip kind="spend" threshold={treasury.threshold} members={treasury.members} />
      <ThresholdChip kind="read" threshold={treasury.viewingThreshold} members={treasury.members} />
    </div>
  );
}

export function Votes() {
  return (
    <div className="flex w-full flex-col gap-3">
      <VoteProgress proposal={proposals.designWork} />
      <VoteProgress proposal={proposals.auditDeposit} />
      <VoteProgress proposal={proposals.tooLarge} />
    </div>
  );
}

const carolOffline = peers.map((peer) =>
  peer.name === "Carol" ? { ...peer, connected: false } : peer,
);

export function Health() {
  return (
    <div className="flex w-full flex-col gap-3">
      <HealthMeter health={readingHealth({ peers, serving: true, viewingThreshold: 2 })} />
      <HealthMeter health={readingHealth({ peers, serving: false, viewingThreshold: 2 })} />
      <HealthMeter
        health={readingHealth({ peers: carolOffline, serving: false, viewingThreshold: 2 })}
      />
    </div>
  );
}

export const thresholds: ExampleSet = {
  title: "Thresholds",
  description:
    "Two thresholds in the CLI's words: approvals to spend, and members to read. Votes and reading health count against them.",
  examples: [
    { name: "Chips", title: "Threshold chips", Component: Chips },
    { name: "Votes", title: "Vote progress", Component: Votes },
    {
      name: "Health",
      title: "Can this vault still read?",
      description: "Healthy, this keeper not serving, and Carol offline as well.",
      Component: Health,
    },
  ],
};
