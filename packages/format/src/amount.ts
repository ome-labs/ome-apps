import type { Amount, TokenInfo } from "@ome-labs/api";

// Amounts stay bigint end to end: an 18-decimal balance has more digits than a float can hold,
// and the guide never lets the UI show a rounded amount.

const digitsOnly = /^\d+$/;

type FormatOptions = {
  /** BCP 47 locale for digit grouping. */
  locale?: string;
};

/** A base-unit amount in display units, every significant digit kept: `"250000000000000000000"` → `250`. */
export function formatAmount(
  amount: Amount,
  decimals: number,
  { locale = "en" }: FormatOptions = {},
): string {
  const units = toBigInt(amount);

  const scale = 10n ** BigInt(decimals);
  const whole = units / scale;
  const fraction = (units % scale).toString().padStart(decimals, "0").replace(/0+$/, "");

  const numbers = new Intl.NumberFormat(locale);
  const grouped = numbers.format(whole);
  if (!fraction) return grouped;

  const separator = numbers.formatToParts(0.5).find((part) => part.type === "decimal")?.value;
  return `${grouped}${separator ?? "."}${fraction}`;
}

/** `250 OMET`. */
export function formatTokenAmount(
  amount: Amount,
  token: TokenInfo,
  options?: FormatOptions,
): string {
  return `${formatAmount(amount, token.decimals, options)} ${token.symbol}`;
}

/** The review screens' line, which shows the exact integer the vault signs: `250 OMET (250000000000000000000 base units)`. */
export function formatWithBaseUnits(
  amount: Amount,
  token: TokenInfo,
  options?: FormatOptions,
): string {
  return `${formatTokenAmount(amount, token, options)} (${toBigInt(amount).toString()} base units)`;
}

export type AmountInputError = "empty" | "not-a-number" | "too-many-decimals" | "zero";

export type ParsedAmount = { ok: true; amount: Amount } | { ok: false; error: AmountInputError };

/**
 * What a member typed, in display units, to a base-unit `Amount`.
 * Accepts `1,000.5` and `1000.5`; refuses anything finer than the token's decimals rather than rounding it away.
 */
export function parseAmount(input: string, decimals: number): ParsedAmount {
  const text = input.trim().replaceAll(",", "").replaceAll("_", "");
  if (!text) return { ok: false, error: "empty" };

  const [whole = "", fraction = "", extra] = text.split(".");
  if (extra !== undefined) return { ok: false, error: "not-a-number" };
  if (
    !(whole || fraction) ||
    (whole && !digitsOnly.test(whole)) ||
    (fraction && !digitsOnly.test(fraction))
  ) {
    return { ok: false, error: "not-a-number" };
  }
  if (fraction.length > decimals) return { ok: false, error: "too-many-decimals" };

  const units =
    BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, "0") || "0");
  if (units === 0n) return { ok: false, error: "zero" };

  return { ok: true, amount: units.toString() };
}

/** The messages for `parseAmount`'s errors, for an inline field error. */
export function amountInputMessage(error: AmountInputError, token: TokenInfo): string {
  switch (error) {
    case "empty": {
      return "Enter an amount.";
    }
    case "not-a-number": {
      return "Enter a number, like 250 or 0.5.";
    }
    case "too-many-decimals": {
      return `${token.symbol} has ${token.decimals} decimals; this amount has more.`;
    }
    case "zero": {
      return "Enter an amount above zero.";
    }
  }
}

function toBigInt(amount: Amount): bigint {
  if (!digitsOnly.test(amount)) throw new TypeError(`Not a base-unit amount: ${amount}`);

  return BigInt(amount);
}
