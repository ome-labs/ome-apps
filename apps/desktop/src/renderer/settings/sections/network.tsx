import { type FormEvent, useCallback, useState } from "react";

import type { NodeStatus } from "@ome-labs/api";
import { Button, StatusBadge, TextField } from "@ome-labs/ui-web";

import { unwrap } from "../../data/session.ts";
import { Row, Section, Value } from "../parts.tsx";
import { useSave } from "../save.ts";

function networkName(node: NodeStatus): string {
  if (node.l1ChainId === 31_337) return "Local network";
  if (node.l1ChainId === 11_155_111) return "Testnet";
  return node.l1ChainId === null ? "Not known yet" : `Chain ${node.l1ChainId}`;
}

/**
 * Which network this profile is on (for life: its account and vaults live there) and the node it reads through. A new
 * node must be on the same network; the daemon restarts to use it.
 */
export function Network({ node }: { node: NodeStatus }) {
  const save = useSave();
  const [url, setUrl] = useState(node.url);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const changed = url.trim() !== node.url;

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const next = url.trim();
      if (!/^https?:\/\/.+/u.test(next)) {
        setError("Use an http:// or https:// URL.");
        return;
      }
      setError(undefined);
      setPending(true);
      const ok = await save(() => unwrap(window.ome.session.changeNode(next)), "Node changed");
      setPending(false);
      if (!ok) setError("That node can't be used. The message above says why.");
    },
    [save, url],
  );

  const synced =
    node.syncedBlock !== null && node.blockNumber !== null
      ? node.syncedBlock >= node.blockNumber
        ? `Block ${node.blockNumber.toLocaleString("en-US")}, synced`
        : `Synced to ${node.syncedBlock.toLocaleString("en-US")} of ${node.blockNumber.toLocaleString("en-US")}`
      : "No blocks yet";

  return (
    <Section id="network" title="Network & node" description="A profile stays on one network.">
      <Row
        title="Network"
        description={node.reachable ? synced : (node.error ?? "The node doesn't answer.")}
      >
        <Value>{networkName(node)}</Value>
        <StatusBadge kind="connection" status={node.reachable ? "connected" : "offline"} />
      </Row>
      <Row
        title="Node"
        description="Any node on the same network. The daemon restarts to use it."
        below={
          <form className="flex items-start gap-2" onSubmit={submit} noValidate>
            <TextField
              label="Node URL"
              className="flex-1"
              value={url}
              onValueChange={setUrl}
              error={error}
              mono
              disabled={pending}
            />
            <Button type="submit" className="mt-[26px]" disabled={!changed} pending={pending}>
              {pending ? "Checking…" : "Change"}
            </Button>
          </form>
        }
      />
    </Section>
  );
}
