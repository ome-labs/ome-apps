import { HugeiconsIcon } from "@hugeicons/react-native";
import type { ColorName } from "@ome-labs/tokens";
import type { SvgProps } from "react-native-svg";
import { useCSSVariable } from "uniwind";

import { registry, type IconName } from "./registry.ts";
import { iconStrokeWidth, type IconSize } from "./sizes.ts";

type IconProps = Omit<SvgProps, "color" | "strokeWidth"> & {
  name: IconName;
  size?: IconSize;
  /** A colour role from the tokens, resolved for the current Uniwind theme. */
  tone?: ColorName;
  /** A literal colour, for icons on art or inside an already-coloured control. */
  color?: string;
  /** Accessible name. Without one the icon is decorative and hidden from screen readers. */
  label?: string;
};

export function Icon({ name, size = 20, tone = "fg", color, label, ...props }: IconProps) {
  // React Native has no currentColor, so the tone is read from the theme Uniwind has active.
  const themed = useCSSVariable(`--color-${tone}`);
  const resolved = color ?? (typeof themed === "string" ? themed : undefined);

  return (
    <HugeiconsIcon
      icon={registry[name]}
      size={size}
      strokeWidth={iconStrokeWidth}
      {...(resolved ? { color: resolved } : {})}
      {...(label
        ? { accessible: true, accessibilityRole: "image", accessibilityLabel: label }
        : { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" })}
      {...props}
    />
  );
}

export { iconNames, type IconName } from "./registry.ts";
export { iconSizes, type IconSize } from "./sizes.ts";
