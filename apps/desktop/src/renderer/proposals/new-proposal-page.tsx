import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";

import type { Hex32, Intent } from "@ome-labs/api";
import { proposalSummary, shortHex } from "@ome-labs/format";
import { Banner, Button, SegmentedControl, TextField } from "@ome-labs/ui-web";

import { callOme, useOme } from "../data/ome.ts";
import { Page } from "../shell/page.tsx";
import { useWithSigner } from "../shell/signer.tsx";
import { nameIn, useAddressBook } from "./calls/address-book.ts";
import { CallsForm, useFunctions } from "./calls/calls-form.tsx";
import { type CallsDraft, emptyCalls, readCalls, summaryBytes } from "./calls/composer.ts";
import { EXPIRY_OPTIONS, type Expiry, MEMO_LIMIT, type TransferDraft, readDraft } from "./draft.ts";
import { DryRun } from "./dry-run.tsx";
import { Row, TransferFields } from "./transfer-fields.tsx";
import { useDebounced } from "./use-debounced.ts";

type Kind = "transfer" | "calls";

const KINDS: { value: Kind; label: string }[] = [
  { value: "transfer", label: "Transfer" },
  { value: "calls", label: "Contract calls" },
];

/** The daemon's limits before `daemon.info` answers; the same as 0.3.0's. */
const DEFAULT_LIMITS = { maxCalls: 4, maxAuthwits: 4, maxSummaryBytes: 4096 };

/**
 * `/vaults/$vault/new`: a transfer, or contract calls with the authwits they need, dry-run as they are written and
 * then proposed with this member's approval.
 */
export function NewProposalPage() {
  const { vault } = useParams({ strict: false }) as { vault: Hex32 };
  const navigate = useNavigate();
  const withSigner = useWithSigner();
  const status = useOme("status", {});
  const info = useOme("daemon.info", {});
  const tokens = useOme("tokens.list", { vault });
  const book = useAddressBook(vault);
  const summary = status.data?.vaults.find((item) => item.address === vault);
  const limits = useMemo(
    () => ({
      ...DEFAULT_LIMITS,
      ...info.data?.limits,
      // A daemon without authwits takes none.
      ...(info.data && !info.data.capabilities.includes("authwits") ? { maxAuthwits: 0 } : {}),
    }),
    [info.data],
  );

  const [kind, setKind] = useState<Kind>("transfer");
  const [transfer, setTransfer] = useState<TransferDraft>({
    token: undefined,
    to: "",
    amount: "",
    memo: "",
    expiry: "24",
  });
  const [calls, setCalls] = useState<CallsDraft>(emptyCalls);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const functionsOf = useFunctions(calls);

  const list = useMemo(() => tokens.data ?? [], [tokens.data]);
  const tokenInfos = useMemo(() => list.map((entry) => entry.token), [list]);
  // The vault's only token is the obvious one; with several, the member picks.
  const token = transfer.token ?? (list.length === 1 ? list[0]?.token.address : undefined);
  const transferRead = useMemo(
    () => readDraft({ ...transfer, token }, list),
    [transfer, token, list],
  );
  const callsRead = useMemo(
    () => readCalls(calls, transfer.memo, functionsOf),
    [calls, functionsOf, transfer.memo],
  );
  const intent: Intent | undefined = kind === "transfer" ? transferRead.intent : callsRead.intent;
  const bytes = intent ? summaryBytes(intent) : 0;
  const tooLarge = bytes > limits.maxSummaryBytes;
  const size = useMemo(
    () => (kind === "calls" && bytes > 0 ? { bytes, max: limits.maxSummaryBytes } : undefined),
    [bytes, kind, limits.maxSummaryBytes],
  );

  // The dry run follows the intent once the member stops typing; until then it shows nothing stale. Intents are
  // compared by their text, since each edit makes a new object.
  const key = intent && !tooLarge ? JSON.stringify(intent) : undefined;
  const settled = useDebounced(key, 450);
  const checked = key !== undefined && settled === key ? intent : undefined;
  const preview = useQuery({
    queryKey: ["proposals.preview", { vault, intent: settled }],
    queryFn: () =>
      callOme("proposals.preview", {
        vault,
        intent: checked as Intent,
        expiresInHours: Number(transfer.expiry),
      }),
    enabled: checked !== undefined,
    placeholderData: (previous) => previous,
  });

  const patchTransfer = useCallback(
    (patch: Partial<TransferDraft>) => setTransfer((current) => ({ ...current, ...patch })),
    [],
  );
  const setMemo = useCallback((memo: string) => patchTransfer({ memo }), [patchTransfer]);
  const setExpiry = useCallback((expiry: Expiry) => patchTransfer({ expiry }), [patchTransfer]);
  const pickKind = useCallback((next: Kind) => {
    setKind(next);
    setError(undefined);
  }, []);

  const toProposals = useCallback(
    () => void navigate({ to: "/vaults/$vault/proposals", params: { vault } }),
    [navigate, vault],
  );
  const back = useMemo(() => ({ label: "Proposals", onClick: toProposals }), [toProposals]);
  const ready = checked !== undefined && preview.data?.ok === true && !preview.isFetching;
  const summaryLine = useMemo(() => {
    if (!intent) return undefined;
    if (intent.kind === "transfer") {
      const known = nameIn(book, intent.to);
      const label = known
        ? {
            address: intent.to,
            label: known.name,
            source: known.kind === "member" ? ("member" as const) : ("aztecWallet" as const),
          }
        : null;
      const held = list.find((entry) => entry.token.address === intent.token);
      return proposalSummary({ intent, token: held?.token ?? null }, label);
    }
    if (intent.kind === "calls") {
      const named = intent.calls.map(
        (call) => `${call.fn} on ${nameIn(book, call.to)?.name ?? shortHex(call.to)}`,
      );
      return named.length === 1
        ? `Call ${named[0]}.`
        : `${named.length} calls: ${named.join(", then ")}.`;
    }
    return proposalSummary({ intent, token: null });
  }, [book, intent, list]);
  const nameOf = useCallback((address: string) => nameIn(book, address)?.name, [book]);
  const propose = useCallback(async () => {
    if (!intent) return;
    setPending(true);
    setError(undefined);
    try {
      const made = await withSigner(() =>
        callOme("proposals.create", { vault, intent, expiresInHours: Number(transfer.expiry) }),
      );
      if (made) {
        await navigate({ to: "/vaults/$vault/proposals/$id", params: { vault, id: made.id } });
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(false);
    }
  }, [intent, navigate, transfer.expiry, vault, withSigner]);

  const threshold = summary?.threshold;
  return (
    <Page
      back={back}
      title="New proposal"
      lead={
        threshold
          ? `Move funds or call contracts from the vault. It goes through once ${threshold} of ${summary.members} members approve it.`
          : "Move funds or call contracts from the vault."
      }
    >
      <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col rounded-lg bg-surface px-6 shadow-1">
          <div className="flex flex-col gap-3 border-b border-line-subtle py-5">
            <SegmentedControl
              aria-label="What the proposal does"
              options={KINDS}
              value={kind}
              onValueChange={pickKind}
            />
            {error ? <Banner kind="alarm">{error}</Banner> : null}
          </div>

          {kind === "transfer" ? (
            <TransferFields
              draft={transfer}
              token={token}
              onChange={patchTransfer}
              tokens={list}
              loading={tokens.isPending}
              errors={transferRead.errors}
              book={book}
              disabled={pending}
            />
          ) : (
            <div className="border-b border-line-subtle py-5">
              <CallsForm
                draft={calls}
                onChange={setCalls}
                functionsOf={functionsOf}
                errors={callsRead.errors}
                book={book}
                tokens={tokenInfos}
                limits={limits}
                disabled={pending}
              />
            </div>
          )}

          <Row>
            <TextField
              label="Note"
              placeholder="What it's for"
              value={transfer.memo}
              onValueChange={setMemo}
              maxLength={MEMO_LIMIT}
              hint="Optional. Every member sees it."
              disabled={pending}
            />
          </Row>
          <Row>
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <div className="flex flex-col gap-0.5">
                <span className="type-label-m text-fg">Expires after</span>
                <span className="type-body-s text-fg-muted">Unexecuted by then, it can't run.</span>
              </div>
              <SegmentedControl
                aria-label="Expires after"
                options={EXPIRY_OPTIONS}
                value={transfer.expiry}
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
          waiting={
            kind === "transfer"
              ? "Fill in the token, recipient and amount to simulate it."
              : "Choose a contract, a function and its arguments to simulate it."
          }
          preview={intent && !tooLarge ? preview.data : undefined}
          checking={
            intent !== undefined && !tooLarge && (checked === undefined || preview.isFetching)
          }
          failure={intent ? preview.error?.message : undefined}
          threshold={threshold}
          size={size}
          nameOf={nameOf}
        />
      </div>
    </Page>
  );
}
