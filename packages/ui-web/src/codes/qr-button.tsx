import { useState } from "react";

import { IconButton } from "../actions/icon-button.tsx";
import { Dialog } from "../overlays/dialog.tsx";
import { CopyButton } from "../values/copy-button.tsx";
import { QrCode } from "./qr-code.tsx";

export type QrButtonProps = {
  value: string;
  /** What the value is, lower case: "address", "peer ID". Names the button and the code. */
  label: string;
  /** The dialog's title: "Your Aztec account". */
  title: string;
  description?: string | undefined;
  size?: "sm" | "md" | undefined;
};

/** A QR icon beside a value that opens it as a large code to scan, with the full value and a copy button under it. */
export function QrButton({ value, label, title, description, size = "sm" }: QrButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        icon="qr"
        label={`Show ${label} as a QR code`}
        size={size}
        onClick={() => setOpen(true)}
        className="size-6 text-fg-subtle"
      />
      <Dialog title={title} description={description} open={open} onOpenChange={setOpen}>
        <div className="flex flex-col items-center gap-5">
          <QrCode value={value} label={`${title}: ${label}`} size={232} />
          <div className="flex w-full items-center gap-2 rounded-md bg-sunken px-3 py-2 shadow-field">
            <span className="min-w-0 flex-1 truncate type-mono-s text-fg" title={value}>
              {value}
            </span>
            <CopyButton value={value} label={`Copy ${label}`} />
          </div>
        </div>
      </Dialog>
    </>
  );
}
