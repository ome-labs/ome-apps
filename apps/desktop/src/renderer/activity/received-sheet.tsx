// One payment the keepers found: what arrived, from whom, and where it is on chain, each copyable.
import { type ReactNode, useMemo } from "react";

import type { ActivityEntry } from "@ome-labs/api";
import { formatAbsoluteTime, formatCount } from "@ome-labs/format";
import { Address, Amount, Hash, Sheet, TokenMonogram } from "@ome-labs/ui-web";

import type { KnownAddress } from "../proposals/calls/address-book.ts";

type Received = Extract<ActivityEntry, { kind: "received" }>;

export function ReceivedSheet({
  entry,
  sender,
  onOpenChange,
}: {
  entry: Received;
  /** The sender, when the member knows them: a member (trusted) or an aztec-wallet alias (not). */
  sender: KnownAddress | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const label = useMemo(
    () =>
      sender
        ? {
            label: sender.name,
            source:
              sender.kind === "member" || sender.kind === "vault"
                ? ("member" as const)
                : ("aztecWallet" as const),
          }
        : null,
    [sender],
  );
  return (
    <Sheet
      title="Payment received"
      description="A private transfer the members' keepers found. Only the vault's members can see it."
      open
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 rounded-lg bg-success-subtle px-4 py-4">
          <TokenMonogram token={entry.token} />
          <Amount amount={entry.amount} token={entry.token} size="lg" baseUnits />
        </div>
        <dl className="flex flex-col gap-4">
          <Row label="From">
            <Address address={entry.from} label={label} flagAlias full copy />
          </Row>
          <Row label="Token">
            <span className="flex flex-col gap-0.5">
              <span className="type-body-s text-fg">
                {entry.token.name} · {entry.token.symbol}
              </span>
              <Hash value={entry.token.address} noun="token" tone="quiet" />
            </span>
          </Row>
          <Row label="When">
            <span className="type-body-s text-fg">{formatAbsoluteTime(entry.at)}</span>
          </Row>
          <Row label="Block">
            <span className="type-mono-s text-fg">{formatCount(entry.block)}</span>
          </Row>
          <Row label="Transaction">
            <Hash value={entry.txHash} noun="transaction" full />
          </Row>
        </dl>
      </div>
    </Sheet>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="type-label-s text-fg-subtle">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
