import { useMemo, type CSSProperties, type ImgHTMLAttributes } from "react";

import { stateObjectUrls } from "../generated/web/assets.ts";
import { manifest, type StateObjectId } from "../manifest.ts";

const pixelated: CSSProperties = { imageRendering: "pixelated" };

type StateObjectProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "alt" | "width" | "height"
> & {
  id: StateObjectId;
  /** Which drawing: the light one has an ink outline, the dark one a rim light and glowing lit parts. */
  theme?: "light" | "dark" | undefined;
  /** The longest side in pixels. Leave it out for the drawing's own size; whole multiples of it stay sharpest. */
  size?: number | undefined;
  /** Overrides the manifest's alt text; pass "" when the object is decorative next to its own title. */
  alt?: string | undefined;
};

/**
 * One of the kit's state objects (Figma pages 13b and 13c): a voxel object on its own shadow for an empty page, a
 * wait, an alarm or a setup step. Drawn per theme; the image is scaled with nearest-neighbour sampling.
 */
export function StateObject({ id, theme = "light", size, alt, style, ...props }: StateObjectProps) {
  const pixelatedStyle = useMemo(() => ({ ...pixelated, ...style }), [style]);
  const entry = manifest.stateObjects.find((item) => item.id === id);
  const drawing = entry?.[theme];
  const urls = stateObjectUrls[id][theme];
  const scale = drawing && size ? size / Math.max(drawing.width, drawing.height) : 1;

  return (
    <img
      src={urls["1x"]}
      srcSet={`${urls["1x"]} 1x, ${urls["2x"]} 2x`}
      width={drawing ? Math.round(drawing.width * scale) : undefined}
      height={drawing ? Math.round(drawing.height * scale) : undefined}
      alt={alt ?? entry?.alt ?? ""}
      decoding="async"
      style={pixelatedStyle}
      {...props}
    />
  );
}
