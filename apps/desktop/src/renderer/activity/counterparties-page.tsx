import { useCallback, useMemo } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";

import type { Counterparty, Hex32 } from "@ome-labs/api";
import { formatAbsoluteTime, formatCount, timeAgo } from "@ome-labs/format";
import {
  Address,
  Banner,
  Button,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  Tooltip,
} from "@ome-labs/ui-web";

import { callOme, omeQueryKey } from "../data/ome.ts";
import { useNow } from "../shell/now.ts";
import { Page } from "../shell/page.tsx";

const PAGE = 50;

/** What an exposed sender means, and what to ask of them: the same words on the row and in the summary. */
const EXPOSED =
  "They paid before a member was removed. That former member can still tell when they pay again, never what or how much, until they handshake with the vault again.";

/** `/vaults/$vault/counterparties`: who has paid the vault, and who a former member can still recognise. */
export function CounterpartiesPage() {
  const { vault } = useParams({ strict: false }) as { vault: Hex32 };
  const navigate = useNavigate();
  const now = useNow();
  const params = useMemo(() => ({ vault }), [vault]);
  const parties = useInfiniteQuery({
    queryKey: [...omeQueryKey("vault.counterparties", params), "pages"],
    queryFn: ({ pageParam }) =>
      callOme("vault.counterparties", {
        ...params,
        limit: PAGE,
        ...(pageParam ? { before: pageParam } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next ?? undefined,
  });
  const items = useMemo(
    () => parties.data?.pages.flatMap((page) => page.items) ?? [],
    [parties.data],
  );
  const exposed = items.filter((party) => party.exposed).length;
  const more = useCallback(() => void parties.fetchNextPage(), [parties]);
  const receive = useCallback(
    () => void navigate({ to: "/vaults/$vault/receive", params: { vault } }),
    [navigate, vault],
  );

  return (
    <Page
      title="Counterparties"
      lead="Everyone who has paid the vault, as the members' keepers found their payments. Only members see this."
    >
      <div className="flex flex-col gap-4">
        {parties.error ? <Banner kind="alarm">{parties.error.message}</Banner> : null}
        {exposed > 0 ? (
          <section className="flex flex-col gap-2 rounded-lg bg-warning-subtle px-5 py-4 inset-ring inset-ring-warning/25">
            <h2 className="type-label-m text-fg">
              {exposed === 1 ? "1 sender is" : `${exposed} senders are`} still visible to a former
              member
            </h2>
            <p className="type-body-s text-fg-muted">{EXPOSED}</p>
            <p className="type-body-s text-fg-muted">
              To close it, ask each of them to handshake with the vault again from their wallet.
              Nothing is needed from the vault's members, and the vault keeps receiving their
              payments either way.
            </p>
          </section>
        ) : null}

        {parties.data && items.length === 0 ? (
          <EmptyState
            scene="counterparties"
            className="pt-12"
            title="No one has paid the vault yet"
            action={
              <Button icon="receive" onClick={receive}>
                Receive
              </Button>
            }
          >
            Senders show here once their first payment is found.
          </EmptyState>
        ) : null}

        {items.length > 0 ? (
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Sender</TableHeader>
                <TableHeader className="w-28 text-right">Payments</TableHeader>
                <TableHeader className="hidden w-36 @3xl:table-cell">First</TableHeader>
                <TableHeader className="w-36">Latest</TableHeader>
                <TableHeader className="w-32">Privacy</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {items.map((party) => (
                <PartyRow key={party.address} party={party} now={now} />
              ))}
            </TableBody>
          </Table>
        ) : null}

        {parties.hasNextPage ? (
          <div className="flex justify-center">
            <Button onClick={more} pending={parties.isFetchingNextPage}>
              {parties.isFetchingNextPage ? "Loading…" : "Load more"}
            </Button>
          </div>
        ) : null}
      </div>
    </Page>
  );
}

function PartyRow({ party, now }: { party: Counterparty; now: number }) {
  return (
    <TableRow>
      <TableCell>
        {party.label ? (
          <span className="flex min-w-0 flex-col">
            <span className="type-label-m text-fg">{party.label}</span>
            <Address address={party.address} copy className="type-caption" />
          </span>
        ) : (
          <Address address={party.address} copy />
        )}
      </TableCell>
      <TableCell className="text-right type-mono-s text-fg tabular-nums">
        {formatCount(party.received)}
      </TableCell>
      <TableCell
        className="hidden type-body-s text-fg-muted @3xl:table-cell"
        title={formatAbsoluteTime(party.firstAt)}
      >
        {timeAgo(party.firstAt, now)}
      </TableCell>
      <TableCell className="type-body-s text-fg-muted" title={formatAbsoluteTime(party.lastAt)}>
        {timeAgo(party.lastAt, now)}
      </TableCell>
      <TableCell>
        {party.exposed ? (
          <Tooltip content={EXPOSED}>
            <button type="button" className="focus-ring cursor-default rounded-xs">
              <Tag tone="warning">Exposed</Tag>
            </button>
          </Tooltip>
        ) : (
          <Tag tone="success">Private</Tag>
        )}
      </TableCell>
    </TableRow>
  );
}
