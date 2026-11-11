import { useCallback, useMemo, useState } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";

import type { ActivityEntry, ActivityKind, ActivityParams, Hex32 } from "@ome-labs/api";
import { groupByDay } from "@ome-labs/format";
import {
  ActivityRow,
  Banner,
  Button,
  EmptyState,
  Field,
  FilterChip,
  Select,
  TokenMonogram,
} from "@ome-labs/ui-web";

import { callOme, omeQueryKey, useOme } from "../data/ome.ts";
import { nameIn, useAddressBook } from "../proposals/calls/address-book.ts";
import { useNow } from "../shell/now.ts";
import { Page } from "../shell/page.tsx";
import { ReceivedSheet } from "./received-sheet.tsx";

type Received = Extract<ActivityEntry, { kind: "received" }>;
type Kind = "all" | ActivityKind;

const KINDS: { id: Kind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "proposal", label: "Proposals" },
  { id: "received", label: "Received" },
];
const ALL_TOKENS = "all";
const PAGE = 50;

/**
 * The vault's history, newest first and in pages: its proposals, and the payments members' keepers found. Money
 * leaves the vault only through executed proposals, so there is no separate "sent" kind.
 */
export function useActivity(params: Omit<ActivityParams, "before" | "limit">) {
  return useInfiniteQuery({
    // Keyed like a daemon call, so the vault's events refresh it.
    queryKey: [...omeQueryKey("vault.activity", params), "pages"],
    queryFn: ({ pageParam }) =>
      callOme("vault.activity", {
        ...params,
        limit: PAGE,
        ...(pageParam ? { before: pageParam } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next ?? undefined,
  });
}

/** `/vaults/$vault/activity`. */
export function ActivityPage() {
  const { vault } = useParams({ strict: false }) as { vault: Hex32 };
  const navigate = useNavigate();
  const now = useNow();
  const tokens = useOme("tokens.list", { vault });
  const book = useAddressBook(vault);
  const [kind, setKind] = useState<Kind>("all");
  const [token, setToken] = useState<string>(ALL_TOKENS);
  const [open, setOpen] = useState<Received>();

  const params = useMemo(
    () => ({
      vault,
      ...(kind === "all" ? {} : { kinds: [kind] }),
      ...(token === ALL_TOKENS ? {} : { token: token as Hex32 }),
    }),
    [kind, token, vault],
  );
  const activity = useActivity(params);
  const entries = useMemo(
    () => activity.data?.pages.flatMap((page) => page.items) ?? [],
    [activity.data],
  );
  const groups = useMemo(() => groupByDay(entries, now), [entries, now]);
  const names = useMemo(
    () => Object.fromEntries(book.map((entry) => [entry.address, entry.name])),
    [book],
  );
  const filtered = kind !== "all" || token !== ALL_TOKENS;

  const tokenOptions = useMemo(
    () => [
      { value: ALL_TOKENS, label: "All tokens" },
      ...(tokens.data ?? []).map((entry) => ({
        value: entry.token.address,
        label: entry.token.symbol,
        leading: <TokenMonogram token={entry.token} size="sm" />,
      })),
    ],
    [tokens.data],
  );
  const hrefFor = useCallback((id: string) => `#/vaults/${vault}/proposals/${id}`, [vault]);
  const more = useCallback(() => void activity.fetchNextPage(), [activity]);
  const clear = useCallback(() => {
    setKind("all");
    setToken(ALL_TOKENS);
  }, []);
  const receive = useCallback(
    () => void navigate({ to: "/vaults/$vault/receive", params: { vault } }),
    [navigate, vault],
  );
  const propose = useCallback(
    () => void navigate({ to: "/vaults/$vault/new", params: { vault } }),
    [navigate, vault],
  );
  const close = useCallback((next: boolean) => {
    if (!next) setOpen(undefined);
  }, []);

  return (
    <Page
      title="Activity"
      lead="Everything that happened in the vault that members can see: its proposals, and the payments the keepers found."
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {KINDS.map((item) => (
              <KindChip key={item.id} item={item} pressed={kind === item.id} onPick={setKind} />
            ))}
          </div>
          {(tokens.data?.length ?? 0) > 1 ? (
            <Field label={<span className="sr-only">Token</span>}>
              <Select
                aria-label="Token"
                options={tokenOptions}
                value={token}
                onValueChange={setToken}
                className="w-44"
              />
            </Field>
          ) : null}
        </div>

        {activity.error ? <Banner kind="alarm">{activity.error.message}</Banner> : null}

        {activity.data && entries.length === 0 ? (
          filtered ? (
            <EmptyState
              object="ballot"
              className="pt-12"
              title="Nothing matches"
              action={<Button onClick={clear}>Show everything</Button>}
            >
              No activity of this kind{token === ALL_TOKENS ? "" : " in this token"} yet.
            </EmptyState>
          ) : (
            <EmptyState
              scene="no-activity"
              className="pt-12"
              title="Nothing has happened yet"
              action={
                <div className="flex gap-2">
                  <Button icon="receive" onClick={receive}>
                    Receive
                  </Button>
                  <Button variant="ghost" icon="plus" onClick={propose}>
                    New proposal
                  </Button>
                </div>
              }
            >
              Payments to the vault and its proposals show here as they happen.
            </EmptyState>
          )
        ) : null}

        {groups.map((group) => (
          <section key={group.key} className="flex flex-col gap-2">
            <h2 className="type-overline text-fg-subtle">{group.label}</h2>
            <ul className="flex flex-col divide-y divide-line-subtle overflow-hidden rounded-lg bg-surface shadow-1">
              {group.items.map((entry) =>
                entry.kind === "received" ? (
                  <ReceivedRow
                    key={entry.txHash}
                    entry={entry}
                    now={now}
                    names={names}
                    onOpen={setOpen}
                  />
                ) : (
                  <ActivityRow
                    key={entry.proposal.id}
                    entry={entry}
                    now={now}
                    href={hrefFor(entry.proposal.id)}
                  />
                ),
              )}
            </ul>
          </section>
        ))}

        {activity.hasNextPage ? (
          <div className="flex justify-center">
            <Button onClick={more} pending={activity.isFetchingNextPage}>
              {activity.isFetchingNextPage ? "Loading…" : "Load older"}
            </Button>
          </div>
        ) : entries.length > PAGE ? (
          <p className="text-center type-caption text-fg-subtle">That's everything.</p>
        ) : null}
      </div>
      {open ? (
        <ReceivedSheet entry={open} sender={nameIn(book, open.from)} onOpenChange={close} />
      ) : null}
    </Page>
  );
}

function KindChip({
  item,
  pressed,
  onPick,
}: {
  item: { id: Kind; label: string };
  pressed: boolean;
  onPick: (kind: Kind) => void;
}) {
  const press = useCallback(() => onPick(item.id), [item.id, onPick]);
  return <FilterChip label={item.label} pressed={pressed} onPressedChange={press} />;
}

function ReceivedRow({
  entry,
  now,
  names,
  onOpen,
}: {
  entry: Received;
  now: number;
  names: Record<string, string>;
  onOpen: (entry: Received) => void;
}) {
  const open = useCallback(() => onOpen(entry), [entry, onOpen]);
  return <ActivityRow entry={entry} now={now} names={names} onOpen={open} />;
}
