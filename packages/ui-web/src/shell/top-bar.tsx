import type { ReactNode } from "react";

import type { ServiceStatus } from "@ome-labs/api";
import { Logo } from "@ome-labs/brand/web";
import { formatCount, formatDuration, serviceStatus } from "@ome-labs/format";

import { Button } from "../actions/button.tsx";
import { IconButton } from "../actions/icon-button.tsx";
import { cn } from "../styling/class-names.ts";
import { StatusChip } from "./status-chip.tsx";

export type NodeState =
  | { state: "ready"; network: string; block: number }
  | { state: "syncing"; network: string; synced: number; block: number }
  | { state: "unreachable"; network: string };

export type SignerState = { locked: true } | { locked: false; unlockedUntil: number };

export type TopBarProps = {
  /** The status chips, each shown only when given; an app can leave them to its own banners. */
  node?: NodeState | undefined;
  keeper?: ServiceStatus | undefined;
  signer?: SignerState | undefined;
  /** Unix seconds, for the unlock countdown. */
  now?: number | undefined;
  onLock?: () => void | undefined;
  onUnlock?: () => void | undefined;
  /** The profile menu at the far right. */
  profile?: ReactNode | undefined;
  /** Room for the macOS window controls, which the desktop app draws natively. */
  windowControlsInset?: boolean | undefined;
  className?: string | undefined;
};

/** Page 40's top bar: network and node, keeper, signer, profile. Write actions elsewhere follow these states. */
export function TopBar({
  node,
  keeper,
  signer,
  now,
  onLock,
  onUnlock,
  profile,
  windowControlsInset,
  className,
}: TopBarProps) {
  const keeperDisplay = keeper ? serviceStatus(keeper) : undefined;

  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center justify-between gap-4 bg-surface px-4 select-none",
        windowControlsInset && "pl-[92px]",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-fg">
        <Logo variant="lockup-horizontal" tone="mono" title="Ome" className="h-5 w-auto" />
      </div>

      <div className="flex items-center gap-2">
        {!node ? null : node.state === "ready" ? (
          <StatusChip>
            {node.network} · block {formatCount(node.block)}
          </StatusChip>
        ) : node.state === "syncing" ? (
          <StatusChip icon="refresh" tone="info">
            Syncing block {formatCount(node.synced)} of {formatCount(node.block)}
          </StatusChip>
        ) : (
          <StatusChip icon="alert-circle" tone="danger">
            Node unreachable
          </StatusChip>
        )}

        {keeperDisplay ? (
          <StatusChip icon="server" {...(keeper === "running" ? {} : { tone: keeperDisplay.tone })}>
            Keeper · {keeperDisplay.label}
          </StatusChip>
        ) : null}

        {!signer ? null : signer.locked ? (
          <span className="flex items-center gap-1.5">
            <StatusChip icon="lock">Locked</StatusChip>
            <Button size="sm" icon="unlock" onClick={onUnlock}>
              Unlock
            </Button>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <StatusChip icon="unlock" tone="accent">
              Unlocked · {formatDuration(signer.unlockedUntil - (now ?? 0)).replace(/\s?0m$/, "")}
            </StatusChip>
            <IconButton icon="lock" label="Lock signer" size="sm" onClick={onLock} />
          </span>
        )}

        {profile}
      </div>
    </header>
  );
}
