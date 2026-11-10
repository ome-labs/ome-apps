import type { ReactNode } from "react";

import type { UseQueryResult } from "@tanstack/react-query";

import type { Status } from "@ome-labs/api";

import { failureKind } from "../data/failure.ts";
import { FullScreen } from "./full-screen.tsx";

/**
 * The whole-window states before the app can show anything: still reaching the daemon, no daemon, or a failure.
 * `null` once the status is in, so the caller renders the app.
 */
export function daemonStates(status: UseQueryResult<Status, Error>): ReactNode | null {
  if (status.isPending) {
    return <FullScreen illustration="starting" title="Starting Ome…" />;
  }
  if (status.isError && failureKind(status.error) === "unreachable") {
    return (
      <FullScreen
        illustration="daemon-failed"
        title="Ome's daemon isn't running"
        onRetry={status.refetch}
      >
        The daemon keeps your wallet and signing key for this profile. Start it again; if it keeps
        stopping, its log says why.
      </FullScreen>
    );
  }
  if (status.isError) {
    return (
      <FullScreen illustration="not-found" title="Something went wrong" onRetry={status.refetch}>
        {status.error.message}
      </FullScreen>
    );
  }
  return null;
}
