import type { ReactNode } from "react";

import type { UseQueryResult } from "@tanstack/react-query";

import type { Status } from "@ome-labs/api";

import { failureKind } from "../data/failure.ts";
import { FullScreen, RunButton } from "./full-screen.tsx";

/**
 * The whole-window states while the status is on its way: still loading, no daemon, a failure, or a daemon with no
 * member in it. `null` once the status is in, so the caller renders the app.
 */
export function daemonStates(status: UseQueryResult<Status, Error>): ReactNode | null {
  if (status.isPending) {
    return <FullScreen scene="starting" title="Starting Ome…" />;
  }
  if (status.isError && failureKind(status.error) === "unreachable") {
    return (
      <FullScreen
        scene="daemon-failed"
        title="Ome's daemon isn't running"
        action={<RunButton run={status.refetch}>Try again</RunButton>}
      >
        The daemon keeps your wallet and signing key for this profile. Start it again; if it keeps
        stopping, its log says why.
      </FullScreen>
    );
  }
  if (status.isError) {
    return (
      <FullScreen
        scene="not-found"
        title="Something went wrong"
        action={<RunButton run={status.refetch}>Try again</RunButton>}
      >
        {status.error.message}
      </FullScreen>
    );
  }
  if (!status.data.profile) {
    return (
      <FullScreen
        scene="profile-not-set-up"
        title="This profile isn't set up"
        action={<RunButton run={window.ome.session.leave}>Use another profile</RunButton>}
      >
        Its daemon runs, but no member was created in it. Set it up from the first run, or open
        another profile.
      </FullScreen>
    );
  }
  return null;
}
