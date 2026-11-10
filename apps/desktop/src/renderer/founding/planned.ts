// How many members the host planned the vault for. The daemon's lobby has no size, so the host's app keeps it, per
// lobby, in this window's storage; a lobby whose size isn't known here falls back to checking only the thresholds.
import type { Hex16 } from "@ome-labs/api";

const key = (lobby: Hex16) => `ome:lobby-size:${lobby}`;

export function rememberPlanned(lobby: Hex16, members: number): void {
  try {
    localStorage.setItem(key(lobby), String(members));
  } catch {
    // Storage can be unavailable; the lobby then works without a planned size.
  }
}

export function plannedFor(lobby: Hex16): number | undefined {
  try {
    const value = Number(localStorage.getItem(key(lobby)));
    return Number.isInteger(value) && value >= 2 ? value : undefined;
  } catch {
    return undefined;
  }
}
