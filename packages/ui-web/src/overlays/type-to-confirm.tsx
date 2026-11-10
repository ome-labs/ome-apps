import { useState, type ReactElement, type ReactNode } from "react";

import { Button } from "../actions/button.tsx";
import { TextField } from "../forms/text-field.tsx";
import { Dialog, DialogClose } from "./dialog.tsx";

export type TypeToConfirmProps = {
  title: string;
  description: ReactNode;
  /** What the member types, usually the vault's name. Matched exactly, case included. */
  phrase: string;
  confirmLabel: string;
  onConfirm: () => void;
  trigger?: ReactElement | undefined;
  open?: boolean | undefined;
  onOpenChange?: (open: boolean) => void | undefined;
};

/**
 * Page 37's typed confirmation, for removing members and other changes that can't be taken back. The kit asks
 * for the vault's name rather than a countdown: typing it proves the member read which vault this is.
 */
export function TypeToConfirm({
  title,
  description,
  phrase,
  confirmLabel,
  onConfirm,
  trigger,
  open,
  onOpenChange,
}: TypeToConfirmProps) {
  const [typed, setTyped] = useState("");
  const matches = typed === phrase;

  return (
    <Dialog
      title={title}
      description={description}
      trigger={trigger}
      {...(open === undefined ? {} : { open })}
      onOpenChange={(next) => {
        if (!next) setTyped("");
        onOpenChange?.(next);
      }}
      actions={
        <>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button variant="danger" disabled={!matches} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <TextField
        label={`Type ${phrase} to confirm`}
        value={typed}
        onValueChange={(value) => setTyped(value)}
        autoComplete="off"
        spellCheck={false}
      />
    </Dialog>
  );
}
