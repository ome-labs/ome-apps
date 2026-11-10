import type { KeeperState, NodeStatus, SignerStatus } from "@ome-labs/api";

import { callOme, useOme } from "../data/ome.ts";

/** Network and node, keeper, signer: the three things every screen depends on. */
export function TopBar() {
  const status = useOme("status", {});
  if (!status.data) return <header className="h-full border-b border-neutral-200" />;

  const { node, keeper, signer, profile } = status.data;
  return (
    <header className="flex h-full items-center gap-4 border-b border-neutral-200 px-4 text-sm">
      <span className="font-semibold">Ome</span>
      <span className="text-neutral-400">{profile?.name ?? "No profile"}</span>
      <div className="ml-auto flex items-center gap-4">
        <span>{nodeLabel(node)}</span>
        <span>{keeperLabel(keeper)}</span>
        <SignerButton signer={signer} />
      </div>
    </header>
  );
}

function nodeLabel(node: NodeStatus): string {
  if (!node.reachable) return "Node unreachable";
  if (
    node.syncedBlock !== null &&
    node.blockNumber !== null &&
    node.syncedBlock < node.blockNumber
  ) {
    return `Syncing block ${node.syncedBlock.toLocaleString()} of ${node.blockNumber.toLocaleString()}`;
  }
  const network = node.l1ChainId === 31_337 ? "Local network" : "Testnet";
  return `${network} · block ${node.blockNumber?.toLocaleString() ?? "?"}`;
}

function keeperLabel(keeper: KeeperState): string {
  if (keeper.remote) return `Keeper · remote ${keeper.remote}`;
  return `Keeper · ${keeper.status}`;
}

/** Placeholder unlock: the unlock sheet (§5.5) replaces it. */
function SignerButton({ signer }: { signer: SignerStatus }) {
  if (signer.locked) {
    return (
      <button
        type="button"
        className="rounded border border-neutral-300 px-2 py-0.5"
        onClick={() =>
          void callOme("signer.unlock", { secret: { passphrase: "sample" }, ttlSecs: 900 })
        }
      >
        Locked · Unlock
      </button>
    );
  }
  return (
    <button
      type="button"
      className="rounded border border-neutral-300 px-2 py-0.5"
      onClick={() => void callOme("signer.lock", {})}
    >
      Unlocked · Lock
    </button>
  );
}
