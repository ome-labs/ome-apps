import { useMemo } from "react";

import { useNavigate } from "@tanstack/react-router";

import type { NodeStatus, Status } from "@ome-labs/api";
import { Menu, MemberAvatar, TopBar, type NodeState } from "@ome-labs/ui-web";

import { callOme } from "../data/ome.ts";
import { useNow } from "./now.ts";

const LOCAL_CHAIN = 31_337;

function nodeState(node: NodeStatus): NodeState {
  const network = node.l1ChainId === LOCAL_CHAIN ? "Local network" : "Testnet";
  if (!node.reachable) return { state: "unreachable", network };

  const block = node.blockNumber ?? 0;
  if (node.syncedBlock !== null && node.syncedBlock < block) {
    return { state: "syncing", network, synced: node.syncedBlock, block };
  }
  return { state: "ready", network, block };
}

const lock = (): void => void callOme("signer.lock", {});

/** The top bar: network and node, keeper, signer and the profile menu, from the daemon's status. */
export function StatusBar({ status, onUnlock }: { status: Status; onUnlock: () => void }) {
  const now = useNow();
  const navigate = useNavigate();
  const { node, keeper, signer, profile } = status;

  const signerState = useMemo(
    () =>
      signer.locked || signer.unlockedUntil === null
        ? ({ locked: true } as const)
        : ({ locked: false, unlockedUntil: signer.unlockedUntil } as const),
    [signer.locked, signer.unlockedUntil],
  );

  const menu = useMemo(
    () => [
      {
        label: "Settings",
        icon: "settings" as const,
        shortcut: "⌘,",
        onSelect: (): void => void navigate({ to: "/settings" }),
      },
      { label: "Lock now", icon: "lock" as const, shortcut: "⌘L", onSelect: lock },
    ],
    [navigate],
  );

  return (
    <TopBar
      node={nodeState(node)}
      keeper={keeper.status}
      signer={signerState}
      now={now}
      onLock={lock}
      onUnlock={onUnlock}
      profile={
        profile ? (
          <Menu
            align="end"
            items={menu}
            trigger={
              <button
                type="button"
                className="flex items-center gap-2 rounded-md px-1.5 py-1 type-label-m text-fg"
              >
                <MemberAvatar name={profile.name} index={1} size="sm" />
                {profile.name}
              </button>
            }
          />
        ) : null
      }
    />
  );
}
