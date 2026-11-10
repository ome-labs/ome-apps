import type { Amount as AmountValue, TokenInfo } from "@ome-labs/api";
import { formatAmount } from "@ome-labs/format";
import { View } from "react-native";

import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";

const sizes = {
  lg: ["type-numeric-l", "type-mono-m"],
  md: ["type-numeric-m", "type-mono-s"],
  sm: ["type-mono-m", "type-mono-s"],
} as const;

export type AmountProps = {
  amount: AmountValue;
  token: Pick<TokenInfo, "symbol" | "decimals">;
  size?: keyof typeof sizes | undefined;
  /** Add the exact base units underneath, as review screens must. */
  baseUnits?: boolean | undefined;
  className?: string | undefined;
};

/** Page 31's amount: every significant digit, then the symbol. Never rounded, never in fiat. */
export function Amount({ amount, token, size = "md", baseUnits, className }: AmountProps) {
  const [value, symbol] = sizes[size];
  const display = formatAmount(amount, token.decimals);

  return (
    <View
      accessible
      accessibilityLabel={`${display} ${token.symbol}`}
      className={cn("gap-0.5", className)}
    >
      <View className="flex-row flex-wrap items-baseline gap-x-1.5">
        <Text className={cn("shrink", value)}>{display}</Text>
        <Text className={cn("text-fg-subtle", symbol)}>{token.symbol}</Text>
      </View>
      {baseUnits ? (
        <Text className="type-mono-s text-fg-subtle">{BigInt(amount).toString()} base units</Text>
      ) : null}
    </View>
  );
}
