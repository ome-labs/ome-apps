import {
  SegmentedControl,
  type SegmentedControlOption,
  type ThemePreference,
  useTheme,
} from "@ome-labs/ui-web";

const OPTIONS: SegmentedControlOption<ThemePreference>[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "Match the system", icon: "laptop" },
];

/** Light, dark, or the system's choice, as three icons. The app remembers the choice. */
export function ThemeSwitch() {
  const { preference, setPreference } = useTheme();
  return (
    <SegmentedControl
      aria-label="Theme"
      options={OPTIONS}
      value={preference}
      onValueChange={setPreference}
      size="sm"
      iconsOnly
    />
  );
}
