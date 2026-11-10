import { useState } from "react";

import { fullHex, shortHex } from "@ome-labs/format";
import { Pressable, View } from "react-native";

import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";
import { CopyButton } from "./copy-button.tsx";

export type HexValueProps = {
  value: string;
  /** "address", "transaction"… for the copy button and the screen reader. */
  noun: string;
  /** Start expanded: all 64 digits, wrapped. */
  full?: boolean | undefined;
  copy?: boolean | undefined;
  tone?: "default" | "quiet" | undefined;
  className?: string | undefined;
};

/** A 0x value as the guide writes it. There is no hover on a phone, so tapping it shows the full value. */
export function HexValue({
  value,
  noun,
  full = false,
  copy = true,
  tone = "default",
  className,
}: HexValueProps) {
  const [expanded, setExpanded] = useState(full);
  const complete = fullHex(value);

  return (
    <View className={cn("flex-row items-center", className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${noun} ${complete}`}
        accessibilityHint={expanded ? "Shows the short form" : "Shows the full value"}
        onPress={() => setExpanded(!expanded)}
        className="min-h-11 shrink justify-center active:opacity-60"
      >
        <Text className={cn("type-mono-s", tone === "quiet" ? "text-fg-subtle" : "text-fg")}>
          {expanded ? complete : shortHex(complete)}
        </Text>
      </Pressable>
      {copy ? <CopyButton value={complete} label={`Copy ${noun}`} /> : null}
    </View>
  );
}
