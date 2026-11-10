// The picture the host chose for a vault before it exists. The daemon's lobby doesn't keep it, so the host's app keeps
// it, per lobby, in this window's storage; it is saved for the vault once founding finishes.
import type { Hex16 } from "@ome-labs/api";
import { type AvatarId, manifest } from "@ome-labs/brand/web";

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
