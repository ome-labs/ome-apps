// The open profile's pictures, and the ones shown when none was chosen. Pictures stay on this computer; until a member
// picks one, their profile and each vault get a kit avatar picked from the name or address, so it's the same every time.
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { manifest, type AvatarId } from "@ome-labs/brand/web";
import type { AvatarSource } from "@ome-labs/ui-web";

import type { AvatarChoice, Avatars } from "../../bridge/contract.ts";

const KEY = ["avatars"] as const;
const PROFILES_KEY = ["avatars", "profiles"] as const;

export const PROFILE_ART = manifest.avatars.filter((avatar) => avatar.kind === "profile");
export const VAULT_ART = manifest.avatars.filter((avatar) => avatar.kind === "vault");

function pick(list: readonly { id: AvatarId }[], seed: string): AvatarId {
  let hash = 0;
  for (const char of seed.toLowerCase()) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  return (list[hash % list.length] as { id: AvatarId }).id;
}

/** The kit avatar a profile shows until its member picks one. */
export function defaultProfileArt(name: string): AvatarId {
  return pick(PROFILE_ART, name);
}

/** The kit avatar a vault shows until a member picks one. */
export function defaultVaultArt(address: string): AvatarId {
  return pick(VAULT_ART, address);
}

export function asSource(choice: AvatarChoice): AvatarSource {
  return choice.kind === "art" ? { kind: "art", id: choice.id as AvatarId } : choice;
}

export function useAvatars(): Avatars | undefined {
  return useQuery({ queryKey: KEY, queryFn: () => window.ome.avatars.get() }).data;
}

export function useProfilePictures(): Record<string, AvatarChoice> | undefined {
  return useQuery({ queryKey: PROFILES_KEY, queryFn: () => window.ome.avatars.ofProfiles() }).data;
}

/** The open profile's picture: the chosen one, else its default. */
export function useProfileAvatar(name: string | undefined): AvatarSource | undefined {
  const avatars = useAvatars();
  if (!name) return undefined;
  return avatars?.profile
    ? asSource(avatars.profile)
    : { kind: "art", id: defaultProfileArt(name) };
}

/** A vault's picture for this member: the chosen one, else its default. */
export function vaultAvatar(avatars: Avatars | undefined, address: string): AvatarSource {
  const chosen = avatars?.vaults[address.toLowerCase()];
  return chosen ? asSource(chosen) : { kind: "art", id: defaultVaultArt(address) };
}

/** Stores what a change returned, and refreshes the list of profiles' pictures. */
export function useAvatarsChanged(): (avatars: Avatars) => void {
  const queries = useQueryClient();
  return (avatars) => {
    queries.setQueryData(KEY, avatars);
    void queries.invalidateQueries({ queryKey: PROFILES_KEY });
  };
}
