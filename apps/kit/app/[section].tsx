import { Text } from "@ome-labs/ui-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";

import { sections } from "../src/sections/index.ts";

export default function Section() {
  const { section: slug } = useLocalSearchParams<{ section: string }>();
  const section = sections.find((item) => item.slug === slug);

  if (!section) return <Text className="p-5">No section called {slug}.</Text>;

  return (
    <ScrollView contentContainerClassName="gap-8 p-5 pb-16">
      <Stack.Screen options={{ title: section.title }} />
      <section.Screen />
    </ScrollView>
  );
}
