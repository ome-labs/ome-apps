// Which client answers the renderer. Packaged builds will use the member's daemon; until its client exists, every
// build uses the fixtures. Development builds can switch scenario from the devtools console:
// `window.ome.dev.set({ scenario })`.
import type { DaemonEvent } from "@ome-labs/api";

import type { DevState, Source } from "../bridge/contract.ts";
import type { OmeClient } from "./ome/client.ts";
import { FixtureClient } from "./ome/fixtures/client.ts";
import { SCENARIOS, type Scenario, isScenario } from "./ome/fixtures/scenarios.ts";

const fixtures = new FixtureClient(initialScenario());
let source: Source = "fixtures";

function initialScenario(): Scenario {
  const named = process.env["OME_DESKTOP_SCENARIO"];
  return isScenario(named) ? named : "normal";
}

export function client(): OmeClient {
  return fixtures;
}

/** Forwards the active client's events; returns the function that stops forwarding. */
export function forwardEvents(send: (event: DaemonEvent) => void): () => void {
  return client().subscribe(send);
}

export function devState(): DevState {
  return { source, scenario: fixtures.scenario, scenarios: SCENARIOS };
}

export function setDevState(next: Partial<DevState>): DevState {
  if (next.source === "daemon") {
    throw new Error("The daemon client isn't built yet; the app runs on fixtures.");
  }
  if (next.source) source = next.source;
  if (next.scenario !== undefined) {
    if (!isScenario(next.scenario)) throw new Error(`Unknown scenario ${next.scenario}.`);
    fixtures.setScenario(next.scenario);
  }
  return devState();
}
