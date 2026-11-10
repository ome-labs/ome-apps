// Where a member's profiles live, laid out as `omed` and `ome-client` expect: `<home>/profiles/<name>/`, the home being
// `OME_HOME` or `~/.ome`. Each profile is one member with its own daemon.
import { readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

/** Profile names: lowercase letters, digits, `-` and `_`, at most 32, so a name can't leave the home. */
const PROFILE_NAME = /^[a-z0-9][a-z0-9_-]{0,31}$/u;

export function omeHome(): string {
  return process.env["OME_HOME"] || join(homedir(), ".ome");
}

export function profileDir(name: string, home = omeHome()): string {
  if (!PROFILE_NAME.test(name)) throw new Error(`${JSON.stringify(name)} isn't a profile name.`);
  return join(home, "profiles", name);
}

/** A profile name from a member's name, as `ome init` makes it: `Alice Smith` → `alice-smith`. */
export function profileNameFor(member: string): string {
  let out = "";
  for (const c of member.trim().toLowerCase()) {
    if (/[a-z0-9_]/u.test(c)) out += c;
    else if (out !== "" && !out.endsWith("-")) out += "-";
  }
  out = out.replace(/-+$/u, "").slice(0, 32);
  return out === "" ? "member" : out;
}

/** A profile that was set up: its folder name and the member's name. */
export interface ProfileEntry {
  name: string;
  member: string;
}

/** The member's name from a profile's public state, or null while it isn't set up (`profile.create` not yet run). */
async function memberOf(dir: string): Promise<string | null> {
  try {
    const state = JSON.parse(await readFile(join(dir, "profile.json"), "utf8")) as {
      profile?: { name?: unknown } | null;
    };
    return typeof state.profile?.name === "string" ? state.profile.name : null;
  } catch {
    return null;
  }
}

/** Every profile on this computer that was set up, by folder name. */
export async function listProfiles(home = omeHome()): Promise<ProfileEntry[]> {
  let names: string[];
  try {
    names = await readdir(join(home, "profiles"));
  } catch {
    return [];
  }
  const entries = await Promise.all(
    names
      .filter((name) => PROFILE_NAME.test(name))
      .map(async (name) => {
        const member = await memberOf(join(home, "profiles", name));
        return member === null ? null : { name, member };
      }),
  );
  return entries.filter((entry) => entry !== null).toSorted((a, b) => a.name.localeCompare(b.name));
}
