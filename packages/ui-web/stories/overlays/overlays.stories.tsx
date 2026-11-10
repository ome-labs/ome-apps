import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../src/actions/button.tsx";
import { IconButton } from "../../src/actions/icon-button.tsx";
import { SegmentedControl } from "../../src/forms/segmented-control.tsx";
import { TextField } from "../../src/forms/text-field.tsx";
import { TokenMonogram } from "../../src/identity/token-monogram.tsx";
import { Dialog, DialogClose } from "../../src/overlays/dialog.tsx";
import { Menu } from "../../src/overlays/menu.tsx";
import { Popover } from "../../src/overlays/popover.tsx";
import { Sheet } from "../../src/overlays/sheet.tsx";
import { Tooltip } from "../../src/overlays/tooltip.tsx";
import { TypeToConfirm } from "../../src/overlays/type-to-confirm.tsx";
import { omet, treasury, unlockOptions } from "../sample.ts";

const meta = { title: "Overlays/Dialogs, sheets, menus" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

function UnlockFields() {
  const [minutes, setMinutes] = useState<"5" | "15" | "60">("15");

  return (
    <>
      <TextField label="Passphrase" type="password" autoComplete="current-password" />
      <div className="flex flex-col gap-2">
        <span className="type-label-m">Unlock for</span>
        <SegmentedControl
          aria-label="Unlock for"
          value={minutes}
          onValueChange={setMinutes}
          options={unlockOptions}
        />
      </div>
    </>
  );
}

/** Page 37's unlock sheet, as a dialog. */
export const Unlock: Story = {
  render: () => (
    <Dialog
      title="Unlock signer"
      description="Approving needs your signing key. Unlock it for a while, or approve once."
      trigger={<Button icon="unlock">Unlock</Button>}
      actions={
        <>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button variant="primary" icon="unlock">
            Unlock
          </Button>
        </>
      }
    >
      <UnlockFields />
    </Dialog>
  ),
};

export const RemoveMember: Story = {
  render: () => (
    <TypeToConfirm
      title="Remove Carol from Treasury?"
      description="Carol's keeper share will be replaced. This needs approvals like any proposal, and removes at most t − 1 members."
      phrase={treasury.name}
      confirmLabel="Remove member"
      onConfirm={noop}
      trigger={<Button variant="danger">Remove Carol…</Button>}
    />
  ),
};

export const AddToken: Story = {
  render: () => (
    <Sheet
      title="Add token"
      trigger={<Button icon="plus">Add token</Button>}
      footer={
        <>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button variant="primary">Add token</Button>
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
  ),
};

export const RowMenu: Story = {
  render: () => (
    <Menu
      trigger={<IconButton icon="more-horizontal" label="Token actions" />}
      items={[
        { label: "Copy address", icon: "copy", shortcut: "⌘C", onSelect: noop },
        { label: "Receive", icon: "receive", onSelect: noop },
        "separator",
        { label: "Stop tracking", icon: "trash", danger: true, onSelect: noop },
      ]}
    />
  ),
};

export const TooltipAndPopover: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip content="Lock signer">
        <IconButton icon="lock" label="Lock signer" />
      </Tooltip>
      <Popover title="Stale" trigger={<Button size="sm">What is stale?</Button>}>
        Made under an older vault config: the members changed after it was proposed.
      </Popover>
    </div>
  ),
};
