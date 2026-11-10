// Contract artifacts on this computer: chosen in a file dialog, or named by an `aztec-wallet` alias. The main process
// reads the file so the renderer never touches the disk; the daemon then checks the artifact is the code at the
// address before it registers anything, so a wrong or tampered file is refused there.
import { readFile, stat } from "node:fs/promises";
import { isAbsolute } from "node:path";

import { type BrowserWindow, dialog } from "electron";

import type { ContractImport } from "../bridge/contract.ts";
import { OmeError } from "./ome/client.ts";

/** The daemon's largest artifact (`daemon.info.limits.maxArtifactBytes`). */
const MAX_ARTIFACT_BYTES = 32 << 20;
const ADDRESS = /^0x[0-9a-fA-F]{64}$/u;

export async function chooseArtifact(window: BrowserWindow | null): Promise<string | null> {
  const options = {
    title: "Choose a contract artifact",
    properties: ["openFile" as const],
    filters: [{ name: "Contract artifacts", extensions: ["json"] }],
  };
  const picked = window
    ? await dialog.showOpenDialog(window, options)
    : await dialog.showOpenDialog(options);
  const path = picked.filePaths[0];
  return picked.canceled || !path ? null : path;
}

/** The request from the renderer, checked: an address and an absolute path to a JSON file. */
export function contractImport(request: unknown): ContractImport {
  const r = (request ?? {}) as Partial<Record<keyof ContractImport, unknown>>;
  if (typeof r.address !== "string" || !ADDRESS.test(r.address))
    throw new OmeError("invalid", "A contract address is 0x and 64 hex characters.");
  if (typeof r.artifactPath !== "string" || !isAbsolute(r.artifactPath))
    throw new OmeError("invalid", "Name the artifact file by its full path.");
  if (!r.artifactPath.endsWith(".json"))
    throw new OmeError("invalid", "A contract artifact is a .json file.");
  return {
    address: r.address.toLowerCase() as ContractImport["address"],
    artifactPath: r.artifactPath,
    instance: (r.instance ?? undefined) as ContractImport["instance"],
  };
}

/** The artifact's text, refused when it isn't a file or is larger than the daemon takes. */
export async function readArtifact(path: string): Promise<string> {
  const info = await stat(path).catch(() => undefined);
  if (!info?.isFile()) throw new OmeError("not-found", `There is no artifact at ${path}.`);
  if (info.size > MAX_ARTIFACT_BYTES)
    throw new OmeError("invalid", "The artifact is larger than 32 MiB, more than Ome takes.");
  return readFile(path, "utf8");
}
