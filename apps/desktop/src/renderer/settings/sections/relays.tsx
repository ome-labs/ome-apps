import { type FormEvent, useCallback, useState } from "react";

import { Button, IconButton, TextField } from "@ome-labs/ui-web";

import { callOme } from "../../data/ome.ts";
import { Row, Section } from "../parts.tsx";
import { useNeedsRestart } from "../restart.tsx";
import { useSave } from "../save.ts";

/** The daemon's rule: up to 8 multiaddrs, each ending in `/p2p/<peer id>`. */
const RELAY = /^\/(ip4|ip6|dns4|dns6|dns)\/.+\/p2p\/[1-9A-HJ-NP-Za-km-z]+$/u;
const MAX = 8;

/** `/dns4/relay.ome.network/udp/4001/quic-v1/p2p/12D3…` → `relay.ome.network`. */
function host(relay: string): string {
  return relay.split("/")[2] ?? relay;
}

/**
 * The relays the keeper reaches other members through when they can't connect directly. They carry only encrypted
 * messages. The keeper reads them as it starts.
 */
export function Relays({ relays }: { relays: string[] }) {
  const save = useSave();
  const needsRestart = useNeedsRestart();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string>();

  const store = useCallback(
    async (next: string[], done: string) => {
      const ok = await save(() => callOme("relays.set", { relays: next }), done);
      if (ok) needsRestart();
      return ok;
    },
    [needsRestart, save],
  );

  const add = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const relay = draft.trim();
      if (!RELAY.test(relay)) {
        setError(
          "Use a multiaddr ending in /p2p/<peer id>, such as /dns4/relay.example/udp/4001/quic-v1/p2p/12D3…",
        );
        return;
      }
      if (relays.includes(relay)) {
        setError("That relay is already in the list.");
        return;
      }
      setError(undefined);
      if (await store([...relays, relay], `Added ${host(relay)}`)) setDraft("");
    },
    [draft, relays, store],
  );

  const remove = useCallback(
    (relay: string) =>
      void store(
        relays.filter((r) => r !== relay),
        `Removed ${host(relay)}`,
      ),
    [relays, store],
  );

  return (
    <Section
      id="relays"
      title="Relays"
      description="How keepers reach each other when they can't connect directly. Relays see only encrypted messages."
    >
      {relays.length === 0 ? (
        <Row title="No relays" description="Keepers connect directly." />
      ) : (
        relays.map((relay) => <RelayRow key={relay} relay={relay} onRemove={remove} />)
      )}
      {relays.length < MAX ? (
        <Row
          title="Add a relay"
          below={
            <form className="flex items-start gap-2" onSubmit={add} noValidate>
              <TextField
                label="Multiaddr"
                className="flex-1"
                value={draft}
                onValueChange={setDraft}
                error={error}
                placeholder="/dns4/relay.example/udp/4001/quic-v1/p2p/12D3…"
                mono
              />
              <Button type="submit" className="mt-[26px]">
                Add
              </Button>
            </form>
          }
        />
      ) : null}
    </Section>
  );
}

function RelayRow({ relay, onRemove }: { relay: string; onRemove: (relay: string) => void }) {
  const click = useCallback(() => onRemove(relay), [onRemove, relay]);
  return (
    <Row title={host(relay)} description={<span className="break-all type-mono-s">{relay}</span>}>
      <IconButton icon="trash" label={`Remove ${host(relay)}`} onClick={click} />
    </Row>
  );
}
