// Contract calls as the member builds them: each call names a contract, a function and its arguments; each authwit
// names the contract allowed to make one private call as the vault, and that call. The draft becomes a `calls` intent
// once every field reads; until then the dry run waits.
import type { ContractFunction, Hex32, Intent, IntentCall } from "@ome-labs/api";

import { type ArgDraft, emptyArg, readArg } from "./abi.ts";

export type CallDraft = {
  /** Stable across reorders, for React and for error paths. */
  key: string;
  contract: Hex32 | null;
  fn: string | null;
  args: ArgDraft[];
};

export type AuthwitDraft = {
  key: string;
  /** The contract that will use it: an AMM pulling the vault's tokens for a swap. */
  caller: string;
  call: CallDraft;
};

export type CallsDraft = { calls: CallDraft[]; authwits: AuthwitDraft[] };

/** The functions of a contract this member's daemon knows, or undefined while they load. */
export type FunctionsOf = (contract: Hex32) => ContractFunction[] | undefined;

let made = 0;
const key = (prefix: string) => `${prefix}-${(made += 1)}`;

export function newCall(): CallDraft {
  return { key: key("call"), contract: null, fn: null, args: [] };
}

export function newAuthwit(): AuthwitDraft {
  return { key: key("authwit"), caller: "", call: newCall() };
}

export const emptyCalls = (): CallsDraft => ({ calls: [newCall()], authwits: [] });

/** The call pointed at another function: its arguments start empty, typed for it. */
export function withFunction(call: CallDraft, fn: ContractFunction | undefined): CallDraft {
  return {
    ...call,
    fn: fn?.name ?? null,
    args: fn ? fn.params.map((param) => emptyArg(param.type)) : [],
  };
}

const ADDRESS = /^0x[0-9a-fA-F]{64}$/u;

type Read = {
  /** Errors by field: `<key>.contract`, `<key>.fn`, `<key>.<param path>`, `<key>.caller`. */
  errors: Record<string, string>;
  /** Every field has a value: there is something to simulate. */
  complete: boolean;
};

function readCall(
  call: CallDraft,
  functionsOf: FunctionsOf,
  read: Read,
  privateOnly: boolean,
): IntentCall | undefined {
  if (!call.contract) {
    read.complete = false;
    return undefined;
  }
  const functions = functionsOf(call.contract);
  if (!functions || !call.fn) {
    read.complete = false;
    return undefined;
  }
  const fn = functions.find((candidate) => candidate.name === call.fn);
  if (!fn) {
    read.errors[`${call.key}.fn`] = "This contract has no such function";
    read.complete = false;
    return undefined;
  }
  if (privateOnly && fn.kind !== "private") {
    read.errors[`${call.key}.fn`] = "An authwit allows a private call only";
  }
  const args = [];
  for (const [at, param] of fn.params.entries()) {
    const result = readArg(param.type, call.args[at] ?? emptyArg(param.type), param.name);
    if (result.ok) args.push(result.value);
    else {
      read.complete = false;
      if (!result.missing) {
        for (const [path, message] of Object.entries(result.errors))
          read.errors[`${call.key}.${path}`] = message;
      }
    }
  }
  return args.length === fn.params.length ? { to: call.contract, fn: fn.name, args } : undefined;
}

/** The intent, once every call and authwit reads, and the errors to show on their fields. */
export function readCalls(
  draft: CallsDraft,
  memo: string,
  functionsOf: FunctionsOf,
): Read & { intent: Intent | undefined } {
  const read: Read = { errors: {}, complete: draft.calls.length > 0 };
  const calls = draft.calls.map((call) => readCall(call, functionsOf, read, false));
  const authwits = draft.authwits.map((authwit) => {
    const caller = authwit.caller.trim();
    if (!caller) read.complete = false;
    else if (!ADDRESS.test(caller))
      read.errors[`${authwit.key}.caller`] = "An Aztec address is 0x and 64 hex";
    const call = readCall(authwit.call, functionsOf, read, true);
    return call && ADDRESS.test(caller)
      ? { caller: caller.toLowerCase() as Hex32, call }
      : undefined;
  });

  const ready =
    read.complete &&
    Object.keys(read.errors).length === 0 &&
    calls.every((call) => call !== undefined) &&
    authwits.every((authwit) => authwit !== undefined);
  const intent: Intent | undefined = ready
    ? {
        kind: "calls",
        calls: calls as IntentCall[],
        ...(authwits.length > 0
          ? { authwits: authwits as NonNullable<(typeof authwits)[number]>[] }
          : {}),
        memo: memo.trim() || null,
      }
    : undefined;
  return { ...read, intent };
}

/** How many bytes the intent takes in the proposal's description, which the daemon caps. */
export function summaryBytes(intent: Intent): number {
  return new TextEncoder().encode(JSON.stringify(intent)).length;
}

/** Moves the item at `from` by `by` places, keeping the rest in order. */
export function moved<T>(items: T[], from: number, by: -1 | 1): T[] {
  const to = from + by;
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}
