import { useState } from "react";

import {
  Button,
  Dialog,
  DialogClose,
  IconButton,
  Menu,
  Popover,
  SegmentedControl,
  Sheet,
  TextField,
  TokenMonogram,
  Tooltip,
  TypeToConfirm,
  toast,
} from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";
import { omet, treasury, unlockOptions } from "../sample/story.ts";

export function Unlock() {
  const [minutes, setMinutes] = useState<"5" | "15" | "60">("15");

  return (
    <Dialog
      title="Unlock signer"
      description="Approving needs your signing key. Unlock it for a while, or approve once."
      trigger={<Button icon="unlock">Unlock</Button>}
      actions={
        <>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <DialogClose
            render={
              <Button variant="primary" icon="unlock">
                Unlock
              </Button>
            }
          />
        </>
      }
    >
      <TextField label="Passphrase" type="password" autoComplete="off" />
      <div className="flex flex-col gap-2">
        <span className="type-label-m">Unlock for</span>
        <SegmentedControl
          aria-label="Unlock for"
          value={minutes}
          onValueChange={setMinutes}
          options={unlockOptions}
        />
      </div>
    </Dialog>
  );
}

export function RemoveMember() {
  return (
    <TypeToConfirm
      title="Remove Carol from Treasury?"
      description="Carol's keeper share will be replaced. This needs approvals like any proposal, and removes at most t − 1 members."
      phrase={treasury.name}
      confirmLabel="Remove member"
      onConfirm={() => toast.success("Removal proposed")}
      trigger={<Button variant="danger">Remove Carol…</Button>}
    />
  );
}

export function AddToken() {
  return (
    <Sheet
      title="Add token"
      trigger={<Button icon="plus">Add token</Button>}
      footer={
        <>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <DialogClose render={<Button variant="primary">Add token</Button>} />
        </>
      }
    >
      <TextField
        label="Contract address"
        mono
        defaultValue={omet.address}
        hint="Ome reads name, symbol and decimals from the contract."
      />
      <div className="flex items-center gap-3 rounded-md bg-sunken p-3">
        <TokenMonogram token={omet} />
        <div className="flex flex-col">
          <span className="type-label-m">{omet.name}</span>
          <span className="type-mono-s text-fg-subtle">
            {omet.symbol} · {omet.decimals} decimals
          </span>
        </div>
      </div>
    </Sheet>
  );
}

export function RowMenu() {
  return (
    <Menu
      trigger={<IconButton icon="more-horizontal" label="Token actions" />}
      items={[
        {
          label: "Copy address",
          icon: "copy",
          shortcut: "⌘C",
          onSelect: () => void navigator.clipboard.writeText(omet.address),
        },
        { label: "Receive", icon: "receive", onSelect: () => toast.info("Receive pressed") },
        "separator",
        {
          label: "Stop tracking",
          icon: "trash",
          danger: true,
          onSelect: () => toast.info("Stop tracking pressed"),
        },
      ]}
    />
  );
}

export function TooltipAndPopover() {
  return (
    <div className="flex items-center gap-4">
      <Tooltip content="Lock signer">
        <IconButton icon="lock" label="Lock signer" />
      </Tooltip>
      <Popover title="Stale" trigger={<Button size="sm">What is stale?</Button>}>
        Made under an older vault config: the members changed after it was proposed.
      </Popover>
    </div>
  );
}

export const overlays: ExampleSet = {
  title: "Overlays",
  description:
    "Dialogs hold one decision, sheets hold a short form, and destructive changes ask for the vault's name. Escape closes all of them.",
  examples: [
    {
      name: "Unlock",
      title: "Dialog",
      description: "The unlock sheet, as a dialog.",
      Component: Unlock,
    },
    {
      name: "RemoveMember",
      title: "Type to confirm",
      description: "Type Treasury to enable the button.",
      Component: RemoveMember,
    },
    { name: "AddToken", title: "Sheet", Component: AddToken },
    { name: "RowMenu", title: "Menu", Component: RowMenu },
    { name: "TooltipAndPopover", title: "Tooltip and popover", Component: TooltipAndPopover },
  ],
};
