// Which session answers the renderer: the member's daemon, or the sample data when `OME_DESKTOP_SOURCE=fixtures`
// (tests, and designing a screen without a daemon). On fixtures, development builds can switch scenario from the
// devtools console: `window.ome.dev.set({ scenario })`.
import type { DevState, Source } from "../bridge/contract.ts";
import { DaemonSession } from "./ome/daemon/session.ts";
import { SCENARIOS, type Scenario, isScenario } from "./ome/fixtures/scenarios.ts";
import { FixtureSession } from "./ome/fixtures/session.ts";
import type { AppSession } from "./ome/session.ts";

const source: Source = process.env["OME_DESKTOP_SOURCE"] === "fixtures" ? "fixtures" : "daemon";

function initialScenario(): Scenario {
  const named = process.env["OME_DESKTOP_SCENARIO"];
  return isScenario(named) ? named : "normal";
}

const fixtures = source === "fixtures" ? new FixtureSession(initialScenario()) : undefined;
const active: AppSession = fixtures ?? new DaemonSession();

export function session(): AppSession {
  return active;
}

export function devState(): DevState {
  return {
    source,
    scenario: fixtures?.client.scenario ?? "",
    scenarios: fixtures ? SCENARIOS : [],
  };
}

export function setDevState(next: Partial<DevState>): DevState {
  if (next.scenario !== undefined) {
    if (!fixtures)
      throw new Error("Scenarios belong to the fixtures: start with OME_DESKTOP_SOURCE=fixtures.");
    if (!isScenario(next.scenario)) throw new Error(`Unknown scenario ${next.scenario}.`);
    fixtures.setScenario(next.scenario);
  }
  return devState();
}
