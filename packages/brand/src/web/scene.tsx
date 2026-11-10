import { useMemo, type CSSProperties, type ImgHTMLAttributes } from "react";

import { sceneUrls } from "../generated/web/assets.ts";
import { manifest, type SceneId } from "../manifest.ts";

const pixelated: CSSProperties = { imageRendering: "pixelated" };

type SceneProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "alt"> & {
  id: SceneId;
  /** Overrides the manifest's alt text; pass "" when the scene is decorative next to its own title. */
  alt?: string;
};

/**
 * One of the app's scenes: the in-app illustrations, drawn after the onboarding scenes and in their style. Pixel art
 * must never be smoothed, so the browser scales it with nearest-neighbour sampling.
 */
export function Scene({ id, alt, style, ...props }: SceneProps) {
  const pixelatedStyle = useMemo(() => ({ ...pixelated, ...style }), [style]);
  const entry = manifest.scenes.find((item) => item.id === id);
  const urls = sceneUrls[id];

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
