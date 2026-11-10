import { readingHealth } from "@ome-labs/format";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { HealthMeter } from "../../src/thresholds/health-meter.tsx";
import { ThresholdChip } from "../../src/thresholds/threshold-chip.tsx";
import { VoteProgress } from "../../src/thresholds/vote-progress.tsx";
import { peers, proposals, treasury } from "../sample.ts";

const meta = { title: "Thresholds/Chips, votes and health" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Chips: Story = {
  render: () => (
    <div className="flex gap-2">
      <ThresholdChip kind="spend" threshold={treasury.threshold} members={treasury.members} />
      <ThresholdChip kind="read" threshold={treasury.viewingThreshold} members={treasury.members} />
    </div>
  ),
};

export const Votes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <VoteProgress proposal={proposals.designWork} />
      <VoteProgress proposal={proposals.auditDeposit} />
      <VoteProgress proposal={proposals.tooLarge} />
    </div>
  ),
};

const [alice, bob, carol] = peers;
const lonely = [alice, bob, carol ? { ...carol, connected: false } : undefined].filter(
  (peer) => peer !== undefined,
);

export const Health: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <HealthMeter health={readingHealth({ peers, serving: true, viewingThreshold: 2 })} />
      <HealthMeter health={readingHealth({ peers, serving: false, viewingThreshold: 2 })} />
      <HealthMeter health={readingHealth({ peers: lonely, serving: false, viewingThreshold: 2 })} />
    </div>
  ),
};
