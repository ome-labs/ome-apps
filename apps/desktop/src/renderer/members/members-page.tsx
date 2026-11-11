import { useCallback, useState } from "react";

import { useNavigate, useParams } from "@tanstack/react-router";

import type { Hex32 } from "@ome-labs/api";
import { connectionOf, timeAgo } from "@ome-labs/format";
import {
  Address,
  Banner,
  Button,
  MemberAvatar,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  ThresholdChip,
} from "@ome-labs/ui-web";

import { useOme } from "../data/ome.ts";
import { useNow } from "../shell/now.ts";
import { Page } from "../shell/page.tsx";
import { type MemberRow, useMembers } from "./live.ts";
import { MemberSheet } from "./member-sheet.tsx";

/** `/vaults/$vault/members`: who is in the vault, and how this member's keeper reaches each of theirs. */
export function MembersPage() {
  const { vault } = useParams({ strict: false }) as { vault: Hex32 };
  const navigate = useNavigate();
  const now = useNow();
  const info = useOme("daemon.info", {});
  const { details, peers, rows } = useMembers(vault);
  const [open, setOpen] = useState<MemberRow>();
  const summary = details.data?.summary;
  const committee = details.data?.committee;
  // Releases are compared with this member's own: an older one is who to ask to update.
  const mine = rows.find((row) => row.member.you)?.member.release ?? info.data?.version ?? null;

  const health = useCallback(
    () => void navigate({ to: "/vaults/$vault/health", params: { vault } }),
    [navigate, vault],
  );
  const change = useCallback(
    () => void navigate({ to: "/vaults/$vault/membership", params: { vault } }),
    [navigate, vault],
  );
  const close = useCallback((next: boolean) => {
    if (!next) setOpen(undefined);
  }, []);

  return (
    <Page
      title="Members"
      lead={
        summary && committee ? (
          <span className="flex flex-wrap items-center gap-2">
            <ThresholdChip kind="spend" threshold={summary.threshold} members={summary.members} />
            <ThresholdChip
              kind="read"
              threshold={committee.viewingThreshold}
              members={summary.members}
            />
            <Tag>committee epoch {committee.epoch}</Tag>
          </span>
        ) : (
          "Who is in the vault, and how your keeper reaches theirs."
        )
      }
      actions={
        <div className="flex items-center gap-2">
          <Button icon="shield-check" onClick={health}>
            Health
          </Button>
          <Button icon="rotate" onClick={change}>
            Change members
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {details.error ? <Banner kind="alarm">{details.error.message}</Banner> : null}
        {peers.error ? (
          <Banner kind="warning">
            Can't reach your keeper to check the others: {peers.error.message}
          </Banner>
        ) : null}
        {rows.length > 0 ? (
          <Table>
            <TableHead>
              <tr>
                <TableHeader className="w-12">#</TableHeader>
                <TableHeader>Member</TableHeader>
                <TableHeader className="w-40">Keeper</TableHeader>
                <TableHeader className="hidden w-32 @3xl:table-cell">Last seen</TableHeader>
                <TableHeader className="hidden w-28 @3xl:table-cell">Round trip</TableHeader>
                <TableHeader className="w-28">Release</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <MemberRowView
                  key={row.member.identity}
                  row={row}
                  now={now}
                  mine={mine}
                  onOpen={setOpen}
                />
              ))}
            </TableBody>
          </Table>
        ) : null}
        <p className="type-caption text-fg-subtle">
          Each member's keeper holds one share of the vault's viewing key. Yours checks the others
          every few seconds.
        </p>
      </div>
      {open ? <MemberSheet row={open} onOpenChange={close} /> : null}
    </Page>
  );
}

function MemberRowView({
  row,
  now,
  mine,
  onOpen,
}: {
  row: MemberRow;
  now: number;
  mine: string | null;
  onOpen: (row: MemberRow) => void;
}) {
  const { member, peer } = row;
  const open = useCallback(() => onOpen(row), [onOpen, row]);
  const behind = member.release !== null && mine !== null && olderThan(member.release, mine);

  return (
    <TableRow interactive>
      <TableCell className="type-mono-s text-fg-subtle tabular-nums">{member.index}</TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <MemberAvatar name={member.name} index={member.index} size="sm" />
          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-2">
              {/* The name opens the member's sheet; the row's highlight follows it. */}
              <button
                type="button"
                onClick={open}
                className="focus-ring rounded-xs type-label-m text-fg after:absolute after:inset-0 after:content-['']"
              >
                {member.name}
              </button>
              {member.you ? <Tag tone="accent">You</Tag> : null}
            </span>
            {member.account ? (
              <Address address={member.account} className="relative z-10 type-caption" />
            ) : (
              <span className="type-caption text-fg-subtle">No account recorded</span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        {member.you ? (
          <span className="type-body-s text-fg-muted">This computer</span>
        ) : peer ? (
          <StatusBadge kind="connection" status={connectionOf(peer)} />
        ) : (
          <span className="type-body-s text-fg-subtle">Checking…</span>
        )}
      </TableCell>
      <TableCell className="hidden type-body-s text-fg-muted @3xl:table-cell">
        {member.you ? "—" : peer?.lastSeen ? timeAgo(peer.lastSeen, now) : "Never"}
      </TableCell>
      <TableCell className="hidden type-mono-s text-fg-muted tabular-nums @3xl:table-cell">
        {!member.you && peer && peer.rttMs !== null ? `${peer.rttMs} ms` : "—"}
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-1.5">
          <span className="type-mono-s text-fg-muted">{member.release ?? "—"}</span>
          {behind ? <Tag tone="warning">older</Tag> : null}
        </span>
      </TableCell>
    </TableRow>
  );
}

/** `0.2.0` as its three numbers. */
const versionParts = (version: string) =>
  version
    .split(/[.-]/u)
    .slice(0, 3)
    .map((part) => Number(part) || 0);

/** Whether release `a` (`0.2.0`) is older than `b`, by its numbers. */
export function olderThan(a: string, b: string): boolean {
  const [x, y] = [versionParts(a), versionParts(b)];
  for (let at = 0; at < 3; at++) {
    if ((x[at] ?? 0) !== (y[at] ?? 0)) return (x[at] ?? 0) < (y[at] ?? 0);
  }
  return false;
}
