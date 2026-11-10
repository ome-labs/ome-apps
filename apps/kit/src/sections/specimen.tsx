import type { ReactNode } from "react";

import { Text } from "@ome-labs/ui-native";
import { View } from "react-native";

/** One labelled example on a section screen. */
export function Specimen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="type-overline text-fg-subtle">{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}
