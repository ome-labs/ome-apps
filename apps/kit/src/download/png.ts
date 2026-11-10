import { toast } from "@ome-labs/ui-web";

import { saveBlob } from "./save.ts";
import { svgSize } from "./svg.ts";

export type PngScale = 1 | 2 | 4;

export type PngOptions = {
  /** The 1x height in pixels; the SVG's own size when left out. */
  height?: number | undefined;
  scale: PngScale;
  /** Pixel art keeps hard edges; logos and icons are smoothed. */
  pixelated?: boolean | undefined;
};

/** Rasterises an SVG in the browser through a canvas, so the kit ships no PNG it doesn't need to. */
export async function downloadPng(markup: string, name: string, options: PngOptions) {
  const natural = svgSize(markup);
  const height = Math.round((options.height ?? natural.height) * options.scale);
  const width = natural.height ? Math.round((natural.width / natural.height) * height) : height;

  // An SVG with only a viewBox rasterises at the browser's default 300 × 150 before scaling, which blurs it;
  // sizing the document to the target first renders it sharp.
  const document = new DOMParser().parseFromString(markup, "image/svg+xml");
  document.documentElement.setAttribute("width", String(width));
  document.documentElement.setAttribute("height", String(height));
  const sized = new XMLSerializer().serializeToString(document);

  const image = new Image();
  image.decoding = "async";
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;

  try {
    await image.decode();
  } catch {
    toast.error("Couldn't render the PNG");
    return;
  }

  const canvas = window.document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return;

  context.imageSmoothingEnabled = !options.pixelated;
  context.drawImage(image, 0, 0, width, height);

  const suffix = options.scale === 1 ? "" : `@${options.scale}x`;
  canvas.toBlob((blob) => {
    if (blob) saveBlob(blob, `${name}${suffix}.png`, `${width} × ${height}`);
  }, "image/png");
}
