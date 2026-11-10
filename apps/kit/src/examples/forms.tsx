import { useState } from "react";

import {
  Checkbox,
  Field,
  RadioGroup,
  SegmentedControl,
  Select,
  Switch,
  TextField,
  TokenMonogram,
} from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";
import { omet, unlockOptions } from "../sample/story.ts";

export function TextFields() {
  return (
    <div className="flex w-full max-w-80 flex-col gap-5">
      <TextField
        label="To"
        hint="Address, aztec-wallet alias or member."
        defaultValue="accounts:dave"
        mono
      />
      <TextField label="To" defaultValue="dave" error="Not an address or alias." mono />
      <TextField
        label="Memo"
        defaultValue="Audit deposit"
        hint="Up to 280 characters. Members see it."
      />
      <TextField label="Amount" placeholder="0" hint="Balance 1,000 OMET" />
      <TextField label="To" defaultValue="accounts:dave" mono disabled />
    </div>
  );
}

export function TokenSelect() {
  return (
    <div className="flex w-full max-w-80 flex-col gap-5">
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
      <Field label="Expires in">
        <Select
          defaultValue="24"
          options={[
            { value: "1", label: "1 hour" },
            { value: "24", label: "24 hours" },
            { value: "168", label: "7 days" },
            { value: "720", label: "30 days" },
          ]}
        />
      </Field>
      <Select
        aria-label="Expires in"
        defaultValue="24"
        disabled
        options={[{ value: "24", label: "24 hours" }]}
      />
    </div>
  );
}

export function Checkboxes() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox label="Remove Carol" />
      <Checkbox label="Remove Bob" defaultChecked />
      <Checkbox label="Every member" indeterminate />
      <Checkbox label="Remove Alice (you)" disabled />
    </div>
  );
}

export function Radios() {
  return <RadioGroup aria-label="Unlock for" defaultValue="15" options={unlockOptions} />;
}

export function Switches() {
  return (
    <div className="flex flex-col gap-3">
      <Switch label="Unlock with Touch ID" defaultChecked />
      <Switch label="Open at login" />
      <Switch label="Show Internals" disabled />
    </div>
  );
}

export function Segmented() {
  const [value, setValue] = useState<"5" | "15" | "60">("15");

  return (
    <SegmentedControl
      aria-label="Unlock for"
      value={value}
      onValueChange={setValue}
      options={unlockOptions}
    />
  );
}

export const forms: ExampleSet = {
  title: "Forms",
  description:
    "Fields keep their label visible and put hints and errors under the input. Addresses and amounts use the mono input.",
  examples: [
    { name: "TextFields", title: "Text fields", Component: TextFields },
    { name: "TokenSelect", title: "Select", Component: TokenSelect },
    { name: "Checkboxes", title: "Checkboxes", Component: Checkboxes },
    { name: "Radios", title: "Radio group", Component: Radios },
    { name: "Switches", title: "Switches", Component: Switches },
    { name: "Segmented", title: "Segmented control", Component: Segmented },
  ],
};
