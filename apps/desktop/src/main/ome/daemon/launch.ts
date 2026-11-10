// Finding and starting a profile's daemon, the way the `ome` CLI does: `omed` runs detached in its own process group
// with its output in the profile's `daemon.log`, so it keeps running after the app quits and the CLI shares it.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync } from "node:fs";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

import { app } from "electron";

import { OmeError } from "../client.ts";
import { DaemonConnection } from "./connection.ts";
import { omeHome, profileDir } from "./home.ts";

/** How long a start waits for the daemon to answer: opening the PXE can take a while. */
const START_TIMEOUT_MS = 90_000;
const POLL_MS = 250;

/** The core checkout, for development: `OME_CORE_DIR`, else `ome` beside this repository. */
function coreCheckout(): string | undefined {
  const configured = process.env["OME_CORE_DIR"];
  if (configured) return configured;
  if (app.isPackaged) return undefined;
  return resolve(app.getAppPath(), "../../../ome");
}

/** Where `omed` is: `OME_DAEMON`, `<home>/bin/omed`, then the core checkout's `omed.ts`. */
export function omedPath(home = omeHome()): string | undefined {
  const core = coreCheckout();
  return [
    process.env["OME_DAEMON"],
    join(home, "bin", "omed"),
    core && join(core, "packages/daemon/src/omed.ts"),
  ].find((path): path is string => Boolean(path) && existsSync(path as string));
}

/** Where `ome-keeper` is, as the daemon is told: `OME_KEEPER_BIN`, `<home>/bin/ome-keeper`, then the checkout's build. */
export function keeperPath(home = omeHome()): string | undefined {
  const core = coreCheckout();
  return [
    process.env["OME_KEEPER_BIN"],
    join(home, "bin", "ome-keeper"),
    core && join(core, "crates/target/release/ome-keeper"),
    core && join(core, "crates/target/debug/ome-keeper"),
  ].find((path): path is string => Boolean(path) && existsSync(path as string));
}

/** Connects to the profile's daemon if one answers. */
export async function running(profile: string): Promise<DaemonConnection | undefined> {
  try {
    return await DaemonConnection.open(profileDir(profile));
  } catch {
    return undefined;
  }
}

/** Starts the profile's daemon unless it's running, and returns a session once it answers. */
export async function start(profile: string): Promise<DaemonConnection> {
  const existing = await running(profile);
  if (existing) return existing;

  const home = omeHome();
  const omed = omedPath(home);
  if (!omed) {
    throw new OmeError(
      "unreachable",
      "Ome's daemon (omed) isn't installed. Install Ome from ome.network, or set OME_DAEMON.",
    );
  }
  const dir = profileDir(profile, home);
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const log = openSync(join(dir, "daemon.log"), "a", 0o600);

  // A TypeScript entry runs with Node 24 (it runs its sources directly); an installed `omed` is its own launcher.
  const script = omed.endsWith(".ts") || omed.endsWith(".js");
  const keeper = keeperPath(home);
  const child = spawn(
    script ? "node" : omed,
    [...(script ? [omed] : []), "--profile", profile, "--home", home],
    {
      detached: true,
      stdio: ["ignore", log, log],
      env: { ...process.env, ...(keeper ? { OME_KEEPER_BIN: keeper } : {}) },
    },
  );
  let exited: string | undefined;
  child.once("error", (error) => (exited = error.message));
  child.once("exit", (code, signal) => (exited = `exit ${signal ?? code}`));
  child.unref();

  const deadline = Date.now() + START_TIMEOUT_MS;
  const answer = async (): Promise<DaemonConnection> => {
    const connection = await running(profile);
    if (connection) return connection;
    if (exited !== undefined) {
      throw new OmeError(
        "unreachable",
        `The daemon stopped while starting (${exited}). Its log is ${join(dir, "daemon.log")}.`,
      );
    }
    if (Date.now() > deadline) {
      throw new OmeError("unreachable", "The daemon didn't answer within 90 seconds.");
    }
    await sleep(POLL_MS);
    return answer();
  };
  return answer();
}

/** Waits until the profile's daemon no longer answers, for at most 30 seconds. */
async function gone(profile: string, deadline = Date.now() + 30_000): Promise<void> {
  const still = await running(profile);
  if (!still || Date.now() > deadline) return;
  still.close();
  await sleep(POLL_MS);
  return gone(profile, deadline);
}

/** Stops the daemon and waits for its socket to go away, so the next start reads the new settings. */
export async function restart(
  profile: string,
  connection: DaemonConnection,
): Promise<DaemonConnection> {
  await connection.call("daemon.stop", {}).catch(() => undefined);
  await Promise.race([connection.closed, sleep(30_000)]);
  connection.close();
  await gone(profile);
  return start(profile);
}
