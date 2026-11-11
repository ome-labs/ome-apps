import type { ActivityEntry } from "@ome-labs/api";
import {
  formatAbsoluteTime,
  formatCount,
  proposalSummary,
  receivedText,
  shortProposalId,
  timeAgo,
  voteProgress,
} from "@ome-labs/format";
import { Icon } from "@ome-labs/icons/web";

import { StatusBadge } from "../status/status-badge.tsx";
import { cn } from "../styling/class-names.ts";

export type ActivityRowProps = {
  entry: ActivityEntry;
  now: number;
  /** Names for senders this member knows (members' accounts, aliases), by lower-case address. */
  names?: Record<string, string> | undefined;
  /** Where a proposal row goes: the whole row is its link. */
  href?: string | undefined;
  /** Opens a received payment's details: the whole row is its button. */
  onOpen?: (() => void) | undefined;
  className?: string | undefined;
};

const target =
  "focus-ring rounded-xs text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none";

/**
 * Page 38's activity: transfers this member's daemon decrypted, and proposals. The vault is private, so this
 * is what this member can see, not a public history. With `href` or `onOpen` the row opens the entry.
 */
export function ActivityRow({ entry, now, names, href, onOpen, className }: ActivityRowProps) {
  const received = entry.kind === "received";
  const text = received
    ? receivedText(entry, names?.[entry.from.toLowerCase()])
    : `${proposalSummary(entry.proposal)} · ${shortProposalId(entry.proposal.id)}`;
  const label = href ? (
    <a href={href} className={target}>
      {text}
    </a>
  ) : onOpen ? (
    <button type="button" onClick={onOpen} className={target}>
      {text}
    </button>
  ) : (
    text
  );

  return (
    <li
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        (href || onOpen) &&
          "relative transition-colors duration-fast ease-standard hover:bg-hover has-[:focus-visible]:bg-hover",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full inset-ring",
          received
            ? "bg-success-subtle inset-ring-success/15"
            : "bg-accent-subtle inset-ring-accent-fg/15",
        )}
      >
        <Icon
          name={received ? "receive" : "send"}
          size={16}
          tone={received ? "success" : "accent-fg"}
          className="size-3.5"
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate type-body-s text-fg">{label}</span>
        {received ? null : (
          <span className="type-caption text-fg-subtle">
            from {entry.proposal.proposer.name} · {voteProgress(entry.proposal).label}
          </span>
        )}
      </span>
      {received ? (
        <span className="type-mono-s text-fg-subtle">block {formatCount(entry.block)}</span>
      ) : (
        <StatusBadge kind="proposal" status={entry.proposal.status} />
      )}
      <time
        dateTime={new Date(entry.at * 1000).toISOString()}
        title={formatAbsoluteTime(entry.at)}
        className="w-20 text-right type-caption text-fg-subtle"
      >
        {timeAgo(entry.at, now)}
      </time>
    </li>
  );
}
