import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";

import type { Hex32, ProposalPreview } from "@ome-labs/api";
import { formatTokenAmount, proposalSummary } from "@ome-labs/format";
import {
  Banner,
  Button,
  Field,
  SegmentedControl,
  Select,
  TextField,
  TokenMonogram,
} from "@ome-labs/ui-web";

import { callOme, useOme } from "../data/ome.ts";
import { Page } from "../shell/page.tsx";
import { useWithSigner } from "../shell/signer.tsx";
import { EXPIRY_OPTIONS, MEMO_LIMIT, type TransferDraft, readDraft } from "./draft.ts";
import { useDebounced } from "./use-debounced.ts";

/** `/vaults/$vault/new`: a transfer from the vault, dry-run as it is typed, then proposed with this member's approval. */
export function NewProposalPage() {
  const { vault } = useParams({ strict: false }) as { vault: Hex32 };
  const navigate = useNavigate();
  const withSigner = useWithSigner();
  const status = useOme("status", {});
  const tokens = useOme("tokens.list", { vault });
  const aliases = useOme("aztec.aliases", {});
  const summary = status.data?.vaults.find((item) => item.address === vault);

  const [draft, setDraft] = useState<TransferDraft>({
    token: undefined,
    to: "",
    amount: "",
    memo: "",
    expiry: "24",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const list = useMemo(() => tokens.data ?? [], [tokens.data]);
  // The vault's only token is the obvious one; with several, the member picks.
  const token = draft.token ?? (list.length === 1 ? list[0]?.token.address : undefined);
  const { intent, errors } = useMemo(
    () => readDraft({ ...draft, token }, list),
    [draft, token, list],
  );

  // The dry run follows the intent once the member stops typing; until then it shows nothing stale.
  const settled = useDebounced(intent, 400);
  const checked = settled !== undefined && settled === intent ? settled : undefined;
  const preview = useQuery({
    queryKey: ["proposals.preview", { vault, intent: checked }],
    queryFn: () =>
      callOme("proposals.preview", {
        vault,
        intent: checked as NonNullable<typeof checked>,
        expiresInHours: 24,
      }),
    enabled: checked !== undefined,
  });

  const set = useCallback(
    <K extends keyof TransferDraft>(key: K) =>
      (value: TransferDraft[K]) =>
        setDraft((current) => ({ ...current, [key]: value })),
    [],
  );
  const setToken = useMemo(() => set("token"), [set]);
  const setTo = useMemo(() => set("to"), [set]);
  const setAmount = useMemo(() => set("amount"), [set]);
  const setMemo = useMemo(() => set("memo"), [set]);
  const setExpiry = useMemo(() => set("expiry"), [set]);

  const tokenOptions = useMemo(
    () =>
      list.map((entry) => ({
        value: entry.token.address,
        label: `${entry.token.name} · ${entry.token.symbol}`,
        leading: <TokenMonogram token={entry.token} size="sm" />,
        meta:
          entry.balance === null ? "balance unread" : formatTokenAmount(entry.balance, entry.token),
      })),
    [list],
  );
  const known = useMemo(
    () =>
      (aliases.data ?? [])
        .filter((alias) => alias.key.startsWith("accounts:"))
        .map((alias) => ({ name: alias.key.slice("accounts:".length), address: alias.value })),
    [aliases.data],
  );
  const recipient = known.find(
    (item) => item.address.toLowerCase() === draft.to.trim().toLowerCase(),
  );
  const held = list.find((entry) => entry.token.address === token);

  const toProposals = useCallback(
    () => void navigate({ to: "/vaults/$vault/proposals", params: { vault } }),
    [navigate, vault],
  );
  const back = useMemo(() => ({ label: "Proposals", onClick: toProposals }), [toProposals]);
  const ready = checked !== undefined && preview.data?.ok === true;
  const summaryLine = useMemo(() => {
    if (intent?.kind !== "transfer") return undefined;
    const label = recipient
      ? { address: intent.to, label: recipient.name, source: "aztecWallet" as const }
      : null;
    return proposalSummary({ intent, token: held?.token ?? null }, label);
  }, [intent, recipient, held]);
  const propose = useCallback(async () => {
    if (!intent) return;
    setPending(true);
    setError(undefined);
    try {
      const made = await withSigner(() =>
        callOme("proposals.create", { vault, intent, expiresInHours: Number(draft.expiry) }),
      );
      if (made) {
        await navigate({ to: "/vaults/$vault/proposals/$id", params: { vault, id: made.id } });
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(false);
    }
  }, [draft.expiry, intent, navigate, vault, withSigner]);

  const threshold = summary?.threshold;
  return (
    <Page
      back={back}
      title="New proposal"
      lead={
        threshold
          ? `Propose a payment from the vault. It goes through once ${threshold} of ${summary.members} members approve it.`
          : "Propose a payment from the vault."
      }
    >
      <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col rounded-lg bg-surface px-6 shadow-1">
          <Row>
            {error ? <Banner kind="alarm">{error}</Banner> : null}
            <Field label="Token" disabled={pending}>
              <Select
                aria-label="Token"
                options={tokenOptions}
                value={token ?? null}
                onValueChange={setToken}
                placeholder={tokens.isPending ? "Loading…" : "Choose a token"}
                disabled={pending || list.length === 0}
              />
            </Field>
            {tokens.data && list.length === 0 ? (
              <p className="type-body-s text-fg-muted">
                The vault has no tokens yet. Add one on Balances & tokens first.
              </p>
            ) : null}
          </Row>
          <Row>
            <TextField
              label="To"
              placeholder="0x…"
              mono
              value={draft.to}
              onValueChange={setTo}
              error={errors.to}
              hint={
                recipient
                  ? `${recipient.name}, from your aztec-wallet aliases (unverified)`
                  : undefined
              }
              disabled={pending}
            />
            {known.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="type-caption text-fg-subtle">Known</span>
                {known.map((item) => (
                  <Known
                    key={item.address}
                    name={item.name}
                    address={item.address}
                    onPick={setTo}
                  />
                ))}
              </div>
            ) : null}
          </Row>
          <Row>
            <TextField
              label="Amount"
              placeholder="0"
              inputMode="decimal"
              value={draft.amount}
              onValueChange={setAmount}
              error={errors.amount}
              hint={
                held?.balance
                  ? `The vault holds ${formatTokenAmount(held.balance, held.token)}.`
                  : undefined
              }
              disabled={pending || !token}
            />
          </Row>
          <Row>
            <TextField
              label="Note"
              placeholder="What it's for"
              value={draft.memo}
              onValueChange={setMemo}
              maxLength={MEMO_LIMIT}
              hint="Optional. Every member sees it."
              disabled={pending}
            />
          </Row>
          <Row>
            <div className="flex items-center justify-between gap-6">
              <div className="flex flex-col gap-0.5">
                <span className="type-label-m text-fg">Expires after</span>
                <span className="type-body-s text-fg-muted">Unexecuted by then, it can't run.</span>
              </div>
              <SegmentedControl
                aria-label="Expires after"
                options={EXPIRY_OPTIONS}
                value={draft.expiry}
                onValueChange={setExpiry}
              />
            </div>
          </Row>
          <div className="flex items-center justify-end gap-2 py-4">
            <Button variant="ghost" onClick={toProposals} disabled={pending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon="signature"
              onClick={propose}
              pending={pending}
              disabled={!ready}
            >
              {pending ? "Proposing…" : "Propose"}
            </Button>
          </div>
        </div>

        <DryRun
          summary={summaryLine}
          preview={checked ? preview.data : undefined}
          checking={intent !== undefined && (checked === undefined || preview.isFetching)}
          failure={preview.error?.message}
          threshold={threshold}
        />
      </div>
    </Page>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3 border-b border-line-subtle py-5">{children}</div>;
}

function Known({
  name,
  address,
  onPick,
}: {
  name: string;
  address: string;
  onPick: (address: string) => void;
}) {
  const pick = useCallback(() => onPick(address), [address, onPick]);
  return (
    <Button size="sm" onClick={pick}>
      {name}
    </Button>
  );
}

/** The dry run: what the proposal would do, simulated on this device before anyone signs. */
function DryRun({
  summary,
  preview,
  checking,
  failure,
  threshold,
}: {
  summary: string | undefined;
  preview: ProposalPreview | undefined;
  checking: boolean;
  failure: string | undefined;
  threshold: number | undefined;
}) {
  return (
    <aside className="flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-1">
      <div className="flex flex-col gap-1">
        <h2 className="type-heading-s text-fg">Dry run</h2>
        <p className="type-body-s text-fg-muted">
          {summary ?? "Fill in the token, recipient and amount to simulate it."}
        </p>
      </div>
      {checking ? <p className="type-body-s text-fg-subtle">Simulating…</p> : null}
      {failure ? <Banner kind="alarm">{failure}</Banner> : null}
      {preview && !checking ? (
        preview.ok ? (
          <>
            <p className="type-body-s text-success">
              Simulation ok
              {preview.gas
                ? ` · ${preview.gas.da.toLocaleString()} DA gas, ${preview.gas.l2.toLocaleString()} L2 gas`
                : ""}
            </p>
            <ol className="flex flex-col gap-2">
              {preview.calls.map((call, position) => (
                <li
                  // Calls are positional, and the same call can appear twice.
                  // oxlint-disable-next-line react/no-array-index-key
                  key={position}
                  className="flex flex-col gap-1 rounded-md bg-sunken px-3 py-2.5 shadow-field"
                >
                  <span className="type-label-m text-fg">{call.toLabel ?? "Contract"}</span>
                  <code className="type-mono-s text-fg-muted [overflow-wrap:anywhere]">
                    {call.fn}({call.args.join(", ")})
                  </code>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <Banner kind="alarm">{preview.error ?? "The simulation failed."}</Banner>
        )
      ) : null}
      <p className="border-t border-line-subtle pt-4 type-caption text-fg-subtle">
        Proposing signs your approval, so it starts at 1 of {threshold ?? "the"} approvals
        {threshold ? "" : " needed"}.
      </p>
    </aside>
  );
}
