import type { Hex16, Hex32 } from "@ome-labs/api";

const hex32 = /^0x[\da-f]{64}$/i;
const hex16 = /^0x[\da-f]{32}$/i;

/** An address, proposal id, key hash or transaction: `0x` and 64 hex digits. */
export function isHex32(value: string): value is Hex32 {
  return hex32.test(value);
}

/** A founding lobby id: `0x` and 32 hex digits. */
export function isHex16(value: string): value is Hex16 {
  return hex16.test(value);
}

/** `0x103b…c2c0`: the first and last 4 hex digits, as the guide and the CLI shorten every id. */
export function shortHex(value: string): string {
  const digits = value.startsWith("0x") ? value.slice(2) : value;
  if (digits.length <= 8) return value;

  return `0x${digits.slice(0, 4)}…${digits.slice(-4)}`;
}

/** The full value in the case the daemon uses, for copy buttons and comparisons. */
export function fullHex(value: string): string {
  return value.toLowerCase();
}
