import { SvgXml } from "react-native-svg";

import { objectXml } from "../generated/native/assets.ts";
import { manifest, type ObjectId } from "../manifest.ts";

type PixelObjectProps = {
  id: ObjectId;
  /** Size in points; keep it a multiple of 32 (the object grid). */
  size?: 32 | 48 | 64 | 96 | 128;
  alt?: string;
};

/** One of the kit's 73 pixel objects, drawn as SVG so it stays sharp at any density. */
export function PixelObject({ id, size = 64, alt }: PixelObjectProps) {
  const label = alt ?? manifest.objects.find((item) => item.id === id)?.alt ?? "";

  return (
    <SvgXml
      xml={objectXml[id]}
      width={size}
      height={size}
      accessible={label !== ""}
      accessibilityLabel={label}
    />
  );
}
