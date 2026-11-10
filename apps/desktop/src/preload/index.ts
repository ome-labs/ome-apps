import type { DaemonEvent } from "@ome-labs/api";
// The renderer's whole view of the system: `window.ome`. It forwards calls and events and nothing else; the main
// process checks every call.
import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";

import { CHANNELS, type CallOutcome, type DevState, type OmeBridge } from "../bridge/contract.ts";

/** A daemon error with its kind, rebuilt on this side of the boundary. */
class OmeCallError extends Error {
  constructor(
    readonly kind: string,
    message: string,
  ) {
    super(message);
    this.name = "OmeCallError";
  }
}

const bridge: OmeBridge = {
  async call(method, params) {
    const outcome = (await ipcRenderer.invoke(CHANNELS.call, method, params)) as CallOutcome<
      typeof method
    >;
    if (!outcome.ok) throw new OmeCallError(outcome.error.kind, outcome.error.message);
    return outcome.value;
  },
  onEvent(listener) {
    const handler = (_event: IpcRendererEvent, event: DaemonEvent) => listener(event);
    ipcRenderer.on(CHANNELS.event, handler);
    return () => ipcRenderer.removeListener(CHANNELS.event, handler);
  },
  // Development builds only; the main process also refuses the dev channels in packaged apps.
  ...(!import.meta.env.DEV
    ? {}
    : {
        dev: {
          get: () => ipcRenderer.invoke(CHANNELS.devGet) as Promise<DevState>,
          set: (state: Partial<DevState>) =>
            ipcRenderer.invoke(CHANNELS.devSet, state) as Promise<DevState>,
        },
      }),
};

contextBridge.exposeInMainWorld("ome", bridge);
