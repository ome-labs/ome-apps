import type { Meta, StoryObj } from "@storybook/react-vite";

import { IconButton } from "../../src/actions/icon-button.tsx";

const meta = {
  title: "Actions/Icon button",
  component: IconButton,
  args: { icon: "more-horizontal", label: "More actions" },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Ghost: Story = {};
export const Secondary: Story = {
  args: { variant: "secondary", icon: "refresh", label: "Refresh" },
};
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton icon="lock" label="Lock signer" size="sm" />
      <IconButton icon="lock" label="Lock signer" size="md" />
      <IconButton icon="lock" label="Lock signer" size="lg" variant="secondary" />
      <IconButton icon="lock" label="Lock signer" disabled />
    </div>
  ),
};
