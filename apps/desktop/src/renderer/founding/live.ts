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

/** The founding's state, from `founding.get` and then from every `founding` event for this lobby. */
export function useFounding(lobby: Hex16): FoundingState | null | undefined {
  const [state, setState] = useState<FoundingState | null>();
  useEffect(() => {
    let live = true;
    const load = async (): Promise<void> => {
      const first = await callOme("founding.get", { lobby });
      if (live) setState((current) => current ?? first);
    };
    void load();
    const stop = window.ome.onEvent((event) => {
      if (event.type === "founding" && event.founding.lobby === lobby) setState(event.founding);
    });
    return () => {
      live = false;
      stop();
    };
  }, [lobby]);
  return state;
}
