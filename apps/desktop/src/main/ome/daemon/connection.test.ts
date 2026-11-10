import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { type Server, type Socket, createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";

import { afterEach, describe, expect, it } from "vitest";

import { DaemonConnection } from "./connection.ts";
import { listProfiles, profileNameFor } from "./home.ts";

const TOKEN = "secret-token";

/** A stand-in daemon that speaks the API's envelopes: auth first, then a few methods and an event. */
function fakeDaemon(dir: string): Promise<{ server: Server; sockets: Socket[] }> {
  const sockets: Socket[] = [];
  const server = createServer((socket) => {
    sockets.push(socket);
    let authed = false;
    const reply = (id: number, body: object) =>
      socket.write(`${JSON.stringify({ jsonrpc: "2.0", id, ...body })}\n`);
    createInterface({ input: socket }).on("line", (line) => {
      const { id, method, params } = JSON.parse(line) as {
        id: number;
        method: string;
        params: { token?: string };
      };
      if (method === "session.auth") {
        authed = params.token === TOKEN;
        if (authed) reply(id, { result: null });
        else
          reply(id, {
            error: { code: -32001, message: "Wrong token.", data: { kind: "unauthorized" } },
          });
        return;
      }
      if (!authed) return;
      if (method === "events.subscribe") {
        reply(id, { result: null });
        socket.write(
          `${JSON.stringify({ jsonrpc: "2.0", method: "event", params: { type: "signer", signer: {} } })}\n`,
        );
      } else if (method === "node.status") {
        // Never answered: a call left waiting when the daemon goes away.
      } else if (method === "signer.unlock") {
        reply(id, {
          error: {
            code: -32012,
            message: "That passphrase doesn't unseal it.",
            data: { kind: "auth" },
          },
        });
      } else {
        reply(id, { result: { method } });
      }
    });
  });
  const socketPath = join(dir, "daemon.sock");
  return new Promise((resolve) =>
    server.listen(socketPath, () => {
      writeFileSync(join(dir, "daemon.addr"), "daemon.sock\n");
      writeFileSync(join(dir, "daemon.token"), `${TOKEN}\n`, { mode: 0o600 });
      resolve({ server, sockets });
    }),
  );
}

describe("DaemonConnection", () => {
  let server: Server | undefined;
  afterEach(() => server?.close());

  it("authenticates, calls, keeps error kinds and delivers events", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ome-conn-"));
    ({ server } = await fakeDaemon(dir));
    const connection = await DaemonConnection.open(dir);

    await expect(connection.call("status", {})).resolves.toEqual({ method: "status" });
    await expect(
      connection.call("signer.unlock", { secret: { passphrase: "x" }, ttlSecs: 60 }),
    ).rejects.toMatchObject({ kind: "auth" });

    const events: string[] = [];
    await connection.subscribe((event) => events.push(event.type));
    await expect.poll(() => events).toEqual(["signer"]);
    connection.close();
  });

  it("refuses a wrong token", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ome-conn-"));
    ({ server } = await fakeDaemon(dir));
    writeFileSync(join(dir, "daemon.token"), "wrong\n");
    await expect(DaemonConnection.open(dir)).rejects.toMatchObject({ kind: "unauthorized" });
  });

  it("is unreachable without a daemon, and fails waiting calls when it goes away", async () => {
    const empty = mkdtempSync(join(tmpdir(), "ome-conn-"));
    await expect(DaemonConnection.open(empty)).rejects.toMatchObject({ kind: "unreachable" });

    const dir = mkdtempSync(join(tmpdir(), "ome-conn-"));
    const daemon = await fakeDaemon(dir);
    server = daemon.server;
    const connection = await DaemonConnection.open(dir);
    const waiting = connection.call("node.status", {});
    for (const socket of daemon.sockets) socket.destroy();
    await expect(waiting).rejects.toMatchObject({ kind: "unreachable" });
    await connection.closed;
    await expect(connection.call("status", {})).rejects.toMatchObject({ kind: "unreachable" });
  });
});

describe("profiles", () => {
  it("names a profile after its member, as ome init does", () => {
    expect(profileNameFor("Alice Smith")).toBe("alice-smith");
    expect(profileNameFor("  Bob  ")).toBe("bob");
    expect(profileNameFor("Ünïcode!!")).toBe("n-code");
    expect(profileNameFor("***")).toBe("member");
  });

  it("lists only profiles that were set up", async () => {
    const home = mkdtempSync(join(tmpdir(), "ome-home-"));
    for (const [name, state] of [
      ["alice", { profile: { name: "Alice" } }],
      ["half", { profile: null }],
      ["Bad Name", { profile: { name: "Nope" } }],
    ] as const) {
      mkdirSync(join(home, "profiles", name), { recursive: true });
      writeFileSync(join(home, "profiles", name, "profile.json"), JSON.stringify(state));
    }
    await expect(listProfiles(home)).resolves.toEqual([{ name: "alice", member: "Alice" }]);
  });
});
