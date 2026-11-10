import { proposalStatuses } from "@ome-labs/format";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusBadge } from "../../src/status/status-badge.tsx";
import { Tag } from "../../src/status/tag.tsx";

const meta = {
  title: "Status/Status badge",
  component: StatusBadge,
  args: { kind: "proposal", status: "collecting" },
} satisfies Meta<typeof StatusBadge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Proposal: Story = {};

/** Every status the daemon can report, with the tone the kit gives it. */
export const All: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {proposalStatuses.map((status) => (
          <StatusBadge key={status} kind="proposal" status={status} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(["stopped", "starting", "running", "restarting", "failed"] as const).map((status) => (
          <StatusBadge key={status} kind="service" status={status} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(["pending", "active", "done", "failed"] as const).map((status) => (
          <StatusBadge key={status} kind="step" status={status} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(["connected", "relayed", "offline"] as const).map((status) => (
          <StatusBadge key={status} kind="connection" status={status} />
        ))}
      </div>
    </div>
  ),
};

export const Tags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag>alias, unverified</Tag>
      <Tag tone="accent">You</Tag>
      <Tag tone="danger">2 rejected</Tag>
      <Tag tone="warning">Testnet</Tag>
      <Tag tone="success">epoch 1</Tag>
    </div>
  ),
};
