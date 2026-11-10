import {
  SegmentedControl,
  type SegmentedControlOption,
  type ThemePreference,
  useTheme,
} from "@ome-labs/ui-web";

import { Row, Section } from "../parts.tsx";

const THEMES: SegmentedControlOption<ThemePreference>[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "laptop" },
];

export function Appearance() {
  const { preference, setPreference } = useTheme();
  return (
    <Section id="appearance" title="Appearance">
      <Row title="Theme" description="System follows your computer's light and dark setting.">
        <SegmentedControl
          aria-label="Theme"
          options={THEMES}
          value={preference}
          onValueChange={setPreference}
          className="w-fit"
        />
      </Row>
    </Section>
  );
}
