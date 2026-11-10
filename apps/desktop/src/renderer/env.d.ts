import type { OmeBridge } from "../bridge/contract.ts";

declare global {
  interface Window {
    /** The preload's bridge to the main process (`src/preload`). */
    ome: OmeBridge;
  }
}
