// Settings the daemon reads only as it starts (proving, relays) ask for a restart; the page offers one at the top.
import { createContext, type ReactNode, use, useCallback, useMemo, useState } from "react";

import { Banner } from "@ome-labs/ui-web";

import { unwrap } from "../data/session.ts";

const Context = createContext<() => void>(() => undefined);

/** Marks that a change waits for the daemon to restart. */
export function useNeedsRestart(): () => void {
  return use(Context);
}

export function RestartProvider({ children }: { children: ReactNode }) {
  const [needed, setNeeded] = useState(false);
  const mark = useCallback(() => setNeeded(true), []);
  const restart = useCallback(() => {
    setNeeded(false);
    void unwrap(window.ome.session.restart());
  }, []);
  const action = useMemo(() => ({ label: "Restart now", onClick: restart }), [restart]);

  return (
    <Context value={mark}>
      {needed ? (
        <Banner kind="info" action={action}>
          Some changes take effect when Ome's daemon restarts. It takes a few seconds.
        </Banner>
      ) : null}
      {children}
    </Context>
  );
}
