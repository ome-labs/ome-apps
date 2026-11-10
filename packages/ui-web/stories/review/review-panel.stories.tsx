import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../src/actions/button.tsx";
import { CheckRow } from "../../src/review/check-row.tsx";
import { ReviewPanel } from "../../src/review/review-panel.tsx";
import { reviewOfAuditDeposit } from "../sample.ts";

const meta = {
  title: "Review/Review panel",
  component: ReviewPanel,
  args: { review: reviewOfAuditDeposit },
  render: (args) => (
    <div className="max-w-[640px]">
      <ReviewPanel {...args} />
    </div>
  ),
} satisfies Meta<typeof ReviewPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Bob reviews 3eb2: everything checks out; the recipient is an unverified alias. */
export const Passing: Story = {};

/** A proposal made before a membership change can't be approved. */
export const OlderConfig: Story = {
  args: {
    review: {
      ...reviewOfAuditDeposit,
      checks: { ...reviewOfAuditDeposit.checks, configCurrent: false },
      proposal: { ...reviewOfAuditDeposit.proposal, currentConfigVersion: 2 },
    },
  },
};

export const SimulationFailed: Story = {
  args: {
    review: {
      ...reviewOfAuditDeposit,
      simulation: { ok: false, gas: null, error: "balance too low" },
    },
  },
};

export const OnPhone: Story = {
  args: {
    actions: (
      <div className="flex items-center justify-end gap-3">
        <span className="type-body-s text-fg-muted">Approve on your phone (iPhone of Bob)</span>
        <Button icon="phone">Send to phone again</Button>
      </div>
    ),
  },
};

export const Checks: Story = {
  render: () => (
    <ul className="w-[420px]">
      <CheckRow state="pass" label="Payload rebuilt and matches" />
      <CheckRow state="warning" label="Recipient label is an unverified alias" />
      <CheckRow state="fail" label="Made under an older config" />
    </ul>
  ),
};
