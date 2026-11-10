import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActivityRow } from "../../src/data/activity-row.tsx";
import { ProposalTable } from "../../src/data/proposal-row.tsx";
import { activity, aliceAccount, daveAlias, now, proposals } from "../sample.ts";

const meta = { title: "Data/Tables and lists" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Proposals: Story = {
  render: () => (
    <ProposalTable
      proposals={[
        proposals.designWork,
        proposals.tooLarge,
        { ...proposals.auditDeposit, status: "executed" },
      ]}
      recipients={{ [proposals.auditDeposit.id]: daveAlias }}
      hrefFor={(proposal) => `#${proposal.id}`}
      now={now}
    />
  ),
};

export const Activity: Story = {
  render: () => (
    <ul
      aria-label="Activity"
      className="divide-y divide-line-subtle rounded-lg border border-line-subtle bg-surface"
    >
      {activity.map((entry) => (
        <ActivityRow
          key={`${entry.kind}-${entry.at}`}
          entry={entry}
          now={now}
          names={{ [aliceAccount]: "Alice" }}
        />
      ))}
    </ul>
  ),
};
