import type { ReactElement } from "react";

import type { ProposalView, Recipient } from "@ome-labs/api";
import {
  formatAbsoluteTime,
  formatExpiry,
  myVote,
  proposalSummary,
  shortProposalId,
} from "@ome-labs/format";

import { StatusBadge } from "../status/status-badge.tsx";
import { cn } from "../styling/class-names.ts";
import { VoteProgress } from "../thresholds/vote-progress.tsx";
import {
  RowLink,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table.tsx";

const voteWords = {
  approved: ["Approved", "text-success"],
  rejected: ["Rejected", "text-danger"],
  none: ["—", "text-fg-subtle"],
} as const;
const open = new Set(["collecting", "ready", "blocked"]);

export type ProposalRowProps = {
  proposal: ProposalView;
  recipient?: Recipient | null | undefined;
  /** Unix seconds, for the expiry column. */
  now: number;
  /** Where the row goes: a URL, or render your router's link with `link`. */
  href?: string | undefined;
  link?: (children: string) => ReactElement | undefined;
};

/** Page 38's proposal row: id · intent and proposer · status · votes · expires · my vote. */
export function ProposalRow({ proposal, recipient, now, href, link }: ProposalRowProps) {
  const summary = proposalSummary(proposal, recipient);
  const [vote, voteColour] = voteWords[myVote(proposal)];

  return (
    <TableRow interactive>
      <TableCell className="w-14 type-mono-s text-fg-subtle">
        {shortProposalId(proposal.id)}
      </TableCell>
      <TableCell className="max-w-0">
        <div className="flex flex-col gap-0.5">
          {link ? (
            link(summary)
          ) : (
            <RowLink href={href} className="truncate type-label-m text-fg">
              {summary}
            </RowLink>
          )}
          <span className="type-caption text-fg-subtle">from {proposal.proposer.name}</span>
        </div>
      </TableCell>
      <TableCell className="w-28">
        <StatusBadge kind="proposal" status={proposal.status} />
      </TableCell>
      <TableCell className="w-56">
        <VoteProgress proposal={proposal} />
      </TableCell>
      <TableCell
        className="w-28 type-caption text-fg-subtle"
        title={formatAbsoluteTime(proposal.expiresAt)}
      >
        {open.has(proposal.status)
          ? formatExpiry(proposal.expiresAt, now).replace("expires ", "")
          : "—"}
      </TableCell>
      <TableCell className={cn("w-20 type-label-s", voteColour)}>{vote}</TableCell>
    </TableRow>
  );
}

export type ProposalTableProps = Omit<ProposalRowProps, "proposal" | "recipient" | "href"> & {
  proposals: ProposalView[];
  recipients?: Record<string, Recipient | null> | undefined;
  hrefFor?: (proposal: ProposalView) => string | undefined;
  label?: string | undefined;
};

/** The proposals list of page 38, header included. */
export function ProposalTable({
  proposals,
  recipients,
  hrefFor,
  label = "Proposals",
  ...row
}: ProposalTableProps) {
  return (
    <Table aria-label={label}>
      <TableHead>
        <tr>
          <TableHeader>ID</TableHeader>
          <TableHeader>Proposal</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Votes</TableHeader>
          <TableHeader>Expires</TableHeader>
          <TableHeader>You</TableHeader>
        </tr>
      </TableHead>
      <TableBody>
        {proposals.map((proposal) => (
          <ProposalRow
            key={proposal.id}
            proposal={proposal}
            recipient={recipients?.[proposal.id] ?? null}
            href={hrefFor?.(proposal)}
            {...row}
          />
        ))}
      </TableBody>
    </Table>
  );
}
