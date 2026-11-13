// One authenticated session with a profile's daemon: newline-delimited JSON-RPC 2.0 on its owner-only socket, the
// token first (`session.auth`), calls answered in any order, and `event` notifications after `events.subscribe`.
import { readFile } from "node:fs/promises";
import { type Socket, createConnection } from "node:net";
import { isAbsolute, join } from "node:path";
import { createInterface } from "node:readline";

import type {
  DaemonEvent,
  DaemonMethod,
  DaemonParams,
  DaemonResult,
  RpcError,
} from "@ome-labs/api";

import { OmeError } from "../client.ts";

/** A reply line longer than this is refused, as `ome-client` does. */
const MAX_LINE = 8 * 1024 * 1024;

interface Pending {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

export class DaemonConnection {
  readonly #socket: Socket;
  readonly #pending = new Map<number, Pending>();
  readonly #listeners = new Set<(event: DaemonEvent) => void>();
  readonly #closed: Promise<void>;
  #next = 0;
  #subscribed = false;

  private constructor(socket: Socket) {
    this.#socket = socket;
    // A daemon that goes away resets the socket on Linux, and readline re-emits the socket's error on its own
    // interface. Unheard, either would crash the main process; the close that follows already fails every
    // waiting call, so the error itself has nothing left to say.
    socket.on("error", () => {});
    createInterface({ input: socket })
      .on("line", (line) => this.#receive(line))
      .on("error", () => {});
    this.#closed = new Promise((resolve) =>
      socket.on("close", () => {
        for (const { reject } of this.#pending.values()) {
          reject(new OmeError("unreachable", "The daemon closed the connection."));
        }
        this.#pending.clear();
        resolve();
      }),
    );
  }

  /** Connects to profile `dir`'s running daemon through the `daemon.addr` and `daemon.token` it wrote. */
  static async open(dir: string): Promise<DaemonConnection> {
    let addr: string;
    let token: string;
    try {
      addr = (await readFile(join(dir, "daemon.addr"), "utf8")).trim();
      token = (await readFile(join(dir, "daemon.token"), "utf8")).trim();
    } catch {
      throw new OmeError("unreachable", "The daemon isn't running for this profile.");
    }
    const socket = await new Promise<Socket>((resolve, reject) => {
      const s = createConnection(isAbsolute(addr) ? addr : join(dir, addr), () => resolve(s));
      s.once("error", () =>
        reject(new OmeError("unreachable", "The daemon isn't running for this profile.")),
      );
    });
    const connection = new DaemonConnection(socket);
    try {
      await connection.call("session.auth", { token });
    } catch (error) {
      connection.close();
      throw error;
    }
    return connection;
  }

  /** Resolves when the connection closes, from either side. */
  get closed(): Promise<void> {
    return this.#closed;
  }

  call<M extends DaemonMethod>(method: M, params: DaemonParams<M>): Promise<DaemonResult<M>> {
    if (this.#socket.destroyed) {
      return Promise.reject(new OmeError("unreachable", "The daemon closed the connection."));
    }
    this.#next += 1;
    const id = this.#next;
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      this.#socket.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
    });
  }

  /** Adds an event listener, subscribing the session on the first one. */
  async subscribe(listener: (event: DaemonEvent) => void): Promise<void> {
    this.#listeners.add(listener);
    if (this.#subscribed) return;
    this.#subscribed = true;
    await this.call("events.subscribe", {});
  }

  close(): void {
    this.#socket.destroy();
  }

  #receive(line: string): void {
    if (line.length > MAX_LINE) {
      this.close();
      return;
    }
    let message: {
      id?: number;
      result?: unknown;
      error?: RpcError;
      method?: string;
      params?: unknown;
    };
    try {
      message = JSON.parse(line) as typeof message;
    } catch {
      return;
    }
    if (message.method === "event") {
      for (const listener of this.#listeners) listener(message.params as DaemonEvent);
      return;
    }
    const pending = message.id === undefined ? undefined : this.#pending.get(message.id);
    if (!pending || message.id === undefined) return;
    this.#pending.delete(message.id);
    if (message.error) {
      pending.reject(new OmeError(message.error.data?.kind ?? "failed", message.error.message));
    } else {
      pending.resolve(message.result);
    }
  }
}
