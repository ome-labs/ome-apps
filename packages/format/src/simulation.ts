import type {
  AbiType,
  AbiValue,
  DecodedArg,
  FeeEstimate,
  SimulationError,
  SimulationFailure,
} from "@ome-labs/api";

import { shortHex } from "./address.ts";
import { formatAmount } from "./amount.ts";

/** Fee juice has 18 decimals, like every Aztec fee amount. */
const FEE_DECIMALS = 18;

/** A contract's name when the caller knows one, else its short address. */
export type NameOf = (address: string) => string | undefined;

/** What went wrong in a simulation, in a sentence a member can act on. */
export function failureText(failure: SimulationFailure, nameOf: NameOf = () => undefined): string {
  const name = (address: string) => nameOf(address) ?? shortHex(address);
  switch (failure.kind) {
    case "insufficientBalance":
      return failure.token
        ? `The vault doesn't hold enough ${failure.token.symbol}.`
        : `The vault doesn't hold enough of the token at ${name(failure.contract)}.`;
    case "authwitRequired":
      return failure.contract
        ? `A call needs an authwit to spend the vault's ${name(failure.contract)}. Add one that lets the calling contract make that call.`
        : "A call needs an authwit the proposal doesn't grant.";
    case "unusedAuthwit":
      return `Authwit ${failure.index + 1} isn't used by any call; check its caller and call, or remove it.`;
    case "nonceUsed":
      return "Another proposal already used this nonce.";
    case "reverted":
      return failure.function
        ? `${failure.function} reverted${failure.contract ? ` on ${name(failure.contract)}` : ""}.`
        : "A call reverted.";
    case "unavailable":
      return "The node couldn't simulate it right now.";
    case "unknown":
      return "The simulation failed.";
  }
}

/** The failure's sentence, then the node's own message when it adds something. */
export function simulationErrorText(
  error: SimulationError,
  nameOf?: NameOf,
): {
  title: string;
  detail: string | null;
} {
  const title = failureText(error.failure, nameOf);
  const detail = error.message && error.message !== title ? error.message : null;

  return { title, detail };
}

/** `0.0021` fee juice: the estimate's fee, every digit kept. */
export function formatFee(fee: Pick<FeeEstimate, "fee">): string {
  return `${formatAmount(fee.fee, FEE_DECIMALS)} FJ`;
}

/** A short name for an ABI type: `u128`, `Field`, `AztecAddress`, `[u8; 32]`. */
export function abiTypeName(type: AbiType): string {
  switch (type.kind) {
    case "field":
      return "Field";
    case "boolean":
      return "bool";
    case "integer":
      return `${type.signed ? "i" : "u"}${type.width}`;
    case "array":
      return `[${abiTypeName(type.item)}; ${type.length}]`;
    case "string":
      return `str<${type.length}>`;
    case "tuple":
      return `(${type.items.map(abiTypeName).join(", ")})`;
    case "struct":
      return type.path.split("::").at(-1) ?? type.path;
  }
}

/** A decoded value as text, structs and arrays included. */
export function formatAbiValue(value: AbiValue): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return `[${value.map(formatAbiValue).join(", ")}]`;

  return `{ ${Object.entries(value)
    .map(([key, field]) => `${key}: ${formatAbiValue(field)}`)
    .join(", ")} }`;
}

/** An argument as the review shows it: the daemon's label when it has one (a member, an alias, an amount). */
export function formatArg(arg: DecodedArg): string {
  return arg.display ?? formatAbiValue(arg.value);
}
