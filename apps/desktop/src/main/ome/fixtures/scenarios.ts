/** The states the fixtures can put the app in, so every screen can be designed and checked in each. */
export const SCENARIOS = [
  "normal",
  "no-profile",
  "no-vaults",
  "locked",
  "node-unreachable",
  "syncing",
  "keeper-failed",
  "alarm",
  "removed",
  "daemon-down",
] as const;

export type Scenario = (typeof SCENARIOS)[number];

export function isScenario(value: unknown): value is Scenario {
  return SCENARIOS.includes(value as Scenario);
}
