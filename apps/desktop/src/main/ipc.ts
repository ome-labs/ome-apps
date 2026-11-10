// The only doors between the renderer and the main process: a daemon call (allowlisted), the event stream, the
// session (which profile, and its daemon), preferences, and in development builds the dev switches.
import { app, BrowserWindow, type IpcMainEvent, ipcMain, type IpcMainInvokeEvent } from "electron";

import {
  CHANNELS,
  type CallFailure,
  type DevState,
  type Outcome,
  type Preferences,
  type SetupRequest,
  isRendererMethod,
} from "../bridge/contract.ts";
import { OmeError } from "./ome/client.ts";
import { preferences, setPreferences } from "./preferences.ts";
import { isAppUrl } from "./security.ts";
import { devState, session, setDevState } from "./sources.ts";

/** Calls must come from the app's own page, not from anything that got loaded into a frame. */
function fromApp(event: IpcMainInvokeEvent | IpcMainEvent): boolean {
  const url = event.senderFrame?.url;
  return url !== undefined && isAppUrl(url);
}

const NOT_APP: Outcome<never> = {
  ok: false,
  error: { kind: "unauthorized", message: "Not the app's page." },
};

function failure(error: unknown): CallFailure {
  if (error instanceof OmeError) return { kind: error.kind, message: error.message };
  return { kind: "failed", message: error instanceof Error ? error.message : String(error) };
}

/** Runs a request from the renderer, turning a throw into a failure that keeps its kind. */
async function outcome<T>(event: IpcMainInvokeEvent, run: () => Promise<T>): Promise<Outcome<T>> {
  if (!fromApp(event)) return NOT_APP;
  try {
    return { ok: true, value: await run() };
  } catch (error) {
    return { ok: false, error: failure(error) };
  }
}

function call(
  event: IpcMainInvokeEvent,
  method: unknown,
  params: unknown,
): Promise<Outcome<unknown>> {
  if (!isRendererMethod(method)) {
    return Promise.resolve({
      ok: false,
      error: { kind: "method-not-found", message: `${String(method)} is not available.` },
    });
  }
  // The params come from the renderer as-is; the daemon validates them, as it does for any client.
  return outcome(event, () => session().call(method, params as never));
}

/** The first step of a setup, checked here because it decides which profile folder the daemon gets. */
function setupRequest(request: unknown): SetupRequest {
  const { member, nodeUrl } = (request ?? {}) as Partial<SetupRequest>;
  const name = typeof member === "string" ? member.trim() : "";
  if (name.length < 1 || name.length > 48)
    throw new OmeError("invalid", "Use 1 to 48 characters for your name.");
  if (typeof nodeUrl !== "string" || !/^https?:\/\//u.test(nodeUrl)) {
    throw new OmeError("invalid", "Use an http:// or https:// URL for the node.");
  }
  return { member: name, nodeUrl };
}

/** Runs a window control on the window whose page asked. */
function control(run: (window: BrowserWindow) => void) {
  return (event: IpcMainEvent): void => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window && fromApp(event)) run(window);
  };
}

function registerTouchId(): void {
  ipcMain.handle(CHANNELS.touchIdState, (event) => (fromApp(event) ? session().touchId() : null));
  ipcMain.handle(CHANNELS.touchIdEnable, (event, passphrase: unknown) =>
    outcome(event, async () => {
      if (typeof passphrase !== "string") throw new OmeError("invalid", "Give the passphrase.");
      await session().enableTouchId(passphrase);
      return null;
    }),
  );
  ipcMain.handle(CHANNELS.touchIdDisable, (event) =>
    outcome(event, async () => (await session().disableTouchId(), null)),
  );
  ipcMain.handle(CHANNELS.touchIdUnlock, (event, ttlSecs: unknown) =>
    outcome(event, () => {
      if (typeof ttlSecs !== "number" || !Number.isInteger(ttlSecs) || ttlSecs <= 0) {
        throw new OmeError("invalid", "Say how long to stay unlocked, in seconds.");
      }
      return session().unlockWithTouchId(ttlSecs);
    }),
  );
}

export function registerIpc(): void {
  registerTouchId();
  ipcMain.on(
    CHANNELS.windowMinimize,
    control((window) => window.minimize()),
  );
  ipcMain.on(
    CHANNELS.windowToggleMaximize,
    control((window) => (window.isMaximized() ? window.unmaximize() : window.maximize())),
  );
  ipcMain.on(
    CHANNELS.windowClose,
    control((window) => window.close()),
  );
  ipcMain.handle(CHANNELS.call, call);
  ipcMain.handle(CHANNELS.sessionState, (event) => (fromApp(event) ? session().state() : null));
  ipcMain.handle(CHANNELS.sessionPreflight, (event) =>
    fromApp(event) ? session().preflight() : null,
  );
  ipcMain.handle(CHANNELS.sessionOpen, (event, profile: unknown) =>
    outcome(event, async () => {
      if (typeof profile !== "string") throw new OmeError("invalid", "Name a profile.");
      await session().open(profile);
      return null;
    }),
  );
  ipcMain.handle(CHANNELS.sessionSetup, (event, request: unknown) =>
    outcome(event, () => session().setup(setupRequest(request))),
  );
  ipcMain.handle(CHANNELS.sessionRetry, (event) =>
    outcome(event, async () => (await session().retry(), null)),
  );
  ipcMain.handle(CHANNELS.sessionLeave, (event) =>
    outcome(event, async () => (await session().leave(), null)),
  );
  ipcMain.handle(CHANNELS.preferencesGet, (event) => (fromApp(event) ? preferences() : null));
  ipcMain.handle(CHANNELS.preferencesSet, (event, patch: Partial<Preferences>) =>
    fromApp(event) ? setPreferences(patch) : null,
  );

  if (app.isPackaged) return;
  ipcMain.handle(CHANNELS.devGet, (event) => (fromApp(event) ? devState() : null));
  ipcMain.handle(CHANNELS.devSet, (event, next: Partial<DevState>) =>
    fromApp(event) ? setDevState(next) : null,
  );
}
