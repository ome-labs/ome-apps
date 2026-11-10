// The only doors between the renderer and the main process: a daemon call (allowlisted), the event stream, and in
// development builds the dev switches.
import { app, ipcMain, type IpcMainInvokeEvent } from "electron";

import { CHANNELS, type CallOutcome, type DevState, isRendererMethod } from "../bridge/contract.ts";
import { OmeError } from "./ome/client.ts";
import { isAppUrl } from "./security.ts";
import { client, devState, setDevState } from "./sources.ts";

/** Calls must come from the app's own page, not from anything that got loaded into a frame. */
function fromApp(event: IpcMainInvokeEvent): boolean {
  const url = event.senderFrame?.url;
  return url !== undefined && isAppUrl(url);
}

async function call(
  event: IpcMainInvokeEvent,
  method: unknown,
  params: unknown,
): Promise<CallOutcome<never>> {
  if (!fromApp(event))
    return { ok: false, error: { kind: "unauthorized", message: "Not the app's page." } };
  if (!isRendererMethod(method)) {
    return {
      ok: false,
      error: { kind: "method-not-found", message: `${String(method)} is not available.` },
    };
  }

  try {
    // The params come from the renderer as-is; the daemon validates them, as it does for any client.
    const value = await client().call(method, params as never);
    return { ok: true, value } as CallOutcome<never>;
  } catch (error) {
    if (error instanceof OmeError)
      return { ok: false, error: { kind: error.kind, message: error.message } };
    return {
      ok: false,
      error: { kind: "failed", message: error instanceof Error ? error.message : String(error) },
    };
  }
}

export function registerIpc(): void {
  ipcMain.handle(CHANNELS.call, call);

  if (app.isPackaged) return;
  ipcMain.handle(CHANNELS.devGet, (event) => (fromApp(event) ? devState() : null));
  ipcMain.handle(CHANNELS.devSet, (event, next: Partial<DevState>) =>
    fromApp(event) ? setDevState(next) : null,
  );
}
