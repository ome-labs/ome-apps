// A transfer's fields: which of the vault's tokens, to whom (with the address book), and how much.
import { type ReactNode, useCallback, useMemo } from "react";

import type { Hex32, TokenBalance } from "@ome-labs/api";
import { formatTokenAmount } from "@ome-labs/format";
import { Field, Select, TextField, TokenMonogram } from "@ome-labs/ui-web";

import type { KnownAddress } from "./calls/address-book.ts";
import { AddressInput } from "./calls/arg-field.tsx";
import type { DraftErrors, TransferDraft } from "./draft.ts";

const PEOPLE = ["member", "alias"] as const;

export function TransferFields({
  draft,
  token,
  onChange,
  tokens,
  loading,
  errors,
  book,
  disabled,
}: {
  draft: TransferDraft;
  token: Hex32 | undefined;
  onChange: (patch: Partial<TransferDraft>) => void;
  tokens: TokenBalance[];
  loading: boolean;
  errors: DraftErrors;
  book: KnownAddress[];
  disabled: boolean;
}) {
  const options = useMemo(
    () =>
      tokens.map((entry) => ({
        value: entry.token.address,
        label: `${entry.token.name} · ${entry.token.symbol}`,
        leading: <TokenMonogram token={entry.token} size="sm" />,
        meta:
          entry.private.state === "known"
            ? formatTokenAmount(entry.private.amount, entry.token)
            : "balance unread",
      })),
    [tokens],
  );
  const held = tokens.find((entry) => entry.token.address === token);
  const setToken = useCallback((next: Hex32) => onChange({ token: next }), [onChange]);
  const setTo = useCallback((to: string) => onChange({ to }), [onChange]);
  const setAmount = useCallback((amount: string) => onChange({ amount }), [onChange]);
  const context = useMemo(() => ({ book, disabled }), [book, disabled]);

  return (
    <>
      <Row>
        <Field label="Token" disabled={disabled}>
          <Select
            aria-label="Token"
            options={options}
            value={token ?? null}
            onValueChange={setToken}
            placeholder={loading ? "Loading…" : "Choose a token"}
            disabled={disabled || tokens.length === 0}
          />
        </Field>
        {!loading && tokens.length === 0 ? (
          <p className="type-body-s text-fg-muted">
            The vault has no tokens yet. Add one on Balances & tokens first.
          </p>
        ) : null}
      </Row>
      <Row>
        <Field label="To" error={errors.to} disabled={disabled}>
          <AddressInput
            value={draft.to}
            onChange={setTo}
            context={context}
            invalid={Boolean(errors.to)}
            only={PEOPLE}
          />
        </Field>
      </Row>
      <Row>
        <TextField
          label="Amount"
          placeholder="0"
          inputMode="decimal"
          mono
          value={draft.amount}
          onValueChange={setAmount}
          error={errors.amount}
          hint={
            held?.private.state === "known"
              ? `The vault holds ${formatTokenAmount(held.private.amount, held.token)} privately.`
              : undefined
          }
          disabled={disabled || !token}
        />
      </Row>
    </>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 border-b border-line-subtle py-5">{children}</div>;
}
