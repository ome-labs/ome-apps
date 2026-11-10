import type { TokenInfo } from "@ome-labs/api";
import { View } from "react-native";

import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";

const sizes = {
  sm: ["size-5", "text-[8px]"],
  md: ["size-7", "text-[10px]"],
  lg: ["size-10", "text-[13px]"],
} as const;

export type TokenMonogramProps = {
  token: Pick<TokenInfo, "symbol">;
  size?: keyof typeof sizes | undefined;
  className?: string | undefined;
};

/** A token's mark: tokens carry no logo, so every token gets the same circle with its symbol's first two characters. */
export function TokenMonogram({ token, size = "md", className }: TokenMonogramProps) {
  const [box, text] = sizes[size];

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn(
        "items-center justify-center rounded-full border border-line-subtle bg-accent-subtle",
        box,
        className,
      )}
    >
      <Text className={cn("font-mono-medium text-accent-fg", text)}>
        {[...token.symbol].slice(0, 2).join("").toUpperCase()}
      </Text>
    </View>
  );
}
