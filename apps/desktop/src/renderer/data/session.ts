// The session from React: which profile the app is on and whether its daemon answers, kept current by the main
// process's `session:changed` messages.
import { useEffect, useState } from "react";

import type { Outcome, SessionState } from "../../bridge/contract.ts";
import { OmeCallError } from "./ome.ts";

export function useSession(): SessionState | undefined {
  const [state, setState] = useState<SessionState>();
  useEffect(() => {
    let live = true;
    const stop = window.ome.session.onState(setState);
    const load = async (): Promise<void> => {
      const first = await window.ome.session.state();
      if (live) setState((current) => current ?? first);
    };
    void load();
    return () => {
      live = false;
      stop();
    };
  }, []);
  return state;
}

/** The value of a session request, or its failure thrown as an `OmeCallError`. */
export async function unwrap<T>(request: Promise<Outcome<T>>): Promise<T> {
  const outcome = await request;
  if (!outcome.ok) throw new OmeCallError(outcome.error.kind, outcome.error.message);
  return outcome.value;
}
