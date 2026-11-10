import type { Meta, StoryObj } from "@storybook/react-vite";

import { CodeBox } from "../../src/codes/code-box.tsx";
import { QrCode } from "../../src/codes/qr-code.tsx";
import { inviteCode, omet, treasury } from "../sample.ts";

const meta = { title: "Codes/Code box and QR" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Invite: Story = {
  render: () => (
    <CodeBox
      className="w-[520px]"
      label="Invite"
      value={inviteCode}
      hint="Holds no secrets. Send it to each co-founder."
    />
  ),
};

export const Receive: Story = {
  render: () => (
    <div className="flex items-start gap-6">
      <QrCode value={treasury.address} label="Treasury's address" />
      <div className="flex w-[420px] flex-col gap-5">
        <CodeBox label="Pay Treasury privately" value={treasury.address} />
        <CodeBox
          label="From aztec-wallet"
          value={`aztec-wallet send transfer_in_private -ca ${omet.address} --args accounts:<you> ${treasury.address} <amount> 0 -f <you>`}
          hint="Only private transfers keep the vault's balance private."
        />
      </div>
    </div>
  ),
};
