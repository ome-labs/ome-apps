import { CodeBox, QrCode } from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";
import { inviteCode, omet, treasury } from "../sample/story.ts";

export function Invite() {
  return (
    <CodeBox
      className="w-full max-w-[520px]"
      label="Invite"
      value={inviteCode}
      hint="Holds no secrets. Send it to each co-founder."
    />
  );
}

export function Receive() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <QrCode value={treasury.address} label="Treasury's address" />
      <div className="flex w-full max-w-[420px] min-w-0 flex-col gap-5">
        <CodeBox label="Pay Treasury privately" value={treasury.address} />
        <CodeBox
          label="From aztec-wallet"
          value={`aztec-wallet send transfer_in_private -ca ${omet.address} --args accounts:<you> ${treasury.address} <amount> 0 -f <you>`}
          hint="Only private transfers keep the vault's balance private."
        />
      </div>
    </div>
  );
}

export const codes: ExampleSet = {
  title: "Codes",
  description: "Values meant to be copied or scanned: invites, addresses and commands.",
  examples: [
    { name: "Invite", title: "Invite code", Component: Invite },
    { name: "Receive", title: "Receive", Component: Receive, wide: true },
  ],
};
