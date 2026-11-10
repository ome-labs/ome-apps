import "../global.css";
import { useEffect } from "react";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { fontFiles } from "@ome-labs/brand/native";
import { Toaster, useResolvedTheme } from "@ome-labs/ui-native";
import { PortalHost } from "@rn-primitives/portal";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

void SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded] = useFonts(fontFiles);
  const theme = useResolvedTheme();
  // Navigation styles take colours, not classes, so they are read from the active theme.
  const [surface = "", canvas = "", fg = ""] = useCSSVariable([
    "--color-surface",
    "--color-canvas",
    "--color-fg",
  ]).map(String);

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // The kit's type styles name the font files, so nothing renders until they are registered.
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar style={theme === "dark" ? "light" : "dark"} />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: surface },
              headerTintColor: fg,
              contentStyle: { backgroundColor: canvas },
              headerShadowVisible: false,
            }}
          />
          <PortalHost />
          <Toaster />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
