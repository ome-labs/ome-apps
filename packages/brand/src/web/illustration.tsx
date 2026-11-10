import { useMemo, type CSSProperties, type ImgHTMLAttributes } from "react";

import { illustrationUrls } from "../generated/web/assets.ts";
import { manifest, type IllustrationId } from "../manifest.ts";

const pixelated: CSSProperties = { imageRendering: "pixelated" };

type IllustrationProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "alt"> & {
  id: IllustrationId;
  /** Overrides the manifest's alt text; pass "" when the scene is decorative next to its own title. */
  alt?: string;
};

/**
 * One of the kit's pixel scenes (Figma pages 14–17), as a responsive image. Pixel art must never be
 * smoothed, so the browser scales it with nearest-neighbour sampling.
 */
export function Illustration({ id, alt, style, ...props }: IllustrationProps) {
  const pixelatedStyle = useMemo(() => ({ ...pixelated, ...style }), [style]);
  const entry = manifest.illustrations.find((item) => item.id === id);
  const urls = illustrationUrls[id];

  return (
    <img
      src={urls["1x"]}
      srcSet={`${urls["1x"]} 1x, ${urls["2x"]} 2x`}
      width={entry?.width}
      height={entry?.height}
      alt={alt ?? entry?.alt ?? ""}
      decoding="async"
      style={pixelatedStyle}
      {...props}
    />
  );
}
