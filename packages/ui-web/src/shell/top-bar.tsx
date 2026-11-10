import type { ReactNode } from "react";

import type { ServiceStatus } from "@ome-labs/api";
import { Logo } from "@ome-labs/brand/web";
import { formatDuration, serviceStatus } from "@ome-labs/format";

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
  node: NodeState;
  keeper: ServiceStatus;
  signer: SignerState;
  /** Unix seconds, for the unlock countdown. */
  now: number;
  onLock?: () => void | undefined;
  onUnlock?: () => void | undefined;
  /** The profile menu at the far right. */
  profile?: ReactNode | undefined;
  /** Room for the macOS window controls, which the desktop app draws natively. */
  windowControlsInset?: boolean | undefined;
  className?: string | undefined;
};

const blocks = new Intl.NumberFormat("en");

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
  const keeperDisplay = serviceStatus(keeper);

  return (
    <header
      // The desktop shell drags the window by this bar.
      data-tauri-drag-region
      className={cn(
        "flex h-[52px] shrink-0 items-center justify-between gap-4 border-b border-line-subtle bg-surface px-4",
        windowControlsInset && "pl-20",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-fg">
        <Logo variant="lockup-horizontal" tone="mono" title="Ome" className="h-5 w-auto" />
      </div>

      <div className="flex items-center gap-2">
        {node.state === "ready" ? (
          <StatusChip>
            {node.network} · block {blocks.format(node.block)}
          </StatusChip>
        ) : node.state === "syncing" ? (
          <StatusChip icon="refresh" tone="info">
            Syncing block {blocks.format(node.synced)} of {blocks.format(node.block)}
          </StatusChip>
        ) : (
          <StatusChip icon="alert-circle" tone="danger">
            Node unreachable
          </StatusChip>
        )}

        <StatusChip icon="server" {...(keeper === "running" ? {} : { tone: keeperDisplay.tone })}>
          Keeper · {keeperDisplay.label}
        </StatusChip>

        {signer.locked ? (
          <span className="flex items-center gap-1.5">
            <StatusChip icon="lock">Locked</StatusChip>
            <Button size="sm" icon="unlock" onClick={onUnlock}>
              Unlock
            </Button>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <StatusChip icon="unlock" tone="accent">
              Unlocked · {formatDuration(signer.unlockedUntil - now).replace(/\s?0m$/, "")}
            </StatusChip>
            <IconButton icon="lock" label="Lock signer" size="sm" onClick={onLock} />
          </span>
        )}

        {profile}
      </div>
    </header>
  );
}
