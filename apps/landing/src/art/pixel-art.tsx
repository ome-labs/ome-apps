import type { ImgHTMLAttributes } from "react";

import {
  illustrationSource,
  sceneSource,
  type IllustrationArt,
  type SceneArt,
} from "./art-files.ts";

type PixelArtProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "alt" | "width" | "height"
> & {
  /** Describe what it shows, or pass "" when it only decorates text that says the same. */
  alt: string;
} & ({ illustration: IllustrationArt; scene?: never } | { scene: SceneArt; illustration?: never });

const pixelated = { imageRendering: "pixelated" } as const;

/**
 * One of the brand's 320 × 200 pixel scenes, at 1x and 2x. Pixel art must never be smoothed, so the browser scales
 * it nearest-neighbour; lazy unless the caller says otherwise.
 */
export function PixelArt({
  illustration,
  scene,
  alt,
  style,
  loading = "lazy",
  ...props
}: PixelArtProps) {
  const source = illustration ? illustrationSource(illustration) : sceneSource(scene);
  if (!source) return null;

  return (
    <img
      src={source["1x"]}
      srcSet={`${source["1x"]} 1x, ${source["2x"]} 2x`}
      width={640}
      height={400}
      alt={alt}
      loading={loading}
      decoding="async"
      style={style ? { ...pixelated, ...style } : pixelated}
      {...props}
    />
  );
}
