import type { Amount as AmountValue, TokenInfo } from "@ome-labs/api";
import { formatAmount } from "@ome-labs/format";

import { cn } from "../styling/class-names.ts";

const sizes = {
  lg: { value: "type-numeric-l", symbol: "type-mono-m" },
  md: { value: "type-numeric-m", symbol: "type-mono-s" },
  sm: { value: "type-mono-m", symbol: "type-mono-s" },
} as const;

export type AmountProps = {
  amount: AmountValue;
  token: Pick<TokenInfo, "symbol" | "decimals">;
  size?: keyof typeof sizes | undefined;
  /** Add the exact base units underneath, as review screens must. */
  baseUnits?: boolean | undefined;
  className?: string | undefined;
};

/** Page 31's amount: every significant digit, the symbol after it. Never rounded, never in fiat. */
export function Amount({ amount, token, size = "md", baseUnits, className }: AmountProps) {
  const style = sizes[size];

  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
        <span className={cn("text-fg tabular-nums [overflow-wrap:anywhere]", style.value)}>
          {formatAmount(amount, token.decimals)}
        </span>
        <span className={cn("text-fg-subtle", style.symbol)}>{token.symbol}</span>
      </span>
      {baseUnits ? (
        <span className="type-mono-s text-fg-subtle [overflow-wrap:anywhere]">
          {BigInt(amount).toString()} base units
        </span>
      ) : null}
    </span>
  );
}
