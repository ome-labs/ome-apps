import type { Recipient } from "@ome-labs/api";
import { aliasName } from "@ome-labs/format";
import { View } from "react-native";

import { Tag } from "../status/tag.tsx";
import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";
import { HexValue } from "./hex-value.tsx";

export type AddressProps = {
  address: string;
  label?: Pick<Recipient, "label" | "source"> | null | undefined;
  /** Mark aliases as unverified, as review screens must. */
  flagAlias?: boolean | undefined;
  full?: boolean | undefined;
  copy?: boolean | undefined;
  className?: string | undefined;
};

/** Page 31's address: the name Ome has for it, then the address. */
export function Address({ address, label, flagAlias, full, copy, className }: AddressProps) {
  const isAlias = label?.source === "aztecWallet";
  const name = label?.label ? (isAlias ? aliasName(label.label) : label.label) : null;

  return (
    <View className={cn("flex-row flex-wrap items-center gap-x-1.5", className)}>
      {name ? <Text className="type-label-m">{name}</Text> : null}
      {name && isAlias && flagAlias ? (
        <>
          <Text className="type-mono-s text-fg-muted">{label?.label}</Text>
          <Tag>alias, unverified</Tag>
        </>
      ) : null}
      <HexValue
        value={address}
        noun="address"
        full={full}
        copy={copy}
        tone={name ? "quiet" : "default"}
      />
    </View>
  );
}
