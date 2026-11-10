import { useCallback } from "react";

import type { DaemonInfo, KeeperState } from "@ome-labs/api";
import { Button } from "@ome-labs/ui-web";

import { unwrap } from "../../data/session.ts";
import { Row, Section, Value } from "../parts.tsx";
import { useSave } from "../save.ts";

/** Versions, logs, and a restart for when something's stuck. */
export function About({ info, keeper }: { info: DaemonInfo | undefined; keeper: KeeperState }) {
  const save = useSave();
  const daemonLog = useCallback(
    () => void save(() => unwrap(window.ome.session.openLog("daemon")), "Opened the daemon's log"),
    [save],
  );
  const keeperLog = useCallback(
    () => void save(() => unwrap(window.ome.session.openLog("keeper")), "Opened the keeper's log"),
    [save],
  );
  const restart = useCallback(() => void unwrap(window.ome.session.restart()), []);

  return (
    <Section id="about" title="About">
      <Row title="Ome">
        <Value mono>{window.ome.version || "development"}</Value>
      </Row>
      {info ? (
        <Row
          title="Daemon"
          description={`Running since ${new Date(info.startedAt * 1000).toLocaleString()}, process ${info.pid}. API version ${info.apiVersion}.`}
        >
          <Value mono>{info.version}</Value>
        </Row>
      ) : null}
      <Row title="Keeper">
        <Value mono>{keeper.version ?? "Not running"}</Value>
      </Row>
      <Row
        title="Logs"
        description="What the daemon and the keeper wrote, for when something goes wrong."
      >
        <Button onClick={daemonLog}>Daemon log</Button>
        <Button onClick={keeperLog}>Keeper log</Button>
      </Row>
      <Row
        title="Restart the daemon"
        description="Stops and starts it, with its keeper. Takes a few seconds."
      >
        <Button icon="refresh" onClick={restart}>
          Restart
        </Button>
      </Row>
    </Section>
  );
}
