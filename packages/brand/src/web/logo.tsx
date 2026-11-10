import type { SVGProps } from "react";

import * as logos from "../generated/web/logos.ts";

export type LogoVariant = "lockup-horizontal" | "lockup-stacked" | "mark" | "wordmark";
/** `light` and `dark` are the kit's two-tone versions for those surfaces; `mono` is one colour (currentColor), for art and photos. */
export type LogoTone = "light" | "dark" | "mono";

type LogoProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  variant?: LogoVariant;
  tone?: LogoTone;
  /** Accessible name; pass "" when the logo sits next to the word "Ome" and is decorative. */
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

/**
 * The Ome logo (Figma pages 02–04). The SVG scales from its viewBox: size it with height (the
 * lockup keeps its proportions). Minimum sizes: the mark 16 px, a lockup a 20 px mark.
 */
export function Logo({
  variant = "lockup-horizontal",
  tone = "light",
  title = "Ome",
  ...props
}: LogoProps) {
  const Component = components[variant][tone];

  if (title === "") {
    return <Component title="" aria-hidden {...props} aria-label={undefined} />;
  }

  // An <svg> with a <title> is an image to assistive technology; role="img" makes that explicit for
  // browsers that otherwise expose it as a group.
  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline SVG, not an <img>
  return <Component title={title} role="img" {...props} aria-label={title} />;
}
