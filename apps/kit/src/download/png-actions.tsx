import { Tooltip } from "@ome-labs/ui-web";

import { ActionButton } from "../bench/action-button.tsx";
import { downloadPng, type PngOptions, type PngScale } from "./png.ts";
import { downloadSvg } from "./svg.ts";

const scales: PngScale[] = [1, 2, 4];

/** Download actions for an SVG: the SVG itself, then PNGs rendered at 1x, 2x and 4x. */
export function SvgDownloads({
  markup,
  name,
  height,
  pixelated,
}: {
  /** The SVG text, read when an action runs; it may need fetching. */
  markup: () => string | Promise<string>;
  name: string;
  height?: PngOptions["height"];
  pixelated?: boolean;
}) {
  return (
    <>
      <ActionButton
        label="Download SVG"
        icon="download"
        onClick={async () => downloadSvg(await markup(), name)}
      />
      {scales.map((scale) => (
        <Tooltip key={scale} content={`Download PNG at ${scale}x`}>
          <button
            type="button"
            aria-label={`Download PNG at ${scale}x`}
            onClick={async () => downloadPng(await markup(), name, { height, scale, pixelated })}
            className="focus-ring h-7 min-w-7 cursor-pointer rounded-sm px-1 type-label-s text-fg-muted transition-colors duration-fast hover:bg-hover hover:text-fg"
          >
            {scale}x
          </button>
        </Tooltip>
      ))}
    </>
  );
}
