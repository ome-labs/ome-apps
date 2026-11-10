import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "../../src/forms/checkbox.tsx";
import { RadioGroup } from "../../src/forms/radio-group.tsx";
import { SegmentedControl } from "../../src/forms/segmented-control.tsx";
import { Switch } from "../../src/forms/switch.tsx";

const meta = { title: "Forms/Choices" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Checkboxes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox label="Remove Carol" />
      <Checkbox label="Remove Bob" defaultChecked />
      <Checkbox label="Every member" indeterminate />
      <Checkbox label="Remove Alice (you)" disabled />
    </div>
  ),
};

export const Radios: Story = {
  render: () => (
    <RadioGroup
      aria-label="Unlock for"
      defaultValue="15"
      options={[
        { value: "5", label: "5 min" },
        { value: "15", label: "15 min" },
        { value: "60", label: "1 h" },
      ]}
    />
  ),
};

export const Switches: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch label="Unlock with Touch ID" defaultChecked />
      <Switch label="Open at login" />
      <Switch label="Show Internals" disabled />
    </div>
  ),
};

function UnlockFor() {
  const [value, setValue] = useState<"5" | "15" | "60">("15");

  return (
    <SegmentedControl
      aria-label="Unlock for"
      value={value}
      onValueChange={setValue}
      options={[
        { value: "5", label: "5 min" },
        { value: "15", label: "15 min" },
        { value: "60", label: "1 h" },
      ]}
    />
  );
}

export const Segmented: Story = { render: () => <UnlockFor /> };
