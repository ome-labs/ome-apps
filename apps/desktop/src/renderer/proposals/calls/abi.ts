// A call's arguments as the member types them, one draft per ABI type, and the values they become. The checks mirror
// the daemon's (`contracts/abi.ts`) so a mistake shows on its field as it is typed; the daemon checks again.
import type { AbiType, AbiValue } from "@ome-labs/api";

/** What a field holds while it's edited: text for numbers and addresses, a flag for a bool, lists and records. */
export type ArgDraft = string | boolean | ArgDraft[] | { [field: string]: ArgDraft };

/** A field's value, or why not yet. An empty field is `missing`, which only shows once the member tries to propose. */
export type ArgRead =
  | { ok: true; value: AbiValue }
  | { ok: false; missing: boolean; errors: Record<string, string> };

const FIELD_MODULUS = 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001n;
const HEX = /^0x[0-9a-fA-F]+$/u;
const DECIMAL = /^-?\d+$/u;

/** The empty draft of a type. */
export function emptyArg(type: AbiType): ArgDraft {
  switch (type.kind) {
    case "boolean":
      return false;
    case "array":
      return Array.from({ length: type.length }, () => emptyArg(type.item));
    case "tuple":
      return type.items.map(emptyArg);
    case "struct":
      return type.known
        ? ""
        : Object.fromEntries(type.fields.map((field) => [field.name, emptyArg(field.type)]));
    default:
      return "";
  }
}

/** A short name for what a field takes, for its placeholder. */
export function placeholderOf(type: AbiType): string {
  if (type.kind === "struct" && type.known === "aztecAddress") return "0x… (64 hex)";
  if (type.kind === "struct" && type.known === "ethAddress") return "0x… (40 hex)";
  if (type.kind === "struct" && type.known === "functionSelector") return "0x12345678";
  if (type.kind === "integer") return "0";
  if (type.kind === "field") return "0 or 0x…";
  return "";
}

const fail = (path: string, message: string): ArgRead => ({
  ok: false,
  missing: false,
  errors: { [path]: message },
});
const missing = (path: string): ArgRead => ({
  ok: false,
  missing: true,
  errors: { [path]: "Required" },
});

function number(draft: ArgDraft, path: string): bigint | ArgRead {
  const raw = typeof draft === "string" ? draft.trim().replaceAll("_", "") : "";
  if (!raw) return missing(path);
  if (!HEX.test(raw) && !DECIMAL.test(raw)) return fail(path, "A whole number, or 0x hex");
  return BigInt(raw);
}

/** Reads a list of drafts against their types, collecting every error by path. */
function readAll(
  entries: { type: AbiType; draft: ArgDraft; path: string }[],
): { values: AbiValue[] } | Extract<ArgRead, { ok: false }> {
  const values: AbiValue[] = [];
  const errors: Record<string, string> = {};
  let empty = true;
  for (const entry of entries) {
    const read = readArg(entry.type, entry.draft, entry.path);
    if (read.ok) values.push(read.value);
    else {
      Object.assign(errors, read.errors);
      empty &&= read.missing;
    }
  }
  return Object.keys(errors).length === 0 ? { values } : { ok: false, missing: empty, errors };
}

/** `draft` as the value of `type`, or the errors by field path (`amount`, `route[1]`, `config.fee`). */
export function readArg(type: AbiType, draft: ArgDraft, path: string): ArgRead {
  switch (type.kind) {
    case "field": {
      const n = number(draft, path);
      if (typeof n !== "bigint") return n;
      if (n < 0n || n >= FIELD_MODULUS) return fail(path, "A field is from 0 to the field modulus");
      return { ok: true, value: n.toString() };
    }
    case "integer": {
      const n = number(draft, path);
      if (typeof n !== "bigint") return n;
      const width = BigInt(type.width);
      const min = type.signed ? -(1n << (width - 1n)) : 0n;
      const max = type.signed ? (1n << (width - 1n)) - 1n : (1n << width) - 1n;
      if (n < min || n > max)
        return fail(path, `${type.signed ? "i" : "u"}${type.width} is from ${min} to ${max}`);
      return { ok: true, value: n.toString() };
    }
    case "boolean":
      return { ok: true, value: draft === true };
    case "string": {
      const raw = typeof draft === "string" ? draft : "";
      if ([...raw].length > type.length) return fail(path, `At most ${type.length} characters`);
      return { ok: true, value: raw };
    }
    case "array": {
      const items = Array.isArray(draft) ? draft : [];
      const read = readAll(
        Array.from({ length: type.length }, (_, at) => ({
          type: type.item,
          draft: items[at] ?? emptyArg(type.item),
          path: `${path}[${at}]`,
        })),
      );
      return "values" in read ? { ok: true, value: read.values } : read;
    }
    case "tuple": {
      const items = Array.isArray(draft) ? draft : [];
      const read = readAll(
        type.items.map((item, at) => ({
          type: item,
          draft: items[at] ?? emptyArg(item),
          path: `${path}.${at}`,
        })),
      );
      return "values" in read ? { ok: true, value: read.values } : read;
    }
    case "struct": {
      if (type.known) return readKnown(type.known, draft, path);
      const fields = typeof draft === "object" && !Array.isArray(draft) ? draft : {};
      const read = readAll(
        type.fields.map((field) => ({
          type: field.type,
          draft: fields[field.name] ?? emptyArg(field.type),
          path: `${path}.${field.name}`,
        })),
      );
      if (!("values" in read)) return read;
      return {
        ok: true,
        value: Object.fromEntries(
          type.fields.map((field, at) => [field.name, read.values[at] as AbiValue]),
        ),
      };
    }
  }
}

const KNOWN = {
  aztecAddress: { pattern: /^0x[0-9a-fA-F]{64}$/u, message: "An Aztec address is 0x and 64 hex" },
  ethAddress: { pattern: /^0x[0-9a-fA-F]{40}$/u, message: "An Ethereum address is 0x and 40 hex" },
  functionSelector: { pattern: /^0x[0-9a-fA-F]{8}$/u, message: "A selector is 0x and 8 hex" },
} as const;

function readKnown(known: keyof typeof KNOWN, draft: ArgDraft, path: string): ArgRead {
  const raw = typeof draft === "string" ? draft.trim() : "";
  if (!raw) return missing(path);
  const rule = KNOWN[known];
  if (!rule.pattern.test(raw)) return fail(path, rule.message);
  return { ok: true, value: raw.toLowerCase() };
}

/** `amount` in a token's whole units (`"2.5"`) as base units, or undefined when it isn't a valid amount. */
export function toBaseUnits(amount: string, decimals: number): string | undefined {
  const raw = amount.trim().replaceAll(",", "").replaceAll("_", "");
  const match = /^(\d*)(?:\.(\d*))?$/u.exec(raw);
  if (!match || raw === "" || raw === ".") return undefined;
  const whole = match[1] ?? "";
  const fraction = match[2] ?? "";
  if (fraction.length > decimals) return undefined;
  return (
    BigInt(whole || "0") * 10n ** BigInt(decimals) +
    BigInt(fraction.padEnd(decimals, "0") || "0")
  ).toString();
}
