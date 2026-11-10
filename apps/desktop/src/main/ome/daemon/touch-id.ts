// Touch ID (macOS), the way the `ome` CLI keeps it, so either one can turn it on for both: the signer's sealing key as
// a login-keychain generic password (service `ome.signer`, account the profile's folder), read only after a Touch ID
// check, and a `touch-id` marker in the profile that says it's on without prompting. The key stays in this process:
// it goes from the keychain to the daemon and never reaches the renderer.
import { execFile, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

import type { Hex32 } from "@ome-labs/api";
import { systemPreferences } from "electron";

import { OmeError } from "../client.ts";

const SERVICE = "ome.signer";
/** `security`'s exit code when the keychain has no such item. */
const NOT_FOUND = 44;

const run = promisify(execFile);

export function touchIdAvailable(): boolean {
  return process.platform === "darwin" && systemPreferences.canPromptTouchID();
}

export function touchIdEnabled(profileDir: string): boolean {
  return existsSync(join(profileDir, "touch-id"));
}

/** Asks for Touch ID (or the account password, as macOS offers); throws `auth` when the person cancels. */
export async function authenticate(reason: string): Promise<void> {
  if (!touchIdAvailable()) throw new OmeError("not-ready", "Touch ID isn't available on this Mac.");
  try {
    await systemPreferences.promptTouchID(reason);
  } catch {
    throw new OmeError("auth", "Touch ID was cancelled.");
  }
}

/**
 * Stores the sealing key and marks the profile. The key goes to `security` on its standard input, never as an
 * argument, so no other process can read it from the process list.
 */
export async function storeSealingKey(profileDir: string, key: Hex32): Promise<void> {
  const account = JSON.stringify(profileDir);
  await new Promise<void>((resolve, reject) => {
    const child = spawn("security", ["-i"], { stdio: ["pipe", "ignore", "pipe"] });
    let errors = "";
    child.stderr.on("data", (chunk: Buffer) => (errors += chunk.toString()));
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 && errors === ""
        ? resolve()
        : reject(
            new OmeError(
              "failed",
              `The keychain refused the key: ${errors.trim() || `exit ${code}`}.`,
            ),
          ),
    );
    child.stdin.end(`add-generic-password -U -s ${SERVICE} -a ${account} -w ${key}\n`);
  });
  await writeFile(join(profileDir, "touch-id"), "keychain\n", { mode: 0o600 });
}

/** Asks for Touch ID, then reads the profile's sealing key from the keychain. */
export async function readSealingKey(profileDir: string, reason: string): Promise<Hex32> {
  await authenticate(reason);
  try {
    const { stdout } = await run("security", [
      "find-generic-password",
      "-s",
      SERVICE,
      "-a",
      profileDir,
      "-w",
    ]);
    const key = stdout.trim();
    if (!/^0x[0-9a-f]{64}$/u.test(key)) throw new Error("not a key");
    return key as Hex32;
  } catch (error) {
    const missing = (error as { code?: unknown }).code === NOT_FOUND;
    throw new OmeError(
      "failed",
      missing
        ? "Touch ID's key isn't in the keychain any more. Turn Touch ID off and on again."
        : "The keychain item is unreadable. Turn Touch ID off and on again.",
    );
  }
}

/** Removes the keychain item and the marker; a missing one is already off. */
export async function forgetSealingKey(profileDir: string): Promise<void> {
  try {
    await run("security", ["delete-generic-password", "-s", SERVICE, "-a", profileDir]);
  } catch (error) {
    if ((error as { code?: unknown }).code !== NOT_FOUND) throw error;
  }
  await rm(join(profileDir, "touch-id"), { force: true });
}
