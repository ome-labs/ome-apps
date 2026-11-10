import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../src/actions/button.tsx";

const meta = {
  title: "Actions/Button",
  component: Button,
  args: { children: "New proposal" },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary", icon: "plus" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Cancel" } };
export const Danger: Story = { args: { variant: "danger", children: "Remove member" } };

/** Page 24's grid: four styles across three sizes, then disabled. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <Button size={size} variant="primary" icon="signature">
            Approve
          </Button>
          <Button size={size} variant="secondary">
            Review
          </Button>
          <Button size={size} variant="ghost">
            Cancel
          </Button>
          <Button size={size} variant="danger">
            Reject
          </Button>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <Button variant="primary" disabled>
          Approve
        </Button>
        <Button disabled>Review</Button>
        <Button variant="danger" disabled>
          Remove member
        </Button>
      </div>
    </div>
  ),
};
