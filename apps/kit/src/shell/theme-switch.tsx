import { SegmentedControl } from "@ome-labs/ui-web";

export type ThemeView = "light" | "dark" | "system" | "split";

const options: { value: ThemeView; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
  { value: "split", label: "Split" },
];

/** Light, dark, the system's choice, or both side by side. */
export function ThemeSwitch({
  view,
  onView,
}: {
  view: ThemeView;
  onView: (view: ThemeView) => void;
}) {
  return (
    <SegmentedControl aria-label="Theme" value={view} onValueChange={onView} options={options} />
  );
}
