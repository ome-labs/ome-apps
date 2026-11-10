import type { ActivityEntry } from "@ome-labs/api";
import {
  formatAbsoluteTime,
  formatTokenAmount,
  proposalSummary,
  shortHex,
  shortProposalId,
  timeAgo,
} from "@ome-labs/format";
import { Icon } from "@ome-labs/icons/web";

import { StatusBadge } from "../status/status-badge.tsx";
import { cn } from "../styling/class-names.ts";

export type ActivityRowProps = {
  entry: ActivityEntry;
  now: number;
  /** Names for senders this member knows (members' accounts), by address. */
  names?: Record<string, string> | undefined;
  className?: string | undefined;
};

/**
 * Page 38's activity: transfers this member's daemon decrypted, and proposals. The vault is private, so this
 * is what this member can see, not a public history.
 */
export function ActivityRow({ entry, now, names, className }: ActivityRowProps) {
  const received = entry.kind === "received";

  return (
    <li className={cn("flex items-center gap-3 px-4 py-3", className)}>
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          received ? "bg-success-subtle" : "bg-accent-subtle",
        )}
      >
        <Icon
          name={received ? "receive" : "send"}
          size={16}
          tone={received ? "success" : "accent-fg"}
          className="size-3.5"
        />
      </span>
      {received ? (
        <>
          <span className="min-w-0 flex-1 type-body-s text-fg">
            Received{" "}
            <span className="font-mono font-medium">
              {formatTokenAmount(entry.amount, entry.token)}
            </span>{" "}
            from {shortHex(entry.from)}
            {names?.[entry.from.toLowerCase()] ? ` (${names[entry.from.toLowerCase()]})` : ""}
          </span>
          <span className="type-mono-s text-fg-subtle">
            block {new Intl.NumberFormat("en").format(entry.block)}
          </span>
        </>
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate type-body-s text-fg">
            {proposalSummary(entry.proposal)} · {shortProposalId(entry.proposal.id)}
          </span>
          <StatusBadge kind="proposal" status={entry.proposal.status} />
        </>
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
