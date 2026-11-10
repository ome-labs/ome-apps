import { useMemo } from "react";

import { Logo } from "@ome-labs/brand/web";
import { encode } from "uqr";

import { cn } from "../styling/class-names.ts";

export type QrCodeProps = {
  value: string;
  /** What scanning it does, as the image's name: "Pairing code for Alice's iPhone". */
  label: string;
  size?: number | undefined;
  className?: string | undefined;
};

/** Modules of quiet zone around the code, drawn as part of the white tile. */
const QUIET = 2;
/** A finder pattern is 7 modules square. */
const FINDER = 7;
/**
 * Modules stay plain squares, edge to edge, drawn as one path. Round dots and rounded squares were tried: readers sample
 * each module's centre and a grid of gaps between modules, and at some sizes those failed to decode. The style lives in
 * the finder patterns, the mark and the tile instead.
 */
/** The share of the code's width the mark covers; error correction H recovers up to 30%, so a fifth is safe. */
const MARK_SHARE = 0.2;

/** Whether module (x, y) belongs to one of the three finder patterns, which are drawn as shapes of their own. */
function inFinder(x: number, y: number, size: number): boolean {
  const left = x < FINDER;
  const top = y < FINDER;
  return (left && top) || (x >= size - FINDER && top) || (left && y >= size - FINDER);
}

/**
 * Page 35's QR code in Ome's style: square modules, rounded finder squares with a lake-blue eye, and the Ome mark on a
 * white plate in the middle (error correction H keeps it readable under the mark). It is always dark on a white tile,
 * in both themes: phone cameras read light-on-dark codes poorly.
 */
export function QrCode({ value, label, size = 192, className }: QrCodeProps) {
  const { dots, modules, plate } = useMemo(() => {
    const { data } = encode(value, { ecc: "H", border: 0 });
    const count = data.length;
    // The mark's plate, centred and a whole number of modules wide, so it never cuts a dot in half.
    const span = Math.max(5, Math.round(count * MARK_SHARE) | 1);
    const start = (count - span) / 2;
    const underPlate = (x: number, y: number) =>
      x >= start - 0.5 && x < start + span + 0.5 && y >= start - 0.5 && y < start + span + 0.5;

    const parts: string[] = [];
    data.forEach((row, y) => {
      row.forEach((dark, x) => {
        if (dark && !inFinder(x, y, count) && !underPlate(x, y)) parts.push(`M${x} ${y}h1v1h-1z`);
      });
    });
    return { dots: parts.join(""), modules: count, plate: { start, span } };
  }, [value]);

  const total = modules + QUIET * 2;
  const tile = useMemo(() => ({ width: size, height: size }), [size]);
  const markSize = (size * plate.span * 0.7) / total;
  const mark = useMemo(() => ({ width: markSize, height: markSize }), [markSize]);
  const finders: [number, number][] = [
    [0, 0],
    [modules - FINDER, 0],
    [0, modules - FINDER],
  ];

  return (
    <div
      className={cn("relative inline-block shrink-0 rounded-xl bg-brand-white shadow-1", className)}
      style={tile}
    >
      <svg
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline SVG is the image; role="img" names it.
        role="img"
        aria-label={label}
        width={size}
        height={size}
        viewBox={`${-QUIET} ${-QUIET} ${total} ${total}`}
      >
        <path d={dots} className="fill-brand-night" shapeRendering="crispEdges" />
        {finders.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            {/* The outer ring: a 7-module square, its 5-module hole cut out with the even-odd rule. */}
            <path
              className="fill-brand-night"
              fillRule="evenodd"
              d={`M${x + 2} ${y}h3a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-3a2 2 0 0 1 -2 -2v-3a2 2 0 0 1 2 -2z
                  M${x + 2} ${y + 1}a1 1 0 0 0 -1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1 -1v-3a1 1 0 0 0 -1 -1z`}
            />
            <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.9} className="fill-brand-lake" />
          </g>
        ))}
        <rect
          x={plate.start}
          y={plate.start}
          width={plate.span}
          height={plate.span}
          rx={plate.span * 0.22}
          className="fill-brand-white"
        />
      </svg>
      {/* The mark sits over the plate as its own element, so it stays a crisp vector at any size. */}
      <Logo
        variant="mark"
        tone="light"
        title=""
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={mark}
      />
    </div>
  );
}
