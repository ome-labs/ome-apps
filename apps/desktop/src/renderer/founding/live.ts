// The lobby and its founding, kept live: lobby changes arrive as keeper events and foundings as daemon events, both of
// which refresh these queries. A slow poll covers a missed event while a lobby waits.
import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import type { FoundingState, Hex16, LobbyView } from "@ome-labs/api";

import { callOme, omeQueryKey } from "../data/ome.ts";

export function useLobby(lobby: Hex16) {
  return useQuery({
    queryKey: omeQueryKey("lobby.get", { lobby }),
    queryFn: () => callOme("lobby.get", { lobby }),
    refetchInterval: (query) =>
      (query.state.data as LobbyView | undefined)?.status === "open" ? 3000 : false,
  });
}

/** How often a running founding is read again, in case an event was missed. */
const FOUNDING_POLL_MS = 2000;

/**
 * The founding's state, from `founding.get` and every `founding` event for this lobby. Until it finishes it is also
 * read every few seconds: a founding that hadn't begun when the page opened reads as nothing, and an event missed
 * then would leave the page empty until a reload.
 */
export function useFounding(lobby: Hex16): FoundingState | null | undefined {
  const [state, setState] = useState<FoundingState | null>();
  const finished = state?.done === true || Boolean(state?.error);
  useEffect(() => {
    let live = true;
    const load = async (): Promise<void> => {
      const latest = await callOme("founding.get", { lobby }).catch(() => undefined);
      if (live && latest !== undefined) setState((current) => latest ?? current ?? null);
    };
    void load();
    const timer = finished ? undefined : setInterval(() => void load(), FOUNDING_POLL_MS);
    const stop = window.ome.onEvent((event) => {
      if (event.type === "founding" && event.founding.lobby === lobby) setState(event.founding);
    });
    return () => {
      live = false;
      clearInterval(timer);
      stop();
    };
  }, [finished, lobby]);
  return state;
}
