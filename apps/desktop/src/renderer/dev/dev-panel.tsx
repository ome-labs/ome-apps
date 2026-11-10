import { useEffect, useState } from "react";

import type { DevState } from "../../shared/contract.ts";

/** Development builds only: switch the fixture scenario to see every screen in every state. */
export function DevPanel() {
  const [state, setState] = useState<DevState | null>(null);

  useEffect(() => {
    void window.ome.dev?.get().then(setState);
  }, []);

  if (!state || !window.ome.dev) return null;
  const dev = window.ome.dev;

  return (
    <div className="fixed right-3 bottom-3 rounded border border-neutral-300 bg-white/95 p-2 text-xs shadow">
      <label className="flex items-center gap-2">
        <span className="text-neutral-500">Fixtures</span>
        <select
          value={state.scenario}
          onChange={(event) => void dev.set({ scenario: event.target.value }).then(setState)}
          className="rounded border border-neutral-300 px-1 py-0.5"
        >
          {state.scenarios.map((scenario) => (
            <option key={scenario} value={scenario}>
              {scenario}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
