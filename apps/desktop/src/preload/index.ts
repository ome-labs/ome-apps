import type { DaemonEvent } from "@ome-labs/api";
// The renderer's whole view of the system: `window.ome`. It forwards calls and events and nothing else; the main
// process checks every call.
import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";

import {
  CHANNELS,
  type CallOutcome,
  type DevState,
  type OmeBridge,
  type Outcome,
  type Preferences,
  type Preflight,
  type SessionState,
} from "../bridge/contract.ts";

const bridge: OmeBridge = {
  call: (method, params) =>
    ipcRenderer.invoke(CHANNELS.call, method, params) as Promise<CallOutcome<typeof method>>,
  preferences: {
    get: () => ipcRenderer.invoke(CHANNELS.preferencesGet) as Promise<Preferences>,
    set: (patch) => ipcRenderer.invoke(CHANNELS.preferencesSet, patch) as Promise<Preferences>,
  },
  window: {
    platform: process.platform,
    minimize: () => ipcRenderer.send(CHANNELS.windowMinimize),
    toggleMaximize: () => ipcRenderer.send(CHANNELS.windowToggleMaximize),
    close: () => ipcRenderer.send(CHANNELS.windowClose),
  },
  session: {
    state: () => ipcRenderer.invoke(CHANNELS.sessionState) as Promise<SessionState>,
    onState(listener) {
      const handler = (_event: IpcRendererEvent, state: SessionState) => listener(state);
      ipcRenderer.on(CHANNELS.sessionChanged, handler);
      return () => ipcRenderer.removeListener(CHANNELS.sessionChanged, handler);
    },
    preflight: () => ipcRenderer.invoke(CHANNELS.sessionPreflight) as Promise<Preflight>,
    open: (profile) => ipcRenderer.invoke(CHANNELS.sessionOpen, profile) as Promise<Outcome<null>>,
    setup: (request) =>
      ipcRenderer.invoke(CHANNELS.sessionSetup, request) as ReturnType<
        OmeBridge["session"]["setup"]
      >,
    retry: () => ipcRenderer.invoke(CHANNELS.sessionRetry) as Promise<Outcome<null>>,
    leave: () => ipcRenderer.invoke(CHANNELS.sessionLeave) as Promise<Outcome<null>>,
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
