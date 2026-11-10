// What the host chose for a vault before it exists: how many members it's for, and its picture. The daemon's lobby
// keeps neither, so the host's app keeps them, per lobby, in this window's storage. A lobby whose size isn't known here
// falls back to checking only the thresholds; a picture is saved for the vault once founding finishes.
import type { Hex16 } from "@ome-labs/api";
import { type AvatarId, manifest } from "@ome-labs/brand/web";

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

const pictureKey = (lobby: Hex16) => `ome:lobby-picture:${lobby}`;

export function rememberPicture(lobby: Hex16, picture: AvatarId): void {
  try {
    localStorage.setItem(pictureKey(lobby), picture);
  } catch {
    // Without storage the vault keeps its default picture.
  }
}

/** The picture chosen for the lobby's vault, taken once: it's saved for the vault when founding finishes. */
export function takePicture(lobby: Hex16): AvatarId | undefined {
  try {
    const value = localStorage.getItem(pictureKey(lobby));
    localStorage.removeItem(pictureKey(lobby));
    return manifest.avatars.find((avatar) => avatar.kind === "vault" && avatar.id === value)?.id;
  } catch {
    return undefined;
  }
}
