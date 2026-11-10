// The pictures a member gives their profile and vaults. They stay on this computer: the choice is kept in the app's
// preferences per profile and per vault, and a chosen image is cropped square, scaled to 256 pixels and copied into
// the app's data folder, so moving or deleting the original changes nothing.
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { manifest } from "@ome-labs/brand/manifest";
import { app, type BrowserWindow, dialog, nativeImage } from "electron";

import type { AvatarChoice, AvatarTarget, Avatars } from "../bridge/contract.ts";
import { OmeError } from "./ome/client.ts";
import { type StoredAvatar, storedAvatars, setStoredAvatar } from "./preferences.ts";

const SIZE = 256;
const folder = () => join(app.getPath("userData"), "avatars");

const keyOf = (profile: string, target: AvatarTarget) =>
  target.kind === "profile"
    ? `profile:${profile}`
    : `vault:${profile}:${target.vault.toLowerCase()}`;

function choice(stored: StoredAvatar): AvatarChoice | null {
  if (stored.kind === "art") return stored;
  try {
    return {
      kind: "image",
      url: `data:image/png;base64,${readFileSync(join(folder(), stored.file)).toString("base64")}`,
    };
  } catch {
    return null;
  }
}

export function avatarsFor(profile: string): Avatars {
  const out: Avatars = { profile: null, vaults: {} };
  for (const [key, stored] of Object.entries(storedAvatars())) {
    if (key === `profile:${profile}`) out.profile = choice(stored);
    else if (key.startsWith(`vault:${profile}:`)) {
      const picture = choice(stored);
      if (picture) out.vaults[key.slice(`vault:${profile}:`.length)] = picture;
    }
  }
  return out;
}

function replace(profile: string, target: AvatarTarget, next: StoredAvatar | null): void {
  const key = keyOf(profile, target);
  const previous = storedAvatars()[key];
  setStoredAvatar(key, next);
  if (previous?.kind === "image") rmSync(join(folder(), previous.file), { force: true });
}

export function setArt(profile: string, target: AvatarTarget, id: string): Avatars {
  const kind = target.kind === "profile" ? "profile" : "vault";
  if (!manifest.avatars.some((avatar) => avatar.id === id && avatar.kind === kind)) {
    throw new OmeError("invalid", `${id} isn't one of the ${kind} avatars.`);
  }
  replace(profile, target, { kind: "art", id });
  return avatarsFor(profile);
}

export function clearAvatar(profile: string, target: AvatarTarget): Avatars {
  replace(profile, target, null);
  return avatarsFor(profile);
}

export async function chooseFile(
  profile: string,
  target: AvatarTarget,
  window: BrowserWindow | null,
): Promise<Avatars | null> {
  const options = {
    title: "Choose a picture",
    properties: ["openFile" as const],
    filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] }],
  };
  const picked = window
    ? await dialog.showOpenDialog(window, options)
    : await dialog.showOpenDialog(options);
  const path = picked.filePaths[0];
  if (picked.canceled || !path) return null;

  const image = nativeImage.createFromPath(path);
  if (image.isEmpty()) throw new OmeError("invalid", "That file isn't an image Ome can read.");
  const { width, height } = image.getSize();
  const side = Math.min(width, height);
  const square = image
    .crop({
      x: Math.floor((width - side) / 2),
      y: Math.floor((height - side) / 2),
      width: side,
      height: side,
    })
    .resize({ width: SIZE, height: SIZE, quality: "best" });

  mkdirSync(folder(), { recursive: true });
  const file = `${randomUUID()}.png`;
  writeFileSync(join(folder(), file), square.toPNG());
  replace(profile, target, { kind: "image", file });
  return avatarsFor(profile);
}

/**
 * Every profile's own picture, by profile name, for the list of profiles. Keys end in the profile's folder (its name)
 * or, on the fixtures, `fixtures:<name>`.
 */
export function profilePictures(): Record<string, AvatarChoice> {
  const out: Record<string, AvatarChoice> = {};
  for (const [key, stored] of Object.entries(storedAvatars())) {
    if (!key.startsWith("profile:")) continue;
    const name = key.split(/[/:\\]/u).at(-1);
    const picture = choice(stored);
    if (name && picture) out[name] = picture;
  }
  return out;
}
