import type { Meta, StoryObj } from "@storybook/react-vite";

import { Field } from "../../src/forms/field.tsx";
import { Select } from "../../src/forms/select.tsx";
import { TokenMonogram } from "../../src/identity/token-monogram.tsx";
import { omet } from "../sample.ts";

const meta = { title: "Forms/Select", component: Select } satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Token: Story = {
  args: { options: [], "aria-label": "Token" },
  render: () => (
    <div className="w-80">
      <Field label="Token">
        <Select
          defaultValue={omet.address}
          options={[
            {
              value: omet.address,
              label: `${omet.symbol} · ${omet.name}`,
              meta: "1,000",
              leading: <TokenMonogram token={omet} size="sm" />,
            },
          ]}
        />
      </Field>
    </div>
  ),
};

export const ExpiresIn: Story = {
  args: {
    "aria-label": "Expires in",
    defaultValue: "24",
    options: [
      { value: "1", label: "1 hour" },
      { value: "24", label: "24 hours" },
      { value: "168", label: "7 days" },
      { value: "720", label: "30 days" },
    ],
  },
  render: (args) => (
    <div className="w-60">
      <Select {...args} />
    </div>
  ),
};

export const Disabled: Story = { ...ExpiresIn, args: { ...ExpiresIn.args, disabled: true } };
