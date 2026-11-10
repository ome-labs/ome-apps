import type { SvgProps } from "react-native-svg";

import * as logos from "../generated/native/logos.ts";

export type LogoVariant = "lockup-horizontal" | "lockup-stacked" | "mark" | "wordmark";
/** `light` and `dark` are the kit's two-tone versions for those surfaces; `mono` takes `color`. */
export type LogoTone = "light" | "dark" | "mono";

type LogoProps = SvgProps & {
  variant?: LogoVariant;
  tone?: LogoTone;
  /** Accessible name; pass "" when the logo is decorative. */
  title?: string;
};

const components = {
  "lockup-horizontal": {
    light: logos.LockupHorizontalLight,
    dark: logos.LockupHorizontalDark,
    mono: logos.LockupHorizontalMono,
  },
  "lockup-stacked": {
    light: logos.LockupStackedLight,
    dark: logos.LockupStackedDark,
    mono: logos.LockupStackedMono,
  },
  mark: { light: logos.MarkLight, dark: logos.MarkDark, mono: logos.MarkMono },
  wordmark: { light: logos.WordmarkLight, dark: logos.WordmarkDark, mono: logos.WordmarkMono },
} as const;

/** The Ome logo for React Native. Size it with height and width from the viewBox ratio. */
export function Logo({
  variant = "lockup-horizontal",
  tone = "light",
  title = "Ome",
  ...props
}: LogoProps) {
  const Component = components[variant][tone];

  return title === "" ? (
    <Component
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      {...props}
    />
  ) : (
    <Component accessible accessibilityRole="image" accessibilityLabel={title} {...props} />
  );
}
