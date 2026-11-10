import { useState } from "react";

import { Logo } from "@ome-labs/brand/native";
import { Icon } from "@ome-labs/icons/native";
import { SegmentedControl, Text, setTheme, type ThemePreference } from "@ome-labs/ui-native";
import { Link, Stack } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { sections } from "../src/sections/index.ts";

export default function Home() {
  const [theme, setThemeChoice] = useState<ThemePreference>("system");

  return (
    <ScrollView contentContainerClassName="gap-6 p-5">
      <Stack.Screen options={{ title: "Ome Kit" }} />
      <View className="gap-2">
        <Logo variant="lockup-horizontal" tone="mono" title="Ome" className="h-7 text-fg" />
        <Text className="type-body-s text-fg-muted">
          Every @ome-labs/ui-native component and state, with the guide's sample data.
        </Text>
      </View>
      <SegmentedControl
        label="Theme"
        value={theme}
        onValueChange={(next) => {
          setThemeChoice(next);
          setTheme(next);
        }}
        options={[
          { value: "system", label: "System" },
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
      />
      <View className="overflow-hidden rounded-lg border border-line-subtle bg-surface">
        {sections.map((section, position) => (
          <Link
            key={section.slug}
            href={{ pathname: "/[section]", params: { section: section.slug } }}
            asChild
          >
            <Pressable
              accessibilityRole="link"
              className={`min-h-12 flex-row items-center justify-between px-4 active:bg-selected ${position > 0 ? "border-t border-line-subtle" : ""}`}
            >
              <Text className="type-label-m">{section.title}</Text>
              <Icon name="chevron-right" size={20} tone="fg-subtle" />
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}
