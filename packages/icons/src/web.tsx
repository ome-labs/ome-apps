import type { SVGProps } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { tokens, type ColorName } from "@ome-labs/tokens";

import { registry, type IconName } from "./registry.ts";
import { iconStrokeWidth, type IconSize } from "./sizes.ts";

type IconProps = Omit<SVGProps<SVGSVGElement>, "ref" | "color" | "strokeWidth"> & {
  name: IconName;
  size?: IconSize;
  /** A colour role from the tokens; without one the icon takes the text colour (`currentColor`). */
  tone?: ColorName;
  /** Accessible name. Without one the icon is decorative and hidden from assistive technology. */
  label?: string;
};

export function Icon({ name, size = 20, tone, label, ...props }: IconProps) {
  const color = tone ? `var(${tokens.color.variable[tone]})` : "currentColor";

  return (
    <HugeiconsIcon
      icon={registry[name]}
      size={size}
      strokeWidth={iconStrokeWidth}
      color={color}
      focusable="false"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      {...props}
    />
  );
}

export { iconNames, type IconName } from "./registry.ts";
export { iconSizes, type IconSize } from "./sizes.ts";
