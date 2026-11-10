import type { Meta, StoryObj } from "@storybook/react-vite";

import { TextField } from "../../src/forms/text-field.tsx";

const meta = {
  title: "Forms/Text field",
  component: TextField,
  args: {
    label: "To",
    hint: "Address, aztec-wallet alias or member.",
    defaultValue: "accounts:dave",
    mono: true,
  },
  render: (args) => (
    <div className="w-80">
      <TextField {...args} />
    </div>
  ),
} satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Error: Story = { args: { defaultValue: "dave", error: "Not an address or alias." } };
export const Disabled: Story = { args: { disabled: true } };
export const Text: Story = {
  args: {
    label: "Memo",
    mono: false,
    defaultValue: "Audit deposit",
    hint: "Up to 280 characters. Members see it.",
  },
};
export const Empty: Story = {
  args: { label: "Amount", defaultValue: undefined, placeholder: "0", hint: "Balance 1,000 OMET" },
};
