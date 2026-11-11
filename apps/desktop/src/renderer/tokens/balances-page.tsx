import { useCallback, useMemo, useState } from "react";

import { useNavigate, useParams } from "@tanstack/react-router";

import type { Hex32, TokenBalance } from "@ome-labs/api";
import { balanceDisplay, shortHex } from "@ome-labs/format";
import {
  Banner,
  Button,
  Dialog,
  EmptyState,
  Hash,
  IconButton,
  Menu,
  type MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TokenMonogram,
  Tooltip,
  cn,
  toast,
} from "@ome-labs/ui-web";

import { callOme, useOme } from "../data/ome.ts";
import { Page } from "../shell/page.tsx";
import { useWithSigner } from "../shell/signer.tsx";
import { AddToken } from "./add-token.tsx";

/** The chain id of `aztec start --local-network`, the only network test tokens deploy to. */
const LOCAL_CHAIN = 31_337;

/** `/vaults/$vault/tokens`: what the vault holds of each token it tracks, and adding or dropping one. */
export function BalancesPage() {
  const { vault } = useParams({ strict: false }) as { vault: Hex32 };
  const navigate = useNavigate();
  const tokens = useOme("tokens.list", { vault });
  const status = useOme("status", {});
  const [adding, setAdding] = useState(false);
  const local = status.data?.node.l1ChainId === LOCAL_CHAIN;
  const list = useMemo(() => tokens.data ?? [], [tokens.data]);
  const unreadable = list.filter((entry) => entry.private.state === "unreadable").length;

  const openAdd = useCallback(() => setAdding(true), []);
  const receive = useCallback(
    () => void navigate({ to: "/vaults/$vault/receive", params: { vault } }),
    [navigate, vault],
  );

  return (
    <Page
      title="Balances & tokens"
      lead="What the vault holds of each token it tracks. Private balances are read by the members' keepers together; public ones anyone can see."
      actions={
        <div className="flex items-center gap-2">
          {local ? <DeployTestToken vault={vault} /> : null}
          <Button variant="primary" icon="plus" onClick={openAdd}>
            Add token
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {tokens.error ? <Banner kind="alarm">{tokens.error.message}</Banner> : null}
        {unreadable > 0 ? (
          <Banner kind="info">
            {unreadable === 1
              ? "One private balance can't be read until more of the members' keepers answer."
              : `${unreadable} private balances can't be read until more of the members' keepers answer.`}{" "}
            They show once enough keepers are online.
          </Banner>
        ) : null}
        {tokens.data && list.length === 0 ? (
          <EmptyState
            scene="no-tokens"
            className="pt-12"
            title="No tokens yet"
            action={
              <div className="flex gap-2">
                <Button icon="plus" onClick={openAdd}>
                  Add token
                </Button>
                <Button variant="ghost" icon="receive" onClick={receive}>
                  Receive
                </Button>
              </div>
            }
          >
            Add a token the vault holds or will receive, and its balance shows here.
          </EmptyState>
        ) : null}
        {list.length > 0 ? <TokenTable vault={vault} tokens={list} /> : null}
      </div>
      <AddToken vault={vault} open={adding} onOpenChange={setAdding} />
    </Page>
  );
}

function TokenTable({ vault, tokens }: { vault: Hex32; tokens: TokenBalance[] }) {
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeader>Token</TableHeader>
          <TableHeader className="text-right">Private</TableHeader>
          <TableHeader className="text-right">Public</TableHeader>
          <TableHeader className="w-14">
            <span className="sr-only">Actions</span>
          </TableHeader>
        </tr>
      </TableHead>
      <TableBody>
        {tokens.map((entry) => (
          <TokenRow key={entry.token.address} vault={vault} entry={entry} />
        ))}
      </TableBody>
    </Table>
  );
}

function TokenRow({ vault, entry }: { vault: Hex32; entry: TokenBalance }) {
  const { token } = entry;
  const [confirming, setConfirming] = useState(false);
  const items = useMemo<MenuItem[]>(
    () => [
      {
        label: "Copy address",
        icon: "copy",
        onSelect: () => void navigator.clipboard.writeText(token.address),
      },
      "separator",
      { label: "Stop tracking…", icon: "trash", danger: true, onSelect: () => setConfirming(true) },
    ],
    [token.address],
  );

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <TokenMonogram token={token} />
          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-2">
              <span className="type-label-m text-fg">{token.symbol}</span>
              <span className="truncate type-body-s text-fg-muted">{token.name}</span>
            </span>
            <Hash value={token.address} noun="token" tone="quiet" />
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <BalanceCell entry={entry} which="private" />
      </TableCell>
      <TableCell className="text-right">
        <BalanceCell entry={entry} which="public" />
      </TableCell>
      <TableCell>
        <Menu
          trigger={
            <IconButton icon="more-horizontal" label={`${token.symbol} actions`} size="sm" />
          }
          items={items}
        />
        <StopTracking vault={vault} entry={entry} open={confirming} onOpenChange={setConfirming} />
      </TableCell>
    </TableRow>
  );
}

const TONES = { neutral: "text-fg", warning: "text-warning", danger: "text-danger" } as const;

function BalanceCell({ entry, which }: { entry: TokenBalance; which: "private" | "public" }) {
  const shown = balanceDisplay(entry[which], entry.token);
  const tone = shown.tone === "warning" || shown.tone === "danger" ? shown.tone : "neutral";
  const value = (
    <span className="inline-flex flex-col items-end">
      <span
        className={cn(
          shown.baseUnits === null ? "type-label-s" : "type-mono-m tabular-nums",
          TONES[tone],
        )}
      >
        {shown.text}
        {shown.baseUnits === null ? null : (
          <span className="ml-1.5 type-mono-s text-fg-subtle">{entry.token.symbol}</span>
        )}
      </span>
      {shown.detail ? (
        <span className="max-w-56 truncate type-caption text-fg-subtle" title={shown.detail}>
          {shown.detail.split("\n")[0]}
        </span>
      ) : null}
    </span>
  );
  // The exact base units, for checking a number against a transaction.
  return shown.baseUnits === null ? (
    value
  ) : (
    <Tooltip content={`${shown.baseUnits} base units`} mono>
      <button type="button" className="focus-ring cursor-default rounded-xs text-right">
        {value}
      </button>
    </Tooltip>
  );
}

function StopTracking({
  vault,
  entry,
  open,
  onOpenChange,
}: {
  vault: Hex32;
  entry: TokenBalance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const { token } = entry;
  const stop = useCallback(async () => {
    setPending(true);
    setError(undefined);
    try {
      await callOme("tokens.remove", { vault, token: token.address });
      onOpenChange(false);
      toast(`Stopped tracking ${token.symbol}`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(false);
    }
  }, [onOpenChange, token.address, token.symbol, vault]);
  const cancel = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <Dialog
      title={`Stop tracking ${token.symbol}?`}
      description={`Its balance and payments in it stop showing in Ome. The vault keeps any ${token.symbol} it holds, and you can add it again any time.`}
      open={open}
      onOpenChange={onOpenChange}
      actions={
        <>
          <Button variant="ghost" onClick={cancel} disabled={pending}>
            Keep it
          </Button>
          <Button variant="danger" onClick={stop} pending={pending}>
            Stop tracking
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <p className="type-body-s text-fg-muted">
          {token.name} · <span className="type-mono-s">{shortHex(token.address)}</span>
        </p>
        {error ? <Banner kind="alarm">{error}</Banner> : null}
      </div>
    </Dialog>
  );
}

/**
 * A fresh test token with 1,000 minted to the vault, on a local network only. It sends two transactions from this
 * member's account, so it needs the signer.
 */
function DeployTestToken({ vault }: { vault: Hex32 }) {
  const withSigner = useWithSigner();
  const [pending, setPending] = useState(false);
  const deploy = useCallback(async () => {
    setPending(true);
    try {
      const token = await withSigner(() => callOme("tokens.deployTest", { vault }));
      if (token) toast(`Deployed ${token.symbol} and sent the vault 1,000`);
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(false);
    }
  }, [vault, withSigner]);

  return (
    <Button icon="token" onClick={deploy} pending={pending}>
      {pending ? "Deploying…" : "Deploy test token"}
    </Button>
  );
}
