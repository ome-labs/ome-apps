import { useCallback } from "react";

import { Switch } from "@ome-labs/ui-web";

import { callOme } from "../../data/ome.ts";
import { Row, Section } from "../parts.tsx";
import { useNeedsRestart } from "../restart.tsx";
import { useSave } from "../save.ts";

/** Whether this device proves its transactions. The daemon's wallet reads it as it starts. */
export function Proving({ enabled, local }: { enabled: boolean; local: boolean }) {
  const save = useSave();
  const needsRestart = useNeedsRestart();
  const toggle = useCallback(
    (on: boolean) =>
      void save(
        () => callOme("config.set", { proverEnabled: on }),
        on ? "Proving on this device" : "Proving off",
      ).then((ok) => ok && needsRestart()),
    [needsRestart, save],
  );

  return (
    <Section id="proving" title="Proving">
      <Row
        title="Prove on this device"
        description={
          local
            ? "Off is fine here: a local network accepts transactions without real proofs."
            : "Leave it on: Testnet only accepts transactions with real proofs, which take a little while to make."
        }
      >
        <Switch
          label={<span className="sr-only">Prove on this device</span>}
          checked={enabled}
          onCheckedChange={toggle}
        />
      </Row>
    </Section>
  );
}
