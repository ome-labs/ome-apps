import type { LogoTone, LogoVariant } from "@ome-labs/brand/web";

// The SVG masters as text, so a download is the exact file the brand package ships.
const files = import.meta.glob<string>("@brand-assets/logo/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** The master SVG of one logo variant in one tone. */
export function logoSvg(variant: LogoVariant, tone: LogoTone) {
  const entry = Object.entries(files).find(([path]) => path.endsWith(`/${variant}-${tone}.svg`));
  if (!entry) throw new Error(`No logo file for ${variant}-${tone}`);

  return entry[1];
}
