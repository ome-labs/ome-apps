import { useMemo, type CSSProperties, type ImgHTMLAttributes } from "react";

import { objectUrls } from "../generated/web/assets.ts";
import { manifest, type ObjectId } from "../manifest.ts";

const pixelated: CSSProperties = { imageRendering: "pixelated" };

type PixelObjectProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "width" | "height"
> & {
  id: ObjectId;
  /** Rendered size in pixels; keep it a multiple of 32 (the object grid) so pixels stay square. */
  size?: 32 | 48 | 64 | 96 | 128;
  alt?: string;
};

/** One of the kit's 73 pixel objects (Figma page 13). */
export function PixelObject({ id, size = 64, alt, style, ...props }: PixelObjectProps) {
  const pixelatedStyle = useMemo(() => ({ ...pixelated, ...style }), [style]);
  const entry = manifest.objects.find((item) => item.id === id);

  return (
    <img
      src={objectUrls[id]}
      width={size}
      height={size}
      alt={alt ?? entry?.alt ?? ""}
      style={pixelatedStyle}
      {...props}
    />
  );
}
