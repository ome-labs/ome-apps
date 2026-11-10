import { useState } from "react";

import { Button } from "../actions/button.tsx";
import { TextField } from "../forms/text-field.tsx";
import { Dialog } from "./dialog.tsx";

export type TypeToConfirmProps = {
  title: string;
  description: string;
  /** What the member types, usually the vault's name. Matched exactly. */
  phrase: string;
  confirmLabel: string;
  onConfirm: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Page 37's typed confirmation: typing the vault's name proves the member read which vault this is. */
export function TypeToConfirm({
  title,
  description,
  phrase,
  confirmLabel,
  onConfirm,
  open,
  onOpenChange,
}: TypeToConfirmProps) {
  const [typed, setTyped] = useState("");

  const close = (next: boolean) => {
    if (!next) setTyped("");
    onOpenChange(next);
  };

  return (
    <Dialog
      title={title}
      description={description}
      open={open}
      onOpenChange={close}
      actions={
        <>
          <Button variant="danger" size="lg" disabled={typed !== phrase} onPress={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="ghost" size="lg" onPress={() => close(false)}>
            Cancel
          </Button>
        </>
      }
    >
      <TextField
        label={`Type ${phrase} to confirm`}
        value={typed}
        onChangeText={setTyped}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </Dialog>
  );
}
