// `window.ome` in a plain browser, on the sample data: what the preload and the main process do in the app, done in the
// page with the fixtures session. For reviewing screens without Electron or a daemon; never part of the app.
import type {
  AvatarChoice,
  Avatars,
  CallFailure,
  DevState,
  OmeBridge,
  Outcome,
  Preferences,
} from "../bridge/contract.ts";
import { OmeError } from "../main/ome/client.ts";
import { SCENARIOS, type Scenario, isScenario } from "../main/ome/fixtures/scenarios.ts";
import { FixtureSession } from "../main/ome/fixtures/session.ts";

function failure(error: unknown): CallFailure {
  if (error instanceof OmeError) return { kind: error.kind, message: error.message };
  return { kind: "failed", message: error instanceof Error ? error.message : String(error) };
}

async function outcome<T>(run: () => Promise<T> | T): Promise<Outcome<T>> {
  try {
    return { ok: true, value: await run() };
  } catch (error) {
    return { ok: false, error: failure(error) };
  }
}

const PREFERENCES = "ome-browser:preferences";

function readPreferences(): Preferences {
  try {
    return { theme: "light", ...JSON.parse(localStorage.getItem(PREFERENCES) ?? "{}") };
  } catch {
    return { theme: "light" };
  }
}

export function fixtureBridge(scenario: Scenario): { bridge: OmeBridge; session: FixtureSession } {
  const session = new FixtureSession(scenario);
  const avatars: Avatars = { profile: null, vaults: {} };
  const set = (
    target: { kind: "profile" } | { kind: "vault"; vault: string },
    choice: AvatarChoice | null,
  ) => {
    if (target.kind === "profile") avatars.profile = choice;
    else if (choice) avatars.vaults[target.vault] = choice;
    else delete avatars.vaults[target.vault];
    return { ...avatars, vaults: { ...avatars.vaults } };
  };
  const dev = (): DevState => ({
    source: "fixtures",
    scenario: session.client.scenario,
    scenarios: SCENARIOS,
  });

  const bridge: OmeBridge = {
    version: "browser",
    call: (method, params) => outcome(() => session.call(method, params)),
    onEvent: (listener) => session.subscribe(listener),
    preferences: {
      get: async () => readPreferences(),
      set: async (patch) => {
        const next = { ...readPreferences(), ...patch };
        try {
          localStorage.setItem(PREFERENCES, JSON.stringify(next));
        } catch {
          // A private window keeps the theme for this visit only.
        }
        return next;
      },
    },
    window: {
      platform: "browser",
      minimize: () => undefined,
      toggleMaximize: () => undefined,
      close: () => undefined,
    },
    session: {
      state: async () => session.state(),
      onState: (listener) => session.onState(listener),
      preflight: () => session.preflight(),
      open: (profile) => outcome(async () => (await session.open(profile), null)),
      setup: (request) => outcome(() => session.setup(request)),
      retry: () => outcome(async () => (await session.retry(), null)),
      leave: () => outcome(async () => (await session.leave(), null)),
      restart: () => outcome(async () => (await session.restart(), null)),
      changeNode: (url) => outcome(async () => (await session.changeNode(url), null)),
      openLog: () => outcome(() => null),
    },
    avatars: {
      get: async () => avatars,
      ofProfiles: async () => (avatars.profile ? { alice: avatars.profile } : {}),
      setArt: (target, id) => outcome(() => set(target, { kind: "art", id })),
      // There is no file dialog to stand in for: the picker's own art is enough to review it.
      chooseFile: () => outcome(() => null),
      clear: (target) => outcome(() => set(target, null)),
    },
    contracts: {
      chooseArtifact: () =>
        outcome(() => "/Users/alice/contracts/target/my_contract-MyContract.json"),
      register: (request) => outcome(() => session.registerContract(request)),
    },
    touchId: {
      state: () => session.touchId(),
      enable: (passphrase) => outcome(async () => (await session.enableTouchId(passphrase), null)),
      disable: () => outcome(async () => (await session.disableTouchId(), null)),
      unlock: (ttlSecs) => outcome(() => session.unlockWithTouchId(ttlSecs)),
    },
    dev: {
      get: async () => dev(),
      set: async (next) => {
        if (next.scenario !== undefined && isScenario(next.scenario))
          session.setScenario(next.scenario);
        return dev();
      },
    },
  };
  return { bridge, session };
}
