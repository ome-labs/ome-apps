import { useState } from "react";

import { Checkbox, SegmentedControl, Switch, TextField } from "@ome-labs/ui-native";

import { Specimen } from "./specimen.tsx";

export function Forms() {
  const [touchId, setTouchId] = useState(true);
  const [removeCarol, setRemoveCarol] = useState(false);
  const [unlockFor, setUnlockFor] = useState<"5" | "15" | "60">("15");

  return (
    <>
      <Specimen title="Text fields">
        <TextField
          label="To"
          mono
          defaultValue="accounts:dave"
          hint="Address, aztec-wallet alias or member."
        />
        <TextField label="To" mono defaultValue="dave" error="Not an address or alias." />
        <TextField label="Passphrase" secureTextEntry autoComplete="current-password" />
        <TextField label="Memo" defaultValue="Audit deposit" editable={false} />
      </Specimen>
      <Specimen title="Switch and checkbox">
        <Switch label="Unlock with Touch ID" checked={touchId} onCheckedChange={setTouchId} />
        <Switch label="Show Internals" checked={false} onCheckedChange={() => {}} disabled />
        <Checkbox label="Remove Carol" checked={removeCarol} onCheckedChange={setRemoveCarol} />
      </Specimen>
      <Specimen title="Segmented control">
        <SegmentedControl
          label="Unlock for"
          value={unlockFor}
          onValueChange={setUnlockFor}
          options={[
            { value: "5", label: "5 min" },
            { value: "15", label: "15 min" },
            { value: "60", label: "1 h" },
          ]}
        />
      </Specimen>
    </>
  );
}
