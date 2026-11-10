import { useMemo } from "react";

import type { IconName } from "@ome-labs/icons/web";
import { IconButton, Menu, type ThemePreference, useTheme } from "@ome-labs/ui-web";

const CHOICES: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "Match the system", icon: "laptop" },
];

/**
 * One button showing the theme in use; its menu picks light, dark or the system's. The app remembers the choice. `pill`
 * sits among the first run's round pills; `toolbar` sits in the top bar.
 */
export function ThemeSwitch({
  side = "bottom",
  look = "toolbar",
}: {
  side?: "top" | "bottom";
  look?: "pill" | "toolbar";
}) {
  const { preference, resolved, setPreference } = useTheme();

  const items = useMemo(
    () =>
      CHOICES.map((choice) => ({
        label: choice.label,
        icon: choice.icon,
        checked: choice.value === preference,
        onSelect: () => setPreference(choice.value),
      })),
    [preference, setPreference],
  );

  return (
    <Menu
      side={side}
      align="end"
      items={items}
      trigger={
        <IconButton
          icon={resolved === "dark" ? "moon" : "sun"}
          label="Theme"
          variant={look === "pill" ? "secondary" : "ghost"}
          size="sm"
          className={look === "pill" ? "size-7 rounded-full shadow-1" : undefined}
        />
      }
    />
  );
}
