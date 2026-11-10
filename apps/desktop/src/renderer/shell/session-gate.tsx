import { Fragment, useRef } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "@tanstack/react-router";

import type { SessionState } from "../../bridge/contract.ts";
import { useSession } from "../data/session.ts";
import { FullScreen, RunButton } from "./full-screen.tsx";

const retry = () => window.ome.session.retry();
const leave = () => window.ome.session.leave();

/** Where each phase belongs: the first run and the profile list sit outside the app's frame. */
function placeFor(state: SessionState, pathname: string): string | undefined {
  const outside = pathname === "/welcome" || pathname === "/profiles";
  switch (state.phase) {
    case "choose":
      if (state.profiles.length === 0) return pathname === "/welcome" ? undefined : "/welcome";
      return outside ? undefined : "/profiles";
    case "setup":
      return pathname === "/welcome" ? undefined : "/welcome";
    case "ready":
      return outside ? "/" : undefined;
    default:
      return undefined;
  }
}

/**
 * The window before and around the app: which profile it's on and whether that profile's daemon answers. While the
 * daemon starts or after it failed, those states fill the window; otherwise the route renders.
 */
export function SessionGate() {
  const state = useSession();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  // Only an opened profile owns the pages: the first run's daemon (`setup`) must not remount the steps it runs under.
  const profile = state?.phase === "ready" ? state.profile : undefined;

  // Answers cached for one profile never show under another. This runs before the pages below mount (an effect would
  // run after, and clearing then strands their queries), and the pages remount per profile.
  const shown = useRef(profile);
  if (shown.current !== profile) {
    shown.current = profile;
    queryClient.clear();
  }

  if (!state) return null;

  if (state.phase === "starting") {
    return (
      <FullScreen illustration="starting" title="Starting Ome">
        Opening {state.profile}'s daemon. The first start of the day can take up to a minute while
        the wallet opens.
      </FullScreen>
    );
  }
  if (state.phase === "failed") {
    return (
      <FullScreen
        illustration="daemon-failed"
        title="Ome's daemon didn't start"
        action={
          <div className="flex gap-2">
            <RunButton run={leave} variant="ghost">
              Use another profile
            </RunButton>
            <RunButton run={retry}>Try again</RunButton>
          </div>
        }
      >
        {state.message}
      </FullScreen>
    );
  }

  const place = placeFor(state, pathname);
  return place ? (
    <Navigate to={place} />
  ) : (
    <Fragment key={profile}>
      <Outlet />
    </Fragment>
  );
}
