import type { DaemonEvent } from "@ome-labs/api";
// The renderer's whole view of the system: `window.ome`. It forwards calls and events and nothing else; the main
// process checks every call.
import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";

import {
  CHANNELS,
  type CallOutcome,
  type DevState,
  type OmeBridge,
  type Preferences,
} from "../bridge/contract.ts";

const bridge: OmeBridge = {
  call: (method, params) =>
    ipcRenderer.invoke(CHANNELS.call, method, params) as Promise<CallOutcome<typeof method>>,
  preferences: {
    get: () => ipcRenderer.invoke(CHANNELS.preferencesGet) as Promise<Preferences>,
    set: (patch) => ipcRenderer.invoke(CHANNELS.preferencesSet, patch) as Promise<Preferences>,
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
