import { useMemo, type CSSProperties, type ImgHTMLAttributes } from "react";

import { avatarUrls } from "../generated/web/assets.ts";
import { manifest, type AvatarId } from "../manifest.ts";

/**
 * Drawn on a 64 grid: crisp from 64 up, and smoothly scaled below it, where nearest-neighbour would drop whole pixels
 * and break the drawing.
 */
const crisp: CSSProperties = { imageRendering: "pixelated" };

type AvatarArtProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "width" | "height"
> & {
  id: AvatarId;
  /** Rendered size in pixels. */
  size: number;
  alt?: string;
};

/** One of the kit's avatars for a vault or a profile, as a square image; the caller rounds it. */
export function AvatarArt({ id, size, alt, style, ...props }: AvatarArtProps) {
  const merged = useMemo(() => (size >= 64 ? { ...crisp, ...style } : style), [size, style]);
  const entry = manifest.avatars.find((item) => item.id === id);

  return (
    <img
      src={avatarUrls[id]}
      width={size}
      height={size}
      alt={alt ?? entry?.alt ?? ""}
      decoding="async"
      style={merged}
      {...props}
    />
  );
}
