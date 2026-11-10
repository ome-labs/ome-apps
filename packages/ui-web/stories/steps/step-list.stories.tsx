import type { Meta, StoryObj } from "@storybook/react-vite";

import { StepList } from "../../src/steps/step-list.tsx";
import { StepRow } from "../../src/steps/step-row.tsx";

const meta = { title: "Steps/Step list" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** ui-guide §5.19, part way through key generation. */
export const Founding: Story = {
  render: () => (
    <StepList label="Founding" className="w-[420px]">
      <StepRow status="done" label="Agree on the plan" time="4.1 s" />
      <StepRow
        status="active"
        label="Generate the shared key"
        detail="round 2 of 3"
        time="0.52 s"
      />
      <StepRow status="pending" label="Derive the vault" />
      <StepRow status="pending" label="Register with your keeper" />
      <StepRow status="pending" label="Deploy the vault" detail="the host deploys" />
      <StepRow status="pending" label="Verify on chain" />
    </StepList>
  ),
};

export const Execution: Story = {
  render: () => (
    <StepList label="Execution" className="w-[420px]">
      <StepRow status="done" label="Rebuilding" time="0.21 s" />
      <StepRow
        status="active"
        label="Proving"
        detail="This can take a while with real proofs."
        time="38 s"
      />
      <StepRow status="pending" label="Sending" />
      <StepRow status="pending" label="Mined" />
    </StepList>
  ),
};

export const Failed: Story = {
  render: () => (
    <StepList label="Founding" className="w-[420px]">
      <StepRow status="done" label="Agree on the plan" time="4.1 s" />
      <StepRow
        status="failed"
        label="Generate the shared key"
        detail="Keeper 3 did not answer"
        time="30 s"
      />
    </StepList>
  ),
};
