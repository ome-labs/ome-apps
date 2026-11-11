import { useCallback, useMemo, useState } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import type { AuditView, Hex32 } from "@ome-labs/api";
import {
  auditOutcome,
  auditPurpose,
  auditRequester,
  formatAbsoluteTime,
  formatCount,
  timeAgo,
} from "@ome-labs/format";
import {
  Banner,
  Button,
  EmptyState,
  FilterChip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@ome-labs/ui-web";

import { callOme, omeQueryKey } from "../data/ome.ts";
import { useNow } from "../shell/now.ts";
import { Page } from "../shell/page.tsx";

const PAGE = 50;
const ALL = "all";

/**
 * `/vaults/$vault/audit`: every time a keeper asked this one for points to read the vault, newest first. Reading
 * anything takes several members' keepers, so this is how a member checks theirs only helped when it should have.
 */
export function AuditPage() {
  const { vault } = useParams({ strict: false }) as { vault: Hex32 };
  const now = useNow();
  const params = useMemo(() => ({ vault }), [vault]);
  const log = useInfiniteQuery({
    queryKey: [...omeQueryKey("vault.audit", params), "pages"],
    queryFn: ({ pageParam }) =>
      callOme("vault.audit", {
        ...params,
        limit: PAGE,
        ...(pageParam ? { before: pageParam } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next ?? undefined,
  });
  const [who, setWho] = useState<string>(ALL);
  const entries = useMemo(() => log.data?.pages.flatMap((page) => page.items) ?? [], [log.data]);
  // The filter offers whoever appears in what's loaded, this member first.
  const requesters = useMemo(() => {
    const names = new Map<string, string>();
    for (const entry of entries) names.set(entry.requester, auditRequester(entry));
    return [...names].toSorted(([a], [b]) => (a === "local" ? -1 : b === "local" ? 1 : 0));
  }, [entries]);
  const shown = useMemo(
    () => (who === ALL ? entries : entries.filter((entry) => entry.requester === who)),
    [entries, who],
  );
  const refused = entries.filter((entry) => auditOutcome(entry.outcome).refused).length;
  const more = useCallback(() => void log.fetchNextPage(), [log]);

  return (
    <Page
      title="Keeper audit log"
      lead="Every time a keeper asked yours to help read this vault. Reading anything takes several members' keepers, each answering with its own share."
    >
      <div className="flex flex-col gap-4">
        {log.error ? <Banner kind="alarm">{log.error.message}</Banner> : null}
        {refused > 0 ? (
          <Banner kind="warning">
            Your keeper refused {refused === 1 ? "one request" : `${refused} requests`} below. A
            refusal from a keeper outside the committee (a removed member's, say) is the keeper
            doing its job; one from a current member is worth asking them about.
          </Banner>
        ) : null}

        {requesters.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            <WhoChip id={ALL} label="Everyone" pressed={who === ALL} onPick={setWho} />
            {requesters.map(([id, label]) => (
              <WhoChip key={id} id={id} label={label} pressed={who === id} onPick={setWho} />
            ))}
          </div>
        ) : null}

        {log.data && entries.length === 0 ? (
          <EmptyState object="book" className="pt-12" title="No requests yet">
            Requests show here once a keeper asks yours to help read a payment, a balance or a new
            sender.
          </EmptyState>
        ) : null}

        {shown.length > 0 ? (
          <Table>
            <TableHead>
              <tr>
                <TableHeader className="w-32">When</TableHeader>
                <TableHeader className="w-40">Asked by</TableHeader>
                <TableHeader>For</TableHeader>
                <TableHeader className="w-20 text-right">Points</TableHeader>
                <TableHeader className="w-64">Outcome</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {shown.map((entry) => (
                <AuditRow
                  key={`${entry.at}:${entry.requester}:${entry.purpose}`}
                  entry={entry}
                  now={now}
                />
              ))}
            </TableBody>
          </Table>
        ) : null}

        {log.hasNextPage ? (
          <div className="flex justify-center">
            <Button onClick={more} pending={log.isFetchingNextPage}>
              {log.isFetchingNextPage ? "Loading…" : "Load older"}
            </Button>
          </div>
        ) : null}
      </div>
    </Page>
  );
}

function WhoChip({
  id,
  label,
  pressed,
  onPick,
}: {
  id: string;
  label: string;
  pressed: boolean;
  onPick: (id: string) => void;
}) {
  const press = useCallback(() => onPick(id), [id, onPick]);
  return <FilterChip label={label} pressed={pressed} onPressedChange={press} />;
}

function AuditRow({ entry, now }: { entry: AuditView; now: number }) {
  const outcome = auditOutcome(entry.outcome);
  return (
    <TableRow className={outcome.refused ? "bg-danger-subtle/40" : undefined}>
      <TableCell className="type-body-s text-fg-muted" title={formatAbsoluteTime(entry.at)}>
        {timeAgo(entry.at, now)}
      </TableCell>
      <TableCell
        className={cn("type-label-m", entry.requester === "local" ? "text-fg-muted" : "text-fg")}
      >
        {auditRequester(entry)}
      </TableCell>
      <TableCell className="type-body-s text-fg">
        {auditPurpose(entry.purpose)}
        <span className="ml-2 type-mono-s text-fg-subtle">{entry.purpose}</span>
      </TableCell>
      <TableCell className="text-right type-mono-s text-fg-muted tabular-nums">
        {formatCount(entry.points)}
      </TableCell>
      <TableCell className={cn("type-body-s", outcome.refused ? "text-danger" : "text-success")}>
        {outcome.text}
      </TableCell>
    </TableRow>
  );
}
