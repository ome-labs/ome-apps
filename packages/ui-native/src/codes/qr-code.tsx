import { useMemo } from "react";

import { tokens } from "@ome-labs/tokens";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { encode } from "uqr";

import { cn } from "../styling/class-names.ts";
import { depth } from "../styling/depth.ts";

export type QrCodeProps = {
  value: string;
  /** What scanning it does: "Treasury's address". */
  label: string;
  size?: number | undefined;
  className?: string | undefined;
};

/**
 * Page 35's QR code: dark on a white tile in both themes, because cameras read light-on-dark codes poorly. The tile
 * is lifted like a card so its edge holds against a white surface.
 */
export function QrCode({ value, label, size = 224, className }: QrCodeProps) {
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
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      className={cn("self-center overflow-hidden rounded-md bg-brand-white", depth.card, className)}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${modules} ${modules}`}>
        <Path d={path} fill={tokens.color.primitive["ink/1000"]} />
      </Svg>
    </View>
  );
}
