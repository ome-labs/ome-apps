import { useMemo } from "react";

import { encode } from "uqr";

import { cn } from "../styling/class-names.ts";

export type QrCodeProps = {
  value: string;
  /** What scanning it does, as the image's name: "Pairing code for Alice's iPhone". */
  label: string;
  size?: number | undefined;
  className?: string | undefined;
};

/**
 * Page 35's QR code, drawn as one SVG path. It is always dark on a white tile, in both themes: phone cameras read
 * light-on-dark codes poorly.
 */
export function QrCode({ value, label, size = 192, className }: QrCodeProps) {
  const { path, modules } = useMemo(() => {
    const { data } = encode(value, { ecc: "M", border: 2 });
    const parts: string[] = [];

    data.forEach((row, y) => {
      row.forEach((dark, x) => {
        if (dark) parts.push(`M${x} ${y}h1v1h-1z`);
      });
    });

    return { path: parts.join(""), modules: data.length };
  }, [value]);

  return (
    <svg
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline SVG is the image; role="img" names it.
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={`0 0 ${modules} ${modules}`}
      shapeRendering="crispEdges"
      // The tile's ring keeps the white square's edge visible on a white card.
      className={cn("rounded-md bg-brand-white shadow-1", className)}
    >
      <path d={path} className="fill-brand-night" />
    </svg>
  );
}
