import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import type { Hex32, PaymentRequestParams } from "@ome-labs/api";
import { formatAbsoluteTime, formatTokenAmount, parseAmount, timeAgo } from "@ome-labs/format";
import {
  Banner,
  CodeBox,
  CopyButton,
  Field,
  QrCode,
  Select,
  TextField,
  TokenMonogram,
} from "@ome-labs/ui-web";

import { callOme, useOme } from "../data/ome.ts";
import { useDebounced } from "../proposals/use-debounced.ts";
import { useNow } from "../shell/now.ts";
import { Page } from "../shell/page.tsx";

const ANY = "any";
const MEMO_LIMIT = 280;

/** `/vaults/$vault/receive`: the vault's address to pay, how it finds payments, and a payment request to send. */
export function ReceivePage() {
  const { vault } = useParams({ strict: false }) as { vault: Hex32 };
  const status = useOme("status", {});
  const summary = status.data?.vaults.find((item) => item.address === vault);

  return (
    <Page
      title="Receive"
      lead="Anyone can pay the vault from an Aztec wallet. Payments arrive as private notes that the members' keepers read together."
    >
      <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          <AddressCard vault={vault} name={summary?.name} />
          <RequestCard vault={vault} />
        </div>
        <ReceivingCard vault={vault} />
      </div>
    </Page>
  );
}

function Card({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-surface p-6 shadow-1">
      <header className="flex flex-col gap-1">
        <h2 className="type-heading-s text-fg">{title}</h2>
        {lead ? <p className="type-body-s text-fg-muted">{lead}</p> : null}
      </header>
      {children}
    </section>
  );
}

function AddressCard({ vault, name }: { vault: Hex32; name: string | undefined }) {
  return (
    <Card
      title={name ? `${name}'s address` : "The vault's address"}
      lead="Share it, or let the sender scan it. Payments to it are private: only the vault's members can see them."
    >
      <div className="flex flex-col items-start gap-5 @xl:flex-row @xl:items-center">
        <QrCode value={vault} label={`${name ?? "The vault"}'s address, to scan`} size={176} />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <code className="rounded-md bg-sunken px-3 py-2.5 type-mono-m text-fg shadow-field [overflow-wrap:anywhere]">
            {vault}
          </code>
          <div className="flex items-center gap-2">
            <CopyButton value={vault} label="Copy address" size="md" />
            <span className="type-caption text-fg-subtle">
              Check the first and last characters with whoever pays.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * A payment request: the vault, and optionally a token, amount and memo, as an `ome-pay:` link the daemon formats. It
 * follows the fields as they are typed.
 */
function RequestCard({ vault }: { vault: Hex32 }) {
  const tokens = useOme("tokens.list", { vault });
  const [token, setToken] = useState<string>(ANY);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const info = tokens.data?.find((entry) => entry.token.address === token)?.token;
  const parsed = info && amount.trim() ? parseAmount(amount, info.decimals) : undefined;
  const amountError =
    parsed && !parsed.ok
      ? `A ${info?.symbol} amount, at most ${info?.decimals} decimals`
      : undefined;

  const params = useMemo<PaymentRequestParams | undefined>(() => {
    if (amountError) return undefined;
    return {
      vault,
      ...(info ? { token: info.address } : {}),
      ...(parsed?.ok ? { amount: parsed.amount } : {}),
      ...(memo.trim() ? { memo: memo.trim() } : {}),
    };
  }, [amountError, info, memo, parsed, vault]);
  const settled = useDebounced(params ? JSON.stringify(params) : undefined, 250);
  const request = useQuery({
    queryKey: ["vault.request", settled],
    queryFn: () => callOme("vault.request", JSON.parse(settled as string) as PaymentRequestParams),
    enabled: settled !== undefined,
    placeholderData: (previous) => previous,
  });

  const options = useMemo(
    () => [
      { value: ANY, label: "Any token" },
      ...(tokens.data ?? []).map((entry) => ({
        value: entry.token.address,
        label: `${entry.token.name} · ${entry.token.symbol}`,
        leading: <TokenMonogram token={entry.token} size="sm" />,
      })),
    ],
    [tokens.data],
  );
  const pickToken = useCallback((next: string) => {
    setToken(next);
    if (next === ANY) setAmount("");
  }, []);
  const data = request.data;

  return (
    <Card
      title="Request a payment"
      lead="A link with the token and amount filled in, for whoever pays. It holds no secret: anyone with it can only pay."
    >
      <div className="grid grid-cols-1 gap-4 @xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Field label="Token">
          <Select aria-label="Token" options={options} value={token} onValueChange={pickToken} />
        </Field>
        <TextField
          label="Amount"
          mono
          inputMode="decimal"
          placeholder={info ? "0" : "Choose a token first"}
          value={amount}
          onValueChange={setAmount}
          error={amountError}
          hint={info && parsed?.ok ? formatTokenAmount(parsed.amount, info) : "Optional"}
          disabled={!info}
        />
      </div>
      <TextField
        label="Note"
        placeholder="What it's for"
        value={memo}
        onValueChange={setMemo}
        maxLength={MEMO_LIMIT}
        hint="Optional. The sender sees it."
      />
      {request.error ? <Banner kind="alarm">{request.error.message}</Banner> : null}
      {data ? (
        <div className="flex flex-col items-start gap-5 border-t border-line-subtle pt-5 @xl:flex-row">
          <QrCode value={data.uri} label="Payment request, to scan" size={152} />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <CodeBox label="Payment link" value={data.uri} />
            <p className="type-body-s text-fg-muted">
              {data.token
                ? data.amount
                  ? `Asks for ${formatTokenAmount(data.amount, data.token)}`
                  : `Asks for any amount of ${data.token.symbol}`
                : "Asks for any token and amount"}
              {data.memo ? `, for “${data.memo}”.` : "."}
            </p>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

/** How the vault finds payments: the handshake any wallet sends, and senders known from aztec-wallet. */
function ReceivingCard({ vault }: { vault: Hex32 }) {
  const receiving = useOme("vault.receiving", { vault });
  const now = useNow();
  const data = receiving.data;

  return (
    <aside className="flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-1 @3xl:sticky @3xl:top-4">
      <h2 className="type-heading-s text-fg">Finding payments</h2>
      {receiving.error ? <Banner kind="alarm">{receiving.error.message}</Banner> : null}
      {data ? (
        <dl className="flex flex-col divide-y divide-line-subtle">
          <Row
            label="From any Aztec wallet"
            value={data.handshakes ? "Found automatically" : "Off"}
            hint="A wallet's first payment to the vault carries a handshake, which lets the keepers find it."
          />
          <Row
            label="Senders from aztec-wallet"
            value={String(data.senders)}
            hint="aztec-wallet's accounts are registered as senders, so their payments are found even without a handshake."
          />
          <Row
            label="Last payment"
            value={data.lastReceivedAt === null ? "Nothing yet" : timeAgo(data.lastReceivedAt, now)}
            title={
              data.lastReceivedAt === null ? undefined : formatAbsoluteTime(data.lastReceivedAt)
            }
          />
        </dl>
      ) : null}
    </aside>
  );
}

function Row({
  label,
  value,
  hint,
  title,
}: {
  label: string;
  value: string;
  hint?: string;
  title?: string | undefined;
}) {
  return (
    <div className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-3">
        <dt className="type-label-m text-fg">{label}</dt>
        <dd className="type-body-s text-fg-muted tabular-nums" title={title}>
          {value}
        </dd>
      </div>
      {hint ? <p className="type-caption text-fg-subtle">{hint}</p> : null}
    </div>
  );
}
